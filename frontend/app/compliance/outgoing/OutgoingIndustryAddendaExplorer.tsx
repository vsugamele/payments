'use client';

import React, { useMemo, useState } from 'react';
import { OutgoingBrandId } from '@/data/outgoing-tables-flows';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export interface IndustryAddendumField {
  posOrTag: string;
  fieldName: string;
  status: 'M' | 'C';
  format: string;
  descriptionAndRule: string;
}

export interface IndustrySectorSpec {
  id: string;
  icon: string;
  title: string;
  mccs: string;
  subtitle: string;
  triggerCondition: string;
  brazilSpecificRule: string;
  byBrand: {
    visa: {
      recordName: string;
      overview: string;
      fields: IndustryAddendumField[];
      consequenceIfMissing: string;
    };
    elo: {
      recordName: string;
      overview: string;
      fields: IndustryAddendumField[];
      consequenceIfMissing: string;
    };
    mastercard: {
      recordName: string;
      overview: string;
      fields: IndustryAddendumField[];
      consequenceIfMissing: string;
    };
  };
}

export const INDUSTRY_ADDENDA_SECTORS: IndustrySectorSpec[] = [
  // =========================================================================
  // 1. COMPANHIAS AÉREAS & AGÊNCIAS IATA
  // =========================================================================
  {
    id: 'airline-iata',
    icon: '✈️',
    title: '1. Companhias Aéreas & Agências de Viagem (IATA)',
    mccs: 'MCC 3000 a 3299 · MCC 4511 · MCC 4722',
    subtitle:
      'Exige o envio do número do bilhete IATA (13 dígitos), nome do passageiro, aeroportos de origem/destino, código da companhia e separação de Taxa de Embarque no Brasil.',
    triggerCondition:
      'Qualquer compra ou estorno em MCC de Companhia Aérea (3000–3299 e 4511) ou Agência IATA com emissão de bilhete.',
    brazilSpecificRule:
      'No Brasil, a Taxa de Embarque aeroportuária (não sujeita a MDR comercial comum) possui tratamento dedicado: na Elo usa-se o Tipo de Operação 992 (Valor Principal da Passagem) e 995 (Taxa de Embarque) nos Registros 00/01/02, além do Registro 08 para dados do voo.',
    byBrand: {
      visa: {
        recordName: 'TCR 3 — Industry-Specific Data (Format AI — Airline Itinerary)',
        overview:
          'Linha posicional de 168 bytes acoplada ao TC 05/06 contendo o bilhete IATA e até 4 trechos (legs) de voo.',
        fields: [
          {
            posOrTag: 'Pos 1–4 + 5–6',
            fieldName: 'TC + TCR 3 + Business Format Code = "AI"',
            status: 'M',
            format: '4N + 2A',
            descriptionAndRule: 'Identifica que o TCR 3 carrega dados de Companhia Aérea ("AI").',
          },
          {
            posOrTag: 'Pos 7–26',
            fieldName: 'Passenger Name (Nome do Passageiro)',
            status: 'M',
            format: '20 AN',
            descriptionAndRule: 'Sobrenome/Nome do passageiro conforme emitido no bilhete (ex.: SILVA/JOAO).',
          },
          {
            posOrTag: 'Pos 27–32 + 33–35',
            fieldName: 'Departure Date (MMDDYY) + Origination City/Airport Code',
            status: 'M',
            format: '6N + 3A',
            descriptionAndRule: 'Data do embarque inicial e código IATA de 3 letras do aeroporto de origem (ex.: GRU, CGH).',
          },
          {
            posOrTag: 'Pos 36–79',
            fieldName: 'Trip Legs 1 to 4 (Carrier Code 2A + Service Class 1A + Stopover + Destination 3A)',
            status: 'M',
            format: '4 × 11 AN',
            descriptionAndRule: 'Detalha até 4 conexões/trechos com código IATA da cia aérea, classe tarifária e destino.',
          },
          {
            posOrTag: 'Pos 110–122',
            fieldName: 'Ticket / Document Number (13 dígitos IATA)',
            status: 'M',
            format: '13 N',
            descriptionAndRule: 'Código da cia (3 díg.) + Número sequencial do bilhete eletrônico (10 díg.).',
          },
          {
            posOrTag: 'Pos 142',
            fieldName: 'Restricted Ticket Indicator',
            status: 'C',
            format: '1 AN',
            descriptionAndRule: '"1" = Bilhete com restrição/não reembolsável (protege contra disputas 13.x de cancelamento fora da regra).',
          },
        ],
        consequenceIfMissing:
          'Downgrade imediato de intercâmbio (perda da qualificação CPS/Airline) no VSS-130 + vulnerabilidade a chargebacks.',
      },
      elo: {
        recordName: 'Registro 08 (Companhias Aéreas IATA) + Tipo de Operação 992 / 995 (Taxa de Embarque)',
        overview:
          'Registro posicional de 168 bytes específico da Elo 26.2 para transporte aéreo, combinado com a segregação de Taxa de Embarque.',
        fields: [
          {
            posOrTag: 'Reg 08 · Pos 1–4',
            fieldName: 'Código de Transação (05/06) + Subcódigo "08"',
            status: 'M',
            format: '4 AN',
            descriptionAndRule: 'Identifica o Registro 08 de Companhias Aéreas.',
          },
          {
            posOrTag: 'Reg 08 · Pos 5–24',
            fieldName: 'Nome do Passageiro',
            status: 'M',
            format: '20 AN',
            descriptionAndRule: 'Nome do passageiro titular do bilhete aéreo.',
          },
          {
            posOrTag: 'Reg 08 · Pos 25–37',
            fieldName: 'Número do Bilhete IATA (13 posições)',
            status: 'M',
            format: '13 N',
            descriptionAndRule: 'Número oficial do e-ticket emitido.',
          },
          {
            posOrTag: 'Reg 08 · Pos 38–85',
            fieldName: 'Trechos 1 a 4 (Aeroporto Origem 3A + Destino 3A + Cia 2A + Classe + Data Embarque)',
            status: 'M',
            format: '48 AN',
            descriptionAndRule: 'Itinerário completo do voo para exibição na fatura do portador e conciliação.',
          },
          {
            posOrTag: 'Reg 00/01/02 · Tipo 992 / 995',
            fieldName: 'Segregação Passagem (992) × Taxa de Embarque (995)',
            status: 'C',
            format: '3 N',
            descriptionAndRule: 'Obrigatório quando há cobrança separada de taxa de embarque aeroportuária no Brasil.',
          },
        ],
        consequenceIfMissing:
          'Rejeição no retorno TE01 (Registro 09) ou liquidação sem tratamento tarifário de Taxa de Embarque.',
      },
      mastercard: {
        recordName: 'MTI 1240 / MTI 1644 Airline Addendum (PDS 0501 a PDS 0530)',
        overview:
          'Subelementos PDS de itinerário aéreo transportados no MTI 1240 ou em mensagem de adendo MTI 1644 vinculada pelo Trace ID.',
        fields: [
          {
            posOrTag: 'PDS 0501',
            fieldName: 'Passenger Name',
            status: 'M',
            format: 'TLV AN',
            descriptionAndRule: 'Nome do passageiro.',
          },
          {
            posOrTag: 'PDS 0502',
            fieldName: 'Ticket Number (13 dígitos)',
            status: 'M',
            format: 'TLV 13N',
            descriptionAndRule: 'Número do bilhete aéreo IATA.',
          },
          {
            posOrTag: 'PDS 0505 a 0512',
            fieldName: 'Origin Airport, Destination Airport, Carrier, Service Class & Departure Date',
            status: 'M',
            format: 'TLV AN',
            descriptionAndRule: 'Dados estruturados de cada trecho (leg) do itinerário.',
          },
        ],
        consequenceIfMissing:
          'Rebaixamento do IRD (PDS 0158) no relatório IP714010-BB para tarifa Standard/Key-Entered.',
      },
    },
  },

  // =========================================================================
  // 2. HOTELARIA & HOSPEDAGEM (LODGING)
  // =========================================================================
  {
    id: 'hotel-lodging',
    icon: '🏨',
    title: '2. Hotelaria & Hospedagem (Lodging / Resorts)',
    mccs: 'MCC 3501 a 3838 · MCC 7011',
    subtitle:
      'Regula reservas, pré-autorizações incrementais, No-Show (não comparecimento) e o adendo de diárias de hotel no Outgoing.',
    triggerCondition:
      'Transações em hotéis, resorts e pousadas (MCCs 3501–3838 e 7011), incluindo cobrança de diárias, consumos extras e No-Show.',
    brazilSpecificRule:
      'Para cobrança de No-Show (quando o hóspede não aparece para o check-in), apenas 1 diária + impostos pode ser liquidada e o indicador específico de No-Show é 100% obrigatório no Outgoing.',
    byBrand: {
      visa: {
        recordName: 'TCR 3 — Industry-Specific Data (Format HL — Hotel / Lodging)',
        overview:
          'Registro de 168 bytes com número do fólio, datas de check-in/check-out, valor da diária e indicador de No-Show.',
        fields: [
          {
            posOrTag: 'Pos 1–4 + 5–6',
            fieldName: 'TC + TCR 3 + Business Format Code = "HL"',
            status: 'M',
            format: '4N + 2A',
            descriptionAndRule: 'Identifica adendo de Hotelaria ("HL").',
          },
          {
            posOrTag: 'Pos 7–18',
            fieldName: 'Check-in Date (YYMMDD) + Check-out Date (YYMMDD)',
            status: 'M',
            format: '6N + 6N',
            descriptionAndRule: 'Datas de entrada e saída do hóspede.',
          },
          {
            posOrTag: 'Pos 19–30',
            fieldName: 'Daily Room Rate (Valor da Diária)',
            status: 'M',
            format: '12 N',
            descriptionAndRule: 'Valor da tarifa diária do quarto com 2 casas decimais implícitas.',
          },
          {
            posOrTag: 'Pos 45–69',
            fieldName: 'Folio / Confirmation Number',
            status: 'M',
            format: '25 AN',
            descriptionAndRule: 'Número da conta/fólio do hóspede ou código da reserva garantida.',
          },
          {
            posOrTag: 'Pos 70',
            fieldName: 'Special Program / No-Show Indicator',
            status: 'C',
            format: '1 AN',
            descriptionAndRule: '"2" = No-Show Transaction (obrigatório quando cobrar não comparecimento).',
          },
        ],
        consequenceIfMissing:
          'Perda da tarifa CPS/Hotel & Car Rental no VSS-130 e derrota automática em disputas de No-Show (Condition 13.5 / 13.2).',
      },
      elo: {
        recordName: 'Registros 00, 01 e 02 com Indicadores de Pré-Autorização / Hospedagem',
        overview:
          'Exige vinculação correta do código de autorização (e pré-autorização incremental quando aplicável) nos Registros 00 e 02.',
        fields: [
          {
            posOrTag: 'Reg 00 · Pos 60–63',
            fieldName: 'MCC de Hospedagem (3501–3838 ou 7011)',
            status: 'M',
            format: '4 N',
            descriptionAndRule: 'Identifica o ramo hoteleiro.',
          },
          {
            posOrTag: 'Reg 00 · Pos 93–98',
            fieldName: 'Código de Autorização da Reserva / Check-in',
            status: 'M',
            format: '6 AN',
            descriptionAndRule: 'Código aprovado na autorização/pré-autorização.',
          },
        ],
        consequenceIfMissing:
          'Risco de chargeback por valor divergente da reserva ou falta de comprovação de No-Show.',
      },
      mastercard: {
        recordName: 'MTI 1240 Lodging Addendum (PDS 0535 a PDS 0550)',
        overview:
          'Subelementos PDS que detalham Arrival Date, Departure Date, Folio Number e Daily Room Rate no MTI 1240.',
        fields: [
          {
            posOrTag: 'PDS 0536 / 0537',
            fieldName: 'Arrival Date & Departure Date',
            status: 'M',
            format: 'TLV 6N',
            descriptionAndRule: 'Datas de check-in e check-out.',
          },
          {
            posOrTag: 'PDS 0538',
            fieldName: 'Folio Number',
            status: 'M',
            format: 'TLV AN',
            descriptionAndRule: 'Número da fatura/fólio do hotel.',
          },
          {
            posOrTag: 'PDS 0540',
            fieldName: 'Daily Room Rate',
            status: 'M',
            format: 'TLV 12N',
            descriptionAndRule: 'Valor da diária de hospedagem.',
          },
        ],
        consequenceIfMissing:
          'Downgrade de IRD no relatório IP714010-BB em cartões corporativos/T&E e internacionais.',
      },
    },
  },

  // =========================================================================
  // 3. LOCADORAS DE VEÍCULOS (CAR RENTAL)
  // =========================================================================
  {
    id: 'car-rental',
    icon: '🚗',
    title: '3. Locadoras de Veículos (Car Rental)',
    mccs: 'MCC 3351 a 3441 · MCC 7512',
    subtitle:
      'Exige número do contrato de locação, nome do locatário, datas de retirada e devolução e separação de cobranças posteriores (multas/avarias).',
    triggerCondition:
      'Transações em locadoras de automóveis (MCCs 3351–3441 e 7512).',
    brazilSpecificRule:
      'Cobranças posteriores de multas de trânsito, pedágio ou avarias exigem contrato assinado/aceito separadamente e não podem reutilizar a autorização inicial do aluguel.',
    byBrand: {
      visa: {
        recordName: 'TCR 3 — Industry-Specific Data (Format CA — Car Rental)',
        overview:
          'Registro de 168 bytes com Rental Agreement Number, Renter Name, Checkout/Return Date e diárias.',
        fields: [
          {
            posOrTag: 'Pos 1–4 + 5–6',
            fieldName: 'TC + TCR 3 + Business Format Code = "CA"',
            status: 'M',
            format: '4N + 2A',
            descriptionAndRule: 'Identifica adendo de Locadora de Veículos ("CA").',
          },
          {
            posOrTag: 'Pos 7–25',
            fieldName: 'Rental Agreement Number (Número do Contrato)',
            status: 'M',
            format: '19 AN',
            descriptionAndRule: 'Número do contrato de locação.',
          },
          {
            posOrTag: 'Pos 26–45',
            fieldName: 'Renter Name (Nome do Condutor/Locatário)',
            status: 'M',
            format: '20 AN',
            descriptionAndRule: 'Nome do locatário principal.',
          },
          {
            posOrTag: 'Pos 46–57',
            fieldName: 'Check-out Date + Return Date',
            status: 'M',
            format: '12 N',
            descriptionAndRule: 'Datas de retirada e devolução do veículo.',
          },
        ],
        consequenceIfMissing:
          'Downgrade de intercâmbio em cartões comerciais/internacionais no VSS-130.',
      },
      elo: {
        recordName: 'Registros 00, 01 e 02 (MCC 3351–3441 / 7512)',
        overview:
          'Liquidação da locação principal e envio separado (com nova autorização ou MIT contratual) para despesas acessórias.',
        fields: [
          {
            posOrTag: 'Reg 00 · Pos 60–63',
            fieldName: 'MCC de Locação de Veículos',
            status: 'M',
            format: '4 N',
            descriptionAndRule: 'MCC da locadora.',
          },
          {
            posOrTag: 'Reg 00 · Pos 93–98',
            fieldName: 'Código de Autorização Válido',
            status: 'M',
            format: '6 AN',
            descriptionAndRule: 'Autorização vinculada ao contrato.',
          },
        ],
        consequenceIfMissing:
          'Perda de disputa em cobranças de avarias sem documentação separada.',
      },
      mastercard: {
        recordName: 'MTI 1240 Car Rental Addendum (PDS 0560 a PDS 0575)',
        overview:
          'Subelementos PDS com Rental Agreement Number, Renter Name, Checkout/Return Location & Date.',
        fields: [
          {
            posOrTag: 'PDS 0560',
            fieldName: 'Rental Agreement Number',
            status: 'M',
            format: 'TLV AN',
            descriptionAndRule: 'Número do contrato de locação.',
          },
          {
            posOrTag: 'PDS 0561',
            fieldName: 'Renter Name',
            status: 'M',
            format: 'TLV AN',
            descriptionAndRule: 'Nome do locatário.',
          },
          {
            posOrTag: 'PDS 0564 / 0566',
            fieldName: 'Check-Out Date & Return Date',
            status: 'M',
            format: 'TLV 6N',
            descriptionAndRule: 'Datas de retirada e entrega do veículo.',
          },
        ],
        consequenceIfMissing:
          'Rebaixamento do IRD corporativo/T&E no relatório IP714010-BB.',
      },
    },
  },

  // =========================================================================
  // 4. FROTAS, COMBUSTÍVEL & TRANSPORTE PÚBLICO / PEDÁGIO
  // =========================================================================
  {
    id: 'fleet-fuel-transit',
    icon: '⛽',
    title: '4. Frotas, Postos de Combustível & Mobilidade Urbana / Pedágio',
    mccs: 'MCC 5541 · MCC 5542 · MCC 4111 · MCC 4784',
    subtitle:
      'Cobre dados de abastecimento corporativo (litros, tipo de combustível, hodômetro) e agregação de passagens/pedágios contactless (Transit MIT).',
    triggerCondition:
      'Cartões de Frota/Corporativos em postos (MCC 5541/5542) ou transações Contactless em catracas de metrô/ônibus/pedágio (MCC 4111/4784).',
    brazilSpecificRule:
      'Em Transporte Público e Pedágios no Brasil (MCC 4111/4784), múltiplas passagens do mesmo dia podem ser agregadas em um único registro de Outgoing ao fim do ciclo, referenciando o indicador de Transit Aggregation / MIT.',
    byBrand: {
      visa: {
        recordName: 'TCR 3 (Format FL — Fleet/Fuel) & TCR 5 Transit Indicators',
        overview:
          'Para frotas, o TCR 3 FL detalha tipo de combustível, litragem e hodômetro; para transporte urbano, o TCR 5 identifica Transit Contactless.',
        fields: [
          {
            posOrTag: 'TCR 3 FL · Pos 5–6',
            fieldName: 'Business Format Code = "FL" (Fleet Service)',
            status: 'M',
            format: '2 A',
            descriptionAndRule: 'Identifica adendo de Frota/Combustível.',
          },
          {
            posOrTag: 'TCR 3 FL · Pos 7–30',
            fieldName: 'Fuel Type + Quantity (Litros) + Unit Price + Odometer',
            status: 'M',
            format: '24 AN',
            descriptionAndRule: 'Dados do abastecimento exigidos para cartões Visa Fleet/Commercial.',
          },
          {
            posOrTag: 'TCR 0 / TCR 5 · Transit',
            fieldName: 'Transit Transaction Type Indicator (Contactless Aggregation / Debt Recovery)',
            status: 'C',
            format: '2 AN',
            descriptionAndRule: 'Obrigatório em bilhetagem eletrônica de transporte público (MCC 4111) e pedágio (MCC 4784).',
          },
        ],
        consequenceIfMissing:
          'Perda de tarifa especial de Mobilidade Urbana / Transit ou Fleet no VSS-130.',
      },
      elo: {
        recordName: 'Registros 00, 01 e 02 — Mobilidade Urbana, Pedágio e Abastecimento',
        overview:
          'Qualificação tarifária diferenciada para transporte público, pedágios e postos de combustível.',
        fields: [
          {
            posOrTag: 'Reg 00 · Pos 60–63',
            fieldName: 'MCC 4111 (Transporte), 4784 (Pedágio) ou 5541 (Posto)',
            status: 'M',
            format: '4 N',
            descriptionAndRule: 'Define a regra setorial de intercâmbio Elo.',
          },
          {
            posOrTag: 'Reg 00 + Reg 07',
            fieldName: 'Captura Contactless NFC + Dados de Chip',
            status: 'C',
            format: 'Posicional',
            descriptionAndRule: 'Obrigatório em passagens por aproximação na catraca/pedágio.',
          },
        ],
        consequenceIfMissing:
          'Desqualificação do redutor de intercâmbio do segmento de mobilidade.',
      },
      mastercard: {
        recordName: 'MTI 1240 Fleet Addendum (PDS 0580+) & Transit Aggregation Indicators',
        overview:
          'Transporte dos dados de combustível (PDS 0580+) ou indicadores de Mastercard Transit Partner Program no MTI 1240.',
        fields: [
          {
            posOrTag: 'PDS 0580 a 0590',
            fieldName: 'Product Code, Fuel Quantity, Unit Cost & Odometer',
            status: 'C',
            format: 'TLV AN',
            descriptionAndRule: 'Obrigatório para qualificação de cartões Mastercard Fleet.',
          },
          {
            posOrTag: 'DE 48 / PDS Transit',
            fieldName: 'Transit Program Indicator (Aggregated Contactless Taps)',
            status: 'C',
            format: 'TLV AN',
            descriptionAndRule: 'Identifica liquidação agregada de viagens urbanas e recuperação de tarifa (Debt Recovery).',
          },
        ],
        consequenceIfMissing:
          'Downgrade de IRD no IP714010-BB.',
      },
    },
  },
];

interface Props {
  selectedBrand: OutgoingBrandId;
  onSelectBrand: (b: OutgoingBrandId) => void;
}

export function OutgoingIndustryAddendaExplorer({ selectedBrand, onSelectBrand }: Props) {
  const [selectedSectorId, setSelectedSectorId] = useState<string>(
    INDUSTRY_ADDENDA_SECTORS[0].id
  );

  const activeSector = useMemo(() => {
    return (
      INDUSTRY_ADDENDA_SECTORS.find((s) => s.id === selectedSectorId) ??
      INDUSTRY_ADDENDA_SECTORS[0]
    );
  }, [selectedSectorId]);

  const brandSpec = activeSector.byBrand[selectedBrand];

  const handleExportSectorToDocStudio = () => {
    const rows = brandSpec.fields
      .map(
        (f) =>
          `<tr><td><code>${f.posOrTag}</code></td><td><strong>${f.fieldName}</strong></td><td>[${f.status}]</td><td>${f.format}</td><td>${f.descriptionAndRule}</td></tr>`
      )
      .join('');

    sendToDocStudio({
      mode: 'append_html',
      title: `Adendo Setorial Outgoing — ${activeSector.title} (${selectedBrand.toUpperCase()})`,
      sourceModule: 'Ramos Setoriais Especiais & Adendos de Outgoing',
      html: `
        <h2>${activeSector.icon} ${activeSector.title} — ${selectedBrand.toUpperCase()}</h2>
        <p><strong>MCCs Aplicáveis:</strong> ${activeSector.mccs}</p>
        <p><strong>Gatilho de Obrigatoriedade [C ➔ M]:</strong> ${activeSector.triggerCondition}</p>
        <p><strong>Regra Específica Brasil:</strong> ${activeSector.brazilSpecificRule}</p>
        <h3>Registro / Bloco Setorial: ${brandSpec.recordName}</h3>
        <p>${brandSpec.overview}</p>
        <table>
          <thead>
            <tr><th>Posição / Tag</th><th>Campo</th><th>Status</th><th>Formato</th><th>Descrição e Regra</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p><strong>Impacto de Ausência:</strong> ${brandSpec.consequenceIfMissing}</p>
      `,
      metadata: {
        brand: selectedBrand,
        brandName: selectedBrand.toUpperCase(),
        referenceId: activeSector.id.toUpperCase(),
        category: 'Adendos Setoriais de Outgoing',
        executiveSummary: activeSector.subtitle,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho + Seletor dos 4 Setores */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              Registros de Adendo Setorial · Visa TCR 3 (AI/HL/CA/FL) · Elo Reg 08 & 992/995 · Mastercard PDS 0501+
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Ramos Setoriais Especiais no Outgoing (Companhias Aéreas IATA, Hotelaria, Locadoras & Frotas/Pedágio)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Estabelecimentos desses 4 setores têm tabelas e subcampos exclusivos que escalam de{' '}
              <strong>Condicional `[C]` para 100% Obrigatório `[M]`</strong> pelo MCC. Veja o layout exato em cada
              bandeira para evitar downgrade e rejeição.
            </p>
          </div>

          <button
            onClick={handleExportSectorToDocStudio}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition-all shrink-0"
          >
            📄 Exportar Setor p/ Doc Studio
          </button>
        </div>

        {/* Cards dos 4 Setores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {INDUSTRY_ADDENDA_SECTORS.map((sec) => {
            const isSel = sec.id === activeSector.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSectorId(sec.id)}
                className={`rounded-xl p-4 text-left border transition-all flex flex-col justify-between gap-2 ${
                  isSel
                    ? 'bg-blue-950/50 border-blue-400 shadow-md'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base">{sec.icon}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-blue-300">
                      {sec.mccs}
                    </span>
                  </div>
                  <div className="text-xs font-black text-white leading-snug">{sec.title}</div>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{sec.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalhe do Setor Selecionado */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
        {/* Gatilho Geral + Regra Brasil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-1">
            <div className="text-xs font-black uppercase tracking-wider text-blue-400">
              ⚡ Gatilho de Obrigatoriedade Setorial [C ➔ M] ({activeSector.mccs})
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {activeSector.triggerCondition}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-950/15 border border-emerald-500/30 p-4 space-y-1">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
              🇧🇷 Regra Específica do Mercado Brasileiro neste Ramo
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {activeSector.brazilSpecificRule}
            </p>
          </div>
        </div>

        {/* Seletor Rápido de Bandeira dentro do Setor */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-blue-400">
              Layout Técnico do Adendo Setorial ({selectedBrand.toUpperCase()})
            </div>
            <h4 className="text-lg font-black text-white">{brandSpec.recordName}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{brandSpec.overview}</p>
          </div>

          <div className="flex items-center gap-2">
            {(['visa', 'elo', 'mastercard'] as OutgoingBrandId[]).map((bId) => (
              <button
                key={bId}
                onClick={() => onSelectBrand(bId)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border uppercase transition-all ${
                  selectedBrand === bId
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                }`}
              >
                {bId}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Campos do Adendo Setorial */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300 uppercase">
                <th className="py-3 px-3">Posição / Tag</th>
                <th className="py-3 px-3">Campo Setorial</th>
                <th className="py-3 px-3">Status no Ramo</th>
                <th className="py-3 px-3">Formato</th>
                <th className="py-3 px-3">Descrição & Regra de Preenchimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {brandSpec.fields.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-3 font-mono font-bold text-cyan-300 whitespace-nowrap">
                    {f.posOrTag}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-white">{f.fieldName}</td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                        f.status === 'M'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {f.status === 'M' ? '[M] Obrigatório no Setor' : '[C] Condicional'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                    {f.format}
                  </td>
                  <td className="py-3.5 px-3 text-slate-200 leading-relaxed">
                    {f.descriptionAndRule}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Alerta de Consequência de Ausência */}
        <div className="rounded-xl bg-rose-950/15 border border-rose-500/35 p-4 text-xs">
          <strong className="text-rose-400 uppercase tracking-wider">
            ⚠️ Consequência se o Adendo Setorial Faltar no Outgoing:
          </strong>{' '}
          <span className="text-slate-200">{brandSpec.consequenceIfMissing}</span>
        </div>
      </div>
    </div>
  );
}
