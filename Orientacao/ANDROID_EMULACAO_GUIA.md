# 🚀 Guia: Emular Nossa Loto no Android Studio

## ✅ O que foi feito

- ✅ Instalado Capacitor e CLI
- ✅ Estrutura Android criada (pasta `android/`)
- ✅ Versão configurada: **2.0.9** (versionCode: 209)
- ✅ Nome: **Nossa Loto: Resultados e IA**
- ✅ Package ID: **com.companyname.appjogosloteria**
- ✅ Firebase google-services.json configurado
- ✅ AndroidManifest.xml atualizado com permissões
- ✅ Assets web sincronizados

---

## 📱 Abrir no Android Studio

### Passo 1: Abrir o Projeto Android

1. Abra o **Android Studio**
2. Clique em **"Open"** ou **File → Open**
3. Navegue até: `C:\Users\luiz.b\Downloads\nossa-loto\android`
4. Clique em **"OK"**

Android Studio irá sincronizar o Gradle automaticamente (pode levar alguns minutos na primeira vez).

### Passo 2: Aguardar Sincronização do Gradle

- Você verá uma mensagem: **"Gradle sync in progress..."**
- Aguarde até aparecer: **"Gradle sync finished successfully"**
- Se houver erros, clique em **"Sync Now"** para tentar novamente

### Passo 3: Criar ou Selecionar um Emulador Android

**Se você já tem um emulador:**
1. Abra **AVD Manager** (Android Virtual Device Manager)
   - Menu: **Tools → Device Manager** ou **Tools → AVD Manager**
2. Selecione o emulador que deseja usar
3. Clique em **"Play"** ▶ para iniciar

**Se NÃO tem um emulador ainda:**
1. Abra **Device Manager**
2. Clique em **"Create Virtual Device"** ou **"+"**
3. Escolha um dispositivo (ex: **Pixel 4a** ou **Pixel 6**)
4. Escolha uma API Level (recomendado: **API 33** ou superior)
5. Complete o setup e inicie o emulador

### Passo 4: Fazer Build e Executar

**Opção A - Via Android Studio (mais fácil):**
1. Selecione o arquivo: `android/app/src/main/java/com/companyname/appjogosloteria/MainActivity.java`
2. Clique no botão verde **"Run"** ▶ (ou pressione `Shift+F10`)
3. Selecione o emulador que está rodando
4. Clique em **"OK"**

**Opção B - Via Terminal (mais controle):**
```bash
cd C:\Users\luiz.b\Downloads\nossa-loto\android
gradlew.bat assembleDebug
```

Depois conecte um emulador ou dispositivo USB e execute:
```bash
adb install -r build\outputs\apk\debug\app-debug.apk
```

### Passo 5: Aguardar a Compilação

- Primeira compilação pode levar **5-10 minutos**
- Você verá progresso em **"Build Output"** na base do Android Studio
- Quando terminar, o app abrirá automaticamente no emulador

---

## 🔧 Solução de Problemas

### ❌ "Build failed" ou erros de Gradle

**Solução:**
```bash
cd C:\Users\luiz.b\Downloads\nossa-loto\android
gradlew.bat clean
gradlew.bat sync
```

Depois tente novamente no Android Studio.

### ❌ Emulador não aparece na lista

1. Abra **Device Manager**
2. Verifique se há emuladores criados
3. Se não houver, crie um novo
4. Inicie o emulador ANTES de clicar em "Run"

### ❌ Erro sobre "google-services.json"

Já resolvemos isso! O arquivo está em: `android/app/google-services.json`

Se ainda houver erro, verifique se o build.gradle contém:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### ❌ Assets web não aparecem

Execute novamente:
```bash
npm run build
npx cap sync android
```

---

## 📝 Próximas Etapas (Opcional)

### Para Publicar na Google Play Store

1. Configure uma chave de assinatura (signing key)
2. Gere um APK de release
3. Suba na Google Play Console

### Para Usar Recursos Nativos (Câmera, GPS, etc)

Você pode instalar plugins Capacitor adicionais:
```bash
npm install @capacitor/camera @capacitor/geolocation
npx cap sync android
```

---

## 📞 Informações do Projeto

| Item | Valor |
|------|-------|
| **App Name** | Nossa Loto: Resultados e IA |
| **Package** | com.companyname.appjogosloteria |
| **Versão** | 2.0.9 |
| **Version Code** | 209 |
| **Min SDK** | 21 |
| **Target SDK** | 34 |
| **Framework** | React + Capacitor |

---

**Dúvidas?** Verifique os logs em **Logcat** (Android Studio → View → Tool Windows → Logcat)
