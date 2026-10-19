"""Gera linhas da "Planilha de Controle de Itens – Bandeiras" (abas Adquirente e Emissor) a partir de um JSON.

Copia cabeçalho, larguras e estilos da planilha-modelo, apaga as linhas de dados da CÓPIA e grava os itens
com negrito real (rich text) nos títulos de seção e rótulos. Nunca sobrescreve o modelo.

Uso:
    python gerar_planilha_release.py --modelo modelo.xlsx --itens itens.json --saida nova.xlsx
    python gerar_planilha_release.py --validar nova.xlsx      # abre no Excel (COM), confere e exporta PDF
"""
import argparse
import copy
import json
import re
import subprocess
import sys
from pathlib import Path

import openpyxl
from openpyxl.cell.rich_text import CellRichText, TextBlock
from openpyxl.cell.text import InlineFont

LINHA_CAB = 5
PRIMEIRA = 6
# Chave do JSON -> cabeçalho da planilha, por aba. Colunas do cliente não aparecem aqui (ficam em branco).
COLUNAS = {
    'Adquirente': [('bandeira', 'Bandeira'), ('item', 'Item / Ref. Doc'), ('titulo', 'Título Original'), ('__ref', 'ref alan'),
                   ('obrigatoriedade', 'Obrigatoriedade'), ('escopo', 'Escopo / Região'), ('sistema', 'Sistema Impactado'),
                   ('descricao', 'Descrição (produto, contexto, o que muda)'), ('autorizador', 'Impacto 53-MTP (Autorizador)'),
                   ('clearing', 'Impacto 53-Clearing'), ('outros', 'Impacto Outros (Disputas / Liquidação / Infra / Tabelas)'),
                   ('impacto_financeiro', 'Impacto Financeiro'), ('tags', 'Assunto / Tags'), ('vigencia', 'Data de Vigência')],
    'Emissor': [('bandeira', 'Bandeira'), ('item', 'Item / Ref. Doc'), ('titulo', 'Título Original'), ('obrigatoriedade', 'Obrigatoriedade'),
                ('escopo', 'Escopo / Região'), ('sistema', 'Sistema Impactado'), ('descricao', 'Descrição (produto, contexto, o que muda)'),
                ('autorizador', 'Impacto 53-MTP (Autorizador)'), ('clearing', 'Impacto 53-Clearing'),
                ('outros', 'Impacto Outros (Disputas / Liquidação / Infra / Tabelas)'), ('impacto_financeiro', 'Impacto Financeiro'),
                ('tags', 'Assunto / Tags'), ('publicacao', 'Data de Publicação'), ('vigencia', 'Data de Vigência')],
}
PAPEL = {'Adquirente': 'adquirente', 'Emissor': 'emissor'}
RICH = {'descricao', 'autorizador', 'clearing', 'outros'}
ROTULOS = ('Mensagens:', 'Campos:', 'O que desenvolver:', 'Tratamento de exceções:', 'Testes:', 'RECEBER —', 'ENVIAR —',
           'Adquirentes / Processadores', 'Emissores')
TITULO_RE = re.compile(r'^[A-ZÀ-Ý0-9][A-ZÀ-Ý0-9 x/(),.–-]{3,}$')
EMOJI_RE = re.compile('[\U0001F300-\U0001FAFF☀-➿️]')


def segmentos(texto):
    """Lista (trecho, negrito). Títulos (linha toda em maiúsculas) e rótulos ficam em negrito.
    Nenhum trecho fica só com quebra de linha: a quebra é anexada ao trecho anterior."""
    saida = []
    linhas = texto.split('\n')
    for i, linha in enumerate(linhas):
        fim = '\n' if i < len(linhas) - 1 else ''
        rotulo = next((r for r in ROTULOS if linha.startswith(r)), None)
        if linha.strip() and TITULO_RE.match(linha.strip()) and not linha.strip().startswith(('•', '1.', '2.')):
            partes = [(linha + fim, True)]
        elif rotulo:
            corte = linha.index(':') + 1 if rotulo.endswith(':') else len(linha)
            partes = [(linha[:corte], True), (linha[corte:] + fim, False)] if linha[corte:] + fim else [(linha[:corte] + fim, True)]
        else:
            partes = [(linha + fim, False)]
        for trecho, negrito in partes:
            if not trecho:
                continue
            if trecho.strip() == '' and saida:  # só quebra/espaço: junta ao anterior
                saida[-1] = (saida[-1][0] + trecho, saida[-1][1])
            elif saida and saida[-1][1] == negrito:
                saida[-1] = (saida[-1][0] + trecho, negrito)
            else:
                saida.append((trecho, negrito))
    return saida


def rich(texto, fonte):
    blocos = []
    for trecho, negrito in segmentos(texto):
        f = InlineFont(rFont=fonte.name or 'Arial', sz=fonte.sz or 10, b=negrito)
        blocos.append(TextBlock(f, trecho))
    return CellRichText(*blocos)


def validar_item(item):
    erros = []
    for papel in ('adquirente', 'emissor'):
        dados = {**item['comum'], **item.get(papel, {})}
        for chave in ('obrigatoriedade', 'descricao', 'autorizador', 'clearing', 'outros', 'impacto_financeiro'):
            if not dados.get(chave):
                erros.append(f'{papel}: falta "{chave}"')
        for chave in RICH:
            if EMOJI_RE.search(dados.get(chave, '')):
                erros.append(f'{papel}.{chave}: contém emoji (formato aprovado é sem emoji)')
        if dados.get('impacto_financeiro') not in ('BAIXO', 'MÉDIO', 'ALTO'):
            erros.append(f'{papel}: impacto_financeiro deve ser BAIXO, MÉDIO ou ALTO')
        if not dados.get('descricao', '').startswith(('A Visa está', 'A Mastercard está', 'A Elo está', 'A American Express está')):
            erros.append(f'{papel}: descrição deve abrir com "A <Bandeira> está ..."')
        for chave in ('autorizador', 'clearing', 'outros'):
            v = dados.get(chave, '')
            if v.strip().lower().startswith('sem impacto') and v.strip() != 'Sem Impacto.':
                erros.append(f'{papel}.{chave}: use exatamente "Sem Impacto."')
    return erros


def gerar(modelo, itens_json, saida):
    if Path(saida).resolve() == Path(modelo).resolve():
        raise SystemExit('A saída não pode ser o próprio modelo.')
    dados = json.loads(Path(itens_json).read_text(encoding='utf-8'))
    problemas = [f"{it['comum'].get('item', '?')}: {e}" for it in dados['itens'] for e in validar_item(it)]
    if problemas:
        raise SystemExit('Itens com problema:\n  ' + '\n  '.join(problemas))
    wb = openpyxl.load_workbook(modelo, rich_text=True)
    for nome, colunas in COLUNAS.items():
        ws = wb[nome]
        cab = {str(c.value).strip(): c.column for c in ws[LINHA_CAB] if c.value}
        faltando = [h for _, h in colunas if h not in cab]
        if faltando:
            raise SystemExit(f'Aba {nome}: cabeçalhos não encontrados no modelo: {faltando}')
        estilos = {c.column: (copy.copy(c.font), copy.copy(c.fill), copy.copy(c.alignment), copy.copy(c.border), c.number_format)
                   for c in ws[PRIMEIRA]}
        if ws.max_row >= PRIMEIRA:
            ws.delete_rows(PRIMEIRA, ws.max_row - PRIMEIRA + 1)
        if 'release' in dados:
            for linha in ws.iter_rows(min_row=2, max_row=2):
                for c in linha:
                    if isinstance(c.value, str) and c.value.startswith('Release'):
                        c.value = dados['release'].get('nome', c.value)
                    elif isinstance(c.value, str) and ('GMT' in c.value or 'CPD' in c.value) and dados['release'].get('vigencia'):
                        c.value = dados['release']['vigencia']
        for n, item in enumerate(dados['itens']):
            r = PRIMEIRA + n
            valores = {**item['comum'], **item.get(PAPEL[nome], {})}
            for col in range(1, ws.max_column + 1):
                if col in estilos:
                    f, fi, al, bo, nf = estilos[col]
                    c = ws.cell(r, col)
                    c.font, c.fill, c.alignment, c.border, c.number_format = copy.copy(f), copy.copy(fi), copy.copy(al), copy.copy(bo), nf
            for chave, cabecalho in colunas:
                c = ws.cell(r, cab[cabecalho])
                if chave == '__ref':
                    c.value = f'=B{r}'
                elif chave in RICH and valores.get(chave):
                    c.value = rich(valores[chave], c.font)
                else:
                    c.value = valores.get(chave)
            maior = max(len(str(valores.get(k, '')).split('\n')) for k in RICH)
            ws.row_dimensions[r].height = min(409, max(60, 13 * maior))
        ws.auto_filter.ref = f'A{LINHA_CAB}:{openpyxl.utils.get_column_letter(ws.max_column)}{PRIMEIRA + len(dados["itens"]) - 1}'
    wb.save(saida)
    print(f'[OK] {len(dados["itens"])} item(ns) gravado(s) em {saida}')


def validar_no_excel(arquivo):
    """Abre no Excel instalado (somente leitura), confere texto e negrito da 1ª linha de dados e exporta PDF."""
    arq = str(Path(arquivo).resolve())
    pdf = str(Path(arquivo).with_suffix('.pdf').resolve())
    ps = f'''
$ErrorActionPreference = "Stop"
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false
try {{
  $wb = $xl.Workbooks.Open("{arq}", 0, $true)
  foreach ($nome in @("Adquirente","Emissor")) {{
    $ws = $wb.Worksheets.Item($nome)
    $c = $ws.Range("A{PRIMEIRA}").EntireRow
    $desc = if ($nome -eq "Adquirente") {{ $ws.Range("H{PRIMEIRA}") }} else {{ $ws.Range("G{PRIMEIRA}") }}
    $txt = [string]$desc.Value2
    $negritos = 0
    for ($i = 1; $i -le [Math]::Min($txt.Length, 4000); $i += 25) {{ if ($desc.Characters($i,1).Font.Bold) {{ $negritos++ }} }}
    Write-Output ("ABA=" + $nome + " | caracteres_descricao=" + $txt.Length + " | amostras_em_negrito=" + $negritos)
  }}
  $wb.ExportAsFixedFormat(0, "{pdf}")
  Write-Output ("PDF=" + "{pdf}")
  $wb.Close($false)
}} finally {{ $xl.Quit(); [System.Runtime.Interopservices.Marshal]::ReleaseComObject($xl) | Out-Null }}
'''
    proc = subprocess.run(['powershell', '-NoProfile', '-Command', ps], capture_output=True, text=True, timeout=180)
    print(proc.stdout.strip() or proc.stderr.strip())
    return proc.returncode == 0


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--modelo')
    ap.add_argument('--itens')
    ap.add_argument('--saida')
    ap.add_argument('--validar')
    a = ap.parse_args()
    if a.validar:
        sys.exit(0 if validar_no_excel(a.validar) else 1)
    if not (a.modelo and a.itens and a.saida):
        ap.error('Use --modelo, --itens e --saida (ou --validar arquivo.xlsx)')
    gerar(a.modelo, a.itens, a.saida)


if __name__ == '__main__':
    main()
