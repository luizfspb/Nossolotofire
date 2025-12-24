# Variáveis de Ambiente - Nossa Loto Android

## 🔐 Variáveis Obrigatórias

### Google Gemini API Key
```bash
GEMINI_API_KEY=AIzaSyD2bXyrjqxT_S3GOHOeFA5whFjJOjLHXcI
```

### Google AdMob IDs (Opcional - Produção)
```bash
# Test IDs (padrão) - Use para desenvolvimento
VITE_ADMOB_APP_ID=ca-app-pub-3940256099942544~3347511713
VITE_ADMOB_BANNER_ID=ca-app-pub-3940256099942544/6300978111
VITE_ADMOB_INTERSTITIAL_ID=ca-app-pub-3940256099942544/1033173712
VITE_ADMOB_REWARDED_ID=ca-app-pub-3940256099942544/5224354917
VITE_ADMOB_NATIVE_ID=ca-app-pub-3940256099942544/2247696110

# Suas IDs reais (quando for publicar)
# VITE_ADMOB_APP_ID=ca-app-pub-2094842035776742~1234567890
# VITE_ADMOB_BANNER_ID=ca-app-pub-2094842035776742/6300978111
```

## 📋 Verificar Variáveis

As variáveis devem estar configuradas em:

1. **`.env.local`** (Git-ignored, apenas local)
   - Criado na raiz do projeto
   - Não é versionado

2. **`vite.config.ts`**
   - Define como as variáveis são passadas ao app

## ✅ Verificação

Para verificar se está tudo certo:

```bash
cd C:\Users\luiz.b\Downloads\nossa-loto

# Fazer build
npm run build

# Sincronizar com Android
npx cap sync android

# Verificar se está no Logcat quando rodar
```

No Android Studio Logcat, procure por:
```
[Firebase] Inicializando serviços
[AdMob] Inicializando SDK
```

## 🔄 Atualizar as IDs do AdMob

Quando seu app estiver na Google Play, atualize em:

1. **`types.ts`** - Atualize o `ADMOB_CONFIG`
2. **`.env.local`** - Coloque suas IDs reais
3. Execute:
   ```bash
   npm run build
   npx cap sync android
   ```

## 📚 Referência

- Documentação Capacitor: https://capacitorjs.com/docs
- Firebase Android: https://firebase.google.com/docs/android/setup
- AdMob IDs: https://admob.google.com/
