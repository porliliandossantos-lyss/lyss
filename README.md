# Lyss

IA autônoma de conteúdo pro TikTok — roteiro e respostas via Groq (grátis), voz via Piper (local, grátis).

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
autonomia total. `scripts/tiktok-login.js` abre um navegador de verdade pra você logar
manualmente (a Lyss nunca vê sua senha) e salva a sessão em `tiktok-session.json`
(nunca commitado). A partir daí, `src/tiktok/poster.js` reaproveita essa sessão pra postar —
ainda não implementado, é o próximo passo depois que o pipeline de conteúdo estiver validado.

Isso está fora dos Termos de Uso da TikTok (não existe alternativa oficial pra isso hoje) —
decisão já tomada e registrada: autonomia total em troca do risco de restrição de conta.

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
