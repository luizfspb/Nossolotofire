<!-- README - ANDROID EMULATION QUICK START -->

# 🚀 Nossa Loto: Android com Capacitor

## ⚡ TL;DR (Versão Rápida)

```bash
# Já está tudo pronto! Só falta abrir no Android Studio

# Abra esta pasta no Android Studio:
C:\Users\luiz.b\Downloads\nossa-loto\android

# Pronto! Sincronize o Gradle e execute
```

---

## 📱 Configuração Já Feita

| Aspecto | Status | Detalhe |
|--------|--------|---------|
| **Framework** | ✅ | React + TypeScript + Vite |
| **Mobile** | ✅ | Capacitor 6.0+ |
| **Android** | ✅ | v21+ (Min) / v34 (Target) |
| **App Name** | ✅ | Nossa Loto: Resultados e IA |
| **Package** | ✅ | com.companyname.appjogosloteria |
| **Versão** | ✅ | 2.0.9 |
| **Firebase** | ✅ | Configurado e autenticado |
| **AdMob** | ✅ | Integrado com Test IDs |
| **Gemini API** | ✅ | Variável de ambiente |

---

## 🎯 3 Passos para Emular

### 1️⃣ Abrir no Android Studio
```
File → Open → C:\Users\luiz.b\Downloads\nossa-loto\android
```

### 2️⃣ Criar Emulador (se não tiver)
```
Tools → Device Manager → Create Virtual Device
```

### 3️⃣ Executar
```
Pressione SHIFT + F10 (ou clique no botão Run verde)
```

**Pronto!** 🎉 O app abrirá no emulador em poucos segundos.

---

## 📂 Estrutura do Projeto

```
nossa-loto/
├── android/              ← Android Studio abre daqui
│   ├── app/
│   │   ├── build.gradle  ← Versão 2.0.9 configurada
│   │   ├── google-services.json  ← Firebase
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── res/
│   └── settings.gradle
├── src/                  ← Código React
│   ├── components/
│   ├── services/
│   ├── App.tsx
│   └── ...
├── capacitor.config.ts   ← Configuração Capacitor
├── package.json
├── vite.config.ts
└── ANDROID_EMULACAO_GUIA.md  ← Guia detalhado
```

---

## 💡 Dicas Importantes

### Para Desenvolvimento Rápido
```bash
# Terminal 1: Watch dos arquivos
npm run dev

# Terminal 2: Sincronizar mudanças ao Android
npx cap sync android

# Android Studio: Pressionar SHIFT+F10 para reload
```

### Logs e Debug
- **View → Tool Windows → Logcat** para ver logs em tempo real
- Procure por: `[Firebase]`, `[AdMob]`, `[Capacitor]`

### Variáveis de Ambiente
- Estão em `.env.local` (não versionado)
- Se adicionar novas, execute: `npm run build && npx cap sync android`

---

## 🔧 Comandos Essenciais

```bash
# Build web
npm run build

# Sincronizar com Android
npx cap sync android

# Limpar Gradle (se tiver problemas)
cd android && ./gradlew clean

# Ver logs do emulador
adb logcat

# Instalar APK manualmente
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📚 Documentação Criada

1. **ANDROID_EMULACAO_GUIA.md** - Guia completo passo a passo
2. **CHECKLIST_ANDROID.md** - Status de tudo que foi configurado
3. **VARIAVEIS_AMBIENTE.md** - Referência de variáveis
4. **build-android.bat** - Script para compilar (Windows)
5. **build-android.sh** - Script para compilar (Linux/Mac)

---

## ✅ Verificação Rápida

Abra um terminal e execute:

```bash
cd C:\Users\luiz.b\Downloads\nossa-loto

# 1. Verificar dependências
npm list @capacitor/core

# 2. Verificar build
npm run build

# 3. Verificar sincronização
npx cap sync android

# Se tudo passou sem erros ✅, está pronto para Android Studio!
```

---

## 🎓 Próximas Etapas

### Para Produção
1. Gere um APK release: `cd android && ./gradlew assembleRelease`
2. Assine com uma chave (signing key)
3. Suba para Google Play Store

### Para Recursos Nativos
Instale plugins Capacitor conforme necessário:
```bash
npm install @capacitor/camera @capacitor/geolocation
npx cap sync android
```

### Para Otimização
- Reduza tamanho do bundle: `npm run build -- --minify`
- Ative proguard em `android/app/build.gradle`

---

## ❓ FAQ Rápido

**P: Preciso instalar Android SDK?**
R: Não, Android Studio já incluir tudo.

**P: Posso usar um celular real?**
R: Sim! Ativa USB Debug e conecta. Android Studio detecta automaticamente.

**P: Posso mudar o ícone do app?**
R: Sim! Coloque a imagem em `android/app/src/main/res/mipmap-*`

**P: Como testar AdMob?**
R: Os Test IDs já estão configurados. Não clique nos anúncios de teste.

**P: Quanto tempo leva o primeiro build?**
R: 5-10 minutos (Gradle baixa dependências).

---

## 🎉 Sucesso!

Seu app **Nossa Loto** está 100% pronto para:
- ✅ Desenvolvimento em Android Studio
- ✅ Emulação em qualquer dispositivo virtual
- ✅ Testes com Firebase e AdMob
- ✅ Publicação na Google Play Store

**Comece agora:** Abra `android/` no Android Studio!

---

_Última atualização: 22 de Dezembro de 2025_
_Capacitor v6.0+ | Android API 21-34_
