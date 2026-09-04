
import fs from 'fs/promises'; // Use built-in promises-based File System module
import axios from 'axios';
import Fuse from 'fuse.js';
import "dotenv/config";
import readline from 'node:readline/promises';

import { stdin as input, stdout as output } from 'node:process';

import { subscribe } from 'node:diagnostics_channel';



const rl = readline.createInterface({ input, output });
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY


const answer = await rl.question('What function do you want to run \n Type .help for options:  ');

// ...existing code...

if (answer.trim().toLowerCase() === ".help") {
  const choice = await rl.question(' type creator for creator function, channel for channel function, or subscribe for saved channels \n ');

  if (choice.trim().toLowerCase() === "creator") {
    let creator = await rl.question('Give me a creator :  ');
    await queryCreator(creator);

  } else if (choice.trim().toLowerCase() === "channel") {
    let channelID = await rl.question('Give me a channelID :  ');
    await queryChannel(channelID);

  } else if (choice.trim().toLowerCase() === "subscribe") {
    await subscribeToChannelsFromCli();

  } else {
    console.log("You didn't pick creator, channel, or subscribe");
  }
  rl.close();

} else {
  let choice = await rl.question(':  ');

  if (choice.trim().toLowerCase() === "creator") {
    let creator = await rl.question('Give me a creator :  ');
    await queryCreator(creator);

  } else if (choice.trim().toLowerCase() === "channel") {
    let channelID = await rl.question('Give me a channelID :  ');
    await queryChannel(channelID);

  } else if (choice.trim().toLowerCase() === "subscribe") {
    await subscribeToChannelsFromCli();

  } else {
    console.log("You didn't pick creator, channel, or subscribe");
  }
  rl.close();
}

// ...existing code...

async function subscribeToChannelsFromCli() {
  const savedChannels = await loadSavedChannels();

  if (!Array.isArray(savedChannels) || savedChannels.length === 0) {
    console.log("No channels are saved in channel.json yet.");
    return;
  }
  let subscribedChannels = savedChannels.filter(channel => channel.subscribed=== true);
  if(subscribedChannels.length ==5) {
    console.log("You have already subscribed to 5 channels. Please unsubscribe from a channel before subscribing to a new one.");
    return;
  }

  const showChannels = await rl.question("Do you want to see the saved channels in channel.json? (y/n): ");
  if (showChannels.trim().toLowerCase() === "y" || showChannels.trim().toLowerCase() === "yes") {
    console.log("Saved channels:");
    savedChannels.forEach((channel, index) => {
      console.log(`${index + 1}. ${channel.title} (${channel.channelId})`);
    });
  }

  const searchTerm = await rl.question("Type a channel name to subscribe to: ");
  if (!searchTerm.trim()) {
    console.log("No channel name entered.");
    
    return;
  }

  const exactMatch = savedChannels.find((channel) =>
    channel.title.trim().toLowerCase() === searchTerm.trim().toLowerCase()
  );

  if (exactMatch) {
    const updatedChannels = savedChannels.map((channel) =>
      channel.channelId === exactMatch.channelId
        ? { ...channel, subscribed: true }
        : channel
    );

    await fs.writeFile('channel.json', JSON.stringify(updatedChannels, null, 2), 'utf-8');
    console.log(`Subscribed to ${exactMatch.title}.`);
    await start5(); // Call start5() after subscribing to a channel
    return;
  }

  const fuse = new Fuse(savedChannels, {
    keys: ['title'],
    threshold: 0.35,
    ignoreLocation: true
  });

  const possibleMatches = fuse.search(searchTerm.trim());

  if (!possibleMatches.length) {
    console.log("No close match found in channel.json.");
    return;
  }

  const suggestedChannel = possibleMatches[0].item;
  const didYouMean = await rl.question(`Did you mean "${suggestedChannel.title}"? (y/n): `);

  if (didYouMean.trim().toLowerCase() === "y" || didYouMean.trim().toLowerCase() === "yes") {
    const updatedChannels = savedChannels.map((channel) =>
      channel.channelId === suggestedChannel.channelId
        ? { ...channel, subscribed: true }
        : channel
    );

    await fs.writeFile('channel.json', JSON.stringify(updatedChannels, null, 2), 'utf-8');
    console.log(`Subscribed to ${suggestedChannel.title}.`);
   await start5(); // Call start5() after subscribing to a channel
    return;
  }

  console.log(`Okay, ${suggestedChannel.title} was not selected.`);
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

async function queryCreator(query) {
  if (typeof query !== "string" || query.trim() === "") {
    console.log("Please enter a creator name");
    return;
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
    return;
  }



  const creator = await saveCreatorsToJson(query.trim());
  if (creator) {
    try{
    await queryChannel(creator.channelId); }catch(error){
     
    }
  }
}
//This saves the creator to a json this file acts as a repository for all creators that have been searched for 
//and we be used to query channel meta data and video data
async function saveCreatorsToJson(query) {
  if (typeof query !== "string" || query.trim() === "") {
   console.log("Its not a string ");
    return;
  }

  try {
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
      console.log("No creator was found");
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

    console.log(`Saved creator: ${creator.channelTitle}`);
    return creator;

  } catch (error) {
    console.error('Error fetching or writing file:', error);
  }
}
//This takes the the repository of creator queries and gets the channel meta data thatt will be used 
//to track the channels the user has subed to and not subed 
//in set notation terms this is the union of the set of creators that have been searched which 
//is the superset of the set of channels that have been subed to and not subed to

async function queryChannel(channelID) {
  if(typeof channelID !== "string" || channelID.trim() === ""){
    return;
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
      return;
    }

    // 2. Convert the array to a JSON string
    // The 'null, 2' argument formats the JSON with indentation so it's clean and readable
    const firstCreator = response.data.items[0];
    if (!firstCreator) {
      throw new Error("No creator was found");
      return;
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

    console.log('Successfully saved creators array to channel.json!');
    console.log(jsonString);

  
}



//This method will run for all channels that are subscribed to 
async function getRecentUploads(channelId) {
  const uploadsPlaylistId = 'UU' + channelId.slice(2);

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/playlistItems", {
      params: {
        key: YOUTUBE_API_KEY,
        part: "snippet,contentDetails",
        playlistId: uploadsPlaylistId,
        maxResults: 5     // max 50, default 5 — you can just leave this off if count is 5
      }
    });

    return response.data.items.map((item) => ({
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      publishedAt: item.contentDetails.videoPublishedAt,  // more accurate than snippet.publishedAt
      thumbnail: item.snippet.thumbnails.default.url ,
      }));

  } catch (error) {
    console.error('Error fetching recent uploads:', error);
    return [];
  }
}
//this function mays are array of creators that will be used to serve the user there 5 videos

//One key note before we fetch more video's we might implement some type of timer 
// so that we don't burn through qoutes 

//this function is called when a user has subed to a channel 
 export async function start5() {
  try {
    const savedChannels = await loadSavedChannels(); // ← await added
    const channelResults = savedChannels.filter((channel) => channel.subscribed === true);
    const subbedCreators = [];

    for (let x = 0; x < channelResults.length; x++) {
      const currentChannel = channelResults[x];
      const uploads = await getRecentUploads(currentChannel.channelId); // ← await + correct casing

      const videoTime = new Date().toISOString();
      const subbedObject = {
        ...currentChannel,
        recentVideos: uploads,       // ← already an array of 5 — no need to rebuild it
        videosFetchedAt: videoTime
      };
      subbedCreators.push(subbedObject);
    }

    const jsonString = JSON.stringify(subbedCreators, null, 2);
    await fs.writeFile('start5.json', jsonString, 'utf-8');
    console.log('Successfully wrote Starting Five to start5.json!');
  } catch (error) {
    console.error(`${error.name}: ${error.message}`); // ← .message added, .name alone tells you almost nothing
  }
}



// Fuse.js setup




