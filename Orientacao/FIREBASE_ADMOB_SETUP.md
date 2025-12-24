# 🔧 Configuração Firebase e AdMob com Capacitor

## 📱 Projeto: Nossa Loto
- **Package ID:** `com.companyname.appjogosloteria`
- **App Name:** Nossa Loto: Resultados e IA
- **Versão:** 2.0.9

---

## 1️⃣ Configurar Firebase

### Passo 1.1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em **"Criar um novo projeto"**
3. **Nome do projeto:** `Nossa Loto`
4. Desmarque **"Ativar Google Analytics"** (opcional)
5. Clique em **"Criar projeto"**

### Passo 1.2: Registrar Aplicativo Android

1. No Firebase Console, clique em **"Adicionar app"** → **Android**
2. Preencha:
   - **Nome do pacote Android:** `com.companyname.appjogosloteria`
   - **Apelido do app:** `Nossa Loto Android`
   - **SHA-1:** (deixe em branco por enquanto, opcional)
3. Clique em **"Registrar app"**

### Passo 1.3: Baixar google-services.json

1. Clique em **"Baixar google-services.json"**
2. Salve o arquivo em: `android/app/google-services.json`
3. Clique em **"Avançar"** (as instruções são para Android nativo, mas usamos Capacitor)

### Passo 1.4: Instalar Plugins Firebase do Capacitor

```bash
# Navegar para o projeto raiz
cd C:\Users\luiz.b\Desktop\nossa-loto

# Instalar plugins Firebase
npm install @capacitor-firebase/core
npm install @capacitor-firebase/analytics
npm install @capacitor-firebase/messaging
npm install @capacitor-firebase/crashlytics
npm install @capacitor-firebase/authentication

# Sincronizar com Android
npx cap sync android
```

### Passo 1.5: Ativar Serviços no Firebase

1. No Firebase Console, clique em **"Compilação"** (lado esquerdo)
2. Ative os serviços necessários:
   - ✅ **Authentication** (se usar login)
   - ✅ **Cloud Messaging** (notificações push)
   - ✅ **Firestore Database** (banco de dados)
   - ✅ **Analytics** (rastreamento de eventos)
   - ✅ **Crashlytics** (relatórios de erro)

### Passo 1.6: Configurar Cloud Messaging (FCM)

1. Vá em **Compilação** → **Cloud Messaging**
2. Clique em **"Criar credencial de serviço"**
3. Crie uma chave privada JSON para o seu servidor
4. Guarde este arquivo com segurança (você usará para enviar notificações)

---

## 2️⃣ Integrar Firebase no Código React

### Passo 2.1: Criar Arquivo de Inicialização Firebase

Crie `src/firebase.config.ts`:

```typescript
// src/firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Copie suas configurações do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "sua-loto.firebaseapp.com",
  projectId: "sua-loto",
  storageBucket: "sua-loto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
```

**Para obter essas credenciais:**
1. Firebase Console → Engrenagem (⚙️) → **Configurações do projeto**
2. Abas: **Geral** → **Aplicativos web**
3. Copie o objeto de configuração

### Passo 2.2: Inicializar Firebase no App.tsx

```typescript
// src/App.tsx
import './firebase.config'; // Importar no início

import React from 'react';
import GameGenerator from './components/GameGenerator';
import GuruAI from './components/GuruAI';
import SavedGames from './components/SavedGames';
import Settings from './components/Settings';

function App() {
  // Seu código existente
  return (
    // ... seu JSX
  );
}

export default App;
```

### Passo 2.3: Usar Firestore para Salvar Dados

```typescript
// src/services/firebaseService.ts
import { db } from '../firebase.config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export const saveLotteryDraw = async (userId: string, drawData: any) => {
  try {
    const docRef = await addDoc(collection(db, "draws"), {
      userId,
      ...drawData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar:", error);
    throw error;
  }
};

export const getUserDraws = async (userId: string) => {
  try {
    const q = query(collection(db, "draws"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao buscar:", error);
    throw error;
  }
};
```

### Passo 2.4: Ativar Notificações Push

```typescript
// src/services/firebaseMessaging.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { CapacitorFirebaseMessaging } from '@capacitor-firebase/messaging';

export const initializeMessaging = async () => {
  try {
    // Registrar notificações push
    await PushNotifications.requestPermissions();
    await PushNotifications.register();

    // Inicializar Firebase Messaging
    const fcmToken = await CapacitorFirebaseMessaging.getToken();
    console.log('FCM Token:', fcmToken);

    // Ouvir mensagens recebidas
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notificação recebida:', notification);
      // Processar notificação
    });

    // Ouvir cliques em notificações
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Notificação clicada:', notification);
      // Navegar para a tela apropriada
    });
  } catch (error) {
    console.error('Erro ao inicializar mensagens:', error);
  }
};
```

---

## 3️⃣ Configurar Google AdMob

### Passo 3.1: Criar Conta no Google AdMob

1. Acesse [Google AdMob](https://admob.google.com)
2. Clique em **"Começar"** ou **"Fazer login"**
3. Siga as instruções para criar uma conta
4. Complete o perfil com informações de pagamento

### Passo 3.2: Registrar Aplicativo

1. No AdMob, clique em **"Apps"** → **"Adicionar app"**
2. Clique em **"Android"**
3. Preencha:
   - **Nome do app:** `Nossa Loto`
   - **Categoria:** `Jogos`
4. Clique em **"Criar"**

### Passo 3.3: Criar Unidades Publicitárias

No seu app no AdMob, clique em **"Unidades publicitárias"** → **"Criar unidade publicitária"**

Crie as seguintes unidades:

#### 🔹 Banner
- **Nome:** `nossa_loto_banner`
- **Tipo:** Banner
- Salve o **ID: `ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy`**

#### 🔹 Intersticial
- **Nome:** `nossa_loto_intersticial`
- **Tipo:** Anúncio intersticial
- Salve o **ID**

#### 🔹 Rewarded (Vídeo com Recompensa)
- **Nome:** `nossa_loto_rewarded`
- **Tipo:** Anúncio rewarded
- Salve o **ID**

#### 🔹 App ID (Importante!)
- Na seção **"Informações do app"**, você verá um **ID do app**: `ca-app-pub-xxxxxxxxxxxxxxxx~zzzzzzzzzz`
- Guarde este ID

### Passo 3.4: Instalar Plugin AdMob do Capacitor

```bash
npm install @capacitor-community/admob
npx cap sync android
```

### Passo 3.5: Atualizar Arquivo de Tipos (types.ts)

```typescript
// src/types.ts
export const ADMOB_CONFIG = {
  appId: 'ca-app-pub-xxxxxxxxxxxxxxxx~zzzzzzzzzz', // Seu App ID
  bannerAdId: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy', // Banner ID
  intersticialAdId: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy', // Intersticial ID
  rewardedAdId: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy', // Rewarded ID
};

// Para testes, use IDs de teste do Google:
// AppId: ca-app-pub-3940256099942544~3347511713
// Banner: ca-app-pub-3940256099942544/6300978111
// Intersticial: ca-app-pub-3940256099942544/1033173712
// Rewarded: ca-app-pub-3940256099942544/5224354917
```

### Passo 3.6: Criar Serviço de AdMob

```typescript
// src/services/adService.ts
import { AdMob } from '@capacitor-community/admob';
import { ADMOB_CONFIG } from '../types';

// Inicializar
export const initializeAdMob = async () => {
  try {
    await AdMob.initialize({
      requestConfiguration: {
        keywords: ["jogos", "loteria", "IA"],
        contentUrl: "https://seudominio.com",
        childDirected: false,
        tagForUnderAgeOfConsent: false,
      },
    });
    console.log('AdMob inicializado');
  } catch (error) {
    console.error('Erro ao inicializar AdMob:', error);
  }
};

// Carregar Banner
export const loadBannerAd = async () => {
  try {
    await AdMob.loadBanner({
      adId: ADMOB_CONFIG.bannerAdId,
      isTesting: false, // Mude para true durante desenvolvimento
      position: 'BOTTOM',
      size: 'SMART_BANNER',
    });
    await AdMob.showBanner();
  } catch (error) {
    console.error('Erro ao carregar banner:', error);
  }
};

// Carregar Intersticial
export const loadInterstitialAd = async () => {
  try {
    await AdMob.loadInterstitialAd({
      adId: ADMOB_CONFIG.intersticialAdId,
      isTesting: false,
    });
  } catch (error) {
    console.error('Erro ao carregar intersticial:', error);
  }
};

export const showInterstitialAd = async () => {
  try {
    await AdMob.showInterstitialAd();
    // Recarregar para próxima exibição
    await loadInterstitialAd();
  } catch (error) {
    console.error('Erro ao exibir intersticial:', error);
  }
};

// Carregar Rewarded Video
export const loadRewardedAd = async () => {
  try {
    await AdMob.loadRewardedVideoAd({
      adId: ADMOB_CONFIG.rewardedAdId,
      isTesting: false,
    });
  } catch (error) {
    console.error('Erro ao carregar rewarded:', error);
  }
};

export const showRewardedAd = async () => {
  try {
    const result = await AdMob.showRewardedVideoAd();
    if (result.rewarded) {
      console.log('Recompensa concedida!');
      // Dar recompensa ao usuário
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao exibir rewarded:', error);
    return false;
  }
};
```

### Passo 3.7: Usar AdMob no Componente

```typescript
// src/components/GameGenerator.tsx
import React, { useEffect } from 'react';
import { loadBannerAd, showInterstitialAd } from '../services/adService';

export default function GameGenerator() {
  useEffect(() => {
    // Carregar banner ao abrir o componente
    loadBannerAd();
  }, []);

  const handleGenerateGame = async () => {
    // Gerar jogo
    // ...

    // Mostrar intersticial a cada 3 jogos gerados
    await showInterstitialAd();
  };

  return (
    <div>
      {/* Seu conteúdo */}
    </div>
  );
}
```

---

## 4️⃣ Atualizar capacitor.config.json

```json
{
  "appId": "com.companyname.appjogosloteria",
  "appName": "Nossa Loto",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "FirebaseAnalytics": {
      "skipNativeDependencyEvent": "false"
    },
    "FirebaseMessaging": {
      "senderId": "seu_sender_id_aqui"
    },
    "AdMob": {
      "appId": "ca-app-pub-xxxxxxxxxxxxxxxx~zzzzzzzzzz"
    }
  },
  "android": {
    "minVersion": 26,
    "compileSdkVersion": 34,
    "targetSdkVersion": 34
  }
}
```

**Para encontrar o Sender ID:**
- Firebase Console → Engrenagem (⚙️) → **Configurações do projeto**
- Aba **Cloud Messaging** → copie o **ID do Remetente**

---

## 5️⃣ Compilar e Testar

### Passo 5.1: Compilar a Aplicação React

```bash
cd C:\Users\luiz.b\Desktop\nossa-loto
npm run build
```

### Passo 5.2: Sincronizar com Android

```bash
npx cap sync android
```

### Passo 5.3: Abrir no Android Studio

```bash
npx cap open android
```

### Passo 5.4: Executar no Emulador

1. Android Studio → **Device Manager** → Selecione um emulador
2. Clique **Play** para iniciar
3. No Android Studio → **Run** → **Run 'app'**
4. Selecione o emulador e clique **OK**

---

## 6️⃣ Usar IDs de Teste (Durante Desenvolvimento)

### Firebase (Obrigatório)
O Firebase Console fornecerá um `google-services.json` para desenvolvimento.

### AdMob (Recomendado)
Use estes IDs durante o desenvolvimento para evitar conta suspensa:

```typescript
export const ADMOB_CONFIG = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  bannerAdId: 'ca-app-pub-3940256099942544/6300978111',
  intersticialAdId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedAdId: 'ca-app-pub-3940256099942544/5224354917',
};
```

⚠️ **Importante:** Não exiba anúncios reais com IDs de teste. Isso pode resultar em suspensão da conta.

---

## 7️⃣ Checklist Final

- [ ] Projeto Firebase criado
- [ ] google-services.json baixado e copiado para `android/app/`
- [ ] Plugins Firebase instalados (`npm install @capacitor-firebase/*`)
- [ ] Firebase inicializado em `src/firebase.config.ts`
- [ ] Serviços Firebase criados (authentication, messaging, etc)
- [ ] Conta AdMob criada
- [ ] Unidades publicitárias criadas
- [ ] IDs do AdMob atualizados em `types.ts`
- [ ] Plugin AdMob instalado (`npm install @capacitor-community/admob`)
- [ ] Serviço AdMob criado
- [ ] `capacitor.config.json` atualizado
- [ ] Aplicação compilada (`npm run build`)
- [ ] Projeto sincronizado (`npx cap sync android`)
- [ ] Testado no emulador

---

## 🆘 Troubleshooting

### Firebase não inicializa
- ✓ Verifique se `google-services.json` está em `android/app/`
- ✓ Confirme as configurações em `src/firebase.config.ts`
- ✓ Execute `npx cap sync android` novamente

### AdMob mostra erro
- ✓ Use IDs de teste durante desenvolvimento
- ✓ Verifique se o plugin foi instalado: `npm list @capacitor-community/admob`
- ✓ Confirme `capacitor.config.json` está correto

### Notificações push não funcionam
- ✓ Ative Cloud Messaging no Firebase Console
- ✓ Copie corretamente o `Sender ID`
- ✓ Verificar permissões no `AndroidManifest.xml`

---

## 📚 Referências

- [Firebase Console](https://console.firebase.google.com)
- [Google AdMob](https://admob.google.com)
- [Capacitor Firebase Plugin](https://github.com/capawesome-team/capacitor-firebase)
- [Capacitor AdMob Plugin](https://github.com/capacitor-community/admob)
- [Firebase JS SDK](https://firebase.google.com/docs/web/setup)

---

**Criado em:** 22 de dezembro de 2025  
**Versão:** 1.0  
**Aplicação:** Nossa Loto - Resultados e IA
