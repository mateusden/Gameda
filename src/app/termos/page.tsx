import type { Metadata } from "next";
import LegalPage from "@/components/legal/legal-page";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Termos de Uso | Gameda",
  description: "Regras para usar o Gameda.",
};

export default function TermosPage() {
  return (
    <LegalPage
      title="Termos de Uso do Gameda"
      updated={LEGAL.data}
      intro={
        <p>
          Bem-vindo ao Gameda. Estes Termos explicam as regras para usar o site{" "}
          {LEGAL.site} (“Gameda”). Ao criar uma conta ou usar o Gameda, você
          concorda com eles. Se não concordar, por favor não use o serviço.
        </p>
      }
      sections={[
        {
          title: "Quem somos",
          content: (
            <p>
              O Gameda é operado por {LEGAL.nome}, pessoa física, com contato
              pelo e-mail {LEGAL.email} (“nós”).
            </p>
          ),
        },
        {
          title: "O que é o Gameda",
          content: (
            <p>
              O Gameda é uma plataforma social para jogadores de videogame. Você
              pode organizar sua biblioteca de jogos, registrar sessões de jogo,
              escrever resenhas, seguir outras pessoas, curtir e comentar.
            </p>
          ),
        },
        {
          title: "Quem pode usar (idade mínima)",
          content: (
            <>
              <p>
                Para criar uma conta, você precisa ter{" "}
                <strong>pelo menos 16 anos</strong>. Ao se cadastrar, você
                declara ter essa idade e informa sua data de nascimento.
              </p>
              <p>
                Se descobrirmos que uma conta pertence a alguém abaixo dessa
                idade, podemos suspendê-la ou excluí-la. Se você sabe de uma
                conta nessa situação, avise-nos em {LEGAL.email}.
              </p>
            </>
          ),
        },
        {
          title: "Sua conta",
          content: (
            <ul>
              <li>
                Você é responsável pelas informações da sua conta e por manter
                sua senha em segurança.
              </li>
              <li>
                O nome de usuário (@) deve ser seu e não pode se passar por
                outra pessoa, marca ou organização.
              </li>
              <li>
                Use apenas uma conta por pessoa. Avise-nos se achar que alguém
                acessou sua conta sem permissão.
              </li>
              <li>
                Você pode editar seus dados e pedir a exclusão da conta a
                qualquer momento (veja a Política de Privacidade).
              </li>
            </ul>
          ),
        },
        {
          title: "Seu conteúdo",
          content: (
            <>
              <p>
                Chamamos de “conteúdo” o que você publica: perfil, foto, bio,
                biblioteca, sessões, comentários das sessões, resenhas, notas,
                comentários e curtidas.
              </p>
              <ul>
                <li>
                  <strong>O conteúdo é seu.</strong> Não reivindicamos a
                  propriedade dele.
                </li>
                <li>
                  Para o Gameda funcionar, você nos dá permissão gratuita e não
                  exclusiva de armazenar, exibir e distribuir seu conteúdo
                  dentro do serviço, conforme suas configurações de privacidade.
                  Essa permissão termina quando você apaga o conteúdo ou a
                  conta, exceto cópias técnicas temporárias (como backups)
                  mantidas por prazo limitado.
                </li>
                <li>
                  Você é responsável pelo que publica e declara ter o direito de
                  publicá-lo.
                </li>
                <li>
                  Resenhas e comentários expressam a opinião de cada pessoa, não
                  a nossa.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Privacidade do seu perfil",
          content: (
            <p>
              Você controla quem vê sua biblioteca, sessões e resenhas nas
              configurações do perfil. Perfis privados não podem ser seguidos.
              Conteúdo que você tornar público pode ser visto por qualquer
              pessoa, inclusive sem conta, e copiado por terceiros fora do nosso
              controle.
            </p>
          ),
        },
        {
          title: "O que você não pode fazer",
          content: (
            <>
              <p>Não é permitido:</p>
              <ul>
                <li>
                  publicar conteúdo ilegal, que incite violência ou ódio,
                  discrimine, ameace, assedie ou intimide;
                </li>
                <li>
                  publicar conteúdo sexual envolvendo menores de idade ou
                  qualquer conteúdo que os explore;
                </li>
                <li>
                  divulgar dados pessoais de outras pessoas sem permissão;
                </li>
                <li>
                  fazer spam, golpes, propaganda não autorizada ou criar contas
                  falsas ou em massa;
                </li>
                <li>
                  publicar conteúdo que viole direitos autorais ou outros
                  direitos de terceiros;
                </li>
                <li>
                  tentar acessar contas, sistemas ou dados que não são seus,
                  burlar regras de privacidade, sobrecarregar o serviço, ou usar
                  robôs ou raspagem automática sem nossa autorização por
                  escrito;
                </li>
                <li>
                  falsificar horas, avaliações ou interações com o objetivo de
                  enganar outras pessoas.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Moderação, denúncias e remoção de conteúdo",
          content: (
            <>
              <p>
                Podemos remover conteúdo, limitar funções ou suspender e excluir
                contas que violem estes Termos ou a lei, com ou sem aviso prévio
                quando houver risco para outras pessoas. Quando possível,
                explicaremos o motivo e você poderá contestar escrevendo para{" "}
                {LEGAL.email}.
              </p>
              <p>
                Para denunciar conteúdo ou contas, use o botão “Denunciar”
                (ícone de bandeira) ou escreva para {LEGAL.email}. Se você
                acredita que do direito e seus dados de contato.
              </p>
            </>
          ),
        },
        {
          title: "Dados de jogos e marcas",
          content: (
            <p>
              As informações sobre jogos (nomes, capas, descrições, plataformas,
              datas) vêm em grande parte do{" "}
              <a
                href="https://www.igdb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#66836A] hover:text-[#263A30]"
              >
                IGDB.com
              </a>{" "}
              e pertencem aos seus respectivos titulares. Nomes de jogos, marcas
              e imagens pertencem às suas empresas e são usados aqui só para
              identificar os jogos. O Gameda não é afiliado a nenhuma delas.
            </p>
          ),
        },
        {
          title: "Serviço “como está”",
          content: (
            <>
              <p>
                Fazemos o possível para manter o Gameda funcionando e seguro,
                mas é um projeto independente. O serviço é oferecido{" "}
                <strong>no estado em que se encontra</strong>, sem garantia de
                disponibilidade contínua, ausência de erros ou preservação
                permanente de dados. Podemos alterar, suspender ou encerrar
                funcionalidades, avisando quando for razoável. Recomendamos que
                você guarde uma cópia do que for importante para você.
              </p>
              <p>
                Na máxima extensão permitida pela lei, não nos responsabilizamos
                por danos indiretos decorrentes do uso do serviço ou de conteúdo
                publicado por terceiros. Isso não afasta direitos que a lei
                garante a você, como consumidor ou titular de dados.
              </p>
            </>
          ),
        },
        {
          title: "Funcionalidades pagas e anúncios (futuro)",
          content: (
            <p>
              Hoje o Gameda é gratuito. No futuro poderemos oferecer doações
              voluntárias, planos opcionais e exibir anúncios discretos em
              páginas públicas. As funções essenciais (biblioteca, sessões,
              resenhas e perfil) continuarão gratuitas. Antes de qualquer
              cobrança ou anúncio, atualizaremos estes Termos e a Política de
              Privacidade e avisaremos você.
            </p>
          ),
        },
        {
          title: "Mudanças nestes Termos",
          content: (
            <p>
              Podemos atualizar estes Termos. Avisaremos pelo site ou por e-mail
              em caso de mudanças relevantes. Continuar usando o Gameda depois
              da mudança significa que você aceita a nova versão; se não
              aceitar, pode encerrar sua conta.
            </p>
          ),
        },
        {
          title: "Lei aplicável e contato",
          content: (
            <>
              <p>
                Estes Termos seguem as leis do Brasil. Eventuais disputas
                poderão ser resolvidas no foro do seu domicílio, quando a lei
                assim garantir, ou no foro da comarca de {LEGAL.cidade} nos
                demais casos.
              </p>
              <p>Dúvidas, pedidos e denúncias: {LEGAL.email}.</p>
            </>
          ),
        },
      ]}
    />
  );
}
