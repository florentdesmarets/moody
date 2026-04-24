# 🩷 Moody — Emotional Wellness Journal

> A compassionate emotional tracking app designed to help you understand yourself better, day after day.

**[→ Open the app](https://www.moodyapp.fr/)**

🇫🇷 [Lire en français](#-moody--journal-émotionnel-bienveillant)

---

> ⚕️ **Medical disclaimer** — Moody is a personal emotional tracking tool. It does not replace the advice of a doctor, psychologist or any other healthcare professional. If you are in distress, please contact a qualified professional.

---

## 💡 Why this project?

I built Moody for someone very dear to me. She lives with bipolar disorder, and tracking her emotions daily helps her understand herself better, anticipate difficult periods, and share a concrete history with her doctor.

This is not a startup. It's a personal project, built with care, offered for free to anyone who might need it.

---

## ✨ Features

### 📊 Daily tracking
- Mood selection via 7 emojis (from hardest to happiest)
- If already logged today: shows a **recap card** (emoji, mood level, sleep/food/energy badges, tags) with options to view the calendar or redo the entry
- Last 7 days visible on the home screen (colored dots + "Today" label + streak 🔥)
- Positive mode for mixed-polarity days
- Free journal with predefined tags (30 activities & feelings)
- Sleep, nutrition and energy tracking

### 📅 History
- Monthly calendar color-coded by mood
- Edit any past entry directly from the calendar

### 📈 Stats & charts
- Monthly mood + sleep overlay chart
- Activity/mood correlation: what helps, what affects, comfort activities
- **Smart tag classification**: inherently negative states (Anxious, Cried, Stressful day, Drank alcohol…) are always placed in "What affects you" regardless of statistical correlation
- Streak, days tracked, top mood, % positive days

### 🏆 Badges & avatars
- Progression system (beginner → legend)
- Unlockable avatars based on earned badges
- Badge sharing via generated image (canvas + Web Share API)

### 💬 Supportive chatbot
- Conversational assistant with themed advice cards
- Proactive detection of negative tags from the day (stress, sadness, fatigue…)
- Automatic suggestion of relevant cards with yes/no confirmation
- Link to guided meditations when a relevant topic is detected

### 🎧 Guided meditations
- 5 short meditations (2–5 min) built into the PWA — no streaming, no external API
- Heart coherence, body scan, 5-4-3-2-1 grounding, sleep relaxation, gratitude
- Voice synthesis (Web Speech API) with automatic best-voice selection
- Manual voice picker with quality indicator
- Breathing tones (Web Audio API) synced with breath cycles
- Animated breathing circle (inhale / exhale)

### 🆘 Crisis mode
- Emergency numbers accessible in one tap (3114, 15, 17, 112)
- Breathing exercise (heart coherence 5s/5s)
- Guided sensory grounding (5-4-3-2-1)
- Personal trusted contact

### 🎨 Customisation
- 8 color themes (with dynamic PWA `theme-color` update)
- Adjustable text size (Small / Normal / Large / Extra large)
- Available in **French** and **English** (preference saved to profile)
- Desktop version with animated decorative blobs

### 📄 Export
- Monthly PDF report with charts and activity correlation analysis

### 🔔 Web Push notifications
- Real push notifications via the **VAPID / Web Push protocol** — work even when the app is closed
- Device subscription stored in Supabase (`push_subscriptions` table)
- Daily reminder sent by a **Supabase Edge Function** (Deno), triggered every minute by cron-job.org
- Notification language (FR/EN) follows the user's profile preference
- Expired subscriptions (410 / 404) automatically cleaned up
- Fallback: SW timer for desktop (open tab)

### 📱 PWA
- Installable on home screen (Android & iOS)
- Works offline (service worker cache)
- iOS install banner with step-by-step guide

### 🔐 Authentication
- Secure registration: math captcha, honeypot, minimum delay, lockout after 3 attempts
- Mandatory email confirmation
- Login / logout
- Forgot password with reset link
- Full account deletion (data + profile + auth)

### 💌 Contact & admin
- Users can send a message (Support / Suggestion / Bug) from the About page — stored directly in Supabase
- **Admin interface** (`/admin`) accessible only with the admin account:
  - **Messages tab**: inbox with type filters, mark read/unread, expand, delete
  - **Stats tab**: 8 KPI cards (total users, new today, DAU, WAU, total moods, avg mood 30d, push subscribers, messages), 7-day DAU bar chart, weekly retention %, FR/EN language split

---

## 🛠 Tech stack

| Technology | Usage |
|---|---|
| [React 19](https://react.dev) | UI |
| [Vite 8](https://vitejs.dev) | Build & dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Styles |
| [React Router v7](https://reactrouter.com) | Routing |
| [Supabase](https://supabase.com) | Auth, database, RLS, Edge Functions |
| [web-push](https://www.npmjs.com/package/web-push) | VAPID push notifications (Edge Function) |
| [cron-job.org](https://cron-job.org) | Cron trigger for push Edge Function (every minute) |
| [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) | Voice synthesis for meditations |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Breathing tones |

---

## 🚀 Running locally

### Prerequisites
- Node.js 18+
- A Supabase project with the tables described below

### Setup

```bash
git clone https://github.com/florentdesmarets/moody.git
cd moody
npm install
```

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

Start the dev server:

```bash
npm run dev
```

App available at **http://localhost:5173/**

---

## 🌿 Branches

| Branch | Role |
|---|---|
| `main` | Production — deployed at [www.moodyapp.fr](https://www.moodyapp.fr) |
| `dev` | Development — tests and new features |

Merges from `dev` to `main` automatically trigger deployment via GitHub Actions.

---

## 🗄 Supabase schema

### `profiles` table
| Column | Type | Description |
|---|---|---|
| id | uuid | Linked to `auth.users` |
| prenom | text | User's first name |
| langue | text | `fr` or `en` |
| avatar | text | Active badge avatar ID |
| theme | text | Chosen color theme |
| notif_active | boolean | Daily reminder enabled |
| reminder_time | text | Reminder time (e.g. `20:00`) |
| contact_urgence_nom | text | Trusted contact name |
| contact_urgence_tel | text | Trusted contact phone |

### `moods` table
| Column | Type | Description |
|---|---|---|
| id | uuid | |
| user_id | uuid | Linked to `auth.users` |
| date | date | Entry date |
| niveau | int | Mood level 1–7 |
| emoji | text | Corresponding emoji |
| commentaire | text | Activity tags (`, ` separated) |
| sommeil | float | Hours of sleep |
| nourriture | int | Nutrition 1–3 |
| fatigue | int | Energy level 1–3 |
| note | text | Free-text note |

### `push_subscriptions` table
| Column | Type | Description |
|---|---|---|
| id | uuid | |
| user_id | uuid | Linked to `profiles` (ON DELETE CASCADE) |
| endpoint | text | Push endpoint URL |
| p256dh | text | VAPID encryption key |
| auth | text | Auth secret |
| utc_offset | int | Timezone offset in minutes (positive-east) |

### `messages` table
| Column | Type | Description |
|---|---|---|
| id | uuid | |
| created_at | timestamptz | Submission timestamp |
| user_id | uuid | Linked to `profiles` (nullable) |
| user_email | text | Sender email (nullable) |
| type | text | `support`, `suggest` or `bug` |
| body | text | Message content |
| read | boolean | Read status (admin use) |

---

## ⚙️ Supabase Edge Function — `send-daily-push`

Located in `supabase/functions/send-daily-push/index.ts`.

Triggered every minute by cron-job.org. For each active subscription whose `reminder_time` (adjusted by `utc_offset`) matches the current UTC minute, it sends a push notification in the user's language (FR/EN).

**Required Supabase secrets:**
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`

**cron-job.org setup:**
- URL: `https://<project-ref>.supabase.co/functions/v1/send-daily-push`
- Schedule: every minute
- Header: `Authorization: Bearer <service_role_legacy_key>`
- JWT verification: **disabled** in Edge Function settings

---

## 📦 Deployment (GitHub Pages + custom domain)

Deployment is automated via GitHub Actions on every push to `main`.

The app is served at **[www.moodyapp.fr](https://www.moodyapp.fr)** via GitHub Pages with a custom OVH domain.

**Required GitHub secrets** (`Settings → Secrets → Actions`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_VAPID_PUBLIC_KEY`

**Supabase URL configuration**:
- Site URL: `https://www.moodyapp.fr/`
- Redirect URLs: `https://www.moodyapp.fr/**`

---

## 💙 Support the project

Moody is free and open-source. If the app helps you and you'd like to contribute to hosting costs:

👉 [Buy Me a Coffee ☕](https://buymeacoffee.com/florent.d)

---

## 📲 Share the app

If you think Moody could help someone around you, feel free to share it!

**https://www.moodyapp.fr/**

---

## 🙏 About

Made with ❤️ by **Florent Desmarets** — non-profit, open source.

If this app helps even one person, that's all that matters.

> *"You don't have to be okay all the time."*

---
---

# 🩷 Moody — Journal émotionnel bienveillant

> Une application de suivi émotionnel bienveillante, conçue pour aider à mieux se comprendre au quotidien.

**[→ Voir l'application](https://www.moodyapp.fr/)**

🇬🇧 [Read in English](#-moody--emotional-wellness-journal)

---

> ⚕️ **Avertissement médical** — Moody est un outil de suivi émotionnel personnel. Il ne remplace en aucun cas l'avis d'un médecin, d'un psychologue ou de tout autre professionnel de santé. En cas de détresse, contacte un professionnel qualifié.

---

## 💡 Pourquoi ce projet ?

J'ai créé Moody pour une personne qui m'est chère. Suivre ses émotions au quotidien l'aide à mieux se connaître, à anticiper les moments difficiles, et à partager un historique concret avec son médecin.

Ce n'est pas une startup. C'est un projet personnel, fait avec soin, proposé gratuitement à toute personne qui pourrait en avoir besoin.

---

## ✨ Fonctionnalités

### 📊 Suivi quotidien
- Sélection de l'humeur via 7 emojis (du plus difficile au plus heureux)
- Si déjà renseigné aujourd'hui : affichage d'une **carte récap** (emoji, niveau, badges sommeil/alimentation/énergie, tags) avec accès au calendrier ou possibilité de refaire l'entrée
- Historique des 7 derniers jours (dots colorés + "Auj." pour le jour courant + streak 🔥)
- Mode positif pour les jours à polarité mixte
- Journal libre avec tags prédéfinis (30 activités & ressentis)
- Suivi du sommeil, de l'alimentation et de l'énergie

### 📅 Historique
- Calendrier mensuel coloré selon l'humeur
- Modification d'une entrée passée directement depuis le calendrier

### 📈 Statistiques & graphiques
- Graphique mensuel humeur + sommeil croisés
- Corrélation activités / humeur : ce qui aide, ce qui affecte, activités de réconfort
- **Classification intelligente des tags** : les états négatifs par nature (Anxieux·se, Pleuré·e, Journée stressante, Bu de l'alcool…) sont toujours placés dans "CE QUI T'AFFECTE" quelle que soit la corrélation statistique
- Streak, jours suivis, humeur fréquente, % positifs

### 🏆 Badges & avatars
- Système de progression (débutant → légende)
- Avatars débloquables selon les badges obtenus
- Partage d'un badge via une image générée (canvas + Web Share API)

### 💬 Chatbot bienveillant
- Assistant conversationnel avec fiches de conseils thématiques
- Détection proactive des tags négatifs du jour (stress, tristesse, fatigue…)
- Proposition automatique de fiches adaptées avec confirmation oui/non
- Lien vers les méditations guidées si un thème le nécessite

### 🎧 Méditations guidées
- 5 méditations courtes (2–5 min) intégrées dans le PWA, sans streaming ni API externe
- Cohérence cardiaque, scan corporel, ancrage 5-4-3-2-1, endormissement, gratitude
- Synthèse vocale (Web Speech API) avec sélection automatique de la meilleure voix disponible
- Sélecteur de voix manuel avec indicateur de qualité
- Tonalités de respiration (Web Audio API) synchronisées avec les cycles
- Cercle de respiration animé (inspiration / expiration)

### 🆘 Mode crise
- Numéros d'urgence accessibles en un clic (3114, 15, 17, 112)
- Exercice de respiration (cohérence cardiaque 5s/5s)
- Ancrage sensoriel guidé (5-4-3-2-1)
- Contact de confiance personnel

### 🎨 Personnalisation
- 8 thèmes de couleurs (avec mise à jour dynamique de la `theme-color` PWA)
- Taille du texte réglable (Petit / Normal / Grand / Très grand)
- Interface disponible en **français** et **anglais** (préférence sauvegardée dans le profil)
- Version desktop avec bulles décoratives animées

### 📄 Export
- Rapport mensuel PDF avec graphiques et analyse des activités

### 🔔 Notifications Web Push
- Vraies notifications push via le protocole **VAPID / Web Push** — fonctionnent même si l'appli est fermée
- Souscription de l'appareil stockée dans Supabase (table `push_subscriptions`)
- Rappel quotidien envoyé par une **Supabase Edge Function** (Deno), déclenchée chaque minute par cron-job.org
- La langue de la notification (FR/EN) suit la préférence du profil utilisateur
- Abonnements expirés (410 / 404) nettoyés automatiquement
- Fallback : timer SW pour le bureau (onglet ouvert)

### 📱 PWA
- Installable sur l'écran d'accueil (Android & iOS)
- Fonctionne hors-ligne (cache service worker)
- Bannière d'installation iOS avec guide pas à pas

### 🔐 Authentification
- Inscription sécurisée : captcha mathématique, honeypot, délai minimum, blocage après 3 tentatives
- Confirmation par email obligatoire
- Connexion / déconnexion
- Mot de passe oublié avec lien de réinitialisation
- Suppression de compte complète (données + profil + auth)

### 💌 Messagerie & espace admin
- Les utilisateurs peuvent envoyer un message (Soutien / Suggestion / Bug) depuis la page À propos — stocké directement dans Supabase (fini le mailto)
- **Interface admin** (`/admin`) accessible uniquement avec le compte admin :
  - **Onglet Messages** : boîte de réception avec filtres par type, marquer lu/non lu, développer, supprimer
  - **Onglet Stats** : 8 cartes KPI (utilisateurs total, nouveaux auj., actifs auj./7j, humeurs totales, humeur moy. 30j, abonnés push, messages reçus), graphique DAU 7 jours, rétention hebdo %, répartition langues FR/EN

---

## 🛠 Stack technique

| Technologie | Usage |
|---|---|
| [React 19](https://react.dev) | Interface utilisateur |
| [Vite 8](https://vitejs.dev) | Build & dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Styles |
| [React Router v7](https://reactrouter.com) | Navigation |
| [Supabase](https://supabase.com) | Auth, base de données, RLS, Edge Functions |
| [web-push](https://www.npmjs.com/package/web-push) | Notifications push VAPID (Edge Function) |
| [cron-job.org](https://cron-job.org) | Déclencheur cron de l'Edge Function (toutes les minutes) |
| [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) | Synthèse vocale pour les méditations |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Tonalités de respiration |

---

## 🚀 Lancer le projet en local

### Prérequis
- Node.js 18+
- Un projet Supabase avec les tables décrites ci-dessous

### Installation

```bash
git clone https://github.com/florentdesmarets/moody.git
cd moody
npm install
```

Crée un fichier `.env.local` :

```env
VITE_SUPABASE_URL=ta_url_supabase
VITE_SUPABASE_ANON_KEY=ta_cle_anon
VITE_VAPID_PUBLIC_KEY=ta_cle_vapid_publique
```

Lance le serveur de développement :

```bash
npm run dev
```

L'app est disponible sur **http://localhost:5173/**

---

## 🌿 Branches

| Branche | Rôle |
|---|---|
| `main` | Production — déployée sur [www.moodyapp.fr](https://www.moodyapp.fr) |
| `dev` | Développement — tests et nouvelles fonctionnalités |

Les merges de `dev` vers `main` déclenchent automatiquement le déploiement via GitHub Actions.

---

## 🗄 Structure Supabase

### Table `profiles`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | Lié à `auth.users` |
| prenom | text | Prénom de l'utilisateur |
| langue | text | `fr` ou `en` |
| avatar | text | ID du badge avatar actif |
| theme | text | Thème de couleur choisi |
| notif_active | boolean | Rappel quotidien activé |
| reminder_time | text | Heure du rappel (ex: `20:00`) |
| contact_urgence_nom | text | Nom du contact de confiance |
| contact_urgence_tel | text | Téléphone du contact de confiance |

### Table `moods`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | |
| user_id | uuid | Lié à `auth.users` |
| date | date | Date de l'entrée |
| niveau | int | Humeur de 1 à 7 |
| emoji | text | Emoji correspondant |
| commentaire | text | Tags activités (séparés par `, `) |
| sommeil | float | Heures de sommeil |
| nourriture | int | Alimentation 1–3 |
| fatigue | int | Énergie 1–3 |
| note | text | Note libre |

### Table `push_subscriptions`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | |
| user_id | uuid | Lié à `profiles` (ON DELETE CASCADE) |
| endpoint | text | URL du point d'accès push |
| p256dh | text | Clé de chiffrement VAPID |
| auth | text | Secret d'authentification |
| utc_offset | int | Décalage UTC en minutes (positif-est) |

### Table `messages`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | |
| created_at | timestamptz | Date d'envoi |
| user_id | uuid | Lié à `profiles` (nullable) |
| user_email | text | Email de l'expéditeur (nullable) |
| type | text | `support`, `suggest` ou `bug` |
| body | text | Contenu du message |
| read | boolean | Statut lu (usage admin) |

---

## ⚙️ Supabase Edge Function — `send-daily-push`

Fichier : `supabase/functions/send-daily-push/index.ts`

Déclenchée chaque minute par cron-job.org. Pour chaque abonnement actif dont le `reminder_time` (ajusté par `utc_offset`) correspond à la minute UTC courante, elle envoie une notification push dans la langue du profil utilisateur (FR/EN).

**Secrets Supabase requis :**
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`

**Configuration cron-job.org :**
- URL : `https://<project-ref>.supabase.co/functions/v1/send-daily-push`
- Fréquence : toutes les minutes
- Header : `Authorization: Bearer <clé_service_role_legacy>`
- Vérification JWT : **désactivée** dans les paramètres de l'Edge Function

---

## 📦 Déploiement (GitHub Pages + domaine custom)

Le déploiement est automatisé via GitHub Actions à chaque push sur `main`.

L'app est servie sur **[www.moodyapp.fr](https://www.moodyapp.fr)** via GitHub Pages avec domaine custom OVH.

**Secrets GitHub requis** (`Settings → Secrets → Actions`) :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_VAPID_PUBLIC_KEY`

**Supabase URL Configuration** :
- Site URL : `https://www.moodyapp.fr/`
- Redirect URLs : `https://www.moodyapp.fr/**`

---

## 💙 Soutenir le projet

Moody est gratuit et open-source. Si l'app t'aide et que tu souhaites participer aux frais d'hébergement :

👉 [Buy Me a Coffee ☕](https://buymeacoffee.com/florent.d)

---

## 📲 Partager l'app

Si tu penses que Moody peut aider quelqu'un autour de toi, n'hésite pas à le partager !

**https://www.moodyapp.fr/**

---

## 🙏 À propos

Fait avec ❤️ par **Florent Desmarets** — projet non lucratif, open source.

Si cette application aide ne serait-ce qu'une personne, c'est tout ce qui compte.

> *"Tu n'as pas à aller bien tout le temps."*
