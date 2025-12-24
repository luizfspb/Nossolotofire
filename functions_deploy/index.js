const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {SecretManagerServiceClient} = require("@google-cloud/secret-manager");

admin.initializeApp();
const db = admin.firestore();

const smClient = new SecretManagerServiceClient();
const secretCache = new Map();

async function getSecretValue(secretName) {
  if (secretCache.has(secretName)) return secretCache.get(secretName);
  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || (process.env.FIREBASE_CONFIG && JSON.parse(process.env.FIREBASE_CONFIG).projectId);
  if (!projectId) throw new Error("Cannot determine project id for Secret Manager");
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  const [version] = await smClient.accessSecretVersion({name});
  const payload = version.payload && version.payload.data ? version.payload.data.toString('utf8') : null;
  secretCache.set(secretName, payload);
  return payload;
}

if (functions.setGlobalOptions) {
  functions.setGlobalOptions({ maxInstances: 10 });
}

exports.admobRewardPostback = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    let SSV_SECRET = null;
    try {
      SSV_SECRET = await getSecretValue('admob_ssv_secret');
    } catch (err) {
      SSV_SECRET = process.env.ADMOB_SSV_SECRET || (functions.config && functions.config().admob && functions.config().admob.ssv_secret) || null;
      console.warn('Secret Manager unavailable, using fallback secret source');
    }

    const payload = req.body || {};
    const userId = payload.userId || payload.user_id || (payload.customData && payload.customData.userId) || (payload.custom_data && payload.custom_data.userId);
    const customData = payload.customData || payload.custom_data || {};
    const reward = payload.reward || payload.rewards || {};

    if (!userId) return res.status(400).send('Missing userId');

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

    console.log(`Granted ${amount} credit(s) to ${userId}`);
    return res.status(200).send('ok');
  } catch (err) {
    console.error('Error processing SSV postback', err);
    return res.status(500).send('error');
  }
});
