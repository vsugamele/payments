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
} from "docx";

export async function exportHtmlToDocx(htmlContent: string, title: string = "Documento") {
  // Create a temporary parser element in browser
  const parser = new DOMParser();
  const docHtml = parser.parseFromString(htmlContent, "text/html");
  const body = docHtml.body;

  const children: (Paragraph | Table)[] = [];

  // Parse DOM nodes to DOCX elements
  function parseNode(node: Node): TextRun[] {
    const runs: TextRun[] = [];

    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) {
        runs.push(new TextRun({ text: node.textContent }));
      }
      return runs;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      const isBold = tagName === "strong" || tagName === "b" || el.style.fontWeight === "bold";
      const isItalic = tagName === "em" || tagName === "i" || el.style.fontStyle === "italic";
      const isUnderline = tagName === "u" || el.style.textDecoration.includes("underline");
      const isStrike = tagName === "s" || tagName === "strike" || tagName === "del";

      el.childNodes.forEach((child) => {
        const childRuns = parseNode(child);
        childRuns.forEach((r) => {
          // Clone properties
          runs.push(
            new TextRun({
              text: (r as any).root[1]?.value || child.textContent || "",
              bold: isBold || (r as any).options?.bold,
              italics: isItalic || (r as any).options?.italics,
              underline: isUnderline ? {} : (r as any).options?.underline,
              strike: isStrike || (r as any).options?.strike,
            })
          );
        });
      });
    }

    return runs;
  }

  // Iterate over block elements
  Array.from(body.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === "h1") {
        children.push(
          new Paragraph({
            text: el.textContent || "",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
          })
        );
      } else if (tag === "h2") {
        children.push(
          new Paragraph({
            text: el.textContent || "",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (tag === "h3") {
        children.push(
          new Paragraph({
            text: el.textContent || "",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 },
          })
        );
      } else if (tag === "ul" || tag === "ol") {
        Array.from(el.querySelectorAll("li")).forEach((li, idx) => {
          children.push(
            new Paragraph({
              text: `${tag === "ol" ? `${idx + 1}. ` : "• "} ${li.textContent || ""}`,
              spacing: { before: 60, after: 60 },
              indent: { left: 720 },
            })
          );
        });
      } else if (tag === "blockquote") {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: el.textContent || "",
                italics: true,
                color: "4A5568",
              }),
            ],
            indent: { left: 720, right: 720 },
            spacing: { before: 140, after: 140 },
          })
        );
      } else if (tag === "hr") {
        children.push(
          new Paragraph({
            border: {
              bottom: {
                color: "CBD5E1",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 120, after: 120 },
          })
        );
      } else {
        // Standard paragraph
        const textContent = el.textContent?.trim();
        if (textContent) {
          children.push(
            new Paragraph({
              children: parseNode(el),
              spacing: { before: 60, after: 100 },
              alignment:
                el.style.textAlign === "center"
                  ? AlignmentType.CENTER
                  : el.style.textAlign === "right"
                  ? AlignmentType.RIGHT
                  : el.style.textAlign === "justify"
                  ? AlignmentType.JUSTIFIED
                  : AlignmentType.LEFT,
            })
          );
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      children.push(
        new Paragraph({
          text: node.textContent.trim(),
          spacing: { before: 60, after: 100 },
        })
      );
    }
  });

  // If empty, add a default paragraph
  if (children.length === 0) {
    children.push(new Paragraph({ text: "Documento sem conteúdo." }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-zA-Z0-9-_]/g, "_") || "documento"}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
