
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

if(answer.trim().toLowerCase()===".help"){

  const choice=  await rl.question(' type creator for creator function channel for channel function \n ');

  if(choice.trim().toLowerCase()==="creator"){
    let creator =  await rl.question('Give me a creator :  ');
   await queryCreator(creator);


  }else if(choice.trim().toLowerCase()==="channel"){
     let channelID =  await rl.question('Give me a channelID :  ');
    await queryChannel(channelID);
  }else{
    console.log("You didn't pick creator or channel")
  }
  rl.close();

}else{
  let choice=  await rl.question(':  ');

  if(choice.trim().toLowerCase()==="creator"){

  let creator =  await rl.question('Give me a creator :  ');
    await queryCreator(creator);

  }else if(choice.trim().toLowerCase()==="channel"){
     let channelID =  await rl.question('Give me a channelID :  ');
    await queryChannel(channelID);
  }else{
    console.log("You didn't pick creator or channel")
  }
  rl.close();

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
    await queryChannel(creator.channelId);
  }
}

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

async function queryChannel(channelID) {
  if(typeof channelID !== "string" || channelID.trim() === ""){
    return;
  }
  try {
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
      console.log("Nothing was returned");
      return;
    }

    // 2. Convert the array to a JSON string
    // The 'null, 2' argument formats the JSON with indentation so it's clean and readable
    const firstCreator = response.data.items[0];
    if (!firstCreator) {
      console.log("No creator was found");
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

    // 3. Write the string to a file named 'creators.json'
    await fs.writeFile('channel.json', jsonString, 'utf-8');

    console.log('Successfully saved creators array to channel.json!');
    console.log(jsonString);

  } catch (error) {
    console.error('Error fetching or writing file:', error);
  }
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
 async function start5(){

  try{
   const savedChannels = loadSavedChannels();
   console.log(savedChannels);
   const channelResults = savedChannels.filter((channel) => channel.subscribed == true);
   const subbedCreators=[]

   for(let x=0; x<channelResults.length;x++){
     let currentChannelID =channelResults[x].channelID
   let uploads =  getRecentUploads(currentChannelID);

   
    //this keeps track of when the request for new uploads was made so when can make 
    //a timer for it so we can just update them properly 
    let  videoTime= new Date().toISOString();
   let  subbedObject ={...channelResults[x],recentVideos:[{videoID: uploads.videoID,
      title: uploads.title, publishedAt: uploads.publishedAt, thumbnail: uploads.thumbnail
   }],"videosFetchedAt":videoTime}
   subbedCreators.push(subbedObject);
   
   }
     const jsonString = JSON.stringify(subbedCreators, null, 2);

    // 3. Write the string to a file named 'creators.json'
    await fs.writeFile('start5.json', jsonString, 'utf-8');

    console.log('Successfully wrote starting 5 array to starting5.json!');
    console.log(jsonString);


  
  }catch(error){
  console.log("This is a "+error.name+" error");
  }
  

}


// Fuse.js setup




