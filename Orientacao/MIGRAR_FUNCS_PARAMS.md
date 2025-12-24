# Migrar de `functions.config()` para Environment Params (`functions:params`)

Resumo
- Por que: `functions.config()` e o Runtime Config estão deprecados e serão desativados. A API recomendada é o sistema de *Environment Parameters* ("params") do Firebase Functions, que fornece uma forma segura, gerenciável e compatível com Secret Manager para armazenar segredos e variáveis.
- Objetivo: garantir que o SSV secret e outras configurações sensíveis sejam armazenadas corretamente e que as Functions rodem em runtimes suportados (Node 20+).

Por que migrar
- `functions.config()` está deprecado e será removido (falhas em deploys futuros). 
- `params` integra com o Secret Manager (definir segredos com `defineSecret`) e permite deploy seguro de valores sensíveis.
- Uso futuro: compatível com as versões modernas do `firebase-functions` e com o ciclo de vida de runtimes (Node 20+).

O que será alterado (visão geral)
1. Atualizar `package.json` das Functions para `"engines": { "node": "20" }` e `firebase-functions` para v4+.
2. Modificar o código para ler o secret via API `params` (ex.: `defineString`/`defineSecret`).
3. Definir o param no projeto: `firebase functions:params:set admob.ssv_secret="<SECRET>"` e publicar com `firebase functions:params:deploy`.
4. Deploy das functions normalmente (`firebase deploy --only functions --project <PROJECT_ID>`).

Comandos recomendados
- Atualizar CLI (se necessário):
```powershell
npm install -g firebase-tools@latest
firebase --version
```

- Ajustes locais (no diretório `functions`):
```powershell
# Atualizar engine e dependências no package.json
# (ou eu posso aplicar as mudanças para você)
npm install
```

- Definir e publicar params (no projeto correto):
```powershell
firebase use <PROJECT_ID>
firebase functions:params:set admob.ssv_secret="SUA_CHAVE_AQUI" --project <PROJECT_ID>
firebase functions:params:deploy --project <PROJECT_ID>
```

- Deploy das functions:
```powershell
firebase deploy --only functions --project <PROJECT_ID>
```

Exemplo de código (migrando `index.js` para usar `params`)
```javascript
const functions = require('firebase-functions');
const { defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// declare the param at module scope
const SSV_SECRET_PARAM = defineString('admob.ssv_secret');

exports.admobRewardPostback = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    // Access the param value inside the function
    const SSV_SECRET = SSV_SECRET_PARAM.value();

    const payload = req.body || {};
    const userId = payload.userId || payload.user_id || (payload.customData && payload.customData.userId) || (payload.custom_data && payload.custom_data.userId);
    const customData = payload.customData || payload.custom_data || {};
    const reward = payload.reward || payload.rewards || {};

    if (!userId) return res.status(400).send('Missing userId');

    // validate secret
    if (customData && customData.secret && String(customData.secret) !== String(SSV_SECRET)) {
      console.warn('SSV secret mismatch for userId', userId);
      return res.status(403).send('Forbidden');
    }

    const amount = (reward && (reward.amount || reward.rewardAmount)) ? (reward.amount || reward.rewardAmount) : 1;

    const docRef = db.collection('ai_credits').doc(userId);
    await db.runTransaction(async (tx) => {
      const doc = await tx.get(docRef);
      const data = doc.exists ? doc.data() : { remaining: 0, totalUsed: 0 };
      data.remaining = (data.remaining || 0) + Number(amount);
      await tx.set(docRef, data, { merge: true });
    });

    return res.status(200).send('ok');
  } catch (err) {
    console.error('Error processing SSV postback', err);
    return res.status(500).send('error');
  }
});
```

Observações e dicas
- A chamada `defineString('admob.ssv_secret')` declara o parâmetro; seu valor é injetado no runtime quando você publica os params com `firebase functions:params:deploy`.
- Para segredos mais sensíveis, use `defineSecret` e o Secret Manager do GCP. Ex.: `const { defineSecret } = require('firebase-functions/params'); const SECRET = defineSecret('admob/ssv_secret');`.
- Se estiver migrando dados existentes de `functions.config()`, use `firebase functions:config:export` para obter os valores e reimportar manualmente para `params`.

Testes locais
- Use os emuladores para testar a função antes do deploy:
```powershell
cd functions
firebase emulators:start --only functions --project <PROJECT_ID>
```
- Simule um postback com `curl` ou `Invoke-RestMethod` conforme instruções do guia SSV.

Fallbacks
- Durante a migração, mantenha suporte a `functions.config()` ou `process.env` como fallback, mas planeje removê-los — eles serão obsoletos.

Próximos passos que posso executar para você
- A) Aplicar mudanças em `package.json` (Node 20 + firebase-functions v4+) e atualizar `functions/index.js` para o código exemplo acima, instalar dependências e rodar `npm install`.
- B) Apenas criar este documento e te guiar enquanto você aplica as mudanças localmente.

Quer que eu aplique as mudanças automaticamente agora (A) ou só gere o documento (já criado) e você faz manualmente (B)?
