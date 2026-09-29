import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} from "docx";
import { BulletinMetadata, BulletinDateDetail, BulletinVersionItem } from "./BulletinMetadataCard";

const TOTAL_PAGE_WIDTH_DXA = 9746; // A4 (11906) - 2 * 1080 margins = 9746 dxa

// Helper: Parse CSS color strings (hex, rgb, rgba) to 6-digit uppercase hex without '#'
function parseHexColor(colorStr?: string | null): string | undefined {
  if (!colorStr) return undefined;
  const col = colorStr.trim();
  if (col === "transparent" || col === "inherit" || col === "initial") return undefined;

  if (col.startsWith("#")) {
    const hex = col.slice(1);
    if (hex.length === 3) {
      return hex.split("").map((c) => c + c).join("").toUpperCase();
    }
    if (hex.length === 6) {
      return hex.toUpperCase();
    }
    if (hex.length === 8) {
      return hex.slice(0, 6).toUpperCase();
    }
  }

  const rgbMatch = col.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, "0");
    const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, "0");
    const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, "0");
    return (r + g + b).toUpperCase();
  }

  // Common named colors
  const namedColors: Record<string, string> = {
    white: "FFFFFF",
    black: "000000",
    red: "DC2626",
    blue: "2563EB",
    green: "16A34A",
    gray: "64748B",
    slate: "334155",
    amber: "D97706",
  };
  return namedColors[col.toLowerCase()];
}

interface InlineStyleProps {
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  bgColor?: string;
  fontSize?: number;
}

// Helper: Parse DOM node recursively into TextRun array
function parseInlineNodes(node: Node, parentStyles: InlineStyleProps = {}): TextRun[] {
  const runs: TextRun[] = [];

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    if (text) {
      runs.push(
        new TextRun({
          text,
          bold: parentStyles.bold,
          italics: parentStyles.italics,
          underline: parentStyles.underline ? {} : undefined,
          strike: parentStyles.strike,
          color: parentStyles.color,
          shading: parentStyles.bgColor
            ? { fill: parentStyles.bgColor, type: ShadingType.CLEAR }
            : undefined,
          size: parentStyles.fontSize || 20, // 10pt default
          font: "Calibri",
        })
      );
    }
    return runs;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    const isBold =
      parentStyles.bold ||
      tag === "strong" ||
      tag === "b" ||
      el.style.fontWeight === "bold" ||
      parseInt(el.style.fontWeight, 10) >= 600;

    const isItalic =
      parentStyles.italics ||
      tag === "em" ||
      tag === "i" ||
      el.style.fontStyle === "italic";

    const isUnderline =
      parentStyles.underline ||
      tag === "u" ||
      el.style.textDecoration.includes("underline");

    const isStrike =
      parentStyles.strike ||
      tag === "s" ||
      tag === "strike" ||
      tag === "del" ||
      el.style.textDecoration.includes("line-through");

    const elemColor = parseHexColor(el.style.color) || parentStyles.color;
    const elemBg =
      parseHexColor(el.style.backgroundColor) ||
      parseHexColor(el.style.background) ||
      (tag === "mark" ? "FEF08A" : undefined) ||
      parentStyles.bgColor;

    let fontSize = parentStyles.fontSize;
    if (el.style.fontSize) {
      if (el.style.fontSize.includes("px")) {
        const px = parseFloat(el.style.fontSize);
        fontSize = Math.round(px * 1.5); // Convert px to half-points roughly
      } else if (el.style.fontSize.includes("pt")) {
        const pt = parseFloat(el.style.fontSize);
        fontSize = Math.round(pt * 2);
      } else if (el.style.fontSize.includes("rem")) {
        const rem = parseFloat(el.style.fontSize);
        fontSize = Math.round(rem * 20);
      }
    }

    const currentStyles: InlineStyleProps = {
      bold: isBold,
      italics: isItalic,
      underline: isUnderline,
      strike: isStrike,
      color: elemColor,
      bgColor: elemBg,
      fontSize: fontSize,
    };

    el.childNodes.forEach((child) => {
      runs.push(...parseInlineNodes(child, currentStyles));
    });
  }

  return runs;
}

// Generate the rich bulletin metadata summary card at the start of the Word document
function createBulletinMetadataSection(meta: BulletinMetadata): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Brand color mapping
  const brandThemes: Record<string, { bg: string; text: string; label: string }> = {
    mastercard: { bg: "EB001B", text: "FFFFFF", label: "MASTERCARD" },
    visa: { bg: "1A1F71", text: "FFFFFF", label: "VISA" },
    elo: { bg: "00A4E4", text: "FFFFFF", label: "ELO" },
    pix: { bg: "059669", text: "FFFFFF", label: "PIX" },
    amex: { bg: "0077A6", text: "FFFFFF", label: "AMERICAN EXPRESS" },
    geral: { bg: "1E293B", text: "FFFFFF", label: "MERCADO GERAL" },
  };
  const theme = brandThemes[meta.brand.toLowerCase()] || brandThemes.geral;

  // Requirement badge color
  const reqColors: Record<string, { fill: string; border: string; text: string }> = {
    Mandatório: { fill: "FEE2E2", border: "DC2626", text: "B91C1C" },
    "Alerta de Risco": { fill: "FEF3C7", border: "D97706", text: "B45309" },
    Informativo: { fill: "DBEAFE", border: "2563EB", text: "1D4ED8" },
    Opcional: { fill: "F1F5F9", border: "64748B", text: "475569" },
  };
  const reqStyle = reqColors[meta.requirement] || reqColors["Informativo"];

  // Risk color
  const riskColors: Record<string, string> = {
    Crítico: "991B1B",
    Alto: "DC2626",
    Médio: "D97706",
    Baixo: "16A34A",
  };
  const riskColor = riskColors[meta.riskLevel] || "1E293B";

  // 1. Top Bulletin Header Block: Brand, Ref ID, Requirement, and Title
  const headerCardCell = new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: ` ${theme.label} `,
            bold: true,
            color: theme.text,
            shading: { fill: theme.bg, type: ShadingType.CLEAR },
            size: 19,
            font: "Calibri",
          }),
          new TextRun({ text: "  " }),
          new TextRun({
            text: `REF: ${meta.referenceId || "GLB-1000"}`,
            bold: true,
            color: "0F2C59",
            size: 19,
            font: "Calibri",
          }),
          new TextRun({ text: "   •   " }),
          new TextRun({
            text: ` [ ${meta.requirement.toUpperCase()} ] `,
            bold: true,
            color: reqStyle.text,
            shading: { fill: reqStyle.fill, type: ShadingType.CLEAR },
            size: 18,
            font: "Calibri",
          }),
        ],
        spacing: { before: 80, after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: meta.title || "Comunicado Técnico de Pagamentos",
            bold: true,
            size: 32, // 16pt
            color: "0F172A",
            font: "Calibri",
          }),
        ],
        spacing: { before: 60, after: 60 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `CATEGORIA: ${meta.category?.toUpperCase() || "OPERAÇÕES • SEGURANÇA"}`,
            bold: true,
            size: 16,
            color: "64748B",
            font: "Calibri",
          }),
        ],
        spacing: { before: 40, after: 80 },
      }),
    ],
    width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
    shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
    margins: { top: 160, bottom: 160, left: 200, right: 200 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 12, color: theme.bg },
      left: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
    },
  });

  elements.push(
    new Table({
      rows: [new TableRow({ children: [headerCardCell], cantSplit: true })],
      width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
      columnWidths: [TOTAL_PAGE_WIDTH_DXA],
    })
  );

  elements.push(new Paragraph({ spacing: { before: 80, after: 80 } }));

  // 2. 4-Column KPI Grid Table (Publicação, Vigência, Região, Risco)
  const colWidth = Math.floor(TOTAL_PAGE_WIDTH_DXA / 4);
  const remainder = TOTAL_PAGE_WIDTH_DXA - colWidth * 3;

  function createKpiCell(label: string, value: string, valueColor: string = "0F172A", width: number) {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: label.toUpperCase(),
              bold: true,
              size: 14, // 7pt
              color: "64748B",
              font: "Calibri",
            }),
          ],
          spacing: { before: 40, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: value,
              bold: true,
              size: 20, // 10pt
              color: valueColor,
              font: "Calibri",
            }),
          ],
          spacing: { before: 20, after: 40 },
        }),
      ],
      width: { size: width, type: WidthType.DXA },
      shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
        left: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
        right: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
      },
    });
  }

  const kpiRow = new TableRow({
    children: [
      createKpiCell("Data de Publicação", meta.publicationDate || "N/A", "0F172A", colWidth),
      createKpiCell("Vigência Operacional", meta.effectiveDate || "N/A", "1E40AF", colWidth),
      createKpiCell("Escopo / Região", meta.region || "Global", "0F172A", colWidth),
      createKpiCell("Nível de Risco", meta.riskLevel || "Baixo", riskColor, remainder),
    ],
    cantSplit: true,
  });

  elements.push(
    new Table({
      rows: [kpiRow],
      width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
      columnWidths: [colWidth, colWidth, colWidth, remainder],
    })
  );

  elements.push(new Paragraph({ spacing: { before: 80, after: 80 } }));

  // 3. Audience & Tags
  if (meta.audience?.length > 0 || meta.tags?.length > 0) {
    const audienceRuns: TextRun[] = [
      new TextRun({ text: "Público-Alvo Impactado: ", bold: true, color: "0F2C59", size: 18, font: "Calibri" }),
      new TextRun({ text: meta.audience.join(" • "), color: "334155", size: 18, font: "Calibri" }),
    ];
    elements.push(new Paragraph({ children: audienceRuns, spacing: { before: 40, after: 60 } }));

    if (meta.tags?.length > 0) {
      const tagRuns: TextRun[] = [
        new TextRun({ text: "Tags Técnicas: ", bold: true, color: "0F2C59", size: 18, font: "Calibri" }),
        new TextRun({
          text: meta.tags.map((t) => `#${t}`).join("   "),
          color: "2563EB",
          bold: true,
          size: 17,
          font: "Calibri",
        }),
      ];
      elements.push(new Paragraph({ children: tagRuns, spacing: { before: 20, after: 120 } }));
    }
  }

  // 4. Executive Summary & Recommended Action Callout Box
  if (meta.executiveSummary || meta.recommendedAction) {
    const summaryCellChildren: Paragraph[] = [];

    if (meta.executiveSummary) {
      summaryCellChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "💡 RESUMO EXECUTIVO DO COMUNICADO",
              bold: true,
              size: 20,
              color: "1E40AF",
              font: "Calibri",
            }),
          ],
          spacing: { before: 40, after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: meta.executiveSummary,
              size: 19,
              color: "1E293B",
              font: "Calibri",
            }),
          ],
          spacing: { before: 0, after: 120 },
        })
      );
    }

    if (meta.recommendedAction) {
      summaryCellChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "🎯 RECOMENDAÇÃO IMEDIATA / DIRETRIZ DE ENGENHARIA:",
              bold: true,
              size: 19,
              color: "0F2C59",
              font: "Calibri",
            }),
          ],
          spacing: { before: 60, after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: meta.recommendedAction,
              size: 19,
              italics: true,
              color: "1E293B",
              font: "Calibri",
            }),
          ],
          spacing: { before: 0, after: 40 },
        })
      );
    }

    const summaryCalloutCell = new TableCell({
      children: summaryCellChildren,
      width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
      shading: { fill: "EFF6FF", type: ShadingType.CLEAR },
      margins: { top: 140, bottom: 140, left: 180, right: 180 },
      borders: {
        left: { style: BorderStyle.SINGLE, size: 24, color: "2563EB" },
        top: { style: BorderStyle.SINGLE, size: 6, color: "BFDBFE" },
        right: { style: BorderStyle.SINGLE, size: 6, color: "BFDBFE" },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "BFDBFE" },
      },
    });

    elements.push(
      new Table({
        rows: [new TableRow({ children: [summaryCalloutCell], cantSplit: true })],
        width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
        columnWidths: [TOTAL_PAGE_WIDTH_DXA],
      })
    );

    elements.push(new Paragraph({ spacing: { before: 100, after: 100 } }));
  }

  // 5. Critical Dates & Deadlines Table (Cronograma Regulatório)
  if (meta.dateExplanations && meta.dateExplanations.length > 0) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "📅 Cronograma Regulatório & Datas Críticas",
            bold: true,
            size: 24, // 12pt
            color: "0F2C59",
            font: "Calibri",
          }),
        ],
        spacing: { before: 180, after: 80 },
      })
    );

    const dCols = [1400, 1600, 2700, 4046]; // Sum = 9746 dxa

    const dateHeaderRow = new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "DATA", bold: true, color: "FFFFFF", size: 17 })] })],
          width: { size: dCols[0], type: WidthType.DXA },
          shading: { fill: "0F2C59", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "TIPO / MARCO", bold: true, color: "FFFFFF", size: 17 })] })],
          width: { size: dCols[1], type: WidthType.DXA },
          shading: { fill: "0F2C59", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "EVENTO / MARCO REGULATÓRIO", bold: true, color: "FFFFFF", size: 17 })] })],
          width: { size: dCols[2], type: WidthType.DXA },
          shading: { fill: "0F2C59", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "DETALHAMENTO E JUSTIFICATIVA TÉCNICA", bold: true, color: "FFFFFF", size: 17 })] })],
          width: { size: dCols[3], type: WidthType.DXA },
          shading: { fill: "0F2C59", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
        }),
      ],
    });

    const dateDataRows = meta.dateExplanations.map((d, idx) => {
      const rowBg = idx % 2 === 0 ? "F8FAFC" : "FFFFFF";
      return new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: d.date, bold: true, color: "0F172A", size: 18 })] })],
            width: { size: dCols[0], type: WidthType.DXA },
            shading: { fill: rowBg, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: d.impactType,
                    bold: true,
                    color: d.impactType === "Go-Live" ? "15803D" : d.impactType === "Expiração" ? "B91C1C" : "1D4ED8",
                    size: 17,
                  }),
                ],
              }),
            ],
            width: { size: dCols[1], type: WidthType.DXA },
            shading: { fill: rowBg, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: d.event, bold: true, color: "1E293B", size: 18 })] })],
            width: { size: dCols[2], type: WidthType.DXA },
            shading: { fill: rowBg, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: d.explanation, color: "334155", size: 17 })] })],
            width: { size: dCols[3], type: WidthType.DXA },
            shading: { fill: rowBg, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
            },
          }),
        ],
      });
    });

    elements.push(
      new Table({
        rows: [dateHeaderRow, ...dateDataRows],
        width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
        columnWidths: dCols,
      })
    );

    elements.push(new Paragraph({ spacing: { before: 100, after: 100 } }));
  }

  // 6. Version History Table
  if (meta.versionHistory && meta.versionHistory.length > 0) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "📋 Histórico de Versões do Comunicado",
            bold: true,
            size: 24, // 12pt
            color: "0F2C59",
            font: "Calibri",
          }),
        ],
        spacing: { before: 180, after: 80 },
      })
    );

    const vCols = [1400, 1600, 6746]; // Sum = 9746 dxa

    const vHeaderRow = new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "VERSÃO", bold: true, color: "FFFFFF", size: 17 })] })],
          width: { size: vCols[0], type: WidthType.DXA },
          shading: { fill: "1E293B", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "DATA", bold: true, color: "FFFFFF", size: 17 })] })],
          width: { size: vCols[1], type: WidthType.DXA },
          shading: { fill: "1E293B", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "DESCRIÇÃO DAS ALTERAÇÕES E NOTAS DE REGISTRO", bold: true, color: "FFFFFF", size: 17 })] })],
          width: { size: vCols[2], type: WidthType.DXA },
          shading: { fill: "1E293B", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
        }),
      ],
    });

    const vDataRows = meta.versionHistory.map((v, idx) => {
      const rowBg = idx % 2 === 0 ? "F8FAFC" : "FFFFFF";
      return new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: v.version, bold: true, color: "0F172A", size: 18 }),
                  ...(v.isCurrent
                    ? [new TextRun({ text: " (Atual)", bold: true, color: "15803D", size: 16 })]
                    : []),
                ],
              }),
            ],
            width: { size: vCols[0], type: WidthType.DXA },
            shading: { fill: rowBg, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: v.date, color: "475569", size: 18 })] })],
            width: { size: vCols[1], type: WidthType.DXA },
            shading: { fill: rowBg, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: v.description, color: "1E293B", size: 18 })] })],
            width: { size: vCols[2], type: WidthType.DXA },
            shading: { fill: rowBg, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
            },
          }),
        ],
      });
    });

    elements.push(
      new Table({
        rows: [vHeaderRow, ...vDataRows],
        width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
        columnWidths: vCols,
      })
    );

    elements.push(new Paragraph({ spacing: { before: 100, after: 100 } }));
  }

  // 7. Custom Fields Table (if any)
  if (meta.customFields && meta.customFields.length > 0) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "⚙️ Metadados Adicionais Personalizados",
            bold: true,
            size: 22,
            color: "0F2C59",
            font: "Calibri",
          }),
        ],
        spacing: { before: 140, after: 80 },
      })
    );

    const cCols = [3000, 6746];
    const customRows = meta.customFields.map((cf, idx) => {
      const rowBg = idx % 2 === 0 ? "F8FAFC" : "FFFFFF";
      return new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: cf.label, bold: true, color: "0F2C59", size: 18 })] })],
            width: { size: cCols[0], type: WidthType.DXA },
            shading: { fill: rowBg, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: cf.value, color: "1E293B", size: 18 })] })],
            width: { size: cCols[1], type: WidthType.DXA },
            shading: { fill: rowBg, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
            },
          }),
        ],
      });
    });

    elements.push(
      new Table({
        rows: customRows,
        width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
        columnWidths: cCols,
      })
    );

    elements.push(new Paragraph({ spacing: { before: 100, after: 100 } }));
  }

  // 8. Divider separating the Ficha Cadastral from the Editorial Parecer
  elements.push(
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: "CBD5E1" },
      },
      spacing: { before: 140, after: 160 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "PARECER TÉCNICO & DIRETRIZES OPERACIONAIS DETALHADAS",
          bold: true,
          size: 26, // 13pt
          color: "0F2C59",
          font: "Calibri",
        }),
      ],
      spacing: { before: 100, after: 160 },
    })
  );

  return elements;
}

// Convert HTML <table> into native docx Table
function convertHtmlTableToDocx(tableEl: HTMLElement): Table {
  const rows: TableRow[] = [];
  const trElements = Array.from(tableEl.querySelectorAll("tr"));

  // Calculate max number of columns
  let maxCols = 1;
  trElements.forEach((tr) => {
    const cells = Array.from(tr.children).filter(
      (c) => c.tagName.toLowerCase() === "td" || c.tagName.toLowerCase() === "th"
    );
    if (cells.length > maxCols) maxCols = cells.length;
  });

  const baseColWidth = Math.floor(TOTAL_PAGE_WIDTH_DXA / maxCols);
  const columnWidths = Array(maxCols).fill(baseColWidth);
  // Absorb remainder on last col so sum == TOTAL_PAGE_WIDTH_DXA
  columnWidths[maxCols - 1] = TOTAL_PAGE_WIDTH_DXA - baseColWidth * (maxCols - 1);

  // If it's a 2-column key/value or messaging flow table, adjust proportions
  if (maxCols === 2) {
    const firstCell = tableEl.querySelector("td, th") as HTMLElement | null;
    const styleWidth = firstCell?.style?.width;
    if (styleWidth && (styleWidth.includes("px") || styleWidth.includes("%"))) {
      let w1 = 2500;
      if (styleWidth.includes("px")) {
        const px = parseFloat(styleWidth);
        w1 = Math.max(1800, Math.min(3600, Math.round(px * 16)));
      } else if (styleWidth.includes("%")) {
        const pct = parseFloat(styleWidth);
        w1 = Math.round((pct / 100) * TOTAL_PAGE_WIDTH_DXA);
      }
      columnWidths[0] = w1;
      columnWidths[1] = TOTAL_PAGE_WIDTH_DXA - w1;
    } else {
      // Check if first column text is short (like "Fluxo de Ida:", "Retorno:")
      const firstColCells = Array.from(tableEl.querySelectorAll("tr > td:first-child, tr > th:first-child"));
      const isShortLabels = firstColCells.length > 0 && firstColCells.every((c) => (c.textContent || "").trim().length < 30);
      if (isShortLabels) {
        columnWidths[0] = 2600;
        columnWidths[1] = TOTAL_PAGE_WIDTH_DXA - 2600;
      }
    }
  }

  trElements.forEach((tr, rowIndex) => {
    const cells = Array.from(tr.children).filter(
      (c) => c.tagName.toLowerCase() === "td" || c.tagName.toLowerCase() === "th"
    );

    const isHeaderRow =
      rowIndex === 0 ||
      tr.parentElement?.tagName.toLowerCase() === "thead" ||
      cells.some((c) => c.tagName.toLowerCase() === "th");

    const rowBg =
      parseHexColor(tr.style.backgroundColor) ||
      parseHexColor(tr.style.background) ||
      (isHeaderRow ? "0F2C59" : rowIndex % 2 === 0 ? "F8FAFC" : "FFFFFF");

    const isDarkBg =
      rowBg === "0F2C59" ||
      rowBg === "1E293B" ||
      rowBg === "0F172A" ||
      rowBg === "1E3A8A" ||
      rowBg === "111827";

    const tableCells: TableCell[] = [];

    cells.forEach((cell, cellIndex) => {
      const cellEl = cell as HTMLElement;
      const cellWidth = columnWidths[cellIndex] || baseColWidth;

      const cellBg =
        parseHexColor(cellEl.style.backgroundColor) ||
        parseHexColor(cellEl.style.background) ||
        rowBg;

      const isCellDark =
        cellBg === "0F2C59" ||
        cellBg === "1E293B" ||
        cellBg === "0F172A" ||
        cellBg === "1E3A8A" ||
        cellBg === "111827";

      // Parse cell paragraph content
      const cellRuns = parseInlineNodes(cellEl, {
        bold: isHeaderRow || cellEl.tagName.toLowerCase() === "th",
        color: isCellDark ? "FFFFFF" : isHeaderRow ? "FFFFFF" : undefined,
        fontSize: isHeaderRow ? 18 : 18,
      });

      const align =
        cellEl.style.textAlign === "center"
          ? AlignmentType.CENTER
          : cellEl.style.textAlign === "right"
          ? AlignmentType.RIGHT
          : AlignmentType.LEFT;

      const cellParagraph = new Paragraph({
        children: cellRuns.length > 0 ? cellRuns : [new TextRun({ text: " ", size: 18 })],
        alignment: align,
        spacing: { before: 40, after: 40 },
      });

      tableCells.push(
        new TableCell({
          children: [cellParagraph],
          width: { size: cellWidth, type: WidthType.DXA },
          shading: cellBg ? { fill: cellBg, type: ShadingType.CLEAR } : undefined,
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
            left: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
            right: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
          },
        })
      );
    });

    if (tableCells.length > 0) {
      rows.push(
        new TableRow({
          children: tableCells,
          tableHeader: isHeaderRow,
          cantSplit: true,
        })
      );
    }
  });

  return new Table({
    rows,
    width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths,
  });
}

// Convert a single card element into a styled TableCell (for side-by-side grids)
function convertCardToTableCell(cardEl: HTMLElement, cardWidth: number): TableCell {
  const bgColor =
    parseHexColor(cardEl.style.backgroundColor) ||
    parseHexColor(cardEl.style.background) ||
    "F8FAFC";

  const isDark =
    bgColor === "0F172A" ||
    bgColor === "1E293B" ||
    bgColor === "111827" ||
    bgColor === "1E3A8A";

  const leftBorderColor =
    parseHexColor(cardEl.style.borderLeftColor) ||
    parseHexColor(cardEl.style.borderLeft?.split(" ")?.pop()) ||
    (isDark ? "3B82F6" : "2563EB");

  const borderColor =
    parseHexColor(cardEl.style.borderColor) ||
    (isDark ? "334155" : "CBD5E1");

  const paragraphs: Paragraph[] = [];

  Array.from(cardEl.children).forEach((child) => {
    const cEl = child as HTMLElement;
    const tag = cEl.tagName.toLowerCase();
    const style = (cEl.getAttribute("style") || "").toLowerCase();

    // Check if this child is a header with badge (e.g. Adquirente / Envia)
    const isFlexHeader =
      (style.includes("display:flex") || style.includes("display: flex")) &&
      cEl.querySelector("strong, h3, h4, span.font-bold") !== null;

    if (isFlexHeader) {
      const strongEl = cEl.querySelector("strong, h3, h4") as HTMLElement | null;
      const spanEl = cEl.querySelector("span") as HTMLElement | null;

      const titleColor = strongEl ? parseHexColor(strongEl.style.color) : undefined;
      const titleRuns = strongEl
        ? parseInlineNodes(strongEl, { bold: true, color: titleColor || (isDark ? "FFFFFF" : "0F2C59"), fontSize: 20 })
        : [];

      const badgeText = spanEl && spanEl !== strongEl ? spanEl.textContent?.trim() : "";
      const badgeBg =
        spanEl && spanEl !== strongEl
          ? parseHexColor(spanEl.style.backgroundColor) || parseHexColor(spanEl.style.background)
          : undefined;
      const badgeColor =
        spanEl && spanEl !== strongEl ? parseHexColor(spanEl.style.color) || "FFFFFF" : undefined;

      const headerRuns: TextRun[] = [...titleRuns];
      if (badgeText) {
        headerRuns.push(new TextRun({ text: "   " }));
        headerRuns.push(
          new TextRun({
            text: ` [ ${badgeText.toUpperCase()} ] `,
            bold: true,
            size: 16,
            color: badgeColor || "FFFFFF",
            shading: badgeBg ? { fill: badgeBg, type: ShadingType.CLEAR } : undefined,
          })
        );
      }

      paragraphs.push(
        new Paragraph({
          children: headerRuns,
          spacing: { before: 20, after: 60 },
        })
      );
    } else if (tag === "p") {
      const pColor = parseHexColor(cEl.style.color) || (isDark ? "F8FAFC" : "334155");
      const pRuns = parseInlineNodes(cEl, { color: pColor, fontSize: 18 });
      if (pRuns.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: pRuns,
            spacing: { before: 20, after: 50 },
          })
        );
      }
    } else if (tag === "ul" || tag === "ol") {
      const lis = Array.from(cEl.querySelectorAll(":scope > li"));
      lis.forEach((li, idx) => {
        const bullet = tag === "ol" ? `${idx + 1}. ` : "▪ ";
        const liRuns = parseInlineNodes(li as HTMLElement, {
          color: isDark ? "F8FAFC" : "1E293B",
          fontSize: 17,
        });
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: bullet,
                bold: true,
                color: leftBorderColor,
                size: 18,
              }),
              ...liRuns,
            ],
            indent: { left: 240, hanging: 140 },
            spacing: { before: 20, after: 30 },
          })
        );
      });
    } else {
      // General or highlight div (e.g. Desenvolver: ... or Validar: ...)
      const isHighlight =
        cEl.style.fontFamily?.includes("mono") ||
        (cEl.style.background && cEl.style.background !== "transparent") ||
        (cEl.style.backgroundColor && cEl.style.backgroundColor !== "transparent");

      const highlightBg = isHighlight
        ? parseHexColor(cEl.style.backgroundColor) || "F1F5F9"
        : undefined;

      const runs = parseInlineNodes(cEl, {
        color: isDark ? "F8FAFC" : undefined,
        fontSize: 18,
      });

      if (runs.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: runs,
            shading: highlightBg ? { fill: highlightBg, type: ShadingType.CLEAR } : undefined,
            spacing: { before: 30, after: 40 },
          })
        );
      }
    }
  });

  if (paragraphs.length === 0) {
    const runs = parseInlineNodes(cardEl, {
      color: isDark ? "F8FAFC" : undefined,
      fontSize: 18,
    });
    paragraphs.push(
      new Paragraph({
        children: runs.length > 0 ? runs : [new TextRun({ text: cardEl.textContent?.trim() || " " })],
        spacing: { before: 20, after: 40 },
      })
    );
  }

  return new TableCell({
    children: paragraphs,
    width: { size: cardWidth, type: WidthType.DXA },
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    margins: { top: 140, bottom: 140, left: 160, right: 160 },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 24, color: leftBorderColor },
      top: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
      right: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
    },
  });
}

// Convert 2-column or multi-column grid into native Word Table with spacer columns (Modo Caixa Dupla)
function convertGridToDocxTable(gridEl: HTMLElement): Table {
  const childCards = Array.from(gridEl.children).filter(
    (c) => (c as HTMLElement).tagName.toLowerCase() === "div"
  ) as HTMLElement[];

  if (childCards.length === 0) {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: "" })],
              width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
            }),
          ],
        }),
      ],
      width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
    });
  }

  const style = (gridEl.getAttribute("style") || "").toLowerCase();

  // Determine number of columns
  let cols = 2; // Default to dual-box
  if (style.includes("repeat(4") || (childCards.length === 4 && style.includes("repeat(4"))) {
    cols = 4;
  } else if (style.includes("repeat(3") || childCards.length === 3) {
    cols = 3;
  } else if (style.includes("1fr 1fr") || style.includes("repeat(2") || childCards.length === 2) {
    cols = 2;
  } else if (childCards.length % 2 === 0) {
    cols = 2;
  }

  // Calculate widths with inter-card spacer columns
  const spacerWidth = cols === 4 ? 140 : cols === 3 ? 180 : 240;
  const totalSpacerWidth = (cols - 1) * spacerWidth;
  const availableWidth = TOTAL_PAGE_WIDTH_DXA - totalSpacerWidth;
  const baseCardWidth = Math.floor(availableWidth / cols);
  const cardWidths = Array(cols).fill(baseCardWidth);
  cardWidths[cols - 1] = availableWidth - baseCardWidth * (cols - 1);

  // Column widths definition for docx
  const fullColumnWidths: number[] = [];
  for (let c = 0; c < cols; c++) {
    fullColumnWidths.push(cardWidths[c]);
    if (c < cols - 1) fullColumnWidths.push(spacerWidth);
  }

  const createSpacerCell = () =>
    new TableCell({
      children: [new Paragraph({ spacing: { before: 0, after: 0 } })],
      width: { size: spacerWidth, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
    });

  const createEmptyCardCell = (w: number) =>
    new TableCell({
      children: [new Paragraph({ spacing: { before: 0, after: 0 } })],
      width: { size: w, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
    });

  const tableRows: TableRow[] = [];

  for (let i = 0; i < childCards.length; i += cols) {
    const rowCells: TableCell[] = [];
    for (let c = 0; c < cols; c++) {
      const cardIdx = i + c;
      if (cardIdx < childCards.length) {
        rowCells.push(convertCardToTableCell(childCards[cardIdx], cardWidths[c]));
      } else {
        rowCells.push(createEmptyCardCell(cardWidths[c]));
      }
      if (c < cols - 1) {
        rowCells.push(createSpacerCell());
      }
    }
    tableRows.push(new TableRow({ children: rowCells, cantSplit: true }));
  }

  return new Table({
    rows: tableRows,
    width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: fullColumnWidths,
  });
}

// Check if an element is a grid or multi-column card container
function isGridOrMultiColumn(el: HTMLElement): boolean {
  if (el.tagName.toLowerCase() !== "div") return false;
  const style = (el.getAttribute("style") || "").toLowerCase();
  const className = (el.className || "").toLowerCase();

  if (
    style.includes("display:grid") ||
    style.includes("display: grid") ||
    style.includes("grid-template-columns") ||
    className.includes("grid") ||
    className.includes("dual-cards") ||
    el.getAttribute("data-layout") === "dual-cards"
  ) {
    return true;
  }

  // Also check for flex with multiple child cards side-by-side
  if (
    (style.includes("display:flex") || style.includes("display: flex")) &&
    !style.includes("flex-direction: column") &&
    !style.includes("flex-direction:column") &&
    el.children.length >= 2 &&
    Array.from(el.children).every((c) => (c as HTMLElement).tagName.toLowerCase() === "div")
  ) {
    return true;
  }

  return false;
}

// Check if an element is a flex header bar (left content + right badge)
function isFlexHeaderBar(el: HTMLElement): boolean {
  if (el.tagName.toLowerCase() !== "div") return false;
  const style = (el.getAttribute("style") || "").toLowerCase();
  const hasSpaceBetween =
    style.includes("justify-content:space-between") ||
    style.includes("justify-content: space-between");
  const isFlex = style.includes("display:flex") || style.includes("display: flex");
  return isFlex && hasSpaceBetween && el.children.length === 2;
}

// Convert a flex header bar into a clean 2-column Word table
function convertFlexHeaderToDocx(headerEl: HTMLElement): Table {
  const leftChild = headerEl.children[0] as HTMLElement;
  const rightChild = headerEl.children[1] as HTMLElement;

  const leftWidth = 7400;
  const rightWidth = TOTAL_PAGE_WIDTH_DXA - leftWidth; // 2346

  // Parse left child paragraphs
  const leftParagraphs: Paragraph[] = [];
  Array.from(leftChild.children).forEach((child) => {
    const cEl = child as HTMLElement;
    const tag = cEl.tagName.toLowerCase();
    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
      leftParagraphs.push(
        new Paragraph({
          children: parseInlineNodes(cEl, { bold: true, color: "0F2C59", fontSize: 26 }),
          spacing: { before: 20, after: 40 },
        })
      );
    } else if (tag === "span" && (cEl.style.backgroundColor || cEl.style.background)) {
      // Badge
      const bg =
        parseHexColor(cEl.style.backgroundColor) || parseHexColor(cEl.style.background) || "0F2C59";
      const col = parseHexColor(cEl.style.color) || "FFFFFF";
      leftParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: ` ${cEl.textContent?.trim().toUpperCase()} `,
              bold: true,
              size: 16,
              color: col,
              shading: { fill: bg, type: ShadingType.CLEAR },
            }),
          ],
          spacing: { before: 0, after: 40 },
        })
      );
    } else {
      const runs = parseInlineNodes(cEl, { fontSize: 17, color: "64748B" });
      if (runs.length > 0) {
        leftParagraphs.push(
          new Paragraph({
            children: runs,
            spacing: { before: 20, after: 40 },
          })
        );
      }
    }
  });

  if (leftParagraphs.length === 0) {
    leftParagraphs.push(
      new Paragraph({
        children: parseInlineNodes(leftChild),
        spacing: { before: 20, after: 40 },
      })
    );
  }

  // Parse right child badge
  const rightBg =
    parseHexColor(rightChild.style.backgroundColor) ||
    parseHexColor(rightChild.style.background) ||
    "EFF6FF";

  const rightParagraph = new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [
      new TextRun({
        text: ` [ ${rightChild.textContent?.trim().toUpperCase()} ] `,
        bold: true,
        size: 17,
        color: parseHexColor(rightChild.style.color) || "1E40AF",
        shading: { fill: rightBg, type: ShadingType.CLEAR },
      }),
    ],
    spacing: { before: 40, after: 40 },
  });

  const row = new TableRow({
    children: [
      new TableCell({
        children: leftParagraphs,
        width: { size: leftWidth, type: WidthType.DXA },
        borders: {
          bottom: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        margins: { top: 40, bottom: 80, left: 0, right: 60 },
      }),
      new TableCell({
        children: [rightParagraph],
        width: { size: rightWidth, type: WidthType.DXA },
        borders: {
          bottom: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        margins: { top: 40, bottom: 80, left: 60, right: 0 },
      }),
    ],
    cantSplit: true,
  });

  return new Table({
    rows: [row],
    width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [leftWidth, rightWidth],
  });
}

// Check if an element is a complex container that contains nested tables, headings, or grids
function isComplexContainer(el: HTMLElement): boolean {
  if (el.tagName.toLowerCase() !== "div") return false;
  if (el.querySelector("table") !== null) return true;
  if (el.querySelector("h1, h2, h3, h4") !== null) return true;
  if (el.querySelector("[style*='grid'], [style*='flex'], .grid, [data-layout='dual-cards']") !== null) return true;
  const childDivs = Array.from(el.children).filter((c) => (c as HTMLElement).tagName.toLowerCase() === "div");
  if (childDivs.length >= 2) return true;
  return false;
}

// Convert Callout Card div into a 1x1 styled Table in docx
function convertCalloutDivToDocx(divEl: HTMLElement): Table {
  const leftBorderColor =
    parseHexColor(divEl.style.borderLeftColor) ||
    parseHexColor(divEl.style.borderLeft?.split(" ")?.pop()) ||
    "2563EB";

  const bgColor =
    parseHexColor(divEl.style.backgroundColor) ||
    parseHexColor(divEl.style.background) ||
    "EFF6FF";

  const isDark =
    bgColor === "0F172A" ||
    bgColor === "1E293B" ||
    bgColor === "111827" ||
    bgColor === "1E3A8A";

  const borderColor =
    parseHexColor(divEl.style.borderColor) ||
    (isDark ? "334155" : "BFDBFE");

  // Collect paragraphs from inside the callout
  const cellParagraphs: Paragraph[] = [];

  Array.from(divEl.children).forEach((child) => {
    const cEl = child as HTMLElement;
    const tag = cEl.tagName.toLowerCase();

    if (tag === "ul" || tag === "ol") {
      const lis = Array.from(cEl.querySelectorAll(":scope > li"));
      lis.forEach((li, idx) => {
        const bullet = tag === "ol" ? `${idx + 1}. ` : "▪ ";
        const liRuns = parseInlineNodes(li as HTMLElement, {
          color: isDark ? "F8FAFC" : undefined,
          fontSize: 18,
        });
        cellParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: bullet, bold: true, color: leftBorderColor, size: 18 }),
              ...liRuns,
            ],
            indent: { left: 240, hanging: 140 },
            spacing: { before: 20, after: 30 },
          })
        );
      });
    } else {
      const runs = parseInlineNodes(cEl, {
        color: isDark ? "F8FAFC" : undefined,
        fontSize: 19,
      });
      if (runs.length > 0) {
        cellParagraphs.push(
          new Paragraph({
            children: runs,
            spacing: { before: 40, after: 60 },
          })
        );
      }
    }
  });

  // If no block children, parse direct contents
  if (cellParagraphs.length === 0) {
    const runs = parseInlineNodes(divEl, {
      color: isDark ? "F8FAFC" : undefined,
      fontSize: 19,
    });
    cellParagraphs.push(
      new Paragraph({
        children: runs.length > 0 ? runs : [new TextRun({ text: divEl.textContent?.trim() || "" })],
        spacing: { before: 40, after: 60 },
      })
    );
  }

  const calloutCell = new TableCell({
    children: cellParagraphs,
    width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    margins: { top: 160, bottom: 160, left: 200, right: 200 },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 28, color: leftBorderColor },
      top: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
      right: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
    },
  });

  return new Table({
    rows: [new TableRow({ children: [calloutCell], cantSplit: true })],
    width: { size: TOTAL_PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [TOTAL_PAGE_WIDTH_DXA],
  });
}

// Convert HTML content into DOCX block elements
function parseHtmlBody(body: HTMLElement): (Paragraph | Table)[] {
  const children: (Paragraph | Table)[] = [];

  function processNode(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      // 1. Check if it's a Flex Header Bar (space-between with 2 children: title + badge)
      if (isFlexHeaderBar(el)) {
        children.push(convertFlexHeaderToDocx(el));
        children.push(new Paragraph({ spacing: { before: 40, after: 60 } }));
        return;
      }

      // 2. Check if it's a Grid or Multi-Column container (Modo Caixa Dupla / Dual Cards / 4-col KPI)
      if (isGridOrMultiColumn(el)) {
        children.push(convertGridToDocxTable(el));
        children.push(new Paragraph({ spacing: { before: 40, after: 60 } }));
        return;
      }

      // 3. Check if it's a table
      if (tag === "table") {
        children.push(convertHtmlTableToDocx(el));
        children.push(new Paragraph({ spacing: { before: 60, after: 80 } }));
        return;
      }

      // 4. Check if it's a complex container wrapper (e.g. Ficha wrapper with multiple sections, tables, grids)
      if (tag === "div" && isComplexContainer(el)) {
        const topBorder = el.style.borderTop || el.style.borderTopColor;
        if (topBorder && topBorder !== "none") {
          const topColor = parseHexColor(topBorder?.split(" ")?.pop()) || "0F2C59";
          children.push(
            new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 24, color: topColor } },
              spacing: { before: 180, after: 100 },
            })
          );
        }
        Array.from(el.childNodes).forEach(processNode);
        return;
      }

      // 5. Check if it's a Leaf Callout Card (div with border-left or prominent background)
      if (
        tag === "div" &&
        (el.style.borderLeft ||
          el.style.borderLeftColor ||
          (el.style.backgroundColor && el.style.backgroundColor !== "transparent") ||
          el.className.includes("card") ||
          el.className.includes("callout"))
      ) {
        children.push(convertCalloutDivToDocx(el));
        children.push(new Paragraph({ spacing: { before: 40, after: 60 } }));
        return;
      }

      if (tag === "h1") {
        children.push(
          new Paragraph({
            children: parseInlineNodes(el, { bold: true, color: "0F2C59", fontSize: 30 }),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 120 },
          })
        );
      } else if (tag === "h2") {
        children.push(
          new Paragraph({
            children: parseInlineNodes(el, { bold: true, color: "1E3A8A", fontSize: 26 }),
            heading: HeadingLevel.HEADING_2,
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
            },
            spacing: { before: 240, after: 100 },
          })
        );
      } else if (tag === "h3") {
        children.push(
          new Paragraph({
            children: parseInlineNodes(el, { bold: true, color: "334155", fontSize: 22 }),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 180, after: 60 },
          })
        );
      } else if (tag === "h4") {
        children.push(
          new Paragraph({
            children: parseInlineNodes(el, { bold: true, color: "475569", fontSize: 20 }),
            heading: HeadingLevel.HEADING_4,
            spacing: { before: 140, after: 40 },
          })
        );
      } else if (tag === "ul" || tag === "ol") {
        const items = Array.from(el.querySelectorAll(":scope > li"));
        items.forEach((li, idx) => {
          const bullet = tag === "ol" ? `${idx + 1}.  ` : "▪  ";
          const liRuns = parseInlineNodes(li);
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: bullet,
                  bold: true,
                  color: tag === "ol" ? "2563EB" : "0F2C59",
                  size: 20,
                  font: "Calibri",
                }),
                ...liRuns,
              ],
              indent: { left: 480, hanging: 240 },
              spacing: { before: 40, after: 60 },
            })
          );
        });
        children.push(new Paragraph({ spacing: { before: 20, after: 40 } }));
      } else if (tag === "blockquote") {
        children.push(
          new Paragraph({
            children: parseInlineNodes(el, { italics: true, color: "475569" }),
            indent: { left: 480, right: 480 },
            border: {
              left: { style: BorderStyle.SINGLE, size: 24, color: "94A3B8" },
            },
            spacing: { before: 140, after: 140 },
          })
        );
      } else if (tag === "hr") {
        children.push(
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
            },
            spacing: { before: 140, after: 140 },
          })
        );
      } else if (tag === "p") {
        const pRuns = parseInlineNodes(el);
        if (pRuns.length > 0) {
          const align =
            el.style.textAlign === "center"
              ? AlignmentType.CENTER
              : el.style.textAlign === "right"
              ? AlignmentType.RIGHT
              : el.style.textAlign === "justify"
              ? AlignmentType.JUSTIFIED
              : AlignmentType.LEFT;

          children.push(
            new Paragraph({
              children: pRuns,
              alignment: align,
              spacing: { before: 50, after: 80 },
            })
          );
        }
      } else if (tag === "div") {
        // If it's a generic div wrapper, process each child node
        Array.from(el.childNodes).forEach(processNode);
      } else {
        // Fallback for other block elements
        const runs = parseInlineNodes(el);
        if (runs.length > 0) {
          children.push(
            new Paragraph({
              children: runs,
              spacing: { before: 40, after: 60 },
            })
          );
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: node.textContent.trim(), font: "Calibri", size: 20 })],
          spacing: { before: 40, after: 60 },
        })
      );
    }
  }

  Array.from(body.childNodes).forEach(processNode);

  return children;
}

export async function exportHtmlToDocx(
  htmlContent: string,
  title: string = "Documento",
  metadata?: BulletinMetadata | null
) {
  // Parse HTML string in browser
  const parser = new DOMParser();
  const docHtml = parser.parseFromString(htmlContent, "text/html");
  const body = docHtml.body;

  const children: (Paragraph | Table)[] = [];

  // If metadata is provided, render the complete executive bulletin card at the top
  if (metadata) {
    const metaElements = createBulletinMetadataSection(metadata);
    children.push(...metaElements);
  }

  // Parse and append the document body elements
  const bodyElements = parseHtmlBody(body);
  children.push(...bodyElements);

  if (children.length === 0) {
    children.push(new Paragraph({ text: "Documento sem conteúdo registrado." }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: {
              top: 1080, // ~1.9cm
              bottom: 1080,
              left: 1080,
              right: 1080,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: metadata?.referenceId
                      ? `COMUNICADO ${metadata.referenceId} • PARECER TÉCNICO REGULATÓRIO`
                      : "PARECER TÉCNICO REGULATÓRIO • MEIOS DE PAGAMENTO & INTERCÂMBIO",
                    size: 15, // 7.5pt
                    color: "64748B",
                    font: "Calibri",
                  }),
                ],
                border: {
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
                },
                spacing: { after: 120 },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Documento Confidencial — Uso Interno e Corporativo              ",
                    size: 15,
                    color: "94A3B8",
                    font: "Calibri",
                  }),
                  new TextRun({
                    text: "Página ",
                    size: 15,
                    color: "94A3B8",
                    font: "Calibri",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 15,
                    color: "64748B",
                    bold: true,
                    font: "Calibri",
                  }),
                  new TextRun({
                    text: " de ",
                    size: 15,
                    color: "94A3B8",
                    font: "Calibri",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 15,
                    color: "64748B",
                    bold: true,
                    font: "Calibri",
                  }),
                ],
                border: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
                },
                spacing: { before: 120 },
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const fileName = (metadata?.referenceId || title || "comunicado_tecnico")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 80);
  a.download = `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
