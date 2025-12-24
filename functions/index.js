const functions = require("firebase-functions");
const { defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Declare the parameter (value injected at deploy time with `functions:params`).
const SSV_SECRET_PARAM = defineString("admob.ssv_secret");

// Optional: limit function concurrency to help cost control.
if (functions.setGlobalOptions) {
	functions.setGlobalOptions({ maxInstances: 10 });
}

// AdMob Server-Side Verification postback handler.
exports.admobRewardPostback = functions.https.onRequest(
	async (req, res) => {
		try {
			if (req.method !== "POST") {
				return res.status(405).send("Method not allowed");
			}

			// Access param value at runtime.
			const SSV_SECRET = SSV_SECRET_PARAM.value();

			const payload = req.body || {};

			// AdMob may send different field names. Try common variants.
			const userId = (
				payload.userId || payload.user_id ||
				(payload.customData && payload.customData.userId) ||
				(payload.custom_data && payload.custom_data.userId)
			);

			const customData = payload.customData || payload.custom_data || {};
			const reward = payload.reward || payload.rewards || {};

			if (!userId) {
				return res.status(400).send("Missing userId");
			}

			// Validate secret passed in customData when showing the ad.
			if (
				customData && customData.secret &&
				String(customData.secret) !== String(SSV_SECRET)
			) {
				console.warn("SSV secret mismatch for userId", userId);
				return res.status(403).send("Forbidden");
			}

			const amount = (
				reward && (reward.amount || reward.rewardAmount)
			) ? (reward.amount || reward.rewardAmount) : 1;

			const docRef = db.collection("ai_credits").doc(userId);
			await db.runTransaction(async (tx) => {
				const doc = await tx.get(docRef);
				const data = doc.exists ? doc.data() : { remaining: 0, totalUsed: 0 };
				data.remaining = (data.remaining || 0) + Number(amount);
				await tx.set(docRef, data, { merge: true });
			});

			console.log("Granted " + amount + " credit(s) to " + userId);
			return res.status(200).send("ok");

		} catch (err) {
			console.error("Error processing SSV postback", err);
			return res.status(500).send("error");
		}
	}
);
