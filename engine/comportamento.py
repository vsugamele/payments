"""
Motor de Comportamento — analise GENERICA (sem cliente nomeado) de campos e boletins.

Registros:
  - CAMPO    (comportamento/campos/*.json)   : lente tecnica, indexado por DE/PDS.
  - BOLETIM  (comportamento/boletins/*.json)  : 3 lentes (tecnica/normativa/negocio)
               + antes->depois, datas, ISO, cross-bandeira, gatilhos e acoes por papel.
  - GLOSSARIO(comportamento/glossario.json)   : explica MTIs (0100/0110/0200/0400),
               clearing, classificacoes (opcional/condicional...), cross-bandeira.

A analise nunca cita um cliente. O impacto e descrito por PERFIL (papel, produtos,
bandeiras, regiao); a projecao usa um perfil ad-hoc para qualquer cliente.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Optional

BASE = Path(__file__).resolve().parent.parent / "comportamento"
CAMPOS_DIR = BASE / "campos"
BOLETINS_DIR = BASE / "boletins"
GLOSSARIO_FILE = BASE / "glossario.json"

_CRIT_ORDEM = {"baixo": 1, "medio": 2, "alto": 3}
_CRIT_NOME = {1: "Baixo", 2: "Medio", 3: "Alto"}


def _norm(texto: str) -> str:
    t = re.sub(r"[\s/_\-.]", "", texto.upper())
    t = re.sub(r"DE(\d{1,3})", lambda m: "DE" + m.group(1).zfill(3), t)
    return t


def _carregar_dir(d: Path) -> dict[str, dict]:
    out: dict[str, dict] = {}
    if not d.exists():
        return out
    for arq in sorted(d.glob("*.json")):
        try:
            dados = json.loads(arq.read_text(encoding="utf-8"))
            out[dados["id"]] = dados
        except Exception as e:
            print(f"[aviso] falha ao ler {arq.name}: {e}")
    return out


@dataclass
class Campo:
    id: str
    dados: dict

    @property
    def rotulo(self) -> str:
        return f"{self.dados.get('campo','')} {self.dados.get('subcampo','')}".strip()


class ComportamentoEngine:
    def __init__(self) -> None:
        self.campos = _carregar_dir(CAMPOS_DIR)
        self.boletins = _carregar_dir(BOLETINS_DIR)
        self.glossario = self._carregar_glossario()
        self._idx_campo = self._indexar(self.campos, self._chaves_campo)
        self._idx_boletim = self._indexar(self.boletins, lambda d: [d["id"]])

    @staticmethod
    def _carregar_glossario() -> dict:
        try:
            return json.loads(GLOSSARIO_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}

    @staticmethod
    def _chaves_campo(d: dict) -> list[str]:
        chaves = {d["id"], d.get("campo", "")}
        if d.get("subcampo"):
            chaves.add(f"{d.get('campo','')} {d['subcampo']}")
        return [c for c in chaves if c]

    @staticmethod
    def _indexar(registros: dict[str, dict], chaves_fn) -> dict[str, str]:
        idx: dict[str, str] = {}
        for rid, d in registros.items():
            for k in chaves_fn(d):
                idx[_norm(k)] = rid
        return idx

    def _buscar(self, idx: dict[str, str], consulta: str) -> Optional[str]:
        chave = _norm(consulta)
        if chave in idx:
            return idx[chave]
        cands = [v for k, v in idx.items() if k.startswith(chave) or chave.startswith(k)]
        return cands[0] if cands else None

    def get_campo(self, consulta: str) -> Optional[Campo]:
        rid = self._buscar(self._idx_campo, consulta)
        return Campo(rid, self.campos[rid]) if rid else None

    def get_boletim(self, consulta: str) -> Optional[dict]:
        rid = self._buscar(self._idx_boletim, consulta)
        return self.boletins[rid] if rid else None

    def explicar_termo(self, termo: str) -> Optional[str]:
        t = termo.strip().upper()
        for v in self.glossario.get("mensagens_iso", {}).items():
            if v[0] == t:
                return f"{t}: {v[1]}"
        tl = termo.strip().lower()
        for grupo in ("conceitos", "classificacoes"):
            for k, val in self.glossario.get(grupo, {}).items():
                if k.lower() == tl:
                    return f"{k}: {val}"
        if tl in ("cross_bandeira", "cross-bandeira", "crossbandeira"):
            return self.glossario.get("cross_bandeira", "")
        return None

    # -------------------------------------------------------------- projecao
    def projetar_perfil(self, boletim: dict, perfil: dict) -> dict:
        """Cruza um boletim com um PERFIL generico (sem cliente nomeado)."""
        g = boletim.get("gatilhos", {})
        motivos: list[str] = []

        bandeira_ok = boletim.get("bandeira") in perfil.get("bandeiras", []) or not perfil.get("bandeiras")
        regiao_ok = (boletim.get("regiao") in perfil.get("regioes", [])
                     or boletim.get("regiao") == "Global" or not perfil.get("regioes"))
        papeis_match = sorted(set(g.get("papeis", [])) & set(perfil.get("papeis", [])))
        produtos_gatilho = g.get("produtos", [])
        produtos_match = sorted(set(produtos_gatilho) & set(perfil.get("produtos", [])))

        if not bandeira_ok:
            impacta = "Nao"
            motivos.append(f"Bandeira {boletim.get('bandeira')} fora do perfil.")
        elif not regiao_ok:
            impacta = "Nao"
            motivos.append(f"Regiao {boletim.get('regiao')} fora do perfil.")
        elif perfil.get("papeis") and not papeis_match:
            impacta = "Nao"
            motivos.append("Nenhum papel do perfil e atingido por este boletim.")
        else:
            if papeis_match:
                motivos.append(f"Papel(is) atingido(s): {', '.join(papeis_match)}.")
            if not produtos_gatilho:
                impacta = "Sim"
                motivos.append("Boletim sem gatilho de produto especifico — aplica-se ao papel.")
            elif produtos_match:
                impacta = "Sim"
                motivos.append(f"Opera produto(s)-gatilho: {', '.join(produtos_match)}.")
            elif perfil.get("produtos"):
                impacta = "Nao"
                motivos.append(f"Gatilho exige {produtos_gatilho}; perfil nao os opera.")
            else:
                impacta = "Avaliar"
                motivos.append(f"Gatilho exige {produtos_gatilho} — confirmar no perfil.")

        base = _CRIT_ORDEM.get(str(boletim.get("criticidade_base", "baixo")).lower(), 1)
        crit = base
        if impacta == "Sim" and produtos_match:
            crit = min(3, base + 1)
            motivos.append("Criticidade elevada por operar produto-gatilho.")

        if impacta == "Nao":
            acoes: dict[str, list[str]] = {}
        elif papeis_match:
            acoes = {p: boletim.get("acoes", {}).get(p, []) for p in papeis_match}
        else:  # perfil sem papel definido -> mostra todas as acoes do boletim
            acoes = dict(boletim.get("acoes", {}))
        acoes = {p: a for p, a in acoes.items() if a}

        return {
            "boletim": boletim["id"], "perfil": perfil, "impacta": impacta,
            "motivos": motivos, "criticidade": _CRIT_NOME[crit], "acoes": acoes,
            "vigencia": boletim.get("vigencia", []),
            "verificar": boletim.get("verificar", []),
        }

    # ------------------------------------------------------------- glossario
    def _termos_para_explicar(self, d: dict) -> list[str]:
        L: list[str] = []
        cls = str(d.get("classificacao", "")).lower()
        if cls in self.glossario.get("classificacoes", {}):
            L.append(f"{d.get('classificacao')}: {self.glossario['classificacoes'][cls]}")
        for mti in d.get("mensagens_iso", []):
            txt = self.glossario.get("mensagens_iso", {}).get(str(mti))
            if txt:
                L.append(f"{mti}: {txt}")
        for sd in d.get("subdominios", []):
            if sd in self.glossario.get("conceitos", {}):
                L.append(f"{sd}: {self.glossario['conceitos'][sd]}")
        return L

    # ------------------------------------------------------------- renderers
    def render_campo(self, c: Campo) -> str:
        d = c.dados
        L = [f"== CAMPO {d['id']} — {d.get('nome','')} ==",
             f"Bandeira: {d.get('bandeira','')} | {c.rotulo} | Fase: {d.get('fase','')}",
             f"Mensagens: {', '.join(d.get('mensagens', []))}",
             f"Formato: {d.get('formato','(n/d)')}", "",
             "DESCRICAO FUNCIONAL", f"  {d.get('descricao_funcional','')}", "",
             "O QUE CADA PAPEL DESENVOLVE"]
        for papel, info in d.get("papeis", {}).items():
            seta = {"envia": ">> Envia", "recebe": "<< Recebe", "ambos": "<> Envia/Recebe"}.get(
                info.get("acao", ""), info.get("acao", ""))
            L.append(f"  [{papel.upper()}] {seta} | Obrig.: {info.get('obrigatoriedade','')}")
            L.append(f"    Funcional : {info.get('funcional','')}")
            L.append(f"    Campo     : {info.get('campo_tecnico','')}")
            for t in info.get("desenvolver", []):
                L.append(f"    Desenvolver: - {t}")
        iv = d.get("ida_volta", {})
        L += ["", "FLUXO IDA-E-VOLTA",
              f"  IDA          : {iv.get('ida','')}",
              f"  O QUE RETORNA: {iv.get('o_que_retorna','')}",
              f"  O QUE VOLTA  : {iv.get('o_que_volta_clearing','')}", ""]
        if d.get("tabelas_relacionadas"):
            L.append(f"Tabelas: {', '.join(d['tabelas_relacionadas'])}")
        for b in d.get("boletins", []):
            L.append(f"Boletim: {b}")
        L.append(f"Fonte: {d.get('fonte','')}")
        for v in d.get("verificar", []):
            L.append(f"  ! verificar: {v}")
        return "\n".join(L)

    def render_boletim(self, d: dict) -> str:
        cls = d.get("classificacao", "")
        L = [f"== BOLETIM {d['id']} — {d.get('titulo','')} ==",
             f"Bandeira: {d.get('bandeira','')} | Regiao: {d.get('regiao','')} "
             f"| Classificacao: {cls} | Regulatorio: {'Sim' if d.get('regulatorio') else 'Nao'}",
             f"Subdominios: {', '.join(d.get('subdominios', []))} | Criticidade base: {d.get('criticidade_base','')}",
             f"Action indicator (bandeira): {d.get('action_indicator','n/d')} | Impacta Brasil?: {d.get('impacta_brasil','n/d')}",
             "DATAS:",
             f"  Publicado: {d.get('publicado','n/d')}"]
        for v in d.get("vigencia", []):
            L.append(f"  Vigencia {v['data']}: {v['detalhe']}")
        if d.get("o_que_a_bandeira_esta_fazendo"):
            L += ["", "O QUE A BANDEIRA ESTA FAZENDO", f"  {d['o_que_a_bandeira_esta_fazendo']}"]
        if d.get("versoes"):
            L.append("HISTORICO DO PARECER:")
            for v in d["versoes"]:
                L.append(f"  {v.get('versao','')} ({v.get('data','')}): {v.get('mudanca','')}")
        cb = d.get("cross_bandeira")
        if cb:
            L += ["", "CROSS-BANDEIRA",
                  f"  Publicada por {cb.get('publicada_por','?')} para atender {cb.get('atende','?')}: {cb.get('motivo','')}",
                  f"  ({self.glossario.get('cross_bandeira','')})"]
        if d.get("antes_depois"):
            L += ["", "O QUE MUDA (ANTES -> DEPOIS)"]
            for m in d["antes_depois"]:
                L.append(f"  * {m.get('o_que','')}")
                L.append(f"      ANTES : {m.get('antes','')}")
                L.append(f"      DEPOIS: {m.get('depois','')}")
        lentes = d.get("lentes", {})
        tec = lentes.get("tecnica", {})
        L += ["", "LENTE TECNICA"]
        if tec.get("campos"):
            L.append(f"  Campos: {', '.join(tec['campos'])}")
        else:
            L.append(f"  {tec.get('nota', 'Sem campo ISO/PDS.')}")
        if d.get("mensagens_iso"):
            L.append(f"  Mensagens ISO: {', '.join(str(m) for m in d['mensagens_iso'])}")
        norm = lentes.get("normativa")
        if norm:
            L += ["LENTE NORMATIVA", f"  {norm.get('resumo','')}"]
            for m in norm.get("mudancas", []):
                L.append(f"   - {m}")
            L.append(f"  Fonte regra: {norm.get('fonte_regra','')}")
        neg = lentes.get("negocio")
        if neg:
            L += ["LENTE NEGOCIO",
                  f"  Exposicao financeira: {neg.get('exposicao_financeira','')}",
                  f"  Risco competitivo   : {neg.get('risco_competitivo','')}",
                  f"  Esforco/prazo       : {neg.get('esforco_prazo','')}"]
        g = d.get("gatilhos", {})
        L += ["", "APLICA-SE A (perfil generico, sem cliente)",
              f"  Papeis : {', '.join(g.get('papeis', [])) or 'todos'}",
              f"  Produtos-gatilho: {', '.join(g.get('produtos', [])) or '(nenhum especifico)'}",
              f"  Bandeira/Regiao : {d.get('bandeira','')} / {d.get('regiao','')}"]
        L.append("")
        for papel, acoes in d.get("acoes", {}).items():
            for a in acoes:
                L.append(f"  Acao [{papel}]: {a}")
        termos = self._termos_para_explicar(d)
        if termos:
            L.append("")
            L.append("TERMOS (glossario)")
            for t in termos:
                L.append(f"  - {t}")
        L.append(f"Fonte: {d.get('fonte','')}")
        for v in d.get("verificar", []):
            L.append(f"  ! verificar: {v}")
        return "\n".join(L)

    def render_projecao(self, p: dict) -> str:
        perfil = p["perfil"]
        perfil_txt = " | ".join(f"{k}={','.join(v)}" for k, v in perfil.items() if v)
        L = [f"== PROJECAO POR PERFIL: {p['boletim']} ==",
             f"Perfil: {perfil_txt or '(vazio)'}",
             f"IMPACTA: {p['impacta'].upper()}  |  Criticidade: {p['criticidade']}",
             "Por que:"]
        for m in p["motivos"]:
            L.append(f"  - {m}")
        if p["acoes"]:
            L.append("Acoes:")
            for papel, acoes in p["acoes"].items():
                for a in acoes:
                    L.append(f"  [{papel}] - {a}")
        if p["vigencia"]:
            efetiva = p["vigencia"][-1]
            try:
                dias = (date.fromisoformat(efetiva["data"]) - date.today()).days
                prazo = f"{dias} dias" if dias >= 0 else "VENCIDO/vigente"
            except Exception:
                prazo = "n/d"
            L.append(f"Prazo: vigencia {efetiva['data']} ({prazo}) — {efetiva['detalhe']}")
        for v in p["verificar"]:
            L.append(f"  ! verificar: {v}")
        return "\n".join(L)
