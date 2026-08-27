import axios from "axios";
import express from "express";
import fs from 'fs/promises';
import Fuse from 'fuse.js';

const router = express.Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

async function loadSavedCreators() {
  try {
    const savedCreators = await fs.readFile('savedCreators.json', 'utf-8');
    return JSON.parse(savedCreators);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error reading savedCreators.json:', error.message);
    }
    return [];
  }
}

async function saveCreator(creator) {
  const savedCreators = await loadSavedCreators();
  const updatedCreators = [
    ...savedCreators.filter((savedCreator) => savedCreator.channelId !== creator.channelId),
    creator
  ];

  await fs.writeFile(
    'savedCreators.json',
    JSON.stringify(updatedCreators, null, 2),
    'utf-8'
  );
}

async function findOrSaveCreator(query) {
  const savedCreators = await loadSavedCreators();
  const fuse = new Fuse(savedCreators, {
    keys: ['channelTitle'],
    threshold: 0.4,
    ignoreLocation: true
  });
  const cachedMatch = fuse.search(query)[0];

  if (cachedMatch) {
    return cachedMatch.item;
  }

  const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
    params: {
      key: YOUTUBE_API_KEY,
      part: "snippet",
      type: "channel",
      q: query,
      maxResults: 5
    }
  });
  const firstCreator = response.data.items[0];

  if (!firstCreator) {
    return null;
  }

  const creator = {
    channelId: firstCreator.id.channelId,
    channelTitle: firstCreator.snippet.title
  };
  await saveCreator(creator);
  return creator;
}

async function queryChannel(channelId) {
  const response = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
    params: {
      key: YOUTUBE_API_KEY,
      part: "snippet,statistics",
      id: channelId
    }
  });

  return response.data.items.map((item) => ({
    channelId: item.id,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.default.url,
    subscriberCount: item.statistics.subscriberCount,
    videoCount: item.statistics.videoCount,
    viewCount: item.statistics.viewCount
  }));
}

router.get("/search", async (req, res) => {
  try {
    const searchQuery = req.query.q?.trim();

    if (!searchQuery) {
      return res.status(400).send("Missing search query parameter 'q'");
    }

    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Missing YOUTUBE_API_KEY environment variable"
      });
    }

    const creator = await findOrSaveCreator(searchQuery);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "No creator was found"
      });
    }

    const channel = await queryChannel(creator.channelId);
    if (channel.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No channel was found"
      });
    }

    await fs.writeFile('channel.json', JSON.stringify(channel, null, 2), 'utf-8');
    console.log("Channel fetched successfully:", channel[0]);
    res.json({ success: true, count: channel.length, channel });
  } catch (error) {
    console.error("Error fetching creators:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching creators",
      details: error.response?.data || error.message
    });
  }
});

export default router;