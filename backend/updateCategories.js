// updateCategories.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const detectCategorie = (text) => {
  const t = (text || '').toLowerCase();

  const mapping = [
    { key: 'Fitness', keywords: ['fitness', 'workout', 'gym', 'bodybuilding', 'training'] },
    { key: 'Crypto', keywords: ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'web3'] },
    { key: 'Tech', keywords: ['tech', 'gadget', 'ai', 'app', 'software', 'programming', 'code'] },
    { key: 'Cuisine', keywords: ['cook', 'cuisine', 'recipe', 'kitchen', 'meal', 'food'] },
    { key: 'Beauté', keywords: ['makeup', 'beauty', 'skincare', 'cosmetics'] },
    { key: 'Finance', keywords: ['finance', 'money', 'invest', 'stock', 'trading', 'business'] },
    { key: 'Éducation', keywords: ['learn', 'course', 'tutorial', 'éducation', 'how to'] },
    { key: 'Voyage', keywords: ['travel', 'trip', 'voyage', 'tourism'] },
    { key: 'Gaming', keywords: ['game', 'gaming', 'let\'s play', 'stream'] },
    { key: 'Musique', keywords: ['music', 'song', 'instrument', 'concert'] },
  ];

  for (const category of mapping) {
    if (category.keywords.some(keyword => t.includes(keyword))) {
      return category.key;
    }
  }

  return 'Autre';
};

const updateAllMissingCategories = async () => {
  const channels = await prisma.channel.findMany({
    where: { categorie: null }
  });

  for (const channel of channels) {
    const categorie = detectCategorie(channel.name); // ou ajoute description si tu l'as
    await prisma.channel.update({
      where: { id: channel.id },
      data: { categorie }
    });
    console.log(`✅ ${channel.name} → ${categorie}`);
  }

  console.log(`🔁 ${channels.length} chaînes mises à jour.`);
  await prisma.$disconnect();
};

updateAllMissingCategories();
