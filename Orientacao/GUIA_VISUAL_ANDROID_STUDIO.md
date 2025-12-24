# 🎯 GUIA VISUAL - Abrindo no Android Studio

## 1️⃣ Abra o Android Studio

Se não tiver instalado:
- Baixe em: https://developer.android.com/studio
- Instale e abra

Se já tem aberto:
- Vá ao menu **File**

---

## 2️⃣ Clique em "Open"

```
┌─────────────────────────────────────┐
│ File  Edit  View  Run  Tools  Help  │
├─────────────────────────────────────┤
│ ❯ New Project                       │
│ ❯ Open...                  (Ctrl+O) │ ← CLIQUE AQUI
│ ❯ Open Recent                       │
│ ❯ Close                             │
│ ❯ Settings                  (Ctrl+,)│
│ ❯ Exit                              │
└─────────────────────────────────────┘
```

---

## 3️⃣ Navegue para a Pasta Android

```
Caminho exato:
C:\Users\luiz.b\Downloads\nossa-loto\android
                                       ^^^^^^
                                    Esta pasta!
```

Ou copie e cole o caminho:
```
C:\Users\luiz.b\Downloads\nossa-loto\android
```

Deve ver:
```
android/
├── app/              ← Projeto principal
├── gradle/
├── build.gradle      ← Arquivo importante
├── settings.gradle
└── gradlew.bat
```

Clique em **"android"** e depois em **"OK"**

---

## 4️⃣ Aguarde Gradle Sincronizar

Você verá:
```
┌──────────────────────────────────────┐
│  Gradle sync in progress...          │
│  ⏳ Downloading Gradle 8.5           │
│  ⏳ Syncing gradle files             │
│  ⏳ Running Gradle tasks             │
└──────────────────────────────────────┘
```

**Isso pode levar 5-15 minutos na primeira vez.**

Procure por:
```
✅ Gradle sync finished successfully
```

Se vir mensagem de erro, clique em **"Sync Now"** novamente.

---

## 5️⃣ Crie um Emulador (se não tiver)

Na barra superior, procure por **Device Manager** ou vá para:
```
Tools → Device Manager
```

Você verá:
```
┌──────────────────────────────────────┐
│ Your Virtual Devices                 │
├──────────────────────────────────────┤
│  Create Virtual Device  ← CLIQUE      │
│                                       │
│  (ou lista de emuladores existentes)  │
└──────────────────────────────────────┘
```

### Se clicar em "Create Virtual Device":

1. **Escolha um dispositivo** (ex: "Pixel 4a")
2. **Escolha versão Android** (ex: API 33 - Android 13)
3. Complete os passos seguintes
4. Clique em **"Finish"**

---

## 6️⃣ Inicie o Emulador

No **Device Manager**, procure o emulador que criou:

```
┌─────────────────────────────────────┐
│ Pixel 4a (API 33)                   │
├─────────────────────────────────────┤
│  [▶ Play]   [⚙️ Edit]   [❌ Delete]  │
│                                     │
│  Status: Not running                │
└─────────────────────────────────────┘
```

Clique no botão **▶ Play** (verde)

O emulador abrirá em uma nova janela (leva alguns segundos).

---

## 7️⃣ Execute o App

De volta ao Android Studio, você verá um botão grande verde:

```
┌──────────────────────────┐
│  ▶ Run 'app'             │
└──────────────────────────┘
```

Ou pressione: **SHIFT + F10**

Você verá:
```
┌──────────────────────────────────────┐
│ Gradle Build                         │
│ ⏳ Building 'app'...                 │
│                                      │
│ (mostra progresso da compilação)     │
└──────────────────────────────────────┘
```

Espere terminar...

---

## 8️⃣ App Abrirá no Emulador! 🎉

```
┌─────────────────────────────────┐
│ [Emulador Android]              │
│ ┌───────────────────────────┐   │
│ │                           │   │
│ │  Nossa Loto Abrindo...   │   │
│ │                           │   │
│ │  [Splash Screen]          │   │
│ │                           │   │
│ └───────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

Aguarde 3-5 segundos...

```
┌─────────────────────────────────┐
│ [Emulador Android]              │
│ ┌───────────────────────────┐   │
│ │                           │   │
│ │  🎰 NOSSA LOTO            │   │
│ │  Resultados e IA          │   │
│ │                           │   │
│ │  [Mega Sena]  [Lotofácil] │   │
│ │  [Quina]      [Mais...]   │   │
│ │                           │   │
│ │  [Resultados] [IA]        │   │
│ │  [Jogos Salvos] [Config]  │   │
│ │                           │   │
│ └───────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Pronto! 🚀 Seu app está rodando!**

---

## 💡 Atalhos Úteis

| Atalho | Função |
|--------|--------|
| **SHIFT + F10** | Build e executar |
| **CTRL + F5** | Reload rápido (hot reload) |
| **ALT + F9** | Apenas build |
| **CTRL + SHIFT + D** | Debug mode |
| **CTRL + ALT + L** | Formatar código |

---

## 🔍 Ver Logs

Se quiser ver o que está acontecendo nos bastidores:

1. Na base do Android Studio, abra **Logcat**
2. Procure por: `[Firebase]`, `[AdMob]`, ou `[Capacitor]`

Exemplo:
```
[Firebase] Inicializando serviços para com.companyname.appjogosloteria
[AdMob] Inicializando SDK com App ID: ca-app-pub-3940256099942544~3347511713
[Capacitor] Plugins carregados com sucesso
```

---

## ❌ Se Não Funcionar

### Gradle sync failed
```bash
Solução:
1. Android Studio → File → Invalidate Caches
2. Clique OK e deixe reiniciar
3. Clique "Sync Now" novamente
```

### Emulador não aparece
```bash
Solução:
1. Abra Device Manager
2. Verifique se tem algum emulador criado
3. Se não tiver, crie um novo
4. Inicie ele ANTES de clicar Run
```

### App não abre no emulador
```bash
Solução:
1. Abra Logcat (View → Tool Windows → Logcat)
2. Procure por "ERROR" (erro)
3. Se disser API_KEY, verifique:
   - .env.local tem GEMINI_API_KEY?
   - npm run build executou?
   - npx cap sync android executou?
```

---

## 📱 Testar no Celular Real

Se quiser testar em um celular real ao invés de emulador:

1. **Ativa USB Debug no celular**
   - Configurações → Sobre o telefone → Toque 7x em "Build number"
   - Volte e abra "Opções de desenvolvedor"
   - Ativa "USB Debug"

2. **Conecta ao PC via USB**

3. **Android Studio detecta automaticamente**

4. **Clica Run** - instala no celular real

---

## 🎊 Parabéns!

Você conseguiu emular o **Nossa Loto** no Android Studio!

Agora pode:
- ✅ Testar todas as funcionalidades
- ✅ Ver logs em tempo real
- ✅ Debugar problemas
- ✅ Fazer mudanças no código e reload

---

## 📚 Próximas Leituras

- `QUICK_START_ANDROID.md` - Guia rápido
- `README_ANDROID_SETUP.md` - Resumo geral
- `CHECKLIST_ANDROID.md` - Checklist de configuração

---

**Boa sorte! 🚀**
