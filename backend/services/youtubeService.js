const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const axios = require("axios");
require("dotenv").config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// 🔍 Fonction pour détecter la catégorie
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

const getChannelStats = async (channelIds) => {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds.join(',')}&key=${YOUTUBE_API_KEY}`;
  const res = await axios.get(url);
  return res.data.items;
};

const calculateScore = (stats) => {
  const views = parseInt(stats.viewCount || 0);
  const videos = parseInt(stats.videoCount || 1);
  const subscribers = parseInt(stats.subscriberCount || 1);
  if (subscribers === 0 || isNaN(views) || isNaN(videos)) return 0;
  const engagement = views / videos;
  const score = Math.round((engagement / subscribers) * 100);
  return isNaN(score) ? 0 : score;
};

const calculateEngagementRate = (stats) => {
  const views = parseInt(stats.viewCount || 0);
  const subs = parseInt(stats.subscriberCount || 0);

  // Cas limites
  if (subs === 0 || isNaN(views)) return 0;

  const rawRate = (views / subs) * 100;

  // ✅ Si peu d'abonnés, ignore (non représentatif)
  if (subs < 10) return 0;

  // ✅ Plafonner les valeurs extrêmes
  return Math.min(Math.round(rawRate), 300);
};



// 🔍 Fonction principale : recherche et enregistre des chaînes
const searchChannels = async (keyword, region = "CA", maxPages = 4) => {
  let results = [];
  let pageToken = null;

  for (let i = 0; i < maxPages; i++) {
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=50&q=${encodeURIComponent(keyword)}&regionCode=${region}&key=${YOUTUBE_API_KEY}`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    const res = await axios.get(url);
    const items = res.data.items || [];

    const channelIds = items.map(item => item.snippet.channelId).filter(id => !!id);
    if (channelIds.length === 0) break;

    const stats = await getChannelStats(channelIds);

    const batchResults = stats.map(stat => ({
      id: stat.id,
      name: stat.snippet.title,
      subscribers: parseInt(stat.statistics.subscriberCount || 0),
      views: parseInt(stat.statistics.viewCount || 0),
      videos: parseInt(stat.statistics.videoCount || 0),
      score: calculateScore(stat.statistics),
      engagement: calculateEngagementRate(stat.statistics),
      categorie: detectCategorie(stat.snippet.title + ' ' + (stat.snippet.description || ''))
    }));

    // 🔁 Enregistrer chaque chaîne
    for (const channel of batchResults) {
      await prisma.channel.upsert({
        where: { id: channel.id },
        update: {
          name: channel.name,
          subscribers: channel.subscribers,
          views: channel.views,
          videos: channel.videos,
          score: channel.score,
          engagement: channel.engagement,
          categorie: channel.categorie
        },
        create: {
          id: channel.id,
          name: channel.name,
          subscribers: channel.subscribers,
          views: channel.views,
          videos: channel.videos,
          score: channel.score,
          engagement: channel.engagement,
          categorie: channel.categorie
        }
      });
    }

    results = results.concat(batchResults);
    pageToken = res.data.nextPageToken;
    if (!pageToken) break;
  }

  return results;
};

module.exports = { searchChannels };
