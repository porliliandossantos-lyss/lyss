# Lyss — Handoff (02/08/2026)

Documento de retomada — leia isto antes de continuar numa conversa nova, principalmente
a seção do TikTok, pra não repetir tentativas que já sabemos que não funcionam.

## O que está funcionando de verdade (testado, não só escrito)

- **Pipeline de conteúdo**: Groq (roteiro, ideias, resposta de comentário) + Piper (voz local,
  grátis, inglês) rodam de ponta a ponta. `npm run test:pipeline` gera tudo e salva áudio em
  `output/sample.wav`.
- **Painel local**: `npm start` sobe em `localhost:3300`, mesmo layout validado no mockup, com
  abas Painel / Conversa / Conteúdo / Contas / Comentários / Estratégia / Orçamento.
- **GitHub**: repositório em https://github.com/porliliandossantos-lyss/lyss, conectado via
  token fine-grained (permissão Contents: Read and write) já configurado no remote local.
- **Render**: `render.yaml` pronto (blueprint). Falta só a usuária criar a conta em render.com
  (e-mail separado) e conectar o GitHub — nunca foi feito ainda.
- **YouTube Shorts**: código pronto (`src/youtube/`) — upload de vídeo e leitura/resposta de
  comentários via API oficial do Google. **Não testado ainda** — falta a usuária criar um
  projeto no Google Cloud Console, ativar YouTube Data API v3, gerar Client ID/Secret, e rodar
  `npm run youtube:auth` (abre link de aprovação no navegador normal dela, sem automação).
- **Instagram Reels**: código pronto (`src/instagram/`) — postagem e comentários via Graph API
  da Meta. **Não testado ainda** — falta conta profissional do Instagram vinculada a uma Página
  do Facebook, app em developers.facebook.com, permissões `instagram_content_publish` e
  `instagram_manage_comments` aprovadas (passa por revisão da Meta).

## TikTok — bloqueios encontrados (não repetir estas tentativas)

Objetivo: reaproveitar uma sessão já logada manualmente, sem a Lyss nunca fazer login sozinha
(login automatizado é bloqueado de propósito pelo Google/TikTok — não tentamos contornar isso).

1. **Login via Google dentro de uma janela controlada por automação (Playwright) é sempre
   bloqueado** — mensagem do Google: "esse navegador pode não ser seguro". Aconteceu tanto com
   Chromium puro quanto com `channel: 'chrome'`. **Regra: nunca tentar logar dentro de uma
   janela que um script da Lyss abriu.** Se aparecer tela de login numa janela dessas, fechar e
   resolver no Chrome normal.
2. **TikTok também tem proteção anti-bot própria (WAF)** — em uma tentativa apareceram cookies
   de desafio (`_wafchallengeid` etc.) em vez do site normal.
3. **TikTok rate-limita tentativas de login repetidas** — depois de várias tentativas na mesma
   sessão, apareceu "Número máximo de tentativas atingido. Tente mais tarde." Isso passa sozinho
   depois de um tempo, mas evitar bater tentativa atrás de tentativa.
4. **Bug de caminho corrigido**: `chromium.launchPersistentContext` precisa do caminho RAIZ
   ("...\User Data") + `--profile-directory=Profile N`, não o caminho da pasta do perfil direto
   (isso fazia o Chrome criar um perfil novo e vazio dentro da pasta, por isso nunca reconhecia
   sessão nenhuma). Corrigido em `src/tiktok/browser.js` (commit `ade2d98`).
5. **Copiar o perfil pra uma pasta isolada NÃO FUNCIONA pro cookie de sessão** — testado depois
   da correção acima, com login manual confirmado no perfil original. O Chrome moderno
   criptografa cookies de um jeito amarrado ao local original do perfil, especificamente pra
   impedir esse tipo de cópia. `scripts/tiktok-setup-isolated-profile.js` existe mas está
   marcado como não-funcional no topo do arquivo — não vale tentar de novo sem mudar de
   abordagem.
6. **Usar o perfil real direto (não copiado) exige o Chrome inteiro fechado** — qualquer janela
   aberta, em qualquer perfil, trava o `User Data` raiz inteiro (não é por perfil, é a instalação
   toda). Isso é esperado, não é bug.
7. **Última tentativa (perfil real, Chrome supostamente fechado)**: o script reportou erro de
   lock mesmo depois de `tasklist` não mostrar `chrome.exe` — e mesmo assim uma janela abriu do
   lado da usuária mostrando a mensagem de segurança de novo. Isso ficou sem explicação —
   possível processo residual não capturado pelo `tasklist`, ou timing entre o fechamento e a
   checagem. **Não investigado a fundo ainda.**

### Estado da conta

- Perfil dedicado no Chrome: **Profile 6**, caminho em `TIKTOK_CHROME_PROFILE` no `.env`.
- Conta: `@godisstrengthh`, login via Google (conta "Pro Lilian",
  prolilian.cesa@gmail.com), confirmado como concluído manualmente no Chrome normal (não
  automatizado) na sessão de 02/08/2026.
- Apesar do login manual confirmado, a automação (`npm run tiktok:verify`) ainda não conseguiu
  reconhecer a sessão de forma confiável.

### Recomendação pra próxima sessão

Dado o tempo já gasto e os bloqueios em camadas (Google + TikTok WAF + rate limit + criptografia
de cookie), vale considerar:
- Investigar o erro de lock "fantasma" do item 7 antes de mais uma rodada de tentativas (ex:
  checar processos com outro nome, verificar handles abertos na pasta do perfil).
- Ou aceitar TikTok como canal manual/semi-automático (Lyss prepara vídeo + legenda, usuária
  posta e responde comentários manualmente) enquanto YouTube e Instagram — que não têm nenhum
  desses bloqueios, por serem API oficial — se tornam os canais realmente autônomos.

## Credenciais já configuradas (no `.env`, fora do git)

- `GROQ_API_KEY` — configurada e testada.
- `TIKTOK_CHROME_PROFILE` — apontando pro Profile 6 real.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `INSTAGRAM_*` — ainda vazias, dependem de contas
  que só a usuária pode criar (ver seções do YouTube e Instagram no README.md).
