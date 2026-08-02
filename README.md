# Lyss

IA autônoma de conteúdo pro TikTok, Instagram Reels e YouTube Shorts — roteiro e respostas
via Groq (grátis), voz via Piper (local, grátis).

## Setup

```bash
npm install
npm run setup:voice        # baixa o motor de voz Piper (~70MB, uma vez só)
cp .env.example .env       # depois edite .env e cole sua GROQ_API_KEY
```

Chave grátis da Groq: https://console.groq.com/keys

## Testar o pipeline de conteúdo (sem precisar do TikTok ainda)

```bash
npm run test:pipeline
```

Isso gera ideias de vídeo, um roteiro, o áudio narrado (`output/sample.wav`) e uma resposta
de comentário de exemplo — tudo de ponta a ponta, sem gastar nada.

## Painel local

```bash
npm start
```

Abre em http://localhost:3300 — mesmo painel validado no mockup, agora servido localmente.

## Publicar no TikTok (próxima etapa)

O TikTok não tem API oficial para postar/responder comentários em vídeos orgânicos com
autonomia total. A Lyss não faz login sozinha — o Google bloqueia login automatizado de
propósito, e não tentamos contornar isso. Em vez disso:

1. Crie um perfil dedicado no Chrome (separado dos seus outros) e faça login manual no
   TikTok nele, normalmente, como você já faz todo dia.
2. Descubra o caminho desse perfil em `chrome://version` ("Caminho do perfil") e coloque
   em `TIKTOK_CHROME_PROFILE` no `.env`.
3. Feche o Chrome inteiro (a pasta do perfil fica travada com ele aberto) e rode
   `npm run tiktok:verify` — confirma que a sessão está ativa, sem automatizar login algum.

A partir daí, `src/tiktok/poster.js` reaproveita esse mesmo perfil pra postar — ainda não
implementado, é o próximo passo depois que a verificação de sessão passar.

Isso está fora dos Termos de Uso da TikTok (não existe alternativa oficial pra isso hoje) —
decisão já tomada e registrada: autonomia total em troca do risco de restrição de conta.

## Publicar no YouTube Shorts

100% API oficial do Google — sem automação de navegador, sem risco de bloqueio. Cobre
postar vídeo **e** responder comentários.

1. Em [console.cloud.google.com](https://console.cloud.google.com), crie um projeto, ative
   a **"YouTube Data API v3"** e crie uma credencial **OAuth 2.0 → App de Desktop**.
2. Copie o **Client ID** e **Client Secret** pro `.env` (`GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`).
3. Rode `npm run youtube:auth` — ele te dá um link pra abrir no seu navegador normal.
   Você aprova o acesso ali (é você logando no Google, não a Lyss automatizando nada), e o
   token fica salvo em `youtube-token.json` (fora do git).
4. Pronto — `src/youtube/upload.js` posta Shorts, `src/youtube/comments.js` lê e responde
   comentários, ambos via API, sem esbarrar em detecção nenhuma.

## Publicar no Instagram Reels

Também API oficial (Meta Graph API), cobrindo postar **e** responder comentários, com
webhook em tempo real pra quando quisermos reagir na hora.

1. Sua conta do Instagram precisa ser **Profissional (Business ou Criador de conteúdo)** e
   estar vinculada a uma **Página do Facebook**.
2. Crie um app em [developers.facebook.com](https://developers.facebook.com), adicione o
   produto **Instagram Graph API**, e solicite as permissões `instagram_content_publish` e
   `instagram_manage_comments` (passa por revisão da Meta, similar à auditoria da TikTok).
3. Gere um token de acesso de longa duração e o ID da conta profissional — coloque em
   `INSTAGRAM_ACCESS_TOKEN` e `INSTAGRAM_BUSINESS_ACCOUNT_ID` no `.env`.
4. O Instagram busca o vídeo por URL pública (não aceita upload direto) — defina
   `INSTAGRAM_VIDEO_PUBLIC_BASE_URL` apontando pra onde os `.mp4` da Lyss ficam hospedados
   (ex: uma pasta pública servida pelo próprio deploy no Render).
5. `src/instagram/publish.js` posta o Reel, `src/instagram/comments.js` lê e responde
   comentários.

## Deploy no Render

O repositório já tem `render.yaml` pronto (Render detecta sozinho). Passos que só você
pode fazer (login/OAuth):

1. Crie a conta em [render.com](https://render.com) com o e-mail separado.
2. No painel, **New + → Blueprint**, conecte sua conta do GitHub (autoriza o app do Render)
   e selecione o repositório `lyss`.
3. Render vai ler o `render.yaml` sozinho e propor o serviço "lyss" (plano free).
4. Antes de confirmar, ele vai pedir a variável `GROQ_API_KEY` (fica marcada como secreta,
   não vem do repositório) — cole sua chave da Groq ali, direto no site do Render.
5. Deploy. A cada `git push`, o Render atualiza sozinho.

Hoje isso publica o painel + o pipeline de conteúdo. A automação de postar/responder no
TikTok ainda não está implementada (ver seção acima) — quando estiver, sobe pelo mesmo fluxo.
