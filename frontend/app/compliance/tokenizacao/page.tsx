import DafSimulator from "@/components/DafSimulator";
import TermTooltip from "@/components/TermTooltip";
import { ArrowRight, CheckCircle2, BookOpen, ShieldAlert, FileKey } from "lucide-react";
import Link from "next/link";
import RuleReference from "@/components/RuleReference";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Playbook: DAF & Tokenização | VS Payments",
  description: "Entenda o Digital Authentication Framework, isenção de 3DS via Apple Pay e simule as regras de Liability Shift na Tokenização Cloud.",
};

export default function TokenizacaoPage() {
  return (
    <div className="bg-background min-h-screen pb-20">
      {/* ── Header Narrativo ── */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/compliance"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft size={16} /> Voltar ao Hub
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Playbook: DAF & Tokenização
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
            Neste guia definitivo, ensinamos porquê o mercado está migrando da autorização de números de cartão estáticos
            para Criptogramas e como o <strong>Digital Authentication Framework</strong> da Visa pode zerar sua fraude
            (Liability Shift) <strong>sem exigir fluxo 3DS externo</strong> nos pagamentos.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Lado Esquerdo: O Conteúdo Narrativo */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* Seção Teórica Rica */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">O Fim do PAN em Claro</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
              <p>
                No e-commerce tradicional, um cartão é digitado e o lojista processa o <TermTooltip term="PAN" definition="Primary Account Number - O numero de 16 dígitos estampado no plástico do cartão." /> em claro. Sem o auxílio do <TermTooltip term="3DS (3-D Secure)" definition="Protocolo de segurança XML/JSON (EMVco) que permite ao Banco Emissor desafiar o usuário com um SMS, Token ou Biometria antes de autorizar a compra." />, qualquer tentativa de fraude gera um Chargeback cujo ônus (Liability) é inteiramente da conta do Adquirente e do Lojista.
              </p>
              <p>
                A <strong>Tokenização Cloud</strong> e o <strong>Apple Pay</strong> mudaram o jogo. Em vez de números expostos, o emissor gera um <em>Cryptogram</em> de uso único atrelado ao dispositivo (<TermTooltip term="DPAN" definition="Device PAN - Um token restrito geograficamente a um único dispostivo (celular ou smartwatch do Apple Pay / Google Pay)." />) ou a um Merchant Token Requestor. <RuleReference manual="PCI DSS v4.0" chapter="Requirement 3: Protect Stored Account Data" label="PCI: Req 3" />
              </p>
              
              <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl text-foreground text-sm my-6">
                <strong>O Pulo do Gato (Apple Pay):</strong> Como o Apple Pay/Google Pay usa <TermTooltip term="Device Biometrics" definition="O TouchID ou FaceID que prova para o celular que você é o portador." />, as bandeiras consideram que o cliente <strong>já está autenticado</strong>, garantindo <TermTooltip term="Liability Shift Total" definition="A responsabilidade por fraude amigável sai do Lojista e passa a ser do Emissor (Banco)." /> imediatamente, isentando a experiência lenta de se fazer um redirect para o banco 3D Secure. <RuleReference manual="EMVCo 3DS" chapter="Liability Shift Matrix" label="Liability Matrix" />
              </div>
            </div>
          </section>

          {/* Fluxograma Visual (Tailwind UI) */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">Fluxo Transacional de Liability</h2>
            
            <div className="p-6 bg-input border border-border rounded-2xl flex flex-col gap-8 md:flex-row md:items-center justify-between text-center mt-2">
               
               <div className="flex flex-col items-center gap-2">
                 <div className="w-14 h-14 bg-background border border-border rounded-xl flex border-dashed items-center justify-center">
                    <FileKey size={24} className="text-muted-foreground" />
                 </div>
                 <span className="text-xs font-semibold text-foreground">Token/Criptograma<br/>(TR/VTS)</span>
               </div>
               
               <ArrowRight className="hidden md:block text-muted-foreground opacity-50" />

               <div className="flex flex-col items-center gap-2">
                 <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-xl text-xs font-bold uppercase tracking-wider">
                    Filtro DAF da Rede
                 </div>
                 <span className="text-[10px] text-muted-foreground mt-1 text-center max-w-[120px]">A rede avalia se a origem foi Token ou PAN e injeta Flag TAF</span>
               </div>

               <ArrowRight className="hidden md:block text-muted-foreground opacity-50" />

               <div className="flex flex-col gap-1 items-center">
                 <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 border border-green-500/20 rounded-full text-xs font-bold">
                    <CheckCircle2 size={14} /> Liability do Emissor
                 </div>
                 <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 border border-red-500/20 rounded-full text-xs font-bold mt-1">
                    <ShieldAlert size={14} /> Liability Lojista
                 </div>
               </div>

            </div>
          </section>

          {/* O Simulador Interativo */}
          <section className="mt-8 pt-8 border-t border-border">
             <h2 className="text-2xl font-bold text-foreground mb-2">Simulador Prático</h2>
             <p className="text-sm text-muted-foreground mb-8">
               Selecione a origem do pagamento e o seu status de registro DAF. Veja se você ganha a isenção de risco (Liability Shift) e evita o descarte da compra pelo anti-fraude.
             </p>
             <div className="w-full">
               <DafSimulator />
             </div>
          </section>

        </div>

        {/* Lado Direito: Sidebars e Checklists */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-code-bg border border-border rounded-2xl p-6 shadow-sm sticky top-8">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Checklist VTS & DAF</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 flex-shrink-0" id="ck1" disabled checked />
                <label htmlFor="ck1" className="text-sm text-muted-foreground">Cadastrar-se como <TermTooltip term="Token Requestor (TR)" definition="Entidade permitida pela Visa/Master para solicitar e armazenar tokens (ex: Adquirente ou Carteira)." /> aprovado.</label>
              </li>
              <li className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 flex-shrink-0" id="ck2" disabled />
                <label htmlFor="ck2" className="text-sm text-muted-foreground">Obrigatoriedade de usar fluxo OTP ou desafio de Biometria na <strong>Primeira Trasanção (FTU)</strong> de pareamento Cloud.</label>
              </li>
              <li className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 flex-shrink-0" id="ck3" disabled />
                <label htmlFor="ck3" className="text-sm text-muted-foreground">Certificar que o adquirente passa os campos de Token (<TermTooltip term="TAF" definition="Token Authentication Flag - Bit na ISO provando que a VTS foi invocada" />) corretamente na mensageria. <RuleReference manual="ISO 8583-1:1987" chapter="MTIs (Message Type Indicators)" label="ISO: MTIs Data" /></label>
              </li>
              <li className="flex items-start gap-3">
                 <div className="w-full mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-lg text-xs leading-relaxed">
                   <strong>Retenção de TIDI:</strong> Para transações DAF em compras subsequentes de Cloud Tokens sem novo desafio, não esqueça de atrelar o Payment Indicator (TIDI) prévio à string de autorização.
                 </div>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
