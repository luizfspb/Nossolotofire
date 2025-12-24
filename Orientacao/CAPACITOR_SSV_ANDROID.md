# Capacitor (Android) — snippet para Server‑Side Verification (SSV) com RewardedAd

Este arquivo mostra o que implementar no lado Android (Kotlin) e como expor via um plugin Capacitor para ser chamado a partir do JavaScript.

## 1) Dependências
No `android/app/build.gradle` certifique-se de ter a dependência do Google Mobile Ads SDK:

```gradle
implementation 'com.google.android.gms:play-services-ads:22.1.0' // versão exemplo
```

## 2) Snippet Kotlin — carregar RewardedAd com ServerSideVerificationOptions
```kotlin
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.gms.ads.rewarded.ServerSideVerificationOptions
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.LoadAdError

// carregar anúncio
var rewardedAd: RewardedAd? = null
val adUnitId = "ca-app-pub-2094842035776742/2749796079" // seu Rewarded ID

fun loadRewardedAd(context: Context, userId: String, customDataJson: String?) {
  val request = AdRequest.Builder().build()
  RewardedAd.load(context, adUnitId, request, object : RewardedAdLoadCallback() {
    override fun onAdLoaded(ad: RewardedAd) {
      rewardedAd = ad
      // Opcional: configurar SSV aqui antes de mostrar (pode ser feito quando for mostrar também)
    }
    override fun onAdFailedToLoad(loadAdError: LoadAdError) {
      Log.e("AdMob", "Failed to load rewarded ad: ${loadAdError.message}")
    }
  })
}

fun showRewardedAd(activity: Activity, userId: String, customDataJson: String?) {
  if (rewardedAd == null) return

  // Criar ServerSideVerificationOptions com userId e customData
  val ssvOptions = ServerSideVerificationOptions.Builder()
    .setUserId(userId)
    .setCustomData(customDataJson)
    .build()
  rewardedAd?.setServerSideVerificationOptions(ssvOptions)

  rewardedAd?.show(activity) { rewardItem ->
    // onUserEarnedReward - o AdMob deve ter enviado o postback SSV para o seu servidor
    Log.d("AdMob", "User earned reward: ${rewardItem.amount} ${rewardItem.type}")
    // Aqui você pode notificar o app JS para buscar saldo no backend
  }
}
```

## 3) Como chamar a partir do JavaScript (Capacitor)
- Crie um plugin Capacitor simples que expõe `loadRewardedAd(userId, customData)` e `showRewardedAd()` para o JS.
- Ou, edite `MainActivity` para expor por `Bridge` um método que o JS chame via `Capacitor.Plugins`.

Exemplo de chamada JS (após expor plugin):
```ts
// antes de mostrar
const userId = await getAdvertisingIdOrInstallId();
const customData = JSON.stringify({ secret: 'SOME_SECRET', tx: 'tx-123' });
await CapacitorPlugins.MyAdPlugin.loadRewardedAd({ userId, customData });
await CapacitorPlugins.MyAdPlugin.showRewardedAd();
// depois, chame endpoint para reload de créditos
await aiService.loadUsageFromServer();
```

## 4) Observações importantes
- `userId` ideal: Advertising ID (AAID) ou outro identificador estável que você controle; pode ser o `installId` como fallback.
- `customData` pode incluir um `secret` que seu server espera para validar o postback.
- Teste localmente chamando a Cloud Function com `curl` para simular o postback antes de ligar o AdMob real.

---

Se quiser, eu gero um exemplo de plugin Capacitor (código mínimo para android/src) e adiciono instruções para integrá-lo no projeto Android. Isso facilita chamar `loadRewardedAd` / `showRewardedAd` diretamente do JS.