# 🩷 MoodTracker

> Une application de suivi émotionnel, conçue avec amour pour accompagner les personnes vivant avec un trouble bipolaire.

**[→ Voir l'application](https://florentdesmarets.github.io/moodtracker/)**

---

## 💡 Pourquoi ce projet ?

J'ai créé MoodTracker pour ma compagne, qui vit avec un trouble bipolaire. Suivre ses émotions au quotidien l'aide à mieux se connaître, à anticiper les crises, et à partager un historique concret avec son médecin.

Ce n'est pas une startup. C'est un projet personnel, fait avec soin, proposé gratuitement à toute personne qui pourrait en avoir besoin.

---

## ✨ Fonctionnalités

### 📊 Suivi quotidien
- Sélection de l'humeur via 7 emojis (du plus difficile au plus heureux)
- Journal libre avec tags prédéfinis (activités, ressentis)
- Suivi du sommeil chaque jour

### 📅 Historique
- Calendrier mensuel coloré selon l'humeur
- Modification d'une entrée passée directement depuis le calendrier

### 📈 Statistiques & graphiques
- Vue hebdomadaire (semaine calendaire lun → dim)
- Graphique mensuel humeur + sommeil croisés
- Corrélation sommeil / humeur
- Streak, jours suivis, humeur fréquente, % positifs

### 🏆 Badges & avatars
- Système de progression (débutant → légende)
- Avatars débloquables selon les badges obtenus
- Partage d'un badge via le Web Share API

### 🆘 Mode crise
- Numéros d'urgence accessibles en un clic (3114, 15, 17, 112)
- Contact de confiance personnel enregistré dans le compte
- Liens vers des ressources officielles (psycom.org, 3114.fr…)

### 🎨 Personnalisation
- 8 thèmes de couleurs (Coucher de soleil, Lavande, Océan, Rose, Forêt, Nuit, Aurore boréale, Pêche dorée)
- Interface disponible en **français** et **anglais**

### 📄 Export
- Rapport mensuel PDF — humeur & sommeil croisés sur un graphique, adapté pour un suivi médical

### 🔔 Notifications
- Rappel quotidien à l'heure choisie (PWA, Android & iOS 16.4+)

### 📱 PWA
- Installable sur l'écran d'accueil (Android & iOS)
- Fonctionne hors-ligne (cache service worker)

---

## 🛠 Stack technique

| Technologie | Usage |
|---|---|
| [React 19](https://react.dev) | Interface utilisateur |
| [Vite 8](https://vitejs.dev) | Build & dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Styles |
| [React Router v7](https://reactrouter.com) | Navigation |
| [Supabase](https://supabase.com) | Auth, base de données, RLS |

---

## 🚀 Lancer le projet en local

### Prérequis
- Node.js 18+
- Un projet Supabase avec les tables `profiles` et `moods`

### Installation

```bash
git clone https://github.com/florentdesmarets/moodtracker.git
cd moodtracker
npm install
```

Crée un fichier `.env.local` :

```env
VITE_SUPABASE_URL=ta_url_supabase
VITE_SUPABASE_ANON_KEY=ta_cle_anon
```

Lance le serveur de développement :

```bash
npm run dev
```

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
| commentaire | text | Texte libre / tags |
| sommeil | float | Heures de sommeil |

---

## 📦 Déploiement (GitHub Pages)

Le déploiement est automatisé via GitHub Actions à chaque push sur `main`.

**Secrets GitHub requis** (`Settings → Secrets → Actions`) :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Activer GitHub Pages** : `Settings → Pages → Source → GitHub Actions`

---

## 🙏 À propos

Fait avec ❤️ par **Florent Desmarets** — projet non lucratif, open source.

Si cette application t'aide, toi ou un proche, c'est tout ce qui compte.

> *"Tu n'as pas à aller bien tout le temps."*
