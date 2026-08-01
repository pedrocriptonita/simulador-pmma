import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Simulador PM MA 2026 coleta, usa e protege seus dados pessoais, conforme a LGPD.",
};

/**
 * Política de privacidade (LGPD).
 *
 * Existe por duas razões: obrigação legal (coletamos e-mail e dados de
 * desempenho) e exigência do Meta Ads — anunciante sem política acessível
 * tem o anúncio reprovado.
 *
 * ⚠️ PREENCHER ANTES DE ANUNCIAR: o responsável pelo tratamento e o canal de
 * contato abaixo estão como placeholder. Sem um contato real, a política não
 * cumpre o art. 18 da LGPD (direitos do titular).
 */
const CONTROLADOR = "Barvox Digital";
const CONTATO_EMAIL = "barvoxdigitalbr@gmail.com"; // ← trocar pelo e-mail real
const ATUALIZADO_EM = "1º de agosto de 2026";

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold tracking-tight">{titulo}</h2>
      <div className="text-muted-foreground flex flex-col gap-2 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Política de Privacidade</h1>
        <p className="text-muted-foreground text-sm">Última atualização: {ATUALIZADO_EM}</p>
      </header>

      <Secao titulo="1. Quem trata seus dados">
        <p>
          O Simulador PM MA 2026 é operado por {CONTROLADOR}, responsável pelo tratamento dos dados
          pessoais descritos nesta política, nos termos da Lei nº 13.709/2018 (LGPD).
        </p>
        <p>
          Somos uma plataforma de estudos independente, sem qualquer vínculo com a Polícia Militar
          do Maranhão, o Governo do Estado do Maranhão ou a banca Cebraspe.
        </p>
      </Secao>

      <Secao titulo="2. Quais dados coletamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-foreground">Cadastro:</strong> nome e e-mail, informados por
            você ao criar a conta.
          </li>
          <li>
            <strong className="text-foreground">Uso da plataforma:</strong> simulados realizados,
            respostas, notas e desempenho por matéria — é o que permite gerar seu diagnóstico.
          </li>
          <li>
            <strong className="text-foreground">Pagamento:</strong> quando você adquire o acesso
            pago, o processamento é feito pelo provedor de checkout. Não recebemos nem armazenamos
            dados de cartão.
          </li>
          <li>
            <strong className="text-foreground">Dados técnicos:</strong> endereço IP, tipo de
            navegador e páginas visitadas, coletados por cookies e tecnologias similares.
          </li>
        </ul>
      </Secao>

      <Secao titulo="3. Para que usamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Criar e manter sua conta e liberar o acesso contratado.</li>
          <li>Corrigir simulados e montar seu painel de desempenho.</li>
          <li>Enviar comunicações sobre a plataforma e sobre o concurso.</li>
          <li>Medir e melhorar a eficiência da nossa divulgação.</li>
          <li>Cumprir obrigações legais.</li>
        </ul>
      </Secao>

      <Secao titulo="4. Compartilhamento com terceiros">
        <p>Não vendemos seus dados. Compartilhamos apenas o necessário com:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-foreground">Infraestrutura e autenticação</strong> — provedores
            que hospedam a aplicação e o banco de dados.
          </li>
          <li>
            <strong className="text-foreground">Processador de pagamento</strong> — recebe os dados
            necessários para concluir a compra.
          </li>
          <li>
            <strong className="text-foreground">Meta (Facebook e Instagram)</strong> — para medir
            resultados de anúncios, enviamos eventos como visita, cadastro e compra. Quando o
            e-mail é usado nessa medição, ele é transformado em código criptografado (hash) antes
            do envio: a Meta não recebe seu e-mail em texto legível.
          </li>
        </ul>
      </Secao>

      <Secao titulo="5. Cookies">
        <p>
          Usamos cookies necessários (para manter sua sessão ativa) e cookies de medição de
          publicidade, incluindo o pixel da Meta. Você pode bloquear cookies nas configurações do
          navegador — os cookies necessários, se bloqueados, impedem o login.
        </p>
      </Secao>

      <Secao titulo="6. Por quanto tempo guardamos">
        <p>
          Mantemos seus dados enquanto sua conta existir. Após a exclusão, podemos reter registros
          por prazo legal (por exemplo, dados fiscais de compras) e, encerrado esse prazo, os dados
          são eliminados ou anonimizados.
        </p>
      </Secao>

      <Secao titulo="7. Seus direitos">
        <p>
          A LGPD garante a você: confirmação da existência de tratamento, acesso aos dados,
          correção, anonimização ou exclusão, portabilidade, informação sobre compartilhamentos e
          revogação do consentimento.
        </p>
        <p>
          Para exercer qualquer um deles, escreva para{" "}
          <a href={`mailto:${CONTATO_EMAIL}`} className="text-foreground underline">
            {CONTATO_EMAIL}
          </a>
          . Respondemos em até 15 dias.
        </p>
      </Secao>

      <Secao titulo="8. Segurança">
        <p>
          Adotamos medidas técnicas para proteger seus dados, como criptografia em trânsito (HTTPS),
          senhas armazenadas de forma irreversível e isolamento de dados entre usuários. Nenhum
          sistema é 100% seguro, mas tratamos incidentes com prioridade e comunicamos os titulares
          quando houver risco relevante.
        </p>
      </Secao>

      <Secao titulo="9. Menores de idade">
        <p>
          A plataforma é destinada a candidatos de concurso público. Não coletamos intencionalmente
          dados de menores de 16 anos.
        </p>
      </Secao>

      <Secao titulo="10. Alterações">
        <p>
          Podemos atualizar esta política. Mudanças relevantes serão comunicadas por e-mail ou
          aviso na plataforma, e a data de atualização no topo desta página é sempre revisada.
        </p>
      </Secao>

      <footer className="border-t pt-6">
        <Link href="/" className="text-muted-foreground text-sm underline underline-offset-4">
          ← Voltar para a página inicial
        </Link>
      </footer>
    </main>
  );
}
