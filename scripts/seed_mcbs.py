import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")

# ... (GROUPS and EVENTS remain the same, I will use them below)

GROUPS = [
  {
    "id": 'AA',
    "label": 'Autorização — Adquirente (AA)',
    "icon": 'Zap',
    "color": '#6366f1',
    "bg": 'rgba(99,102,241,0.06)',
    "border": 'rgba(99,102,241,0.2)',
    "description": 'Tarifas cobradas do adquirente pelo roteamento de mensagens de autorização na Banknet/Dual Message System.',
    "quem": 'Adquirente',
    "coleta": 'IPM 1740',
  },
  {
    "id": 'AB',
    "label": 'Autorização — Emissor (AB)',
    "icon": 'CreditCard',
    "color": '#0ea5e9',
    "bg": 'rgba(14,165,233,0.06)',
    "border": 'rgba(14,165,233,0.2)',
    "description": 'Tarifas cobradas do emissor por responder mensagens de autorização. Mesma escala de valores que o adquirente no doméstico.',
    "quem": 'Emissor',
    "coleta": 'IPM 1740',
  },
  {
    "id": 'AN',
    "label": 'Não-Autenticação E-commerce (AN)',
    "icon": 'AlertTriangle',
    "color": '#ef4444',
    "bg": 'rgba(239,68,68,0.06)',
    "border": 'rgba(239,68,68,0.2)',
    "description": 'Fee extra cobrado do adquirente em transações e-commerce que NÃO usaram 3DS. Incentivo econômico direto para adoção do SecureCode.',
    "quem": 'Adquirente',
    "coleta": 'IPM 1740',
  },
  {
    "id": 'AV',
    "label": 'Address Verification — AVS (AV)',
    "icon": 'Shield',
    "color": '#10b981',
    "bg": 'rgba(16,185,129,0.06)',
    "border": 'rgba(16,185,129,0.2)',
    "description": 'Cobrado do adquirente quando o serviço AVS é usado para validar o endereço de cobrança do portador em transações CNP.',
    "quem": 'Adquirente',
    "coleta": 'IPM 1740',
  },
  {
    "id": 'CF',
    "label": 'Conectividade (CF)',
    "icon": 'Wifi',
    "color": '#f59e0b',
    "bg": 'rgba(245,158,11,0.06)',
    "border": 'rgba(245,158,11,0.2)',
    "description": 'Taxa semanal baseada no volume de bytes trafegados na Banknet (Single/Dual Message). Regressiva — quanto mais volume, menor o custo unitário.',
    "quem": 'Adquirente / Emissor',
    "coleta": 'DDA/ACH',
  },
  {
    "id": 'BU',
    "label": 'Automated Billing Updater — ABU (BU)',
    "icon": 'RefreshCw',
    "color": '#8b5cf6',
    "bg": 'rgba(139,92,246,0.06)',
    "border": 'rgba(139,92,246,0.2)',
    "description": 'Serviço que atualiza automaticamente dados de cartões junto a merchants em recorrência — reduz declínios por expiração/reemissão.',
    "quem": 'Emissor / Adquirente',
    "coleta": 'DDA/ACH',
  },
  {
    "id": 'C2',
    "label": 'Chargebacks & Representações (C2)',
    "icon": 'BarChart2',
    "color": '#dc2626',
    "bg": 'rgba(220,38,38,0.06)',
    "border": 'rgba(220,38,38,0.2)',
    "description": 'Tarifas de processamento de chargebacks e representações via Single Message Transaction Manager. Cobrada ao emissor por cada item processado.',
    "quem": 'Emissor',
    "coleta": 'IPM 1740',
  },
  {
    "id": 'C1',
    "label": 'MDES Off-Network (C1)',
    "icon": 'Globe',
    "color": '#64748b',
    "bg": 'rgba(100,116,139,0.06)',
    "border": 'rgba(100,116,139,0.2)',
    "description": 'Mapeamento de token MDES para transações fora da rede Mastercard — tokenização em redes de terceiros.',
    "quem": 'Emissor',
    "coleta": 'IPM 1740',
  },
]

EVENTS = [
    # AA
    { "group_id": 'AA', "code": '2AB1006',  "nome": 'Authorization Acquirer Access Fee',        "valor": 'BRL 0.0272',  "unidade": 'por txn doméstica',     "obs": 'BRL 0.50 se adquirente BR + emissor internacional', "priority": 1 },
    { "group_id": 'AA', "code": '2AB1006P', "nome": 'Auth Acquirer Fee — Micro (≤ BRL 10)',      "valor": 'BRL 0.00196', "unidade": 'por txn doméstica', "priority": 2 },
    { "group_id": 'AA', "code": '2AB1006Q', "nome": 'Auth Acquirer Fee — Small (BRL 10–30)',     "valor": 'BRL 0.0196',  "unidade": 'por txn doméstica', "priority": 3 },
    { "group_id": 'AA', "code": '2AB1006R', "nome": 'Auth Acquirer Fee — Mid (BRL 30–60)',       "valor": 'BRL 0.04394', "unidade": 'por txn doméstica', "priority": 4 },
    { "group_id": 'AA', "code": '2AB1006S', "nome": 'Auth Acquirer Fee — Large (BRL 60–90)',     "valor": 'BRL 0.07501', "unidade": 'por txn doméstica', "priority": 5 },
    { "group_id": 'AA', "code": '2AB1006T', "nome": 'Auth Acquirer Fee — Max (> BRL 90)',        "valor": 'BRL 0.117',   "unidade": 'por txn doméstica', "priority": 6 },
    { "group_id": 'AA', "code": '2AB1126',  "nome": 'Pre-Authorization Fee',                     "valor": 'variable',    "unidade": 'amount-based',          "obs": 'Txns pré-auth ≥ BRL 68.96', "priority": 7 },
    
    # AB
    { "group_id": 'AB', "code": '2AB1001P', "nome": 'Auth Issuer Fee — Micro (≤ BRL 10)',        "valor": 'BRL 0.00196', "unidade": 'por txn doméstica', "priority": 1 },
    { "group_id": 'AB', "code": '2AB1001Q', "nome": 'Auth Issuer Fee — Small (BRL 10–30)',       "valor": 'BRL 0.0196',  "unidade": 'por txn doméstica', "priority": 2 },
    { "group_id": 'AB', "code": '2AB1001R', "nome": 'Auth Issuer Fee — Mid (BRL 30–60)',         "valor": 'BRL 0.04394', "unidade": 'por txn doméstica', "priority": 3 },
    { "group_id": 'AB', "code": '2AB1001S', "nome": 'Auth Issuer Fee — Large (BRL 60–90)',       "valor": 'BRL 0.07501', "unidade": 'por txn doméstica', "priority": 4 },
    { "group_id": 'AB', "code": '2AB1001T', "nome": 'Auth Issuer Fee — Max (> BRL 90)',          "valor": 'BRL 0.117',   "unidade": 'por txn doméstica', "priority": 5 },
    { "group_id": 'AB', "code": '2AB1790',  "nome": 'SecureCode AAV Validation',                 "valor": 'BRL 0.015501',"unidade": 'por txn 3DS',           "obs": 'Cobrado quando Mastercard valida o CAVV', "priority": 6 },
    { "group_id": 'AB', "code": '2AB1706',  "nome": 'MC Contactless OBS Mapping',                "valor": 'BRL 0.019',   "unidade": 'por txn NFC',           "obs": 'Mapeamento PAN ↔ contactless', "priority": 7 },
    { "group_id": 'AB', "code": '2AB2600',  "nome": 'MDES Lite Mapping Fee',                     "valor": 'BRL 0.0002',  "unidade": 'amount-based CNP',      "obs": 'Txns recorrentes / e-commerce', "priority": 8 },

    # AN
    { "group_id": 'AN', "code": '2AB3006M', "nome": 'Non-Auth Acquirer Fee (amount-based)',       "valor": 'BRL 0.00029', "unidade": 'por BRL transacionado',  "obs": 'ECI 07 — sem autenticação', "priority": 1 },
    { "group_id": 'AN', "code": '2AB3006',  "nome": 'Non-Auth Acquirer Fee (cap máximo)',         "valor": 'BRL 12.00',   "unidade": 'cap por txn',            "obs": 'Teto do fee por transação', "priority": 2 },

    # AV
    { "group_id": 'AV', "code": '2AV3006',  "nome": 'Address Verification Service — Doméstico',  "valor": 'BRL 0.028682',"unidade": 'por consulta', "priority": 1 },
    { "group_id": 'AV', "code": '2AV3006',  "nome": 'Address Verification Service — Internacional', "valor": 'BRL 0.19128', "unidade": 'por consulta',        "obs": 'Emissor fora do Brasil', "priority": 2 },

    # CF
    { "group_id": 'CF', "code": '2CF1001',  "nome": 'Acquirer Single-Msg Connectivity Fee',      "valor": 'BRL 0.0000143', "unidade": 'por byte (tier 1)',   "obs": 'Mín. BRL 1.375/semana', "priority": 1 },
    { "group_id": 'CF', "code": '2CF2001',  "nome": 'Acquirer Auth Connectivity Fee',            "valor": 'BRL 0.0000143', "unidade": 'por byte (tier 1)',   "obs": 'Mín. BRL 1.375/semana', "priority": 2 },
    { "group_id": 'CF', "code": '2CF1301',  "nome": 'Acquirer Mastercard Edge Connectivity',     "valor": 'BRL 0.0000172', "unidade": 'por byte (tier 1)',   "obs": 'Mín. BRL 1.650/semana', "priority": 3 },

    # BU
    { "group_id": 'BU', "code": '2BU6600',  "nome": 'ABU Issuer Record Fee (tier 1, ≤ 500k)',    "valor": 'BRL 0.046398', "unidade": 'por registro',        "obs": 'Mín. BRL 4.400/mês', "priority": 1 },
    { "group_id": 'BU', "code": '2BU6600',  "nome": 'ABU Issuer Record Fee (tier 4, > 5M)',      "valor": 'BRL 0.0057997',"unidade": 'por registro', "priority": 2 },
    { "group_id": 'BU', "code": '2BU6500',  "nome": 'ABU Merchant Enrollment (automático)',      "valor": 'BRL 231.99',   "unidade": 'por merchant/mês', "priority": 3 },
    { "group_id": 'BU', "code": '2BU6501',  "nome": 'ABU Merchant Enrollment (manual)',          "valor": 'BRL 1.634,47', "unidade": 'por merchant/mês', "priority": 4 },

    # C2
    { "group_id": 'C2', "code": '2CI201716', "nome": 'Issuer Total Representments',              "valor": 'BRL 114.74',   "unidade": 'por representação', "priority": 1 },
    { "group_id": 'C2', "code": '2CI201715', "nome": 'Issuer Total Representments Reversal',     "valor": 'BRL −114.74',  "unidade": 'crédito (estorno)', "priority": 2 },

    # C1
    { "group_id": 'C1', "code": '2C11750',  "nome": 'MDES Off-Network Mapping',                  "valor": 'BRL 0.13',     "unidade": 'por mapeamento', "priority": 1 },
]

def seed():
    if not db_url:
        print("DATABASE_URL não encontrado!")
        return

    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()

        print("Deletando dados antigos...")
        cursor.execute("DELETE FROM ic_mcbs_events;")
        cursor.execute("DELETE FROM ic_mcbs_groups;")

        print("Inserindo Grupos...")
        for g in GROUPS:
            cursor.execute(
                "INSERT INTO ic_mcbs_groups (id, label, icon, color, bg, border, description, quem, coleta) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (g['id'], g['label'], g['icon'], g['color'], g['bg'], g['border'], g['description'], g['quem'], g['coleta'])
            )

        print("Inserindo Eventos...")
        for e in EVENTS:
            cursor.execute(
                "INSERT INTO ic_mcbs_events (group_id, code, nome, valor, unidade, obs, priority) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (e['group_id'], e['code'], e['nome'], e['valor'], e['unidade'], e.get('obs'), e.get('priority', 0))
            )

        cursor.close()
        conn.close()
        print("Seed concluído com sucesso!")
    except Exception as ex:
        print(f"Erro ao inserir: {ex}")

if __name__ == "__main__":
    seed()
