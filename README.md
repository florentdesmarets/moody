# 🩷 Moody — Journal émotionnel bienveillant

> Une application de suivi émotionnel bienveillante, conçue pour aider à mieux se comprendre au quotidien.

**[→ Voir l'application](https://florentdesmarets.github.io/moodtracker/)**

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
- Mode positif pour les jours à polarité mixte
- Journal libre avec tags prédéfinis (30 activités & ressentis)
- Suivi du sommeil, de l'alimentation et de l'énergie

### 📅 Historique
- Calendrier mensuel coloré selon l'humeur
- Modification d'une entrée passée directement depuis le calendrier

### 📈 Statistiques & graphiques
- Graphique mensuel humeur + sommeil croisés
- Corrélation activités / humeur : ce qui aide, ce qui affecte, activités de réconfort
- Streak, jours suivis, humeur fréquente, % positifs

### 🏆 Badges & avatars
- Système de progression (débutant → légende)
- Avatars débloquables selon les badges obtenus
- Partage d'un badge via une image générée (canvas + Web Share API)

### 🆘 Mode crise
- Numéros d'urgence accessibles en un clic (3114, 15, 17, 112)
- Exercice de respiration (cohérence cardiaque 5s/5s)
- Ancrage sensoriel guidé (5-4-3-2-1)
- Contact de confiance personnel

### 🎨 Personnalisation
- 8 thèmes de couleurs
- Interface disponible en **français** et **anglais**
- Version desktop avec panneau décoratif

### 📄 Export
- Rapport mensuel PDF avec graphiques et analyse des activités

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
| commentaire | text | Tags activités (séparés par `, `) |
| sommeil | float | Heures de sommeil |
| nourriture | int | Alimentation 1–3 |
| fatigue | int | Énergie 1–3 |
| note | text | Note libre |

---

## 📦 Déploiement (GitHub Pages)

Le déploiement est automatisé via GitHub Actions à chaque push sur `main`.

**Secrets GitHub requis** (`Settings → Secrets → Actions`) :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Activer GitHub Pages** : `Settings → Pages → Source → GitHub Actions`

---

## 💙 Soutenir le projet

Moody est gratuit et open-source. Si l'app t'aide et que tu souhaites participer aux frais d'hébergement :

👉 [Buy Me a Coffee ☕](https://buymeacoffee.com/florent.d)

---

## 📲 Partager l'app

Si tu penses que Moody peut aider quelqu'un autour de toi, n'hésite pas à le partager !

**https://florentdesmarets.github.io/moodtracker/**

---

## 🙏 À propos

Fait avec ❤️ par **Florent Desmarets** — projet non lucratif, open source.

Si cette application aide ne serait-ce qu'une personne, c'est tout ce qui compte.

> *"Tu n'as pas à aller bien tout le temps."*
