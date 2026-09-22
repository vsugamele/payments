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
    run_hl = p_headline.add_run("Head de Bandeiras | Especialista em Meios de Pagamento, Billing & Performance")
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
    
    r_tel = p_contact.add_run("(11) 99628-0159")
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

    # Helper function for section headings
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

    # ── 2. RESUMO EXECUTIVO ───────────────────────────────────────────────
    add_section_header("Resumo Executivo")
    
    p_summary1 = doc.add_paragraph()
    p_summary1.paragraph_format.space_after = Pt(3)
    p_summary1.paragraph_format.line_spacing = 1.15
    p_summary1.add_run(
        "Executivo e Especialista em Meios de Pagamento com mais de 16 anos de sólida trajetória em Bandeiras (Elo, Amex, Visa, Mastercard), Adquirência (Getnet, EcommIT) e Infraestrutura Transacional (Verifone). Especialista em engenharia de pagamentos, otimização de taxas de autorização, arquitetura de billing/recorrência, governança de releases mandatórios, tokenização de bandeira, mitigação de chargebacks e auditoria de intercâmbio/tarifas (MCBS/VSS)."
    )
    
    p_summary2 = doc.add_paragraph()
    p_summary2.paragraph_format.space_after = Pt(6)
    p_summary2.paragraph_format.line_spacing = 1.15
    p_summary2.add_run(
        "Histórico comprovado na liderança do relacionamento técnico-operacional entre Emissores (Bradesco, BB, Caixa), Credenciadores (Cielo, Rede, Getnet, Stone, PagBank) e Processadoras globais (DXC, AM53, Payware), além de consultoria estratégica para grandes fintechs e gateways (Checkout.com, PicPay, Mercado Pago, Banco Inter, Banco BS2). MBA em Liderança, Inovação e Gestão 3.0 pela PUCRS."
    )

    # ── 3. MATRIZ DE COMPETÊNCIAS & DOMÍNIO TÉCNICO ────────────────────────
    add_section_header("Áreas de Expertise & Domínio Técnico")

    skills_data = [
        ("Performance & Engenharia de Autorização:", " Otimização de conversão transacional, análise forense de Decline Codes, POS Entry Mode (DE 22), mensageria ISO 8583, Stand-In Processing (STIP) e roteamento inteligente (Smart Routing)."),
        ("Inovação, Billing & Tokenização:", " Network Tokens (VTS, MDES, Elo Token), Account Updater (Mastercard ABU e Visa VAU), 3-D Secure (3DS 2.0/2.2/2.3), Smart Retries, QR Code EMVCo e Split de Pagamento para Marketplaces."),
        ("Governança de Bandeiras & Regulatório:", " Gestão de Releases Semestrais/Mandatórios (Visa, Mastercard, Elo, Amex, Hipercard), conformidade Bacen, intercâmbio em cascata (waterfall) e auditoria de faturas de processamento (Mastercard MCBS e Visa VSS)."),
        ("Prevenção a Fraude & Disputas:", " Programas de monitoria de Chargeback (Visa VFMP/VDMP, Mastercard ECP/MDMP), garantia de Liability Shift (ECI 05), Compelling Evidence 3.0 e MATCH Pro / BRAM."),
        ("Analytics, Dados & Ferramentas:", " Qlik Sense, Tableau, DBeaver, SQL, Apache Hue, PostgREST/Supabase, monitoria em tempo real e troubleshooting de causa-raiz.")
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
        "Liderança estratégica no relacionamento técnico e de negócios com bandeiras globais (Visa, Mastercard, Elo, American Express), assegurando conformidade normativa e evolução contínua dos produtos.",
        bold_prefix=""
    )
    add_job_bullet(
        "Checkout.com, Getnet, PicPay, Mercado Pago, Banco Inter, Banco BS2, Entrepay, além de processadoras líderes como DXC Technology, AM53 e Payware.",
        bold_prefix="Consultoria técnica e atendimento a parceiros: "
    )
    add_job_bullet(
        "Governança dos Releases Semestrais Mandatórios, desenho de produtos transacionais, parametrizações de intercâmbio, liquidação financeira e integrações de core bancário/adquirente.",
        bold_prefix=""
    )
    add_job_bullet(
        "Idealização e arquitetura de motor de cálculo de intercâmbio em cascata (waterfall) e auditoria de faturas de processamento das bandeiras cobrindo mais de 224 mil faixas de BINs.",
        bold_prefix=""
    )

    # Job 2: Elo
    add_job_header("Bandeira Elo", "Especialista de Operações (Performance & Troubleshooting)", "Agosto 2020 – Outubro 2023")
    add_job_bullet(
        "Atuação consultiva focada na maximização de performance e taxas de aprovação transacional junto a grandes Credenciadores (Cielo, Getnet, Rede, Stone, PagBank) e Emissores (Bradesco, Banco do Brasil, Caixa).",
        bold_prefix=""
    )
    add_job_bullet(
        "Identificação contínua de causas-raiz de recusas (Do Not Honor, divergências no POS Entry Mode DE 22, timeouts de adquirente/emissor), mapeando oportunidades de incremento de conversão e receita.",
        bold_prefix="Troubleshooting & Análise de Falhas: "
    )
    add_job_bullet(
        "Construção e acompanhamento diário de dashboards analíticos em Qlik Sense, Tableau, Apache Hue e DBeaver, garantindo visibilidade em tempo real sobre autorização, compensação e liquidação.",
        bold_prefix="Analytics & Monitoria Operacional: "
    )
    add_job_bullet(
        "Liderança no desenvolvimento do novo Portal Elo para Adquirentes, centralizando ferramentas de suporte, relatórios e autosserviço operacional para os parceiros.",
        bold_prefix="Portal Elo para Adquirentes: "
    )
    add_job_bullet(
        "Atuação como ponto focal de Operações em squads multidisciplinares de Negócios e Aceitação para homologação e lançamento de novas soluções de mercado.",
        bold_prefix=""
    )

    # Job 3: Getnet
    add_job_header("Getnet", "Analista de Sistemas Sênior / Coordenador de Liquidação & Bandeiras", "Setembro 2017 – Outubro 2020")
    add_job_bullet(
        "Gestão completa do ciclo de desenvolvimento, homologação e rollout dos Releases Mandatórios das Bandeiras Elo, Visa, Mastercard, Amex e Hipercard.",
        bold_prefix=""
    )
    add_job_bullet(
        "Liderança na implantação de 3DS 2.0 (Autenticação), Tokenização de Bandeira (VTS/MDES), Account Updater (ABU/VAU), pagamentos via QR Code EMVCo, Split de Pagamento para Marketplace e Consulta de BIN.",
        bold_prefix="Projetos Estratégicos de Produtos: "
    )
    add_job_bullet(
        "Condução técnica da criação, certificação e homologação de processadora/adquirente dedicada (Amadeus).",
        bold_prefix=""
    )
    add_job_bullet(
        "Responsável pela entrega dos reportes estatísticos e regulatórios trimestrais das bandeiras (QMR/GMR/EIR) e auditoria técnica das invoices de bandeiras junto à diretoria Financeira.",
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
        "Homologação e certificação de produtos de submissão transacional junto a Visa, Mastercard, bancos emissores e processadoras de meios de pagamento.",
        bold_prefix=""
    )
    add_job_bullet(
        "Atuação no projeto Multivan, mapeamento de fluxos operacionais e suporte a terminais POS, gateways e mensageria ISO 8583.",
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
        ("Espanhol:", " Intermediário (Comunicação corporativa para América Latina)")
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
