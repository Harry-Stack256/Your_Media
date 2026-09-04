
///ttps://thelinuxcode.com/create-routes-on-server-side-in-nodejs/






import "dotenv/config";
import express from "express";
import axios from "axios";
import Fuse from "fuse.js";
//the file system that supports promises 
import fs from 'fs/promises';


const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const app = express();
// parse requests with a Content-Type of application/json
app.use(express.json());

app.get('/api/creators/:name', async (req, res) => {

   if (typeof req.params.name !== "string" || req.params.name.trim() === "") {
    
    res.status(400).json({ error: "Please enter a creator name" });
    return;
  }
  const savedCreators = await loadSavedCreators();
  const fuse = new Fuse(savedCreators, {
    keys: ['channelTitle'],
    threshold: 0.4,
    ignoreLocation: true
  });
  const cachedMatch = fuse.search(req.params.name.trim())[0];
  
  if (cachedMatch) {
    try{
    await queryChannel(cachedMatch.item.channelId); }catch(error){
        res.status(403).json({ error: error.message });
    return;
    }
    return;
  }

try{
await saveCreatorsToJson(req.params.name.trim());
res.status(200).json({ message: "Creator saved successfully" });
}catch(error){
    res.status(403).json({ error: error.message });
    
  
}});

async function queryChannel(channelID) {
  if(typeof channelID !== "string" || channelID.trim() === ""){
    throw new Error("Please enter a channel ID");
    
  }
  
    const response = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
      params: {
        key: YOUTUBE_API_KEY,
        part: "snippet,statistics", 
        
        id: channelID
      
      }
    });

    // 1. Map the results into your clean array of objects
    const channel = response.data.items.map((item) => ({
      channelId: item.id, // Direct string on /channels
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url,
      subscriberCount: item.statistics.subscriberCount,
      videoCount: item.statistics.videoCount,
      viewCount: item.statistics.viewCount
      
    }));
    if(channel.length===0){
     throw new Error("No channel was found");
      
    }

    // 2. Convert the array to a JSON string
    // The 'null, 2' argument formats the JSON with indentation so it's clean and readable
    const firstCreator = response.data.items[0];
    if (!firstCreator) {
    

      throw new Error("No creator was found");
      
    }

    const  newChannel = {
      channelId: firstCreator.id, // Direct string on /channels
      title: firstCreator.snippet.title,
      thumbnail: firstCreator.snippet.thumbnails.default.url,
      subscriberCount: firstCreator.statistics.subscriberCount,
      videoCount: firstCreator.statistics.videoCount,
      viewCount: firstCreator.statistics.viewCount,
      subscribed:false
    };

    const savedChannels = await loadSavedChannels();
    const updatedChannels = [
      ...savedChannels.filter((savedChannels) => savedChannels.channelId !== newChannel.channelId),
      newChannel
    ];

   const jsonString = JSON.stringify(updatedChannels, null, 2);

    // 3. Write the string to a file named 'channel.json' in the current directory
    await fs.writeFile('channel.json', jsonString, 'utf-8');

    
  
}



async function loadSavedCreators() {
  try {
    const savedCreators = await fs.readFile('savedCreators.json', 'utf-8');
    return JSON.parse(savedCreators);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error reading savedCreators.json:', error);
    }
    return [];
  }
}

async function loadSavedChannels(){
  try {
    const savedChannels = await fs.readFile('channel.json', 'utf-8');
    return JSON.parse(savedChannels);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error reading savedChannels.json:', error);
    }
    return [];
  }
}

async function queryCreator(query) {
  if (typeof query !== "string" || query.trim() === "") {
    throw new Error("Please enter a creator name");
    
  }

  //look to see if a query match the set of creator that has ever been searched for the query there channel
  const savedCreators = await loadSavedCreators();
  const fuse = new Fuse(savedCreators, {
    keys: ['channelTitle'],
    threshold: 0.4,
    ignoreLocation: true
  });
  const cachedMatch = fuse.search(query.trim())[0];

  if (cachedMatch) {
    console.log(`Using saved channel: ${cachedMatch.item.channelTitle}`);
    await queryChannel(cachedMatch.item.channelId);
    
  }



  const creator = await saveCreatorsToJson(query.trim());
  if (creator) {
    await queryChannel(creator.channelId);
  }
}

async function saveCreatorsToJson(query) {
  if (typeof query !== "string" || query.trim() === "") {
   throw new Error("Please enter a creator name");
    
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
      throw new Error("No creator was found");
      return;
    }

    const creator = {
      channelId: firstCreator.id.channelId,
      channelTitle: firstCreator.snippet.title
    };
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


















app.listen(3002, () => {
  console.log('Server is running on port 3002');
});