// Example Cloud Function (Firebase) to handle AdMob Server-Side Verification postbacks
// Save as functions/index.js in a Firebase Functions project and deploy with `firebase deploy --only functions`

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// Optional: secret to validate customData (set as environment variable in functions config)
const SSV_SECRET = process.env.SSV_SECRET || 'CHANGE_ME_SECRET';

// Expected minimal payload (AdMob may vary):
// { userId: '...', customData: { secret: '...', tx: '...' }, reward: { amount: 1, type: 'GURU_CREDIT' }, transactionId: '...' }

exports.admobRewardPostback = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const payload = req.body || {};
    const userId = payload.userId || payload.user_id || payload.custom_data?.userId || payload.customData?.userId;
    const customData = payload.custom_data || payload.customData || {};
    const reward = payload.reward || payload.rewards || {};

    if (!userId) return res.status(400).send('Missing userId');

    // If you put a secret into customData when showing the ad, validate it here
    if (customData && customData.secret && customData.secret !== SSV_SECRET) {
      console.warn('SSV secret mismatch for userId', userId);
      return res.status(403).send('Forbidden');
    }

    const amount = (reward && (reward.amount || reward.rewardAmount)) ? (reward.amount || reward.rewardAmount) : 1;

    // Credit the user in Firestore under collection 'ai_credits'
    const docRef = db.collection('ai_credits').doc(userId);
    await db.runTransaction(async (tx) => {
      const doc = await tx.get(docRef);
      const data = doc.exists ? doc.data() : { remaining: 0, totalUsed: 0 };
      data.remaining = (data.remaining || 0) + amount;
      await tx.set(docRef, data, { merge: true });
    });

    console.log(`Granted ${amount} credit(s) to ${userId}`);
    return res.status(200).send('ok');

  } catch (err) {
    console.error('Error processing SSV postback', err);
    return res.status(500).send('error');
  }
});
