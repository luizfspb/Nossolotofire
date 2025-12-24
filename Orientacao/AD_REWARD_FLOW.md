# Fluxo de Créditos por Anúncio (GuruAI)

Este documento descreve o que foi implementado no app, limitações e uma solução prática (simples e sem obrigar cadastro) para garantir que o usuário receba +1 crédito ao assistir um anúncio premiado — e, opcionalmente, como persistir isso entre reinstalações usando Server‑Side Verification (SSV) do AdMob.

## 1) O que já implementei (solução simples, cliente-side)

- Comportamento: o app dá **5 consultas grátis** por usuário (inicialmente). Quando o usuário assiste a um anúncio premiado, o app concede **+1 crédito**.
- Persistência: os créditos são gravados num armazenamento "simulado no servidor" dentro do próprio app (`localStorage`) indexado por um `installId` (valor gerado e guardado em `localStorage`).
  - Arquivo principal: `services/firebaseService.ts` (métodos: `grantAiCredit`, `getAiCredits`, `consumeAiCredit`).
  - Exibição do anúncio: `services/adService.ts` chama `firebaseService.grantAiCredit(1)` quando o anúncio termina.
  - Consumo: `services/aiService.ts` chama `firebaseService.consumeAiCredit()` ao gerar uma sugestão do GuruAI.

Vantagens:
- Simples, rápido de testar e funciona offline.
- Não exige cadastro nem servidor adicional.

Limitações importantes:
- Se o usuário **reinstalar o app** ou limpar os dados, o `localStorage` é perdido => o `installId` muda e os créditos não serão recuperados.
- É mais vulnerável a fraudes (um usuário malicioso pode simular a resposta do anúncio).

---

## 2) Solução recomendada (sem obrigar cadastro): AdMob Server‑Side Verification (SSV) + backend leve

Objetivo: permitir que o app credite o usuário apenas quando AdMob atestar (server) que a recompensa foi realmente entregue, e persistir esse crédito num banco no servidor (Firestore / Realtime DB). Sem exigir login do usuário, ainda é possível identificar o dispositivo usando um identificador estável (ver observações).

Resumo do fluxo:
1. App pede ao SDK do AdMob para carregar um `RewardedAd`.
2. Antes de exibir o anúncio, o app configura `ServerSideVerificationOptions` (SDK Android/iOS) com um `userId` (p.ex. Advertising ID) e `customData` (opcional: transaction id).
3. Quando o usuário completa o anúncio, AdMob envia um postback HTTP ao seu endpoint server-side (SSV callback), contendo o `userId` e os dados do pagamento.
4. Seu servidor valida a chamada (opcional: checar IPs/assinatura/segredo) e grava/crédita +1 para esse `userId` no banco (Firestore / supabase / outro).
5. O app consulta seu backend (ou o servidor pode enviar push) para atualizar o saldo do usuário.

Vantagens:
- Persiste créditos independentemente de reinstalação (se `userId` for estável, como Advertising ID — ver observações).
- Muito mais seguro contra fraudes comparado ao client‑only.

Observações sobre identificação sem cadastro:
- Você pode usar o Advertising ID (AAID/IDFA) como `userId`. Isso não exige cadastro, mas:
  - O Advertising ID pode ser resetado pelo usuário; não é 100% permanente, mas é mais estável que `localStorage`.
  - Para obter o Advertising ID em Capacitor você precisa de um plugin nativo (Android: Google Play services `AdvertisingIdClient`).
- Alternativa mais robusta: pedir um simples Login (Google/Email) e usar `uid` para indexar créditos.

Segurança / verificação:
- Preferível proteger o endpoint do SSV (ex.: aceitar apenas requisições provenientes do AdMob ou exigir um segredo na `customData` que você inclui antes de iniciar o anúncio).
- A configuração e formato do postback dependem do AdMob; consulte a documentação oficial de Server‑Side Verification do AdMob.

---

## 3) Exemplo de endpoint SSV (Cloud Function / Express)

Este é um exemplo mínimo de uma Cloud Function (Node.js + Express) que recebe o postback do AdMob e credita um `userId` no Firestore.

NOTA: este é um esboço — ajustes necessários para produção (autenticação, rate limiting, validação do payload do AdMob).

```js
// functions/index.js (exemplo rápido)
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.admobRewardPostback = functions.https.onRequest(async (req, res) => {
  try {
    // AdMob enviará dados no body. Exemplo de payload (varia):
    // { "userId": "AD_ID_123", "reward": {"amount":1, "type":"GURU_CREDIT"}, "transactionId": "tx_abc" }

    const payload = req.body || {};
    const userId = payload.userId || payload.user_id || payload.custom_data?.userId;
    const reward = payload.reward || payload.rewards;

    if (!userId || !reward) {
      return res.status(400).send('Missing userId or reward');
    }

    // Opcional: validar um segredo incluso em custom_data
    // if (payload.custom_data?.secret !== process.env.SSV_SECRET) return res.status(403).send('Forbidden');

    // Creditar no Firestore: coleção 'ai_credits' por userId
    const ref = db.collection('ai_credits').doc(userId);
    await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      const data = doc.exists ? doc.data() : { remaining: 0, totalUsed: 0 };
      data.remaining = (data.remaining || 0) + (reward.amount || 1);
      await tx.set(ref, data);
    });

    return res.status(200).send('ok');
  } catch (err) {
    console.error(err);
    return res.status(500).send('error');
  }
});
```

Integração no client (Android/iOS nativo):
- Ao carregar o `RewardedAd`, defina `ServerSideVerificationOptions` com `userId` e `customData`.
  - Android (exemplo Java/Kotlin):
    - rewardedAd.setServerSideVerificationOptions(ServerSideVerificationOptions.newBuilder().setUserId(userId).setCustomData(customData).build());
  - iOS: há API equivalente.
- Em Capacitor você precisará de um plugin nativo que exponha essa configuração ao JS. Há plugins comunitários para AdMob que já suportam SSV ou você pode adicionar integração nativa mínima.

Após SSV implementado, quando AdMob enviar a notificação para sua Cloud Function, o servidor creditará o `userId`. O app deve então consultar o servidor (ou usar uma notificação / realtime DB) para atualizar o saldo do usuário.

---

## 4) Alternativa mais simples (sem servidor) — o que já tem e como reforçar

- O que já temos: adService.simula anúncio e chama `firebaseService.grantAiCredit(1)` (que hoje grava num DB simulado em `localStorage` indexado por `installId`).
- Como reduzir fraudes sem servidor/SSV:
  - Use somente anúncios de teste (IDs de teste) durante desenvolvimento.
  - No ambiente real, aceite que este método tem limitações; é rápido para teste e lançamento inicial.

---

## 5) Recomendações práticas para publicar com AdMob

- Continue usando os Test IDs do AdMob em desenvolvimento.
- Antes de publicar com anúncios reais, verifique que:
  - Seus blocos de anúncios recompensados estão ativos no painel AdMob.
  - Você seguiu as políticas do Google (conteúdo e privacidade). O AdMob comentou que sua aplicação "Requer revisão" — isso é normal ao adicionar blocos de anúncios/alterações.
- Quando o app estiver aprovado no AdMob, substitua os Test IDs pelos seus IDs reais (os que indicou no painel).

---

## 6) O que posso implementar para você agora (escolha rápida)

1. Documentação + exemplo Cloud Function (já incluído aqui) — pronto.
2. Implementação completa do endpoint SSV + exemplo de integração com Firestore (posso criar o código da Cloud Function e instruções de deploy).
3. Implementar no app a coleta do Advertising ID e passar como `userId` para SSV (requer plugin Capacitor e alterações nativas Android/iOS).
4. Apenas deixar o fluxo atual (cliente-side) e documentar instruções de teste e políticas (Test IDs, etc.).

Diga qual opção prefere e eu procedo: por exemplo, se quiser começar sem servidor, mantenho o fluxo simples e crio um README mais detalhado sobre testes e implantação. Se prefere a solução que sobrevive a reinstalações sem cadastro, eu posso gerar a Cloud Function e instruções para configurá‑la (você precisará de um projeto Firebase em GCP). 

---

Arquivo referenciado:
- `services/firebaseService.ts` — armazenamento simulado
- `services/adService.ts` — concede crédito quando anúncio premiação completa
- `services/aiService.ts` — consome crédito no backend simulado

