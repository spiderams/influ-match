# 🎯 InfluMatch — Recherche de créateurs YouTube (SaaS)

**InfluMatch** est une application web fullstack permettant aux agences, marques ou freelancers de **trouver, analyser et classer des influenceurs YouTube** selon des critères comme l'engagement, le score de pertinence, et la catégorie de contenu.

> 🔍 Exemples d'usages : trouver les meilleurs profils "Fitness", "Crypto", etc. en quelques clics.

---

## 📦 Technologies utilisées

| Côté | Techno |
|------|--------|
| Backend | Node.js, Express, Prisma, PostgreSQL |
| Frontend | React, Axios |
| API | YouTube Data API v3 |
| Hébergement (recommandé) | Railway (backend) + Vercel (frontend) |

---

## 📁 Structure du projet

InfluMatch/
├── frontend/ # React
└── backend/ # Express + Prisma
---

## 🚀 Fonctionnalités principales

- 🔍 Recherche de chaînes YouTube par mot-clé
- 📊 Analyse automatique : vues, abonnés, vidéos, score de pertinence
- 🧠 Détection automatique de la catégorie (Fitness, Crypto, etc.)
- 📈 Calcul du taux d'engagement (plafonné, propre)
- 🧹 Suppression des doublons
- 🗂️ Classement, pagination, tri dynamique (React)
- ✏️ Modification manuelle de la catégorie
- 📤 Export CSV des résultats
- 📉 Statistiques par catégorie

---

## ⚙️ Installation rapide

### 🔁 1. Clone le projet

```bash
git clone https://github.com/<TON-USER>/influ-match.git
cd influ-match

cd backend
npm install
cp .env.example .env
# 👉 Remplis ta clé API YouTube + URL PostgreSQL

npx prisma generate
npx prisma migrate dev
node server.js

 3. Frontend (React)
bash
Copier
Modifier
cd ../frontend
npm install
npm start

Par défaut, le frontend tourne sur http://localhost:3001
Et appelle le backend sur http://localhost:3000
