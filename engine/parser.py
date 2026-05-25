"""
Leitor e parser de baixo nível para o arquivo de parâmetros Mastercard MPE (T068).
Reconstrói o stream binário de blocos de 1.014 bytes, decodifica RDWs e separa as tabelas sequencialmente.
"""
import os
from typing import Generator, Dict, Tuple, Optional, Any

class MPEParser:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.block_size = 1014
        self.payload_size = 1012
        self.tables_metadata: Dict[str, Dict[str, Any]] = {}
        self.tables_order = []

    def stream_raw_records(self) -> Generator[bytes, None, None]:
        """
        Lê o arquivo físico em blocos de 1.014 bytes, remove o trailer de 2 bytes (0x40 0x40)
        e produz registros individuais usando o RDW (Record Descriptor Word) de 4 bytes.
        """
        if not os.path.exists(self.filepath):
            raise FileNotFoundError(f"Arquivo MPE não encontrado: {self.filepath}")

        buffer = b""
        with open(self.filepath, "rb") as f:
            # Pula o cabeçalho do arquivo de substituição (84 bytes lógicos, que na verdade é o primeiro registro de 80 bytes payload)
            # Vamos ler o primeiro bloco para inicializar
            block = f.read(self.block_size)
            if not block:
                return
            buffer += block[:self.payload_size]
            
            # O primeiro registro é o cabeçalho do arquivo (80 bytes payload + 4 bytes RDW = 84 bytes)
            if len(buffer) >= 84:
                # Consome o cabeçalho do arquivo
                file_header = buffer[:84]
                buffer = buffer[84:]

            while True:
                # Alimenta o buffer até ter pelo menos um RDW (4 bytes)
                while len(buffer) < 4:
                    block = f.read(self.block_size)
                    if not block:
                        break
                    buffer += block[:self.payload_size]

                if len(buffer) < 4:
                    break

                rdw = buffer[:4]
                record_len = int.from_bytes(rdw[2:4], 'big')

                # Alimenta o buffer até ter o registro completo
                while len(buffer) < 4 + record_len:
                    block = f.read(self.block_size)
                    if not block:
                        break
                    buffer += block[:self.payload_size]

                if len(buffer) < 4 + record_len:
                    # Fim de arquivo ou arquivo truncado
                    break

                payload = buffer[4:4+record_len]
                buffer = buffer[4+record_len:]
                yield payload

    def parse_table_list(self):
        """
        Lê a primeira tabela do arquivo (IP0000T1 - TABLE LIST) para preencher os metadados
        de todas as tabelas contidas no arquivo.
        """
        print("Lendo a lista de tabelas (IP0000T1)...")
        self.tables_metadata = {}
        self.tables_order = []

        # A primeira tabela é IP0000T1 por definição
        self.tables_metadata["IP0000T1"] = {
            "rec_len": 259,
            "rec_count": 268,
            "desc": "TABLE LIST"
        }
        self.tables_order.append("IP0000T1")

        for payload in self.stream_raw_records():
            # Verifica se chegamos ao fim da IP0000T1
            if payload.startswith(b"TRAILER RECORD IP0000T1"):
                break

            if b"IP0000T1" in payload[:25]:
                try:
                    # Extrai metadados das tabelas contidas
                    table_id = payload[19:27].decode('ascii', errors='ignore').strip()
                    if table_id == "IP0000T1":
                        continue # Já está adicionada como padrão

                    desc = payload[27:55].decode('ascii', errors='ignore').strip()
                    
                    # Trata números com decimais implícitos removendo zeros à direita
                    rec_count_str = payload[106:116].decode('ascii', errors='ignore').strip().rstrip('0')
                    rec_count = int(rec_count_str) if rec_count_str else 0
                    
                    rec_len_str = payload[66:71].decode('ascii', errors='ignore').strip().rstrip('0')
                    rec_len = int(rec_len_str) if rec_len_str else 0
                    
                    self.tables_metadata[table_id] = {
                        "rec_len": rec_len,
                        "rec_count": rec_count,
                        "desc": desc
                    }
                    self.tables_order.append(table_id)
                except Exception as e:
                    pass

        print(f"Lista de tabelas carregada com sucesso. {len(self.tables_metadata)} tabelas registradas.")

    def stream_table_records(self, target_table_id: str) -> Generator[bytes, None, None]:
        """
        Lê o arquivo sequencialmente e produz apenas os registros da tabela especificada.
        """
        if not self.tables_metadata:
            self.parse_table_list()

        if target_table_id not in self.tables_metadata:
            raise ValueError(f"Tabela {target_table_id} não existe neste arquivo MPE.")

        current_table_idx = 0
        current_table_id = self.tables_order[current_table_idx]
        
        print(f"Buscando a tabela {target_table_id} no fluxo sequencial...")

        for payload in self.stream_raw_records():
            # Verifica se o registro é um trailer da tabela atual
            if payload.startswith(b"TRAILER RECORD"):
                trailer_table = payload[15:23].decode('ascii', errors='ignore').strip()
                if trailer_table == current_table_id:
                    # Avança para a próxima tabela na sequência
                    current_table_idx += 1
                    if current_table_idx < len(self.tables_order):
                        current_table_id = self.tables_order[current_table_idx]
                    else:
                        break
                continue

            # Se estamos na tabela procurada, produz o registro
            if current_table_id == target_table_id:
                yield payload

    def parse_bin_record(self, payload: bytes) -> Optional[Dict[str, Any]]:
        """
        Decodifica um registro individual de BIN (tabela IP0040T1, tamanho 194 bytes).
        Retorna um dicionário estruturado com as informações do BIN.
        """
        if len(payload) < 194:
            return None

        try:
            # Cabeçalho de controle (11 caracteres)
            # ex: 2610708A037
            hdr = payload[0:11].decode('ascii')
            
            # Faixa Inicial (19 dígitos)
            range_start = payload[11:30].decode('ascii').strip()
            # Produto Licenciado Inicial (3 caracteres)
            prod_start = payload[30:33].decode('ascii').strip()
            
            # Faixa Final (19 dígitos)
            range_end = payload[33:52].decode('ascii').strip()
            # Produto Licenciado Final (3 caracteres)
            prod_end = payload[52:55].decode('ascii').strip()
            
            # ID de programa de cartão / subtype (2 caracteres)
            card_program_id = payload[55:57].decode('ascii').strip()
            
            # Member ID/ICA do Emissor (11 caracteres)
            issuer_ica = payload[57:68].decode('ascii').strip()
            
            # País do Emissor - Código Alfa-3 (3 caracteres)
            country_alpha = payload[76:79].decode('ascii').strip()
            # País do Emissor - Código Numérico (3 caracteres)
            country_num = payload[79:82].decode('ascii').strip()
            
            # Região do Emissor (1 caractere)
            # B = LAC (Latin America & Caribbean)
            # A = USA
            # C = Europe
            region = payload[82:83].decode('ascii').strip()

            return {
                "range_start": range_start,
                "range_end": range_end,
                "product_start": prod_start,
                "product_end": prod_end,
                "card_program_id": card_program_id,
                "issuer_ica": issuer_ica,
                "country_alpha": country_alpha,
                "country_num": country_num,
                "region": region,
                "raw_record": payload.decode('ascii', errors='ignore')
            }
        except Exception:
            return None
