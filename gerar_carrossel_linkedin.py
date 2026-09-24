import os
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions (LinkedIn 4:5 aspect ratio)
WIDTH = 1080
HEIGHT = 1350

# Output directories
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "frontend", "public", "carousel")
os.makedirs(OUTPUT_DIR, exist_ok=True)
PDF_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "frontend", "public", "Carrossel_LinkedIn_Quando_a_IA_responde.pdf")
ROOT_PDF_PATH = os.path.join(os.path.dirname(__file__), "Carrossel_LinkedIn_Quando_a_IA_responde.pdf")

# Fonts
FONT_BOLD_PATH = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG_PATH = "C:/Windows/Fonts/segoeui.ttf"
FONT_SEMIBOLD_PATH = "C:/Windows/Fonts/segoeuisl.ttf"

def get_font(size, bold=False):
    path = FONT_BOLD_PATH if bold else FONT_REG_PATH
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

# Color Palette (Executive Dark Theme matching VS Payments)
BG_COLOR = "#080C16"
CARD_BG = "#111827"
CARD_BORDER = "#1E293B"
TEXT_WHITE = "#FFFFFF"
TEXT_SLATE = "#CBD5E1"
TEXT_MUTED = "#64748B"
ACCENT_BLUE = "#38BDF8"
ACCENT_ROYAL = "#2563EB"
ACCENT_GREEN = "#10B981"
ACCENT_AMBER = "#F59E0B"
ACCENT_RED = "#EF4444"
ACCENT_PURPLE = "#A855F7"

def create_base_canvas(slide_num, total_slides, category_label):
    img = Image.new("RGB", (WIDTH, HEIGHT), color=BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Subtle top glow accent
    for i in range(120):
        alpha_color = "#0B152A" if i < 60 else "#080C16"
        draw.line([(0, i), (WIDTH, i)], fill=alpha_color)

    # Top Bar Header
    draw.text((70, 60), "VS PAYMENTS", font=get_font(18, bold=True), fill=ACCENT_BLUE)
    draw.text((210, 60), "•", font=get_font(18, bold=True), fill=TEXT_MUTED)
    draw.text((230, 60), category_label.upper(), font=get_font(18, bold=True), fill=TEXT_MUTED)

    # Slide Counter
    counter_text = f"{slide_num:02d} / {total_slides:02d}"
    draw.text((WIDTH - 150, 60), counter_text, font=get_font(18, bold=True), fill=ACCENT_BLUE)

    # Top progress bar
    progress_w = int((WIDTH - 140) * (slide_num / total_slides))
    draw.rounded_rectangle([70, 95, WIDTH - 70, 99], radius=2, fill="#1E293B")
    draw.rounded_rectangle([70, 95, 70 + progress_w, 99], radius=2, fill=ACCENT_ROYAL)

    # Bottom Footer
    draw.line([(70, HEIGHT - 90), (WIDTH - 70, HEIGHT - 90)], fill="#1E293B", width=1)
    draw.text((70, HEIGHT - 68), "Vinícius Sugamele • Especialista em Meios de Pagamento", font=get_font(18, bold=False), fill=TEXT_MUTED)
    
    if slide_num < total_slides:
        draw.text((WIDTH - 250, HEIGHT - 68), "arraste para o lado 👉", font=get_font(18, bold=True), fill=ACCENT_BLUE)
    else:
        draw.text((WIDTH - 220, HEIGHT - 68), "salve este post 📌", font=get_font(18, bold=True), fill=ACCENT_GREEN)

    return img, draw

def draw_card(draw, bbox, bg=CARD_BG, border=CARD_BORDER, radius=20, border_width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=bg, outline=border, width=border_width)

def draw_wrapped_text(draw, text, pos, max_width, font, fill=TEXT_WHITE, line_spacing=1.35):
    words = text.split()
    lines = []
    current_line = []

    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        w = bbox[2] - bbox[0]
        if w <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
    if current_line:
        lines.append(" ".join(current_line))

    x, y = pos
    line_h = int(font.size * line_spacing)
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        y += line_h
    return y

# ── SLIDE 1: CAPA ─────────────────────────────────────────────────────────────
def generate_slide_1():
    img, draw = create_base_canvas(1, 9, "Ensaio Estratégico")

    # Pill Tag
    draw.rounded_rectangle([70, 160, 480, 210], radius=12, fill="#1E293B", outline=ACCENT_BLUE, width=1)
    draw.text((95, 172), "🤖 INTELIGÊNCIA ARTIFICIAL & REPERTÓRIO", font=get_font(17, bold=True), fill=ACCENT_BLUE)

    # Main Headline
    y = draw_wrapped_text(
        draw,
        "Quando a IA\nresponde, quem\nrealmente sabe?",
        (70, 260),
        940,
        get_font(68, bold=True),
        fill=TEXT_WHITE,
        line_spacing=1.15
    )

    # Decorative Line
    draw.line([(70, y + 25), (220, y + 25)], fill=ACCENT_ROYAL, width=6)

    # Subtitle / Hook in Executive Card
    card_y = y + 65
    draw_card(draw, [70, card_y, WIDTH - 70, card_y + 360], bg="#111C35", border=ACCENT_ROYAL, radius=24, border_width=2)
    
    draw.text((105, card_y + 35), "A PROVOCAÇÃO CENTRAL:", font=get_font(18, bold=True), fill=ACCENT_BLUE)
    
    draw_wrapped_text(
        draw,
        "A IA já resume boletins de bandeira, interpreta regras de intercâmbio e cruza especificações em segundos.\n\nIsso é extraordinário. Mas existe um risco silencioso sobre o qual quase ninguém está falando:\n\nO que acontece quando a IA começa a substituir não apenas o trabalho operacional, mas a construção de repertório e raciocínio técnico das pessoas?",
        (105, card_y + 75),
        870,
        get_font(23, bold=False),
        fill=TEXT_SLATE,
        line_spacing=1.35
    )

    # Call to action badge
    cta_y = card_y + 400
    draw.rounded_rectangle([70, cta_y, 440, cta_y + 55], radius=14, fill="#16223D", outline="#2563EB", width=1)
    draw.text((95, cta_y + 15), "Leitura: 3 minutos • 9 slides", font=get_font(19, bold=True), fill="#93C5FD")

    return img

# ── SLIDE 2: O ATALHO DO PROMPT ───────────────────────────────────────────────
def generate_slide_2():
    img, draw = create_base_canvas(2, 9, "A Transformação")

    draw.text((70, 150), "A ILUSÃO DA FACILIDADE", font=get_font(18, bold=True), fill=ACCENT_AMBER)
    draw.text((70, 185), "O Atalho de 10 Segundos", font=get_font(52, bold=True), fill=TEXT_WHITE)

    # Card 1: ANTES (Atrito Cognitivo)
    draw_card(draw, [70, 270, WIDTH - 70, 610], bg="#0F172A", border="#334155", radius=20)
    draw.rounded_rectangle([100, 295, 340, 335], radius=8, fill="#1E293B")
    draw.text((115, 303), "📚 O PROCESSO ANTERIOR", font=get_font(15, bold=True), fill=ACCENT_BLUE)
    
    points_before = [
        "Abrir o boletim da bandeira de 80+ páginas na íntegra.",
        "Rastrear a mensagem entre autorização, clearing e liquidação.",
        "Mapear subcampos da ISO 8583 (DE 22, DE 48, tags EMV).",
        "Errar a interpretação e debater com seniores para aprender."
    ]
    y_pt = 355
    for pt in points_before:
        draw.ellipse([105, y_pt + 8, 117, y_pt + 20], fill=ACCENT_ROYAL)
        y_pt = draw_wrapped_text(draw, pt, (135, y_pt), 800, get_font(21, bold=False), fill=TEXT_SLATE, line_spacing=1.2) + 12

    # Card 2: HOJE (Atalho do Prompt)
    draw_card(draw, [70, 640, WIDTH - 70, 980], bg="#111B33", border=ACCENT_ROYAL, radius=20, border_width=2)
    draw.rounded_rectangle([100, 665, 330, 705], radius=8, fill="#1E3A8A")
    draw.text((115, 673), "⚡ O CICLO DO PROMPT HOJE", font=get_font(15, bold=True), fill="#93C5FD")
    
    draw_card(draw, [100, 725, WIDTH - 100, 815], bg="#090E1A", border="#1E293B", radius=12)
    draw.text((120, 745), '💬 "IA, leia este boletim e me diga os impactos operacionais."', font=get_font(21, bold=True), fill=TEXT_WHITE)
    draw.text((120, 775), "Em 10 segundos surge uma resposta impecável e estruturada.", font=get_font(17, bold=False), fill=ACCENT_GREEN)

    y_pt = 840
    points_today = [
        "Entrega pontual rápida, mas sem retenção na memória.",
        "O atrito cognitivo que construía o repertório simplesmente sumiu."
    ]
    for pt in points_today:
        draw.ellipse([105, y_pt + 8, 117, y_pt + 20], fill=ACCENT_AMBER)
        y_pt = draw_wrapped_text(draw, pt, (135, y_pt), 800, get_font(21, bold=False), fill=TEXT_SLATE, line_spacing=1.2) + 10

    # Bottom Callout
    draw_card(draw, [70, 1010, WIDTH - 70, 1130], bg="#1E160C", border=ACCENT_AMBER, radius=16)
    draw.text((105, 1030), "⚠️ O ponto cego da nossa geração:", font=get_font(18, bold=True), fill=ACCENT_AMBER)
    draw.text((105, 1065), "O trabalho ficou 10x mais veloz. Mas a capacidade de pensar do zero pode estar atrofiando.", font=get_font(21, bold=False), fill=TEXT_WHITE)

    return img

# ── SLIDE 3: FORMA VS DOMÍNIO ─────────────────────────────────────────────────
def generate_slide_3():
    img, draw = create_base_canvas(3, 9, "O Diagnóstico")

    draw.text((70, 150), "A PRIMEIRA GRANDE ARMADILHA", font=get_font(18, bold=True), fill=ACCENT_RED)
    draw.text((70, 185), "Forma Impecável vs.\nDomínio do Assunto", font=get_font(50, bold=True), fill=TEXT_WHITE, spacing=10)

    # Box 1: Resposta bem escrita
    draw_card(draw, [70, 330, WIDTH - 70, 520], bg="#1B1214", border=ACCENT_RED, radius=20, border_width=2)
    draw.text((110, 360), "1ª VERDADE INCONVENIENTE:", font=get_font(18, bold=True), fill="#FCA5A5")
    draw_wrapped_text(
        draw,
        "Uma resposta bem escrita NÃO significa uma resposta correta.",
        (110, 400),
        840,
        get_font(36, bold=True),
        fill=TEXT_WHITE,
        line_spacing=1.15
    )

    # Box 2: Boa entrega != domínio
    draw_card(draw, [70, 550, WIDTH - 70, 740], bg="#1A1810", border=ACCENT_AMBER, radius=20, border_width=2)
    draw.text((110, 580), "2ª VERDADE AINDA MAIS PERIGOSA:", font=get_font(18, bold=True), fill="#FDE68A")
    draw_wrapped_text(
        draw,
        "Uma boa entrega NÃO significa domínio técnico do assunto.",
        (110, 620),
        840,
        get_font(36, bold=True),
        fill=TEXT_WHITE,
        line_spacing=1.15
    )

    # Explicação executiva
    draw_card(draw, [70, 770, WIDTH - 70, 1140], bg="#0F172A", border="#334155", radius=20)
    draw.text((110, 805), "A ILUSÃO DA SENIORIDADE ARTIFICIAL:", font=get_font(18, bold=True), fill=ACCENT_BLUE)
    
    explanation = (
        "Um profissional júnior hoje consegue produzir memorandos, apresentações e pareceres com linguagem refinada e termos técnicos avançados.\n\n"
        "Para a diretoria ou para seus pares, ele aparenta ter anos de bagagem e profundidade analítica.\n\n"
        "Enquanto as reuniões seguem o roteiro básico, ninguém percebe a diferença.\n\n"
        "O problema aparece no instante em que a discussão sai do script..."
    )
    draw_wrapped_text(draw, explanation, (110, 845), 840, get_font(22, bold=False), fill=TEXT_SLATE, line_spacing=1.35)

    return img

# ── SLIDE 4: O TESTE DA SEGUNDA PERGUNTA ───────────────────────────────────────
def generate_slide_4():
    img, draw = create_base_canvas(4, 9, "O Teste Real")

    draw.text((70, 150), "QUANDO O SCRIPT ACABA", font=get_font(18, bold=True), fill=ACCENT_AMBER)
    draw.text((70, 185), "O Teste da Segunda\ne Terceira Pergunta", font=get_font(50, bold=True), fill=TEXT_WHITE, spacing=10)

    draw.text((70, 315), "A ilusão de domínio construída por IA cai por terra quando:", font=get_font(22, bold=False), fill=TEXT_SLATE)

    questions = [
        ("01", "Alguém faz a SEGUNDA pergunta", "Exigindo detalhar o porquê daquela parametrização ou qual a lógica por trás da norma."),
        ("02", "Chega a TERCEIRA pergunta técnica", "Buscando entender o impacto no fluxo financeiro, no clearing ou no split de pagamento."),
        ("03", "Surge uma EXCEÇÃO operacional", "Cenários de fallback, transações offline ou compras transfronteiriças fora do prompt."),
        ("04", "É preciso DEFENDER uma interpretação", "Sustentar tecnicamente um parecer diante da auditoria da bandeira ou do banco emissor."),
        ("05", "Ninguém sabe o caminho exato", "E o profissional precisa formular uma hipótese a partir da sua própria experiência vivida.")
    ]

    y_pos = 360
    for num, title, desc in questions:
        draw_card(draw, [70, y_pos, WIDTH - 70, y_pos + 120], bg="#111827", border="#1E293B", radius=16)
        
        # Badge circle
        draw.ellipse([95, y_pos + 25, 155, y_pos + 85], fill="#1E293B", outline=ACCENT_BLUE, width=2)
        draw.text((110, y_pos + 40), num, font=get_font(22, bold=True), fill=ACCENT_BLUE)

        draw.text((175, y_pos + 25), title, font=get_font(22, bold=True), fill=TEXT_WHITE)
        draw.text((175, y_pos + 60), desc, font=get_font(18, bold=False), fill=TEXT_MUTED)

        y_pos += 140

    # Bottom Punchline
    draw_card(draw, [70, 1080, WIDTH - 70, 1170], bg="#1E1B4B", border=ACCENT_PURPLE, radius=16)
    draw.text((105, 1105), "💡 Repertório e intuição técnica não se transferem por prompt.", font=get_font(22, bold=True), fill="#E0E7FF")

    return img

# ── SLIDE 5: O PARADOXO COGNITIVO ──────────────────────────────────────────────
def generate_slide_5():
    img, draw = create_base_canvas(5, 9, "O Paradoxo")

    draw.text((70, 150), "O PARADOXO DA INTELIGÊNCIA ARTIFICIAL", font=get_font(18, bold=True), fill=ACCENT_BLUE)
    draw.text((70, 185), "O Ciclo Vicioso da\nDependência Intelectual", font=get_font(50, bold=True), fill=TEXT_WHITE, spacing=10)

    # Big Central Statement Box
    draw_card(draw, [70, 330, WIDTH - 70, 680], bg="#0F172A", border=ACCENT_ROYAL, radius=24, border_width=3)
    
    draw.text((110, 370), "O PARADOXO CENTRAL:", font=get_font(20, bold=True), fill=ACCENT_BLUE)
    
    quote = (
        "“Quanto mais usamos IA para nos poupar do esforço de construir conhecimento...\n\n"
        "...menos preparados ficamos para validar aquilo que a própria IA produz.”"
    )
    draw_wrapped_text(draw, quote, (110, 420), 840, get_font(34, bold=True), fill=TEXT_WHITE, line_spacing=1.3)

    # Breakdown Points
    draw_card(draw, [70, 715, WIDTH - 70, 1140], bg="#111827", border="#1E293B", radius=20)
    draw.text((110, 745), "O QUE ACONTECE NA PRÁTICA:", font=get_font(18, bold=True), fill=ACCENT_AMBER)

    effects = [
        ("Se toda dificuldade vira imediatamente um prompt:", "O cérebro para de fazer conexões profundas e de enxergar a arquitetura como um todo."),
        ("A resposta rápida gera viés de confirmação:", "O profissional assume que a IA está certa simplesmente porque a escrita é polida e convincente."),
        ("A capacidade de questionar atrofia:", "Quem nunca aprendeu a construir a resposta do zero raramente saberá quando ela contém uma alucinação sutil.")
    ]

    y_eff = 795
    for title, desc in effects:
        draw.ellipse([110, y_eff + 6, 122, y_eff + 18], fill=ACCENT_AMBER)
        draw.text((135, y_eff), title, font=get_font(20, bold=True), fill=TEXT_WHITE)
        y_eff = draw_wrapped_text(draw, desc, (135, y_eff + 32), 790, get_font(19, bold=False), fill=TEXT_SLATE, line_spacing=1.2) + 20

    return img

# ── SLIDE 6: EM PAGAMENTOS O ERRO CUSTA MILHÕES ────────────────────────────────
def generate_slide_6():
    img, draw = create_base_canvas(6, 9, "A Indústria")

    draw.text((70, 150), "EM MEIOS DE PAGAMENTO", font=get_font(18, bold=True), fill=ACCENT_RED)
    draw.text((70, 185), "Aqui, a Teoria Vira\nPrejuízo Imediato", font=get_font(50, bold=True), fill=TEXT_WHITE, spacing=10)

    draw.text((70, 315), "Em pagamentos, um parecer equivocado não é apenas um slide errado. Vira código em produção e multas pesadas:", font=get_font(20, bold=False), fill=TEXT_SLATE)

    traps = [
        ("CONFUNDIR AUTORIZAÇÃO COM CLEARING", "Achar que um campo de token ou split pode ser enviado apenas no lote diário, causando recusas massivas online na ponta (DE 39 = 05)."),
        ("INTERPRETAR ERRADO PRAZOS DE CHAVES CAPK", "A prorrogação da chave de 1.984 bits exige carga no TMS dos terminais. Sem isso, compras com chip são recusadas presencialmente."),
        ("OMITIR SUBFLUXOS DE COMPLIANCE & 3DS", "Perder critérios mandatórios de elegibilidade para autenticação sem atrito, perdendo o Liability Shift contra fraudes."),
        ("FALSO DIAGNÓSTICO DE 'NÃO-IMPACTO'", "A IA conclui superficialmente que o boletim não afeta o adquirente, gerando multas de Non-Compliance de até centenas de milhares de dólares.")
    ]

    y_trap = 375
    for title, desc in traps:
        draw_card(draw, [70, y_trap, WIDTH - 70, y_trap + 155], bg="#111827", border="#1E293B", radius=16)
        draw.rounded_rectangle([95, y_trap + 18, 125, y_trap + 48], radius=6, fill="#3B1219")
        draw.text((103, y_trap + 22), "✕", font=get_font(18, bold=True), fill=ACCENT_RED)

        draw.text((140, y_trap + 20), title, font=get_font(20, bold=True), fill="#F87171")
        draw_wrapped_text(draw, desc, (140, y_trap + 55), 840, get_font(18, bold=False), fill=TEXT_SLATE, line_spacing=1.2)
        y_trap += 175

    # Bottom Alert
    draw_card(draw, [70, 1090, WIDTH - 70, 1170], bg="#1B1214", border=ACCENT_RED, radius=14)
    draw.text((105, 1115), "🚨 Erros de bandeira aparecem meses depois em faturas de penalidade e perdas de receita.", font=get_font(19, bold=True), fill="#FCA5A5")

    return img

# ── SLIDE 7: ALAVANCA VS MULETA ────────────────────────────────────────────────
def generate_slide_7():
    img, draw = create_base_canvas(7, 9, "A Decisão")

    draw.text((70, 150), "O DIVISOR DE ÁGUAS", font=get_font(18, bold=True), fill=ACCENT_BLUE)
    draw.text((70, 185), "Alavanca Técnica ou\nMuleta Cognitiva?", font=get_font(50, bold=True), fill=TEXT_WHITE, spacing=10)

    draw.text((70, 315), "Não se trata de reduzir o uso da IA. Trata-se da postura diante dela:", font=get_font(21, bold=False), fill=TEXT_SLATE)

    # Box 1: POTENCIALIZAR (Verde)
    draw_card(draw, [70, 365, WIDTH - 70, 710], bg="#0B1C1A", border=ACCENT_GREEN, radius=20, border_width=2)
    draw.rounded_rectangle([100, 390, 420, 430], radius=8, fill="#064E3B")
    draw.text((115, 398), "✅ POTENCIALIZAR CONHECIMENTO", font=get_font(16, bold=True), fill="#A7F3D0")
    
    draw.text((100, 450), "O profissional domina a arquitetura e usa a IA como alavanca:", font=get_font(21, bold=True), fill=TEXT_WHITE)
    points_pot = [
        "Usa a IA como uma estagiária ultraveloz para acelerar pesquisas.",
        "Confronta cada síntese diretamente com o manual e a ISO 8583.",
        "Percebe na hora quando o modelo alucinou ou omitiu uma exceção.",
        "Economiza horas mantendo o controle total da decisão técnica."
    ]
    y_p = 495
    for pt in points_pot:
        draw.ellipse([105, y_p + 7, 117, y_p + 19], fill=ACCENT_GREEN)
        draw.text((130, y_p), pt, font=get_font(19, bold=False), fill="#D1FAE5")
        y_p += 45

    # Box 2: SUBSTITUIR (Vermelho)
    draw_card(draw, [70, 740, WIDTH - 70, 1085], bg="#1C1014", border=ACCENT_RED, radius=20, border_width=2)
    draw.rounded_rectangle([100, 765, 390, 805], radius=8, fill="#7F1D1D")
    draw.text((115, 773), "❌ SUBSTITUIR CONHECIMENTO", font=get_font(16, bold=True), fill="#FECACA")
    
    draw.text((100, 825), "O profissional terceiriza o pensar e opera no escuro:", font=get_font(21, bold=True), fill=TEXT_WHITE)
    points_sub = [
        "Aceita a resposta como verdade irrefutável porque não sabe duvidar.",
        "Não possui base para julgar a qualidade ou o risco do parecer.",
        "Cria uma falsa sensação de segurança para a diretoria.",
        "Torna-se refém da ferramenta para qualquer pergunta não mapeada."
    ]
    y_s = 870
    for pt in points_sub:
        draw.ellipse([105, y_s + 7, 117, y_s + 19], fill=ACCENT_RED)
        draw.text((130, y_s), pt, font=get_font(19, bold=False), fill="#FFE4E6")
        y_s += 45

    return img

# ── SLIDE 8: GOVERNANÇA DE CONHECIMENTO ────────────────────────────────────────
def generate_slide_8():
    img, draw = create_base_canvas(8, 9, "Governança")

    draw.text((70, 150), "O PAPEL DAS EMPRESAS", font=get_font(18, bold=True), fill=ACCENT_GREEN)
    draw.text((70, 185), "5 Perguntas que Toda\nLiderança Deve Fazer", font=get_font(50, bold=True), fill=TEXT_WHITE, spacing=10)

    draw.text((70, 315), "A pergunta não é apenas 'quanto vamos economizar com IA?'. É sobre governança:", font=get_font(21, bold=False), fill=TEXT_SLATE)

    questions_gov = [
        ("1", "Quem está validando o que a IA produz?", "Essa pessoa realmente domina o negócio e as normas ou apenas domina a ferramenta de prompt?"),
        ("2", "Se retirarmos a IA hoje, quanto conhecimento sobra?", "Quanto do know-how operacional reside realmente na organização e quanto desaparece ao fechar o navegador?"),
        ("3", "Quais análises exigem validação humana obrigatória?", "A diretoria sabe quais pareceres podem ser autônomos e quais exigem assinatura técnica responsável?"),
        ("4", "Como estamos formando a nova geração de especialistas?", "Como garantir que profissionais novos continuem desenvolvendo profundidade técnica mesmo com atalhos?"),
        ("5", "Qual o limite de risco aceitável?", "Até que ponto a empresa está disposta a colocar sua operação e compliance nas mãos de respostas sem curadoria?")
    ]

    y_gov = 370
    for num, q, d in questions_gov:
        draw_card(draw, [70, y_gov, WIDTH - 70, y_gov + 125], bg="#111827", border="#1E293B", radius=16)
        
        draw.ellipse([95, y_gov + 25, 150, y_gov + 80], fill="#064E3B", outline=ACCENT_GREEN, width=2)
        draw.text((115, y_gov + 35), num, font=get_font(26, bold=True), fill="#A7F3D0")

        draw.text((170, y_gov + 22), q, font=get_font(21, bold=True), fill=TEXT_WHITE)
        draw_wrapped_text(draw, d, (170, y_gov + 58), 810, get_font(18, bold=False), fill=TEXT_MUTED, line_spacing=1.2)

        y_gov += 145

    # Bottom Banner
    draw_card(draw, [70, 1110, WIDTH - 70, 1175], bg="#102A1E", border=ACCENT_GREEN, radius=14)
    draw.text((105, 1130), "📋 Curadoria especializada continua sendo a maior blindagem de uma operação.", font=get_font(19, bold=True), fill="#A7F3D0")

    return img

# ── SLIDE 9: CONCLUSÃO & CTA ──────────────────────────────────────────────────
def generate_slide_9():
    img, draw = create_base_canvas(9, 9, "Conclusão")

    draw.text((70, 150), "O FUTURO DO TRABALHO", font=get_font(18, bold=True), fill=ACCENT_BLUE)
    draw.text((70, 185), "O Verdadeiro Diferencial", font=get_font(52, bold=True), fill=TEXT_WHITE)

    # Big Quote Highlight Box
    draw_card(draw, [70, 270, WIDTH - 70, 620], bg="#111C35", border=ACCENT_ROYAL, radius=24, border_width=3)
    
    quote_text = (
        "“O diferencial do futuro NÃO pertencerá a quem sabe perguntar melhor para uma IA.\n\n"
        "Pertencerá a quem tem conhecimento suficiente para saber quando a resposta dela NÃO É BOA O BASTANTE.”"
    )
    draw_wrapped_text(draw, quote_text, (110, 315), 840, get_font(33, bold=True), fill=TEXT_WHITE, line_spacing=1.35)

    # Question for Comments Box
    draw_card(draw, [70, 655, WIDTH - 70, 930], bg="#0F172A", border="#334155", radius=20)
    draw.text((110, 690), "💬 COMO VOCÊ VÊ ESSA TRANSIÇÃO NO SEU DIA A DIA?", font=get_font(20, bold=True), fill=ACCENT_AMBER)
    
    draw_wrapped_text(
        draw,
        "A IA está acelerando a formação dos profissionais ou criando uma dependência perigosa antes que eles consigam caminhar sozinhos?\n\n"
        "E dentro da sua organização: quem está fazendo a curadoria técnica da IA?",
        (110, 735),
        840,
        get_font(23, bold=False),
        fill=TEXT_SLATE,
        line_spacing=1.35
    )

    # Action buttons representation
    draw_card(draw, [70, 960, WIDTH - 70, 1140], bg="#1E1B4B", border=ACCENT_PURPLE, radius=20)
    draw.text((110, 990), "PARTICIPE DA DISCUSSÃO:", font=get_font(18, bold=True), fill="#C084FC")
    
    draw.text((110, 1030), "💬  Deixe sua visão sincera nos comentários", font=get_font(22, bold=True), fill=TEXT_WHITE)
    draw.text((110, 1070), "🔄  Compartilhe com líderes e engenheiros de pagamentos", font=get_font(22, bold=True), fill=TEXT_WHITE)

    return img

def main():
    print("Gerando slides do carrossel LinkedIn...")
    slides = [
        generate_slide_1(),
        generate_slide_2(),
        generate_slide_3(),
        generate_slide_4(),
        generate_slide_5(),
        generate_slide_6(),
        generate_slide_7(),
        generate_slide_8(),
        generate_slide_9(),
    ]

    png_paths = []
    for i, slide in enumerate(slides, start=1):
        path = os.path.join(OUTPUT_DIR, f"slide_{i:02d}.png")
        slide.save(path, quality=95)
        png_paths.append(path)
        print(f"Slide {i} salvo: {path}")

    # Save as high-res multi-page PDF
    print("Compilando PDF do carrossel...")
    slides[0].save(
        PDF_OUTPUT_PATH,
        "PDF",
        resolution=100.0,
        save_all=True,
        append_images=slides[1:]
    )
    print(f"PDF salvo em: {PDF_OUTPUT_PATH}")

    # Also save in project root for easy access
    slides[0].save(
        ROOT_PDF_PATH,
        "PDF",
        resolution=100.0,
        save_all=True,
        append_images=slides[1:]
    )
    print(f"PDF raiz salvo em: {ROOT_PDF_PATH}")
    print("Concluído com sucesso!")

if __name__ == "__main__":
    main()
