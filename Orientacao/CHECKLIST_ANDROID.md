# ✅ Checklist - Nossa Loto Android Emulation

## 📋 Configuração Completa

### ✅ Capacitor Instalado e Configurado
- [x] `@capacitor/core` instalado
- [x] `@capacitor/cli` instalado
- [x] `@capacitor/android` instalado
- [x] `capacitor.config.ts` criado com configurações corretas
- [x] Web assets sincronizados (`dist/`)

### ✅ Estrutura Android Criada
- [x] Pasta `android/` gerada
- [x] `android/app/build.gradle` configurado
- [x] `android/app/src/main/AndroidManifest.xml` atualizado
- [x] `android/app/src/main/res/values/strings.xml` atualizado
- [x] `android/app/google-services.json` copiado

### ✅ Configurações do App
- [x] **Nome**: Nossa Loto: Resultados e IA
- [x] **Package**: com.companyname.appjogosloteria
- [x] **Versão**: 2.0.9
- [x] **Version Code**: 209
- [x] **Min SDK**: 21
- [x] **Target SDK**: 34

### ✅ Permissões Android
- [x] INTERNET
- [x] ACCESS_NETWORK_STATE
- [x] POST_NOTIFICATIONS
- [x] ACCESS_FINE_LOCATION
- [x] ACCESS_COARSE_LOCATION

### ✅ Integrações
- [x] Firebase configurado (google-services.json)
- [x] AdMob configurado (TEST IDs)
- [x] Gemini API pronta (variável de ambiente)

### ✅ Ferramentas
- [x] Script `build-android.bat` (Windows)
- [x] Script `build-android.sh` (Linux/Mac)
- [x] Guia `ANDROID_EMULACAO_GUIA.md`
- [x] Referência de variáveis `VARIAVEIS_AMBIENTE.md`

---

## 🚀 Próximos Passos

### 1️⃣ Primeiro Setup
```bash
# Só precisa fazer uma vez!
cd C:\Users\luiz.b\Downloads\nossa-loto
npm install
npm run build
npx cap sync android
```

### 2️⃣ Abrir no Android Studio
1. **File** → **Open**
2. Selecione: `C:\Users\luiz.b\Downloads\nossa-loto\android`
3. Clique **OK** e aguarde Gradle sincronizar

### 3️⃣ Criar/Iniciar Emulador
1. **Tools** → **Device Manager**
2. Crie um novo ou selecione existente
3. Clique **Play** para iniciar

### 4️⃣ Fazer Build e Executar
1. Clique no botão verde **Run** (▶)
2. Ou pressione **Shift + F10**
3. Selecione o emulador
4. Aguarde a compilação

---

## 🔄 Workflow Rápido

### Para Desenvolver:
```bash
# Terminal 1 - Watch da web
npm run dev

# Terminal 2 - Sincronizar ao salvar (quando mudar código)
npx cap sync android
```

### Para Testar no Emulador:
1. Faça as mudanças no código
2. Execute: `npm run build && npx cap sync android`
3. No Android Studio, pressione `Shift + F10`

### Atalhos Android Studio:
- **Shift + F10**: Build e executar
- **Ctrl + F5**: Rodar sem compilar (reload quente)
- **Alt + F9**: Fazer build
- **Logcat**: View → Tool Windows → Logcat

---

## 🐛 Debug e Logs

### Ver Logs no Emulador:
```bash
# Terminal
adb logcat
```

### No Android Studio - Logcat Panel:
1. **View** → **Tool Windows** → **Logcat**
2. Procure por:
   - `[Firebase]` - Eventos do Firebase
   - `[AdMob]` - Anúncios
   - `[Capacitor]` - Plugins

---

## 📱 Requisitos do Sistema

- **Android Studio**: 2023.1 ou superior
- **Java**: 11 ou superior
- **Gradle**: 7.0+
- **Android SDK**: API 34 (recomendado)
- **RAM**: 4GB mínimo (8GB recomendado)

---

## 🎯 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Gradle não sincroniza | `cd android && ./gradlew clean sync` |
| Assets não aparecem | `npm run build && npx cap sync android` |
| Emulador não aparece | Device Manager → Create Virtual Device |
| App não inicia | Verificar Logcat para erros |
| Porta 3000 já em uso | `npm run dev -- --port 3001` |

---

## 📊 Status do Projeto

```
✅ Frontend Web: PRONTO (React/TypeScript/Vite)
✅ Build Android: PRONTO (Capacitor)
✅ Firebase: CONFIGURADO
✅ AdMob: INTEGRADO
✅ Documentação: COMPLETA
```

---

## 🎉 Tudo Pronto!

Você pode agora:
1. ✅ Abrir em Android Studio
2. ✅ Emular em qualquer dispositivo virtual
3. ✅ Testar funcionalidades
4. ✅ Compilar para produção

**Dúvidas?** Consulte os guias criados:
- `ANDROID_EMULACAO_GUIA.md` - Guia completo
- `VARIAVEIS_AMBIENTE.md` - Variáveis de configuração
- `build-android.bat` - Script automatizado

---

**Última atualização:** 22 de Dezembro de 2025
**Versão do Capacitor:** 6.0+
