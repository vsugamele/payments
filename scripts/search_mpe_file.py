"""
Ferramenta CLI para buscar registros específicos dentro do arquivo Mastercard MPE (T068) binário bruto.
Permite varrer qualquer uma das 268 tabelas e encontrar registros por termos textuais ou BINs.
"""
import sys
import os
import argparse

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.parser import MPEParser

def main():
    parser = argparse.ArgumentParser(description="Ferramenta de busca forense para tabelas do arquivo Mastercard MPE.")
    parser.add_argument("--table", default="IP0040T1", help="ID da tabela (ex: IP0040T1, IP0016T1, IP0000T1)")
    parser.add_argument("--query", required=True, help="Termo de busca (ex: 222763, BRA, ITAU)")
    parser.add_argument("--limit", type=int, default=20, help="Limite de resultados exibidos")

    # Tratamento de argumentos se executado via CLI
    args = parser.parse_args()

    filepath = "PRD_MST_T068_D260417.T040718_A001"
    if not os.path.exists(filepath):
        print(f"Erro: Arquivo MPE '{filepath}' não encontrado na raiz do projeto.")
        sys.exit(1)

    mpe = MPEParser(filepath)
    mpe.parse_table_list()

    if args.table not in mpe.tables_metadata:
        print(f"Erro: A tabela '{args.table}' não existe neste arquivo.")
        sys.exit(1)

    meta = mpe.tables_metadata[args.table]
    print(f"\nIniciando busca sequencial na tabela '{args.table}' ({meta['desc']})...")
    print(f"Buscando por: '{args.query}' (Exibindo até {args.limit} resultados)\n")

    count = 0
    found = 0

    for payload in mpe.stream_table_records(args.table):
        count += 1
        text = payload.decode('ascii', errors='ignore')
        
        if args.query in text:
            found += 1
            print(f"🎯 [Resultado {found}] (Linha física {count} da tabela):")
            print(f"   Conteúdo Bruto: {repr(payload)}")
            
            # Se for a tabela de BINs (IP0040T1), exibe decodificado
            if args.table == "IP0040T1":
                parsed = mpe.parse_bin_record(payload)
                if parsed:
                    print(f"   Decodificação MPE:")
                    print(f"     └ Faixa de Cartões: {parsed['range_start']} ── {parsed['range_end']}")
                    print(f"     └ Produto Oficial:  {parsed['product_start']}")
                    print(f"     └ País do Emissor:  {parsed['country_alpha']} ({parsed['country_num']})")
                    print(f"     └ Banco / ICA:      {parsed['issuer_ica']}")
                    print(f"     └ Região:           {parsed['region']}")
            print("-" * 80)

            if found >= args.limit:
                print(f"Exibindo o limite máximo de {args.limit} resultados. Busca encerrada.")
                break

    print(f"\nBusca finalizada!")
    print(f"  └ Total de registros analisados na tabela '{args.table}': {count}")
    print(f"  └ Total de correspondências encontradas: {found}")

if __name__ == "__main__":
    main()
