"""
Motor principal de provisionamento de intercâmbio Mastercard/Maestro.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from .loader import (
    load_mc_rules,
    load_maestro_rules,
    load_visa_rules,
    load_rates,
    load_mcc_to_segment,
    eval_rule,
)

# ---------------------------------------------------------------------------
# Mapeamentos para modo simplificado
# ---------------------------------------------------------------------------

# Mapeamento de produto Visa (termo humano → PID Visa)
VISA_PID_MAP = {
    "classic":      "F^",
    "classico":     "F^",
    "gold":         "P^",
    "ouro":         "P^",
    "platinum":     "N^",
    "platina":      "N^",
    "infinite":     "I^",
    "infinite_hnw": "I1",
    "hnw":          "I1",
    "signature":    "C^",
    "business":     "K^",
    "corporate":    "S^",
    "b2b":          "X^",
    "bndes":        "S6",
    "vale":         "J3",
    "agro":         "S4",
    "electron":     "L^",
    "prepaid":      "F^",   # prepaid consumer usa F^ no Brasil
}

# POS_ENTRY_MODE para canal físico com chip/tarja
VISA_POS_CHIP = ("02", "03", "05", "07", "90", "91", "95")

TIER_MAP = {
    "standard": "Consumer standard",
    "classico": "Consumer standard",
    "classic": "Consumer standard",
    "gold": "Consumer gold",
    "dourado": "Consumer gold",
    "platinum": "Consumer platinum",
    "platina": "Consumer platinum",
    "black": "Consumer black",
    "infinite": "Consumer black",
    "elite": "Consumer black",
    "signature": "Consumer black",
}

CANAL_MAP = {
    "ecommerce": {"CARD_PRESENT_ID": 0, "PAYPASS_IND": 0},
    "ecommerce_3ds": {"CARD_PRESENT_ID": 0, "PAYPASS_IND": 0, "ECSLI": "FRICTIONLESS"},
    "frictionless": {"CARD_PRESENT_ID": 0, "PAYPASS_IND": 0, "ECSLI": "FRICTIONLESS"},
    "fisico": {"CARD_PRESENT_ID": 1, "PAYPASS_IND": 0},
    "chip": {"CARD_PRESENT_ID": 1, "PAYPASS_IND": 0},
    "contactless": {"CARD_PRESENT_ID": 1, "PAYPASS_IND": 1},
    "qr": {"CARD_PRESENT_ID": 1, "ENTRY_MODE": "QRP", "PAYPASS_IND": 0},
}

# Mapeamento de IRD de ajuste → tier equivalente no lookup de base (IA)
# HU, AU, AV, AW = CNP (não autenticado / autenticado)
# JA, JV, JW = Card Present Contactless
# IV, IW = Card Present parcelado

IRD_TIER_KEY = {
    # Consumer Credit CP
    "IA":  ("Consumer standard", "Consumer gold", "Consumer platinum", "Consumer black"),
    "JA":  ("Consumer standard", "Consumer gold", "Consumer platinum", "Consumer black"),
    # Consumer Credit CNP
    "HU":  "CNP, others",
    "AU":  "CNP Authenticated Frictionless",
    "AV":  "CNP Authenticated Frictionless",
    "AW":  "CNP Authenticated Frictionless",
    "HV":  "CNP, others",
    "HW":  "CNP, others",
    # Parcelado CP
    "IV":  ("Consumer standard", "Consumer gold", "Consumer platinum", "Consumer black"),
    "IW":  ("Consumer standard", "Consumer gold", "Consumer platinum", "Consumer black"),
    "JV":  ("Consumer standard", "Consumer gold", "Consumer platinum", "Consumer black"),
    "JW":  ("Consumer standard", "Consumer gold", "Consumer platinum", "Consumer black"),
}

# Para rate lookup, IRDs de ajuste precisam do IRD base IA para calcular taxa final
ADJUSTMENT_IRD_BASE = {
    "HU": "IA", "AU": "IA", "AV": "IA", "AW": "IA",
    "HV": "IA", "HW": "IA",
    "JA": "IA", "JV": "IA", "JW": "IA",
    "IV": "IA", "IW": "IA",
}

# ---------------------------------------------------------------------------
# Resultado do cálculo
# ---------------------------------------------------------------------------

@dataclass
class VisaCalcResult:
    """Resultado de cálculo de intercâmbio Visa."""
    sucesso: bool
    rule_id: str = ""
    descriptor: str = ""
    accounting_sign: str = ""
    rate_pct: float = 0.0
    fixed_fee: float = 0.0
    cap_fee: float = 0.0
    valor_transacao: float = 0.0
    taxa_intercambio: float = 0.0
    cap_aplicado: bool = False
    prioridade: int = 0
    cascata: list = None  # trilha de avaliação por prioridade
    aviso: str = ""       # alerta sobre dados corrompidos na tabela
    erro: str = ""

    def __post_init__(self):
        if self.cascata is None:
            self.cascata = []

    def to_dict(self) -> dict:
        d = {"sucesso": self.sucesso, "bandeira": "visa"}
        if not self.sucesso:
            d["erro"] = self.erro
            if self.cascata:
                d["cascata"] = self.cascata
            return d
        d.update({
            "rule_id": self.rule_id,
            "descriptor": self.descriptor,
            "accounting_sign": self.accounting_sign,
            "prioridade": self.prioridade,
            "rate_pct": round(self.rate_pct, 4),
            "fixed_fee": self.fixed_fee,
            "cap_fee": self.cap_fee,
            "valor_transacao": self.valor_transacao,
            "taxa_intercambio": round(self.taxa_intercambio, 4),
            "taxa_intercambio_fmt": f"R$ {self.taxa_intercambio:.4f}",
            "cap_aplicado": self.cap_aplicado,
            "cascata": self.cascata,
        })
        if self.aviso:
            d["aviso"] = self.aviso
        return d


@dataclass
class CalcResult:
    sucesso: bool
    bandeira: str = ""
    ird: str = ""
    pseudo_ird: str = ""
    descricao_regra: str = ""
    segment: str = ""
    tier: str = ""
    rate_pct: float = 0.0
    valor_transacao: float = 0.0
    taxa_intercambio: float = 0.0
    cap_aplicado: bool = False
    detalhe: dict = field(default_factory=dict)
    erro: str = ""

    def to_dict(self) -> dict:
        d = {
            "sucesso": self.sucesso,
            "bandeira": self.bandeira,
        }
        if not self.sucesso:
            d["erro"] = self.erro
            return d
        d.update({
            "ird": self.ird or self.pseudo_ird,
            "descricao_regra": self.descricao_regra,
            "segment": self.segment,
            "tier": self.tier,
            "rate_pct": round(self.rate_pct, 4),
            "valor_transacao": self.valor_transacao,
            "taxa_intercambio": round(self.taxa_intercambio, 4),
            "taxa_intercambio_fmt": f"R$ {self.taxa_intercambio:.4f}",
            "cap_aplicado": self.cap_aplicado,
            **self.detalhe,
        })
        return d


# ---------------------------------------------------------------------------
# Engine principal
# ---------------------------------------------------------------------------

class InterchangeCalculator:
    def __init__(self):
        self.mc_rules = load_mc_rules()
        self.maestro_rules = load_maestro_rules()
        self.visa_rules = load_visa_rules()
        self.base_rates, self.adjustments = load_rates()
        self.mcc_to_segment = load_mcc_to_segment()

    # ------------------------------------------------------------------
    # API pública: cálculo técnico completo
    # ------------------------------------------------------------------

    def calcular(self, params: dict) -> CalcResult:
        """
        Calcula intercâmbio com parâmetros técnicos.

        Campos obrigatórios:
            valor (float): valor da transação em BRL
            bandeira (str): 'mastercard', 'maestro'

        Campos da transação (mapeados do ISO 8583):
            PRODUCT_TYPE: 'CREDIT', 'DEBIT', 'PREPAID'
            CARD_PROGRAM_ID: 'MSI' para Maestro
            CARD_PRESENT_ID: 0 (CNP/ecommerce) ou 1 (físico)
            PAYPASS_IND: 1 (contactless) ou 0
            ECSLI: 'FRICTIONLESS' para 3DS autenticado
            MCC: código MCC do estabelecimento
            PROC_CODE: 00=compra, 09=saque, 28=pagamento
            TXN_AMOUNT: valor numérico (igual a 'valor')
            INSTALLMENTS: número de parcelas (padrão 1)
            DOCUMENT_TYPE: 2=PF, 1=PJ
            ACQR_COUNTRY_CODE: 76 (Brasil)
            ISSR_COUNTRY_CODE: 76 (doméstico)
            tier: 'Consumer standard/gold/platinum/black' (para lookup de taxa)
        """
        valor = float(params.get("valor", 0))
        bandeira = str(params.get("bandeira", "mastercard")).lower()

        ctx = self._build_ctx(params)

        # Maestro: CARD_PROGRAM_ID="MSI" ou bandeira="maestro"
        if bandeira == "maestro" or ctx.get("CARD_PROGRAM_ID") == "MSI":
            return self._calc_maestro(ctx, valor, bandeira)
        else:
            return self._calc_mastercard(ctx, valor, bandeira, params)

    # ------------------------------------------------------------------
    # API simplificada: termos humanos → parâmetros técnicos
    # ------------------------------------------------------------------

    def calcular_simples(self, params: dict) -> CalcResult:
        """
        Calcula intercâmbio com termos simplificados.

        Parâmetros:
            valor (float): valor da transação
            bandeira (str): 'mastercard', 'maestro'
            tipo_cartao (str): 'standard', 'gold', 'platinum', 'black'
            pessoa (str): 'fisica' ou 'juridica'
            canal (str): 'ecommerce', 'ecommerce_3ds', 'fisico', 'contactless', 'qr'
            mcc (int): código MCC (opcional se categoria fornecida)
            categoria (str): 'restaurante', 'supermercado', 'posto', etc.
            parcelas (int): número de parcelas (padrão 1)
        """
        valor = float(params.get("valor", 0))
        bandeira = str(params.get("bandeira", "mastercard")).lower()
        canal = str(params.get("canal", "fisico")).lower()
        tipo_cartao = str(params.get("tipo_cartao", "standard")).lower()
        pessoa = str(params.get("pessoa", "fisica")).lower()
        parcelas = int(params.get("parcelas", 1))

        # Resolve MCC
        mcc = params.get("mcc")
        if not mcc and params.get("categoria"):
            mcc = self._categoria_to_mcc(str(params["categoria"]).lower())

        # Monta parâmetros técnicos
        tech = {
            "valor": valor,
            "bandeira": "maestro" if bandeira == "maestro" else "mastercard",
            "ACQR_COUNTRY_CODE": 76,
            "ISSR_COUNTRY_CODE": 76,
            "PROC_CODE": 0,
            "INSTALLMENTS": parcelas,
            "TXN_AMOUNT": valor,
            "DOCUMENT_TYPE": 1 if pessoa == "juridica" else 2,
            "tier": TIER_MAP.get(tipo_cartao, "Consumer standard"),
        }

        if mcc:
            tech["MCC"] = int(mcc)

        if bandeira == "maestro":
            tech["CARD_PROGRAM_ID"] = "MSI"
            # Maestro usa variável SEGMENT nas regras físicas
            tech["SEGMENT"] = self._mcc_to_maestro_segment(int(mcc) if mcc else None)
        else:
            tech["PRODUCT_TYPE"] = "DEBIT" if params.get("tipo_produto", "").upper() == "DEBIT" else "CREDIT"

        # Aplica parâmetros do canal
        canal_params = CANAL_MAP.get(canal, CANAL_MAP["fisico"])
        tech.update(canal_params)

        return self.calcular(tech)

    # ------------------------------------------------------------------
    # Cálculo interno Mastercard
    # ------------------------------------------------------------------

    def _calc_mastercard(self, ctx: dict, valor: float, bandeira: str, params: dict) -> CalcResult:
        matched = None
        for rule in self.mc_rules:
            if eval_rule(rule, ctx):
                matched = rule
                break

        if not matched:
            return CalcResult(
                sucesso=False,
                bandeira=bandeira,
                erro="Nenhuma regra encontrada. Verifique os parâmetros da transação.",
            )

        ird = matched.ird
        tier_input = str(params.get("tier", ctx.get("tier", "Consumer standard")))
        segment = self._get_segment(ctx.get("MCC"))
        rate_pct = self._lookup_rate(ird, tier_input, segment)

        if rate_pct is None:
            return CalcResult(
                sucesso=False,
                bandeira=bandeira,
                ird=ird,
                erro=f"Taxa não encontrada: IRD={ird}, tier={tier_input}, segment={segment}",
            )

        taxa = round(valor * (rate_pct / 100), 4)

        return CalcResult(
            sucesso=True,
            bandeira=bandeira,
            ird=ird,
            descricao_regra=matched.description,
            segment=segment,
            tier=tier_input,
            rate_pct=rate_pct,
            valor_transacao=valor,
            taxa_intercambio=taxa,
            detalhe={"prioridade_regra": matched.priority},
        )

    # ------------------------------------------------------------------
    # Cálculo interno Maestro
    # ------------------------------------------------------------------

    def _calc_maestro(self, ctx: dict, valor: float, bandeira: str) -> CalcResult:
        matched = None
        for rule in self.maestro_rules:
            if eval_rule(rule, ctx):
                matched = rule
                break

        if not matched:
            return CalcResult(
                sucesso=False,
                bandeira="maestro",
                erro="Nenhuma regra Maestro encontrada.",
            )

        rate_pct = matched.rate_pct
        taxa = round(valor * (rate_pct / 100), 4)

        cap_aplicado = False
        if matched.cap_brl and taxa > matched.cap_brl:
            taxa = matched.cap_brl
            cap_aplicado = True

        return CalcResult(
            sucesso=True,
            bandeira="maestro",
            pseudo_ird=matched.pseudo_ird,
            descricao_regra=matched.description,
            rate_pct=rate_pct,
            valor_transacao=valor,
            taxa_intercambio=taxa,
            cap_aplicado=cap_aplicado,
            detalhe={"cap_brl": matched.cap_brl},
        )

    # ------------------------------------------------------------------
    # API pública Visa: cálculo técnico
    # ------------------------------------------------------------------

    def calcular_visa(self, params: dict) -> VisaCalcResult:
        """
        Calcula intercâmbio Visa com parâmetros técnicos (campos do Clearing Visa).

        Campos principais (todos opcionais exceto AMOUNT):
            AMOUNT (float)           : valor da transação em BRL
            SETTL_FLAG (str)         : '8' ou '9' = doméstico BR; '0' = internacional
            PID (str)                : Product ID Visa (ex: 'N^'=Platinum, 'F^'=Classic, 'I^'=Infinite)
            AFS (str)                : Account Funding Source: 'C'=Crédito, 'D'=Débito
            ECI (str)                : '05' ou '06' para 3DS autenticado
            MCC (str)                : Merchant Category Code (como string)
            INST (int)               : número de parcelas (padrão 1)
            POS_ENTRY_MODE (str)     : modo de entrada (ex: '81'=ecommerce, '05'=chip)
            SPI (str)                : Special Payment Indicator
            BAI (str)                : Business Application Identifier
            SUBTYPE (str)            : subtipo do produto (ex: 'VA', 'VR')
            TRAN_CODE (str)          : código de transação
            TCQ (str)                : Transaction Category Qualifier
            TAD (str)                : Travel Authorization Data
            MVV (str)                : Merchant Verification Value
            ISS_REG (str)            : Issuer Region (ex: '4'=LAC)
            TIMELINESS (int)         : dias de atraso na submissão
            MANDATORY_DATA (str)     : dados mandatórios presentes
            RESP_CODE (str)          : código de resposta
        """
        amount = float(params.get("AMOUNT", params.get("amount", 0)))
        ctx = self._build_visa_ctx(params, amount)
        return self._calc_visa(ctx, amount, include_cascata=params.get("debug", False))

    def calcular_visa_simples(self, params: dict) -> VisaCalcResult:
        """
        Calcula intercâmbio Visa com termos simplificados em português.

        Parâmetros:
            valor (float)            : valor da transação em BRL
            produto (str)            : 'classic', 'platinum', 'infinite', 'hnw', 'signature',
                                       'business', 'corporate', 'b2b', 'bndes', 'vale', 'agro'
            afs (str)                : 'credito' ou 'debito'
            canal (str)              : 'fisico', 'ecommerce', 'ecommerce_3ds', 'contactless'
            mcc (str|int)            : MCC do estabelecimento
            categoria (str)          : 'restaurante', 'supermercado', etc.
            parcelas (int)           : número de parcelas (padrão 1)
            internacional (bool)     : True para transação internacional (padrão: False = doméstica)
            debug (bool)             : incluir trilha de cascata na resposta
        """
        valor = float(params.get("valor", 0))
        produto = str(params.get("produto", "classic")).lower()
        afs_raw = str(params.get("afs", "credito")).lower()
        canal = str(params.get("canal", "fisico")).lower()
        parcelas = int(params.get("parcelas", 1))
        internacional = bool(params.get("internacional", False))

        afs = "D" if "deb" in afs_raw else "C"
        settl_flag = "0" if internacional else "9"
        pid = VISA_PID_MAP.get(produto, "F^")

        # MCC (aceita int ou string)
        mcc = params.get("mcc")
        if not mcc and params.get("categoria"):
            mcc_int = InterchangeCalculator._categoria_to_mcc(str(params["categoria"]).lower())
            mcc = str(mcc_int) if mcc_int else None
        elif mcc:
            mcc = str(int(mcc))

        # POS_ENTRY_MODE e ECI por canal
        pos_entry_mode = None
        eci = None
        if canal in ("ecommerce", "ecommerce_3ds"):
            pos_entry_mode = "81"
            if canal == "ecommerce_3ds":
                eci = "05"
        elif canal == "contactless":
            pos_entry_mode = "07"
        else:  # fisico / chip
            pos_entry_mode = "05"

        tech: dict = {
            "AMOUNT": valor,
            "SETTL_FLAG": settl_flag,
            "PID": pid,
            "AFS": afs,
            "INST": parcelas,
            "debug": params.get("debug", False),
        }
        if mcc:
            tech["MCC"] = mcc
        if pos_entry_mode:
            tech["POS_ENTRY_MODE"] = pos_entry_mode
        if eci:
            tech["ECI"] = eci

        # Campos opcionais passados diretamente pelo chamador
        for field in ("SPI", "BAI", "SUBTYPE", "TRAN_CODE", "TCQ", "TAD", "MVV", "ISS_REG"):
            if params.get(field):
                tech[field] = params[field]

        return self.calcular_visa(tech)

    # ------------------------------------------------------------------
    # Cálculo interno Visa
    # ------------------------------------------------------------------

    def _build_visa_ctx(self, params: dict, amount: float) -> dict:
        """Normaliza parâmetros Visa para o contexto de avaliação."""
        def _str(key: str):
            v = params.get(key)
            return str(v).strip() if v is not None else None

        def _int(key: str, default=None):
            v = params.get(key)
            if v is None:
                return default
            try:
                return int(v)
            except (ValueError, TypeError):
                return default

        def _float(key: str, default=0.0):
            v = params.get(key)
            if v is None:
                return default
            try:
                return float(v)
            except (ValueError, TypeError):
                return default

        # MANDATORY_DATA: default "PRESENT" para não acionar NON-QUAL erroneamente.
        # A regra BR-NON-QUAL só deve disparar quando o dado realmente faltar,
        # ou seja, quando o caller passar explicitamente MANDATORY_DATA="" ou None.
        mandatory_data_raw = params.get("MANDATORY_DATA")
        if mandatory_data_raw is None:
            mandatory_data = "PRESENT"
        else:
            mandatory_data = str(mandatory_data_raw).strip() or None

        return {
            "AMOUNT": amount,
            "SETTL_FLAG": _str("SETTL_FLAG") or "9",
            "PID": _str("PID"),
            "AFS": _str("AFS"),
            "ECI": _str("ECI"),
            "MCC": _str("MCC"),
            "INST": _int("INST", 1),
            "POS_ENTRY_MODE": _str("POS_ENTRY_MODE"),
            "SPI": _str("SPI"),
            "BAI": _str("BAI"),
            "SUBTYPE": _str("SUBTYPE"),
            "TRAN_CODE": _str("TRAN_CODE"),
            "TCQ": _str("TCQ"),
            "TAD": _str("TAD"),
            "MVV": _str("MVV"),
            "ISS_REG": _str("ISS_REG"),
            "TIMELINESS": _int("TIMELINESS", 0),
            "MANDATORY_DATA": mandatory_data,
            "RESP_CODE": _str("RESP_CODE"),
        }

    def _calc_visa(self, ctx: dict, amount: float, include_cascata: bool = False) -> VisaCalcResult:
        matched = None
        cascata = []

        for rule in self.visa_rules:
            try:
                hit = bool(eval(rule.compiled, {"__builtins__": {}}, {"ctx": ctx}))
            except Exception:
                hit = False

            if include_cascata:
                cascata.append({
                    "priority": rule.priority,
                    "rule_id": rule.rule_id,
                    "descriptor": rule.descriptor,
                    "result": hit,
                })

            if hit:
                matched = rule
                break

        if not matched:
            return VisaCalcResult(
                sucesso=False,
                erro=(
                    "Nenhuma regra Visa encontrada para os parâmetros fornecidos. "
                    "Verifique SETTL_FLAG, PID, AFS e demais campos. "
                    "Nota: a tabela atual não contém regra doméstica padrão para Platinum (PID=N^) — "
                    "adicione a linha correspondente no Excel se necessário."
                    if not include_cascata
                    else "Nenhuma regra Visa encontrada. Veja 'cascata' para detalhes."
                ),
                cascata=cascata,
            )

        # Taxa base: amount * rate_pct%
        taxa = round(amount * (matched.rate_pct / 100), 4)
        # Soma taxa fixa
        taxa += matched.fixed_fee
        # Aplica teto (cap) se definido
        cap_aplicado = False
        if matched.cap_fee > 0 and taxa > matched.cap_fee:
            taxa = matched.cap_fee
            cap_aplicado = True

        result = VisaCalcResult(
            sucesso=True,
            rule_id=matched.rule_id,
            descriptor=matched.descriptor,
            accounting_sign=matched.accounting_sign,
            rate_pct=matched.rate_pct,
            fixed_fee=matched.fixed_fee,
            cap_fee=matched.cap_fee,
            valor_transacao=amount,
            taxa_intercambio=round(taxa, 4),
            cap_aplicado=cap_aplicado,
            prioridade=matched.priority,
            cascata=cascata,
        )
        if matched.rate_corrupted:
            result.aviso = (
                f"ATENÇÃO: A taxa da regra '{matched.rule_id}' está corrompida na planilha "
                "(célula formatada como data em vez de número). Corrija o arquivo Excel e recarregue."
            )
        return result

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _build_ctx(self, params: dict) -> dict:
        ctx = {
            "ACQR_COUNTRY_CODE": params.get("ACQR_COUNTRY_CODE", 76),
            "ISSR_COUNTRY_CODE": params.get("ISSR_COUNTRY_CODE", 76),
            "PRODUCT_TYPE": params.get("PRODUCT_TYPE", "CREDIT"),
            "CARD_PROGRAM_ID": params.get("CARD_PROGRAM_ID"),
            "CARD_PRESENT_ID": params.get("CARD_PRESENT_ID", 1),
            "PAYPASS_IND": params.get("PAYPASS_IND", 0),
            "ECSLI": params.get("ECSLI"),
            "MCC": int(params["MCC"]) if params.get("MCC") else None,
            "PROC_CODE": int(params.get("PROC_CODE", 0)),
            "TXN_AMOUNT": float(params.get("TXN_AMOUNT", params.get("valor", 0))),
            "INSTALLMENTS": int(params.get("INSTALLMENTS", params.get("parcelas", 1))),
            "DOCUMENT_TYPE": int(params.get("DOCUMENT_TYPE", 2)),
            "MC_TRANS_TYPE_IDENTIFIER": params.get("MC_TRANS_TYPE_IDENTIFIER"),
            "ENTRY_MODE": params.get("ENTRY_MODE"),
            "PROD_ID": params.get("PROD_ID"),
            "SEGMENT": params.get("SEGMENT"),
        }
        return ctx

    def _get_segment(self, mcc: Optional[int]) -> str:
        if mcc is None:
            return "Base"
        seg = self.mcc_to_segment.get(int(mcc))
        return seg if seg else "Base"

    def _lookup_rate(self, ird: str, tier: str, segment: str) -> Optional[float]:
        """
        Busca taxa para um IRD.

        IRDs com taxa direta (Basic rate): ex. IA
        IRDs com ajuste (Adjustments): ex. HU = IA_rate + ajuste
        """
        # Tentativa direta (IRD tem Basic rate próprio)
        rate = self.base_rates.get((ird, tier, segment))
        if rate is not None:
            return rate

        # Ajuste sobre IA
        base_ird = ADJUSTMENT_IRD_BASE.get(ird)
        if base_ird:
            base_rate = self.base_rates.get((base_ird, tier, segment))
            if base_rate is None:
                # Fallback para segment "Base"
                base_rate = self.base_rates.get((base_ird, tier, "Base"))
            if base_rate is not None:
                adjustment = self.adjustments.get((ird, segment), self.adjustments.get((ird, "Base"), 0.0))
                return base_rate + adjustment

        # Fallback: segment "Other" ou "Base"
        for seg_fallback in ("Other", "Base"):
            rate = self.base_rates.get((ird, tier, seg_fallback))
            if rate is not None:
                return rate

        return None

    def _mcc_to_maestro_segment(self, mcc: Optional[int]) -> Optional[str]:
        """Mapeia MCC para o SEGMENT usado nas regras Maestro."""
        MAESTRO_SEG = {
            # Supermercados
            5411: "SPR_MKT", 5422: "SPR_MKT", 5451: "SPR_MKT", 5462: "SPR_MKT",
            5499: "SPR_MKT", 5300: "WHOLE",
            # Atacadista
            5199: "WHOLE", 5912: "WHOLE",
            # Loteria / Governo / Transporte / GenEx → com teto
            9406: "LOT", 9311: "GOV_SVC", 9222: "GOV_SVC", 9399: "GOV_SVC",
            4111: "COMM_T", 4784: "COMM_T", 4121: "COMM_T",
            4813: "GEN_EX", 4814: "GEN_EX", 4900: "GEN_EX",
            # Micro merchant
            742: "MM", 1799: "MM", 5697: "MM", 7230: "MM",
            7538: "MM", 8011: "MM", 8021: "MM", 8099: "MM",
        }
        return MAESTRO_SEG.get(mcc) if mcc else None

    @staticmethod
    def _categoria_to_mcc(categoria: str) -> Optional[int]:
        CATEGORIAS = {
            "restaurante": 5812,
            "lanchonete": 5814,
            "bar": 5813,
            "supermercado": 5411,
            "mercado": 5411,
            "hipermercado": 5411,
            "atacado": 5300,
            "atacadista": 5300,
            "farmacia": 5912,
            "drogaria": 5912,
            "posto": 5541,
            "combustivel": 5541,
            "educacao": 8299,
            "escola": 8211,
            "faculdade": 8220,
            "saude": 8099,
            "medico": 8011,
            "hospital": 8062,
            "hotel": 7011,
            "turismo": 4722,
            "transporte": 4111,
            "pedagio": 4784,
            "taxi": 4121,
            "loteria": 9406,
            "governo": 9311,
            "utilidade": 4900,
            "energia": 4900,
            "vestuario": 5621,
            "roupa": 5621,
            "eletronico": 5732,
            "informatica": 5734,
            "movel": 5021,
            "construcao": 5251,
        }
        return CATEGORIAS.get(categoria.lower())
