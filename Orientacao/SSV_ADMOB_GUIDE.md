# AdMob Server‑Side Verification (SSV) — Guia Prático

Objetivo: creditar +1 consulta ao `GuruAI` somente quando o AdMob confirmar (server‑side) que o usuário realmente completou o anúncio premiado. Não exige que o usuário faça login.

Arquivos gerados neste diretório:
- `functions_admob_ssv_example.js` — exemplo de Cloud Function (Node.js) que processa o postback do AdMob e credita o usuário no Firestore.
- `CAPACITOR_SSV_ANDROID.md` — snippet Kotlin para Android (Capacitor) que define `ServerSideVerificationOptions` e exibe o `RewardedAd`.

Resumo do fluxo
1. App gera/obtém um `userId` que será enviado ao AdMob quando iniciar o anúncio (p.ex. Advertising ID ou um installId estável).
2. Antes de mostrar o `RewardedAd`, o app configura `ServerSideVerificationOptions` com `userId` (e opcional `customData`).
3. Usuário assiste o anúncio. AdMob envia um postback (HTTP) para o endpoint que você configurou.
4. Sua Cloud Function valida o payload (opcional) e credita +1 ao `userId` no banco (Firestore).
5. O app consulta seu endpoint / Firestore para receber o novo saldo e atualiza a UI.

=== Prérequisitos ===
- Conta AdMob com app cadastrado e blocos de anúncios configurados.
- Projeto Firebase (Firestore) e Firebase Functions ativados (ou outro backend com endpoint público).
- Projeto Android/iOS Capacitor com capacidade de adicionar código nativo (plugin ou edição nativa).

=== 1) Cloud Function (exemplo) ===
Arquivo de exemplo: `functions_admob_ssv_example.js` (ver arquivo gerado).
Principais pontos:
- Recebe POSTs do AdMob contendo `userId`/`customData` e dados da recompensa.
- Opcionalmente valida um segredo que você incluiu em `customData` para reduzir fraudes.
- Usa Firestore (coleção `ai_credits`) para incrementar `remaining` do `userId`.

Testes locais:
- Você pode testar chamando o endpoint manualmente com curl/postman simulando o payload do AdMob.
- Após deploy, configure o URL no console AdMob (SSV) ou use a ferramenta de testes do AdMob quando disponível.

Segurança/validação:
- Recomendo incluir um `secret` no `customData` antes de exibir o anúncio e validar o mesmo no postback.
- Use HTTPS e firewalls/Cloud Functions com verificação de origem, se possível.

=== 2) Android / Capacitor (snippet) ===
Veja `CAPACITOR_SSV_ANDROID.md` para o código Kotlin para configurar `ServerSideVerificationOptions` e mostrar o anúncio.
Resumo:
- Adicione `ServerSideVerificationOptions.newBuilder().setUserId(userId).setCustomData(customData).build()` ao `RewardedAd`.
- No callback `onUserEarnedReward`, o AdMob normalmente já fez o postback; seu backend receberá a notificação. O cliente pode então chamar seu backend para atualizar saldo (ou apenas chamar `loadUsageFromServer()` que consultará Firestore).

=== 3) Configurar SSV no console AdMob ===
1. No AdMob Console → Apps → selecione sua app → Bloco de anúncios (Rewarded) → Configurações.
2. Procure por "Server‑side verification" ou "Postback". Configure o endpoint HTTPS público (Cloud Function URL ou outro endpoint).
3. Na configuração você geralmente indica quais parâmetros (userId, customData) enviar; a forma exata depende do SDK. Em geral, o SDK envia `userId` e `customData` que você setou no cliente.
4. Salve e aguarde propagação.

=== 4) Deploy Cloud Function (rápido) ===
- Instale Firebase CLI e faça login:
```bash
npm install -g firebase-tools
firebase login
firebase init functions firestore
```
- Copie `functions_admob_ssv_example.js` para `functions/index.js` (ou adicione ao projeto functions existente).
- Deploy:
```bash
cd functions
npm install
firebase deploy --only functions
```
- Copie a URL gerada e configure no AdMob SSV.

=== 5) Como integrar no app (alto nível) ===
- Antes de exibir RewardedAd, gere `userId`:
  - Opção 1 (recomendado sem login): Advertising ID (requer plugin nativo e permissão; pode ser resetado pelo usuário).
  - Opção 2: installId + verificação (menos robusto) — já usado no app como fallback.
- Ao criar o anúncio, associe `userId` e `customData` (ex.: `{ secret: 'SOME_SECRET', tx: 'tx-123' }`).
- Após o usuário completar o anúncio, seu servidor receberá o postback e creditará.
- No cliente, chame `aiService.loadUsageFromServer()` ou seu endpoint para atualizar o saldo local.

=== 6) Testes e validação ===
- Em desenvolvimento use Test Ad Unit IDs do AdMob.
- Para validar a Cloud Function, faça POST manual ao endpoint com JSON similar ao que o AdMob enviaria; verifique se o Firestore é atualizado.

---

Se quiser, eu já:
- gero a Cloud Function completa (já será criada em `Orientacao/functions_admob_ssv_example.js`),
- crio `CAPACITOR_SSV_ANDROID.md` com o snippet Kotlin e instruções para adicionar a permissão/ plugin, e
- escrevo instruções passo-a-passo para configurar SSV no console AdMob.

Diga se quer que eu também implemente no código do app o plugin Capacitor de exemplo (criar `android/` mudanças) — isso requer compilar no Android Studio depois.