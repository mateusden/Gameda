import type { Metadata } from "next";
import LegalPage from "@/components/legal/legal-page";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade | Gameda",
  description: "Como o Gameda trata seus dados pessoais.",
};

export default function PrivacidadePage() {
  return (
    <LegalPage
      title="Política de Privacidade do Gameda"
      updated={LEGAL.data}
      intro={
        <p>
          Esta Política explica como o Gameda ({LEGAL.site}) trata seus dados pessoais, de acordo
          com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).
        </p>
      }
      sections={[
        {
          title: "Quem é o controlador dos dados",
          content: (
            <p>
              {LEGAL.nome}, pessoa física, contato: {LEGAL.email}. É para esse endereço que você
              pode enviar pedidos sobre seus dados.
            </p>
          ),
        },
        {
          title: "Idade mínima",
          content: (
            <p>
              O Gameda é destinado a pessoas com <strong>16 anos ou mais</strong>. Pedimos sua data
              de nascimento no cadastro apenas para verificar essa condição e{" "}
              <strong>não usamos essa informação para publicidade ou personalização</strong>. Não
              coletamos intencionalmente dados de menores de 16 anos. Se identificarmos uma conta
              nessa situação, ela será excluída.
            </p>
          ),
        },
        {
          title: "Quais dados tratamos",
          content: (
            <>
              <p>
                <strong>Dados que você nos fornece</strong>
              </p>
              <ul>
                <li>
                  Cadastro: e-mail, senha (armazenada de forma protegida, nunca em texto aberto),
                  nome de usuário (@), nome de exibição e data de nascimento.
                </li>
                <li>
                  Login com Google: nome, e-mail e foto do seu perfil Google, quando você escolhe
                  essa opção.
                </li>
                <li>Perfil: bio e foto (opcionais) e suas configurações de privacidade.</li>
                <li>
                  Uso: jogos da sua biblioteca, status, plataformas, sessões (data, duração,
                  comentário), resenhas e notas, curtidas, comentários, quem você segue e quem
                  segue você.
                </li>
                <li>Pedidos de inclusão de jogos que você enviar.</li>
              </ul>
              <p>
                <strong>Dados gerados pelo uso</strong>
              </p>
              <ul>
                <li>
                  Notificações sobre interações com você (seguidores, curtidas, comentários).
                </li>
                <li>
                  Dados técnicos de funcionamento e segurança, como endereço IP e registros de
                  acesso mantidos pelos nossos provedores de infraestrutura.
                </li>
              </ul>
              <p>
                <strong>Cookies:</strong> usamos apenas cookies <strong>estritamente necessários</strong>{" "}
                para manter você conectado. Não usamos cookies de publicidade ou rastreamento nesta
                versão.
              </p>
            </>
          ),
        },
        {
          title: "Para que usamos seus dados e em que base legal",
          content: (
            <>
              <ul>
                <li>
                  <strong>Criar e manter sua conta; mostrar sua biblioteca, sessões, resenhas e
                  interações conforme suas configurações; enviar notificações dentro do
                  site:</strong>{" "}
                  execução do contrato (Termos de Uso).
                </li>
                <li>
                  <strong>Segurança, prevenção a fraudes e abuso, moderação:</strong> legítimo
                  interesse e cumprimento de obrigação legal.
                </li>
                <li>
                  <strong>Verificar idade mínima:</strong> cumprimento de obrigação legal e
                  legítimo interesse.
                </li>
                <li>
                  <strong>Responder a pedidos seus e cumprir ordens legais:</strong> obrigação
                  legal e exercício regular de direitos.
                </li>
              </ul>
              <p>Não vendemos seus dados pessoais.</p>
            </>
          ),
        },
        {
          title: "Com quem compartilhamos",
          content: (
            <ul>
              <li>
                <strong>Outros usuários e visitantes:</strong> o que você torna público no seu
                perfil (nome de usuário, nome, foto, bio e, conforme suas configurações,
                biblioteca, sessões e resenhas). Quem você segue e quem segue você é visível.
                Perfis privados mostram apenas o mínimo (nome de usuário, nome, foto e bio).
              </li>
              <li>
                <strong>Provedores que nos ajudam a operar o serviço:</strong> Supabase (banco de
                dados, autenticação e armazenamento de fotos), com servidores em{" "}
                {LEGAL.regiaoServidor}; {LEGAL.hospedagem} (hospedagem do site); e Google (apenas
                se você escolher entrar com Google).
              </li>
              <li>
                <strong>IGDB.com (Twitch/Amazon):</strong> usamos a API do IGDB para obter
                informações e capas dos jogos. Nossas consultas ao IGDB são feitas pelos nossos
                servidores. Seu navegador também carrega as imagens de capa diretamente do IGDB, o
                que pode expor seu endereço IP a eles.
              </li>
              <li>
                <strong>Autoridades,</strong> quando houver obrigação legal ou ordem válida.
              </li>
            </ul>
          ),
        },
        {
          title: "Transferência internacional",
          content: (
            <p>
              Alguns provedores acima podem armazenar ou processar dados fora do Brasil. Nesses
              casos, adotamos as salvaguardas previstas na LGPD, como contratos com cláusulas de
              proteção de dados.
            </p>
          ),
        },
        {
          title: "Por quanto tempo guardamos",
          content: (
            <p>
              Mantemos seus dados enquanto sua conta existir. Se você excluir a conta, apagamos ou
              anonimizamos seus dados pessoais, exceto o que formos obrigados a guardar por lei ou
              para defesa de direitos, e cópias de segurança, que são removidas em ciclo regular
              ({LEGAL.prazoBackup}). Enquanto a exclusão pela própria conta não estiver disponível
              no site, você pode pedi-la por e-mail.
            </p>
          ),
        },
        {
          title: "Seus direitos",
          content: (
            <>
              <p>Você pode, a qualquer momento, pedir:</p>
              <ul>
                <li>confirmação de que tratamos seus dados e acesso a eles;</li>
                <li>correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>
                  anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em
                  desconformidade;
                </li>
                <li>portabilidade dos seus dados;</li>
                <li>eliminação dos dados tratados com consentimento;</li>
                <li>informação sobre com quem compartilhamos seus dados;</li>
                <li>revogação do consentimento, quando essa for a base legal;</li>
                <li>revisão de decisões automatizadas, se existirem.</li>
              </ul>
              <p>
                Muitos ajustes você faz diretamente no site (editar perfil e privacidade). Para os
                demais, escreva para {LEGAL.email}; responderemos em até {LEGAL.prazoResposta}.
                Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
              </p>
            </>
          ),
        },
        {
          title: "Segurança",
          content: (
            <p>
              Usamos medidas técnicas e organizacionais razoáveis, como conexão criptografada
              (HTTPS), controle de acesso por conta no banco de dados e senhas protegidas. Nenhum
              sistema é totalmente seguro; em caso de incidente que envolva risco relevante,
              comunicaremos você e a ANPD conforme a lei.
            </p>
          ),
        },
        {
          title: "Publicidade, pagamentos e analytics (futuro)",
          content: (
            <p>
              Hoje não exibimos anúncios, não processamos pagamentos e não usamos ferramentas de
              análise de visitantes. Se isso mudar, atualizaremos esta Política antes, explicando
              quais dados serão usados, por quem e como você pode controlar.{" "}
              <strong>
                Não usaremos a data de nascimento nem dados de verificação de idade para anúncios.
              </strong>
            </p>
          ),
        },
        {
          title: "Mudanças nesta Política",
          content: (
            <p>
              Podemos atualizar esta Política. Avisaremos pelo site ou por e-mail em caso de
              mudança relevante. A data no topo indica a versão atual.
            </p>
          ),
        },
        {
          title: "Contato",
          content: <p>Dúvidas e pedidos sobre seus dados: {LEGAL.email}.</p>,
        },
      ]}
    />
  );
}