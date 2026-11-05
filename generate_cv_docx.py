import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def add_bottom_border(paragraph, color_hex="0F2C59", sz="8"):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), sz)
    bottom.set(qn('w:space'), '4')
    bottom.set(qn('w:color'), color_hex)
    pBdr.append(bottom)
    pPr.append(pBdr)

def build_cv():
    doc = docx.Document()
    
    # Page setup - Margins 0.65 in (approx 1.65 cm)
    for section in doc.sections:
        section.top_margin = Inches(0.65)
        section.bottom_margin = Inches(0.65)
        section.left_margin = Inches(0.7)
        section.right_margin = Inches(0.7)
        section.page_width = Inches(8.27)  # A4 width
        section.page_height = Inches(11.69) # A4 height
        
    # Styles / Palette
    COLOR_PRIMARY = RGBColor(15, 44, 89)      # Deep Navy #0F2C59
    COLOR_ACCENT = RGBColor(37, 99, 235)      # Royal Blue #2563EB
    COLOR_TEXT = RGBColor(30, 41, 59)         # Dark Slate #1E293B
    COLOR_MUTED = RGBColor(100, 116, 139)     # Slate Gray #64748B
    
    # Set default font
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(10)
    style_normal.font.color.rgb = COLOR_TEXT
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(3)
    
    # ── 1. HEADER ──────────────────────────────────────────────────────────
    p_name = doc.add_paragraph()
    p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_name.paragraph_format.space_after = Pt(2)
    run_name = p_name.add_run("VINÍCIUS SUGAMELE")
    run_name.bold = True
    run_name.font.size = Pt(22)
    run_name.font.color.rgb = COLOR_PRIMARY
    
    p_headline = doc.add_paragraph()
    p_headline.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_headline.paragraph_format.space_after = Pt(4)
    run_hl = p_headline.add_run("Head de Bandeiras | Especialista em Gestão de Bandeiras e Meios de Pagamento")
    run_hl.bold = True
    run_hl.font.size = Pt(11)
    run_hl.font.color.rgb = COLOR_ACCENT
    
    p_contact = doc.add_paragraph()
    p_contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_contact.paragraph_format.space_after = Pt(10)
    
    r_loc = p_contact.add_run("São Paulo, SP")
    r_loc.font.size = Pt(9.5)
    r_loc.font.color.rgb = COLOR_MUTED
    
    r_sep1 = p_contact.add_run("   •   ")
    r_sep1.font.size = Pt(9.5)
    r_sep1.font.color.rgb = COLOR_MUTED
    
    r_tel = p_contact.add_run("(11) 97654-6714")
    r_tel.font.size = Pt(9.5)
    r_tel.font.color.rgb = COLOR_MUTED
    
    r_sep2 = p_contact.add_run("   •   ")
    r_sep2.font.size = Pt(9.5)
    r_sep2.font.color.rgb = COLOR_MUTED
    
    r_mail = p_contact.add_run("vsugamele@gmail.com")
    r_mail.font.size = Pt(9.5)
    r_mail.font.color.rgb = COLOR_MUTED
    
    r_sep3 = p_contact.add_run("   •   ")
    r_sep3.font.size = Pt(9.5)
    r_sep3.font.color.rgb = COLOR_MUTED
    
    r_in = p_contact.add_run("linkedin.com/in/vinicius-sugamele-41136617")
    r_in.font.size = Pt(9.5)
    r_in.font.color.rgb = COLOR_ACCENT
    r_in.bold = True

    def add_section_header(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(title.upper())
        run.bold = True
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_PRIMARY
        add_bottom_border(p, color_hex="0F2C59", sz="8")
        return p

    # ── 2. SOBRE / RESUMO EXECUTIVO ────────────────────────────────────────
    add_section_header("Sobre")
    
    p_s1 = doc.add_paragraph()
    p_s1.paragraph_format.space_after = Pt(3)
    p_s1.paragraph_format.line_spacing = 1.15
    p_s1.add_run(
        "Sou especialista em gestão de bandeiras e meios de pagamento, com mais de 16 anos de atuação direta com Visa, Mastercard, Elo e American Express em compliance de bandeiras, certificações, mandates e governança de Data Integrity. Sou referência em regras de bandeira para os times técnicos e de negócios: traduzo os requisitos das marcas em planos de ação que produto, tecnologia e operações conseguem executar."
    )

    p_s2 = doc.add_paragraph()
    p_s2.paragraph_format.space_after = Pt(3)
    p_s2.paragraph_format.line_spacing = 1.15
    p_s2.add_run(
        "Hoje, na EcommIT, atuo como Head de Bandeiras atendendo adquirentes, subadquirentes, bancos e processadoras (Checkout.com, Getnet, PicPay, Mercado Pago, Banco Inter, Banco BS2, Entrepay, DXC, AM53 e Payware). Alguns resultados:"
    )

    summary_bullets = [
        "Gestão das regras de bandeira, releases semestrais e projetos de captura e processamento, conduzindo certificações L3 / ADVT Visa, MTIP Mastercard, TQS Elo e Amex dentro dos prazos regulatórios.",
        "Atuação preventiva em Data Integrity e qualidade de mensageria entre autorização e clearing, evitando multas operacionais e conduzindo a aprovação de waivers junto às bandeiras.",
        "Estruturação do controle e auditoria das tarifas das bandeiras (Visa VSS e Mastercard MCBS) e projetos de qualificação de Interchange, gerando economia direta e proteção de margem para a operação.",
        "Resolução de incidentes críticos entre autorização, captura e liquidação (clearing), preservando a continuidade operacional sem impacto financeiro para os estabelecimentos e parceiros.",
    ]
    for b_txt in summary_bullets:
        pb = doc.add_paragraph()
        pb.paragraph_format.space_after = Pt(2)
        pb.paragraph_format.left_indent = Inches(0.2)
        pb.paragraph_format.line_spacing = 1.15
        rb = pb.add_run("•  ")
        rb.font.color.rgb = COLOR_ACCENT
        rb.font.size = Pt(9)
        rt = pb.add_run(b_txt)
        rt.font.color.rgb = COLOR_TEXT
        rt.font.size = Pt(9.5)

    p_s3 = doc.add_paragraph()
    p_s3.paragraph_format.space_before = Pt(3)
    p_s3.paragraph_format.space_after = Pt(3)
    p_s3.paragraph_format.line_spacing = 1.15
    p_s3.add_run(
        "Antes, na Bandeira Elo, atuei por 3 anos na gestão de performance, operações e troubleshooting de autorização e liquidação entre grandes Emissores (Bradesco, Banco do Brasil e Caixa) e Credenciadores (Cielo, Rede, Getnet, Stone e PagBank), além de liderar o desenvolvimento do novo Portal Elo para Adquirentes. Na Getnet, conduzi a gestão de compliance e releases mandatórios com Visa, Mastercard, Elo, Amex e Hipercard, os projetos de certificação host da processadora/adquirente dedicada (Amadeus), a entrega dos reportes trimestrais às bandeiras (QMR/GMR/EIR), a auditoria de faturas (MCBS/VSS) junto ao Financeiro e o rollout de 3DS 2.0, Tokenização de Bandeira (VTS/MDES), Account Updater (ABU/VAU), QR Code e Marketplace. Na Verifone / American Express, participei da migração global dos servidores da Amex para o Bradesco e da implantação dos processos de EDI, captura e certificação EMV L2."
    )

    p_s4 = doc.add_paragraph()
    p_s4.paragraph_format.space_after = Pt(6)
    p_s4.paragraph_format.line_spacing = 1.15
    p_s4.add_run(
        "Trabalho de forma transversal com Produtos, Captura, Processamento, Financeiro, Operações, Compliance, Chargeback, Fraudes, Infraestrutura e NOC, com liderança funcional, visão financeira de impacto e práticas ágeis (MBA em Liderança, Inovação e Gestão 3.0 — PUCRS). Atuo com inglês e espanhol no dia a dia. Busco oportunidades em adquirentes, subadquirentes, emissores, bancos, fintechs, bandeiras e processadoras, no Brasil e na América Latina."
    )

    # ── 3. MATRIZ DE COMPETÊNCIAS & DOMÍNIO TÉCNICO ────────────────────────
    add_section_header("Áreas de Expertise & Domínio Técnico")

    skills_data = [
        ("Compliance de Bandeiras, Mandates & Certificações:", " Gestão de Releases Mandatórios e mandates (Visa, Mastercard, Elo, Amex, Hipercard), governança de Data Integrity, prevenção de multas e gestão de waivers, condução de homologações e certificações (Visa ADVT/L3, Mastercard MTIP, Elo TQS e Amex) e conformidade Bacen."),
        ("Controle de Tarifas, Finanças & Interchange:", " Controle e auditoria técnica de faturas das bandeiras (Mastercard MCBS e Visa VSS), regras de qualificação de Interchange, prevenção de downgrades e análise de viabilidade financeira de produtos e processamento."),
        ("Performance, Mensageria & Engenharia de Autorização:", " Otimização de conversão transacional, análise de Decline Codes, POS Entry Mode (DE 22), mensageria ISO 8583 / ISO 20022, fluxos de autorização e clearing/liquidação (Base II / IPM / T068) e Stand-In Processing (STIP)."),
        ("Produtos, Tokenização & Billing:", " Desenho e evolução de produtos de pagamento, Network Tokens (VTS, MDES, Elo Token), Contactless (NFC) / HCE, EMV L2, Account Updater (Mastercard ABU e Visa VAU), 3-D Secure (3DS 2.0/2.2), QR Code EMVCo e Split/Marketplace."),
        ("Prevenção a Fraudes, Chargeback & Monitoria:", " Gestão de disputas e regras de chargeback, programas de monitoria (Visa VAMP/VFMP/VDMP, Mastercard ECP), garantia de Liability Shift, Compelling Evidence 3.0 e análise operacional em Qlik Sense, Tableau e SQL.")
    ]

    for title, desc in skills_data:
        p_sk = doc.add_paragraph()
        p_sk.paragraph_format.space_after = Pt(2.5)
        p_sk.paragraph_format.left_indent = Inches(0.2)
        p_sk.paragraph_format.line_spacing = 1.15
        
        r_b = p_sk.add_run("▪  ")
        r_b.font.color.rgb = COLOR_ACCENT
        r_b.font.size = Pt(8.5)
        
        r_t = p_sk.add_run(title)
        r_t.bold = True
        r_t.font.color.rgb = COLOR_PRIMARY
        r_t.font.size = Pt(9.5)
        
        r_d = p_sk.add_run(desc)
        r_d.font.color.rgb = COLOR_TEXT
        r_d.font.size = Pt(9.5)

    # ── 4. EXPERIÊNCIA PROFISSIONAL ───────────────────────────────────────
    add_section_header("Trajetória Profissional")

    def add_job_header(company, role, period):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(7)
        p.paragraph_format.space_after = Pt(2.5)
        p.paragraph_format.keep_with_next = True
        
        r_comp = p.add_run(company.upper())
        r_comp.bold = True
        r_comp.font.size = Pt(10.5)
        r_comp.font.color.rgb = COLOR_PRIMARY
        
        r_sep = p.add_run("  |  ")
        r_sep.font.color.rgb = COLOR_MUTED
        
        r_role = p.add_run(role)
        r_role.bold = True
        r_role.font.size = Pt(10)
        r_role.font.color.rgb = COLOR_ACCENT
        
        r_per = p.add_run(f"  ({period})")
        r_per.italic = True
        r_per.font.size = Pt(9)
        r_per.font.color.rgb = COLOR_MUTED
        return p

    def add_job_bullet(text, bold_prefix=""):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2.5)
        p.paragraph_format.left_indent = Inches(0.2)
        p.paragraph_format.line_spacing = 1.15
        
        r_b = p.add_run("•  ")
        r_b.font.color.rgb = COLOR_ACCENT
        r_b.font.size = Pt(9)
        
        if bold_prefix:
            r_bp = p.add_run(bold_prefix)
            r_bp.bold = True
            r_bp.font.color.rgb = COLOR_TEXT
            r_bp.font.size = Pt(9.5)
            
        r_txt = p.add_run(text)
        r_txt.font.color.rgb = COLOR_TEXT
        r_txt.font.size = Pt(9.5)

    # Job 1: EcommIT
    add_job_header("EcommIT Integrated Solutions", "Head de Bandeiras", "Outubro 2023 – Presente")
    add_job_bullet(
        "Liderança estratégica no relacionamento técnico e de negócios com Visa, Mastercard, Elo e American Express, atuando como referência em regras de bandeira para Produto, Tecnologia, Riscos, Financeiro e Operações.",
        bold_prefix=""
    )
    add_job_bullet(
        "Checkout.com, Getnet, PicPay, Mercado Pago, Banco Inter, Banco BS2, Entrepay, além de processadoras líderes como DXC Technology, AM53 e Payware.",
        bold_prefix="Atendimento e governança para parceiros: "
    )
    add_job_bullet(
        "Gestão de mandates e Releases Semestrais Mandatórios, condução de homologações e certificações técnicas (Visa ADVT/L3, Mastercard MTIP, Elo TQS e certificações Amex), garantindo cumprimento integral dos prazos das marcas.",
        bold_prefix=""
    )
    add_job_bullet(
        "Atuação preventiva em Data Integrity na mensageria de autorização e clearing, evitando multas operacionais, conduzindo pedidos de waiver e liderando a resolução de incidentes críticos entre captura, autorização e liquidação.",
        bold_prefix=""
    )
    add_job_bullet(
        "Estruturação do controle e auditoria de tarifas das bandeiras (Visa VSS e Mastercard MCBS) e gestão de regras de Interchange, apoiando decisões de viabilidade financeira e proteção de margem.",
        bold_prefix=""
    )

    # Job 2: Elo
    add_job_header("Bandeira Elo", "Especialista de Operações (Performance & Troubleshooting)", "Agosto 2020 – Outubro 2023")
    add_job_bullet(
        "Atuação consultiva focada na maximização de performance e taxas de aprovação transacional junto a grandes Credenciadores (Cielo, Getnet, Rede, Stone, PagBank) e Emissores (Bradesco, Banco do Brasil, Caixa).",
        bold_prefix=""
    )
    add_job_bullet(
        "Identificação contínua de causas-raiz de recusas (Do Not Honor, divergências no POS Entry Mode DE 22, timeouts de adquirente/emissor), gerenciamento de incidentes entre autorização e liquidação e recuperação de conversão.",
        bold_prefix="Troubleshooting & Qualidade Transacional: "
    )
    add_job_bullet(
        "Construção e acompanhamento diário de painéis executivos em Qlik Sense, Tableau, Apache Hue e DBeaver, garantindo visibilidade sobre autorização, compensação e liquidação.",
        bold_prefix="Analytics & Monitoria Operacional: "
    )
    add_job_bullet(
        "Liderança no desenvolvimento do novo Portal Elo para Adquirentes, centralizando abertura e gerenciamento de tickets, ferramentas de suporte, documentação e autosserviço operacional para os parceiros.",
        bold_prefix="Portal Elo para Adquirentes: "
    )
    add_job_bullet(
        "Ponto focal de Operações em squads multidisciplinares de Negócios e Aceitação para apoio no desenho de produtos, homologação, certificação (Elo TQS) e lançamento de soluções no mercado.",
        bold_prefix=""
    )

    # Job 3: Getnet
    add_job_header("Getnet", "Analista de Sistemas Sênior / Coordenador de Liquidação & Bandeiras", "Setembro 2017 – Outubro 2020")
    add_job_bullet(
        "Gestão completa de compliance, desenvolvimento, testes, homologação, certificação (Visa ADVT, Mastercard M-TIP, Elo TQS e Amex) e rollout dos Releases Mandatórios das bandeiras Elo, Visa, Mastercard, Amex e Hipercard.",
        bold_prefix=""
    )
    add_job_bullet(
        "Liderança e apoio no desenho e implantação de 3DS 2.0 (Autenticação), Tokenização de Bandeira (VTS/MDES), Contactless (NFC) / HCE, Account Updater (ABU/VAU), QR Code EMVCo, Split de Pagamento para Marketplace e Consulta de BIN.",
        bold_prefix="Projetos Estratégicos & Desenho de Produtos: "
    )
    add_job_bullet(
        "Condução técnica da criação, certificação host e homologação de processadora/adquirente dedicada (Amadeus), mantendo a documentação técnica e fluxos transacionais atualizados.",
        bold_prefix=""
    )
    add_job_bullet(
        "Responsável pela entrega dos reportes estatísticos e regulatórios trimestrais das bandeiras (QMR/GMR/EIR), gerenciamento de tickets operacionais e auditoria técnica de invoices (MCBS/VSS) junto à diretoria Financeira.",
        bold_prefix=""
    )

    # Job 4: Verifone / Amex
    add_job_header("Verifone / American Express", "Analista de Produção e Negócios", "Agosto 2009 – Setembro 2017")
    add_job_bullet(
        "Participação chave na migração dos servidores globais da American Express (2014) para a infraestrutura do Banco Bradesco, assegurando estabilidade operacional contínua na captura e liquidação de vendas.",
        bold_prefix="Migração Global Amex (2014): "
    )
    add_job_bullet(
        "Criação e implantação de processos de EDI (Electronic Data Interchange) entre clientes corporativos e Bradesco para submissão de vendas e cancelamentos.",
        bold_prefix=""
    )
    add_job_bullet(
        "Condução de testes, homologação e certificação de produtos de submissão transacional e EMV L2 junto a Visa, Mastercard, American Express, bancos emissores e processadoras de meios de pagamento.",
        bold_prefix=""
    )
    add_job_bullet(
        "Atuação no projeto Multivan, mapeamento de fluxos operacionais, gerenciamento de tickets e suporte a terminais POS, Contactless, gateways e mensageria ISO 8583.",
        bold_prefix=""
    )

    # ── 5. FORMAÇÃO ACADÊMICA ─────────────────────────────────────────────
    add_section_header("Formação Acadêmica")

    p_ed1 = doc.add_paragraph()
    p_ed1.paragraph_format.space_before = Pt(3)
    p_ed1.paragraph_format.space_after = Pt(1.5)
    p_ed1.paragraph_format.left_indent = Inches(0.2)
    r_ed1_t = p_ed1.add_run("MBA em Liderança, Inovação e Gestão 3.0")
    r_ed1_t.bold = True
    r_ed1_t.font.color.rgb = COLOR_PRIMARY
    r_ed1_t.font.size = Pt(9.5)
    r_ed1_inst = p_ed1.add_run(" — PUCRS (Conclusão: 2020)")
    r_ed1_inst.font.color.rgb = COLOR_TEXT
    r_ed1_inst.font.size = Pt(9.5)

    p_ed2 = doc.add_paragraph()
    p_ed2.paragraph_format.space_after = Pt(3)
    p_ed2.paragraph_format.left_indent = Inches(0.2)
    r_ed2_t = p_ed2.add_run("Graduação em Gestão da Tecnologia da Informação")
    r_ed2_t.bold = True
    r_ed2_t.font.color.rgb = COLOR_PRIMARY
    r_ed2_t.font.size = Pt(9.5)
    r_ed2_inst = p_ed2.add_run(" — UNIP · Universidade Paulista (Conclusão: 2011)")
    r_ed2_inst.font.color.rgb = COLOR_TEXT
    r_ed2_inst.font.size = Pt(9.5)

    # ── 6. IDIOMAS ────────────────────────────────────────────────────────
    add_section_header("Idiomas")

    langs = [
        ("Português:", " Nativo"),
        ("Inglês:", " Avançado (Negociação técnica e documentação com bandeiras internacionais)"),
        ("Espanhol:", " Profissional (Atuação no dia a dia com operações na América Latina)")
    ]

    for i, (l_title, l_desc) in enumerate(langs):
        p_l = doc.add_paragraph()
        p_l.paragraph_format.space_after = Pt(1.5)
        p_l.paragraph_format.left_indent = Inches(0.2)
            
        r_lb = p_l.add_run("•  ")
        r_lb.font.color.rgb = COLOR_ACCENT
        r_lb.font.size = Pt(9)
        
        r_lt = p_l.add_run(l_title)
        r_lt.bold = True
        r_lt.font.color.rgb = COLOR_PRIMARY
        r_lt.font.size = Pt(9.5)
        
        r_ld = p_l.add_run(l_desc)
        r_ld.font.color.rgb = COLOR_TEXT
        r_ld.font.size = Pt(9.5)

    output_path = r"c:\Users\vsuga\Desktop\V\Ecommit\Tabelasintercambio\Curriculo_Vinicius_Sugamele.docx"
    doc.save(output_path)
    print(f"Successfully generated: {output_path}")

if __name__ == "__main__":
    build_cv()
