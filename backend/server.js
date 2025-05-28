const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { searchChannels } = require('./services/youtubeService');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ✅ Route : lire les chaînes enregistrées avec pagination + tri
app.get('/api/channels', async (req, res) => {
  try {
    const { keyword } = req.query;

    // Sécurisation des paramètres
    const rawPage = parseInt(req.query.page || '1');
    const rawLimit = parseInt(req.query.limit || '20');
    const sort = req.query.sort || 'createdAt';

    const page = isNaN(rawPage) ? 1 : rawPage;
    const take = isNaN(rawLimit) ? 20 : rawLimit;
    const skip = Math.max((page - 1) * take, 0);

    // Tri autorisé
   const validSortFields = ['score', 'subscribers', 'views', 'engagement', 'createdAt'];
    const sortBy = validSortFields.includes(sort) ? sort : 'createdAt';

    console.log("Pagination → skip:", skip, "take:", take, "sort:", sortBy);

    // Requête principale
    const channels = await prisma.channel.findMany({
      where: keyword
        ? { name: { contains: keyword, mode: 'insensitive' } }
        : {},
      orderBy: { [sortBy]: 'desc' },
      skip,
      take
    });
app.put('/api/channels/:id', async (req, res) => {
  const { id } = req.params;
  const { categorie } = req.body;

  try {
    const updated = await prisma.channel.update({
      where: { id },
      data: { categorie },
    });
    res.json(updated);
  } catch (err) {
    console.error("Erreur dans PUT /api/channels :", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
});
function serializeChannel(channel) {
  return {
    ...channel,
    subscribers: Number(channel.subscribers),
    views: Number(channel.views),
  };
}

    const total = await prisma.channel.count({
      where: keyword
        ? { name: { contains: keyword, mode: 'insensitive' } }
        : {},
    });

    res.json({
      channels: channels.map(serializeChannel),
      total,
      page,
      totalPages: Math.ceil(total / take)
    });
  } catch (err) {
    console.error("Erreur dans /api/channels :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des chaînes." });
  }
});
// ✅ Route : recherche + sauvegarde via YouTube API
app.get('/api/search', async (req, res) => {
  const { keyword, region } = req.query;
  if (!keyword) return res.status(400).json({ error: "Missing keyword" });

  try {
    const channels = await searchChannels(keyword, region || "CA");
    res.json(channels);
  } catch (err) {
    console.error("Erreur dans /api/search :", err.message);
    res.status(500).json({ error: "Erreur lors de la recherche." });
  }
});
app.get('/api/stats/categories', async (req, res) => {
  try {
    const resultats = await prisma.channel.groupBy({
      by: ['categorie'],
      _count: { _all: true },
     orderBy: { categorie: 'asc' }
    });

    const stats = resultats.map(r => ({
      categorie: r.categorie ?? 'Non classée',
      count: r._count._all
    }));

    res.json(stats);
  } catch (err) {
    console.error("Erreur dans /api/stats/categories :", err);
    res.status(500).json({ error: "Erreur lors du calcul des statistiques." });
  }
});

// ✅ Lancement
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ API lancée sur http://localhost:${PORT}`));
