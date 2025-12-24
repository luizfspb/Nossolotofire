# 🗂️ ÍNDICE - Documentação Android Emulation

## 🎯 Começar Aqui

Se é sua primeira vez, comece por aqui:

| Arquivo | Tempo | Propósito |
|---------|-------|----------|
| **[LEIA-ME-PRIMEIRO.md](LEIA-ME-PRIMEIRO.md)** | 2 min | Visão geral rápida |
| **[QUICK_START_ANDROID.md](QUICK_START_ANDROID.md)** | 5 min | Guia rápido 3 passos |
| **[GUIA_VISUAL_ANDROID_STUDIO.md](GUIA_VISUAL_ANDROID_STUDIO.md)** | 10 min | Passo-a-passo com descrições |

---

## 📚 Documentação Detalhada

### Conceitos e Setup

| Arquivo | Conteúdo |
|---------|----------|
| **[README_ANDROID_SETUP.md](README_ANDROID_SETUP.md)** | Resumo técnico completo |
| **[CHECKLIST_ANDROID.md](CHECKLIST_ANDROID.md)** | Status de cada configuração |
| **[VARIAVEIS_AMBIENTE.md](VARIAVEIS_AMBIENTE.md)** | Chaves e variáveis de config |

### Referência

| Arquivo | Conteúdo |
|---------|----------|
| **[ANDROID_EMULACAO_GUIA.md](ANDROID_EMULACAO_GUIA.md)** | Guia completo com troubleshooting |
| **[Orientacao/FIREBASE_ADMOB_SETUP.md](Orientacao/FIREBASE_ADMOB_SETUP.md)** | Setup de Firebase e AdMob |
| **[Orientacao/POLITICA_PRIVACIDADE.md](Orientacao/POLITICA_PRIVACIDADE.md)** | Política de privacidade |

---

## 🚀 Scripts Automatizados

### Windows

```bash
setup-android.bat    # Setup automático completo
build-android.bat    # Build automático
```

### Linux / Mac

```bash
bash setup-android.sh    # Setup automático completo
bash build-android.sh    # Build automático
```

---

## 📁 Estrutura de Arquivos

### Código-Fonte

```
src/
├── components/      # Componentes React
│   ├── AdBanner.tsx
│   ├── GameGenerator.tsx
│   ├── GuruAI.tsx
│   ├── LotteryCard.tsx
│   ├── SavedGames.tsx
│   └── Settings.tsx
├── services/        # Serviços (Firebase, API, etc)
│   ├── firebaseService.ts
│   ├── aiService.ts
│   ├── adService.ts
│   ├── gameService.ts
│   ├── geminiService.ts
│   └── lotteryService.ts
├── App.tsx
├── constants.tsx
├── types.ts
└── index.tsx
```

### Configuração Web

```
./
├── vite.config.ts      # Vite config (bundler)
├── tsconfig.json       # TypeScript config
├── package.json        # Dependências e scripts
├── capacitor.config.ts # Capacitor config
└── index.html          # HTML principal
```

### Configuração Android

```
android/
├── app/
│   ├── build.gradle              # Config build (VERSÃO HERE)
│   ├── google-services.json       # Firebase config
│   └── src/main/
│       ├── AndroidManifest.xml    # Permissões
│       ├── java/...               # Java code (MainActivity)
│       └── res/
│           └── values/strings.xml # Strings (NOME HERE)
└── gradle files
```

---

## ⚡ Atalhos Importantes

### Android Studio

| Atalho | Função |
|--------|--------|
| **SHIFT+F10** | Build e executar |
| **CTRL+F5** | Reload rápido |
| **ALT+F9** | Apenas build |
| **CTRL+//** | Comentar linha |
| **CTRL+ALT+L** | Formatar código |

### Terminal

| Comando | Função |
|---------|--------|
| `npm run dev` | Dev server com hot reload |
| `npm run build` | Build de produção |
| `npx cap sync android` | Sincroniza com Android |
| `npx cap open android` | Abre no Android Studio |
| `adb logcat` | Ver logs |

---

## 🔍 Procurando Por...?

### Como...
- **Abrir no Android Studio?** → [GUIA_VISUAL_ANDROID_STUDIO.md](GUIA_VISUAL_ANDROID_STUDIO.md) Passo 1-2
- **Criar um emulador?** → [GUIA_VISUAL_ANDROID_STUDIO.md](GUIA_VISUAL_ANDROID_STUDIO.md) Passo 5
- **Fazer build?** → [QUICK_START_ANDROID.md](QUICK_START_ANDROID.md) ou Passo 3-4
- **Ver logs?** → [README_ANDROID_SETUP.md](README_ANDROID_SETUP.md) Debug
- **Testar em celular real?** → [GUIA_VISUAL_ANDROID_STUDIO.md](GUIA_VISUAL_ANDROID_STUDIO.md) Testar no Celular Real
- **Publicar na Play Store?** → [README_ANDROID_SETUP.md](README_ANDROID_SETUP.md) Build Release

### Entendo Melhor...
- **O projeto de forma geral?** → [README_ANDROID_SETUP.md](README_ANDROID_SETUP.md)
- **O que foi configurado?** → [CHECKLIST_ANDROID.md](CHECKLIST_ANDROID.md)
- **Variáveis de configuração?** → [VARIAVEIS_AMBIENTE.md](VARIAVEIS_AMBIENTE.md)
- **Troubleshooting?** → [README_ANDROID_SETUP.md](README_ANDROID_SETUP.md) Solução Rápida de Problemas

### Resolvendo Problemas...
- **Gradle não sincroniza?** → [README_ANDROID_SETUP.md](README_ANDROID_SETUP.md) Solução Rápida
- **Assets não aparecem?** → [GUIA_VISUAL_ANDROID_STUDIO.md](GUIA_VISUAL_ANDROID_STUDIO.md) Se Não Funcionar
- **App não abre?** → [ANDROID_EMULACAO_GUIA.md](ANDROID_EMULACAO_GUIA.md) Solução de Problemas
- **Emulador não inicia?** → [QUICK_START_ANDROID.md](QUICK_START_ANDROID.md) FAQ

---

## 📊 Informações do Projeto

```
App Name:    Nossa Loto: Resultados e IA
Package:     com.companyname.appjogosloteria
Versão:      2.0.9
Version Code: 209
Min SDK:     21 (Android 5.0)
Target SDK:  34 (Android 14)
Framework:   React + TypeScript + Capacitor
Build Tool:  Vite
Type:        Progressive Web App → Mobile App
```

---

## 🎓 Níveis de Documentação

### 🟢 Iniciante
- [LEIA-ME-PRIMEIRO.md](LEIA-ME-PRIMEIRO.md)
- [QUICK_START_ANDROID.md](QUICK_START_ANDROID.md)
- [GUIA_VISUAL_ANDROID_STUDIO.md](GUIA_VISUAL_ANDROID_STUDIO.md)

### 🟡 Intermediário
- [README_ANDROID_SETUP.md](README_ANDROID_SETUP.md)
- [CHECKLIST_ANDROID.md](CHECKLIST_ANDROID.md)

### 🔴 Avançado
- [ANDROID_EMULACAO_GUIA.md](ANDROID_EMULACAO_GUIA.md)
- [Orientacao/FIREBASE_ADMOB_SETUP.md](Orientacao/FIREBASE_ADMOB_SETUP.md)

---

## 🔄 Workflow Recomendado

### Dia 1: Setup
```
1. Leia: LEIA-ME-PRIMEIRO.md (2 min)
2. Execute: setup-android.bat (1 min)
3. Abra: android/ no Android Studio
4. Crie: um emulador
5. Execute: Shift+F10
```

### Dia 2+: Desenvolvimento
```
1. Faça mudanças no código (src/)
2. Execute: npm run build
3. Execute: npx cap sync android
4. No Android Studio: Shift+F10
5. Veja funcionar no emulador
```

### Produção:
```
1. Configure certificados (signing keys)
2. Execute: npm run build
3. Execute: cd android && ./gradlew assembleRelease
4. Suba na Google Play Console
```

---

## ✅ Checklist Rápido

Antes de começar, verifique:

- [ ] Node.js 16+ instalado (`node -v`)
- [ ] npm instalado (`npm -v`)
- [ ] Android Studio baixado e instalado
- [ ] Pasta `nossa-loto` aberta em um editor
- [ ] Terminal/PowerShell funcionando

Se sim ✅ em todos, execute:
```bash
setup-android.bat    # ou bash setup-android.sh
```

---

## 🎁 Bônus

### Extensões Android Studio Recomendadas
- Logcat Colorizer
- ADB Idea
- JSON to Kotlin Class
- Material Theme UI

### Plugins Capacitor (Opcional)
```bash
npm install @capacitor/camera
npm install @capacitor/geolocation
npm install @capacitor/haptics
```

---

## 📞 Precisa de Ajuda?

1. **Leia** a documentação apropriada acima
2. **Verifique** a seção de Troubleshooting
3. **Execute** `setup-android.bat` novamente
4. **Veja** Logcat no Android Studio para erros

---

## 🚀 Pronto para Começar?

### Caminho Rápido (5 min)
```
1. Abra: QUICK_START_ANDROID.md
2. Execute: setup-android.bat
3. Siga os 3 passos
```

### Caminho Detalhado (15 min)
```
1. Abra: GUIA_VISUAL_ANDROID_STUDIO.md
2. Siga passo-a-passo com imagens
3. Teste o app
```

---

**Boa sorte com seu desenvolvimento! 🚀**

_Última atualização: 22 de Dezembro de 2025_
