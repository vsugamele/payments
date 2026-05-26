"""Schemas Pydantic para a API de provisionamento de intercâmbio."""
from typing import Optional, Literal
from pydantic import BaseModel, Field


class CalcTecnicoRequest(BaseModel):
    """Parâmetros técnicos completos (ISO 8583 / IPM)."""

    valor: float = Field(..., description="Valor da transação em BRL")
    bandeira: Literal["mastercard", "maestro"] = "mastercard"

    # Identificação do produto
    PRODUCT_TYPE: Optional[Literal["CREDIT", "DEBIT", "PREPAID"]] = "CREDIT"
    CARD_PROGRAM_ID: Optional[str] = Field(None, description="MSI=Maestro")
    PROD_ID: Optional[str] = Field(None, description="Ex: MBK, GCP")

    # Canal / tecnologia
    CARD_PRESENT_ID: int = Field(1, description="0=CNP/ecommerce, 1=físico")
    PAYPASS_IND: int = Field(0, description="1=contactless")
    ECSLI: Optional[str] = Field(None, description="FRICTIONLESS para 3DS autenticado")
    ENTRY_MODE: Optional[str] = Field(None, description="QRP para QR code")

    # Transação
    MCC: Optional[int] = Field(None, description="Merchant Category Code")
    PROC_CODE: int = Field(0, description="00=compra, 09=saque, 28=pagamento")
    INSTALLMENTS: int = Field(1, description="Número de parcelas")
    TXN_AMOUNT: Optional[float] = None  # usa 'valor' se omitido
    DOCUMENT_TYPE: int = Field(2, description="2=PF, 1=PJ")

    # Cross-border
    ACQR_COUNTRY_CODE: int = Field(76, description="76=Brasil")
    ISSR_COUNTRY_CODE: int = Field(76, description="76=doméstico")

    # MoneySend / tipos especiais
    MC_TRANS_TYPE_IDENTIFIER: Optional[str] = None

    # Lookup de taxa (obrigatório para MC)
    tier: Optional[str] = Field(
        "Consumer standard",
        description="Consumer standard | gold | platinum | black",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "valor": 150.00,
                "bandeira": "mastercard",
                "PRODUCT_TYPE": "CREDIT",
                "CARD_PRESENT_ID": 0,
                "PAYPASS_IND": 0,
                "MCC": 5812,
                "INSTALLMENTS": 1,
                "DOCUMENT_TYPE": 2,
                "tier": "Consumer platinum",
            }
        }


class CalcSimplesRequest(BaseModel):
    """Parâmetros simplificados em português."""

    valor: float = Field(..., description="Valor da transação em BRL")
    pan: Optional[str] = Field(None, description="Número do cartão de 16 a 19 dígitos para lookup de BIN")
    bandeira: Literal["mastercard", "maestro"] = "mastercard"
    tipo_cartao: str = Field(
        "standard",
        description="standard | gold | platinum | black",
    )
    pessoa: Literal["fisica", "juridica"] = Field("fisica", description="PF ou PJ")
    canal: str = Field(
        "fisico",
        description="fisico | ecommerce | ecommerce_3ds | contactless | qr",
    )
    tipo_produto: Optional[Literal["CREDIT", "DEBIT"]] = "CREDIT"
    mcc: Optional[int] = Field(None, description="MCC (opcional, use categoria se preferir)")
    categoria: Optional[str] = Field(
        None,
        description="restaurante | supermercado | farmacia | posto | educacao | etc.",
    )
    parcelas: int = Field(1, description="Número de parcelas")

    class Config:
        json_schema_extra = {
            "example": {
                "valor": 150.00,
                "bandeira": "mastercard",
                "tipo_cartao": "platinum",
                "pessoa": "fisica",
                "canal": "ecommerce",
                "categoria": "restaurante",
                "parcelas": 1,
            }
        }


class CalcBatchItem(BaseModel):
    """Item de lote para cálculo batch."""
    id: Optional[str] = None
    simples: bool = True
    params: dict


class CalcBatchRequest(BaseModel):
    transacoes: list[CalcBatchItem]


# ---------------------------------------------------------------------------
# Visa
# ---------------------------------------------------------------------------

class CalcVisaTecnicoRequest(BaseModel):
    """Parâmetros técnicos do Clearing Visa."""

    AMOUNT: float = Field(..., description="Valor da transação em BRL")

    SETTL_FLAG: str = Field(
        "9",
        description="'8' ou '9'=doméstico BR, '0'=internacional",
    )
    PID: Optional[str] = Field(None, description="Product ID Visa (ex: N^=Platinum, F^=Classic, I^=Infinite)")
    AFS: Optional[str] = Field(None, description="Account Funding Source: C=Crédito, D=Débito")
    ECI: Optional[str] = Field(None, description="ECI 05/06=3DS autenticado")
    MCC: Optional[str] = Field(None, description="Merchant Category Code (como string)")
    INST: int = Field(1, description="Número de parcelas")
    POS_ENTRY_MODE: Optional[str] = Field(None, description="81=ecommerce, 05=chip, 07=contactless")
    SPI: Optional[str] = Field(None, description="Special Payment Indicator (ex: '5'=Crediário)")
    BAI: Optional[str] = Field(None, description="Business Application Identifier (TU, CP, AA)")
    SUBTYPE: Optional[str] = Field(None, description="Subtipo do produto (VA, VR, VCUS)")
    TRAN_CODE: Optional[str] = Field(None, description="Código de transação (05=compra, 07=saque, 15=disputa)")
    TCQ: Optional[str] = Field(None, description="Transaction Category Qualifier (1=AFT, 2=OCT)")
    TAD: Optional[str] = Field(None, description="Travel Authorization Data (A, H)")
    MVV: Optional[str] = Field(None, description="Merchant Verification Value (para VPP/B2B)")
    ISS_REG: Optional[str] = Field(None, description="Issuer Region (4=LAC)")
    TIMELINESS: int = Field(0, description="Dias de atraso na submissão (>32 → NON_QUAL)")
    MANDATORY_DATA: Optional[str] = Field(None, description="Dados mandatórios presentes")
    RESP_CODE: Optional[str] = Field(None, description="Código de resposta (00=aprovado)")
    debug: bool = Field(False, description="Incluir trilha de cascata na resposta")

    class Config:
        json_schema_extra = {
            "example": {
                "AMOUNT": 200.00,
                "SETTL_FLAG": "9",
                "PID": "N^",
                "AFS": "C",
                "ECI": "05",
                "MCC": "5812",
                "INST": 1,
                "POS_ENTRY_MODE": "81",
                "debug": True,
            }
        }


class CalcVisaSimplesRequest(BaseModel):
    """Parâmetros simplificados para simulação Visa."""

    valor: float = Field(..., description="Valor da transação em BRL")
    produto: str = Field(
        "classic",
        description=(
            "classic | platinum | infinite | hnw | signature | "
            "business | corporate | b2b | bndes | vale | agro"
        ),
    )
    afs: str = Field("credito", description="credito | debito")
    canal: str = Field(
        "fisico",
        description="fisico | ecommerce | ecommerce_3ds | contactless",
    )
    mcc: Optional[int] = Field(None, description="MCC do estabelecimento")
    categoria: Optional[str] = Field(
        None,
        description="restaurante | supermercado | farmacia | posto | etc.",
    )
    parcelas: int = Field(1, description="Número de parcelas")
    internacional: bool = Field(False, description="True para transação internacional")
    debug: bool = Field(False, description="Incluir trilha de cascata na resposta")

    # Campos opcionais para cenários específicos
    SPI: Optional[str] = Field(None, description="Special Payment Indicator")
    BAI: Optional[str] = Field(None, description="Business Application Identifier")
    SUBTYPE: Optional[str] = Field(None, description="Subtipo (VA, VR, VCUS)")
    TRAN_CODE: Optional[str] = Field(None, description="Código de transação")
    TCQ: Optional[str] = Field(None, description="Transaction Category Qualifier")
    TAD: Optional[str] = Field(None, description="Travel Authorization Data")
    MVV: Optional[str] = Field(None, description="Merchant Verification Value")
    ISS_REG: Optional[str] = Field(None, description="Issuer Region")

    class Config:
        json_schema_extra = {
            "example": {
                "valor": 200.00,
                "produto": "platinum",
                "afs": "credito",
                "canal": "ecommerce_3ds",
                "categoria": "restaurante",
                "parcelas": 1,
                "debug": True,
            }
        }
