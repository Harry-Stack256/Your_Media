### Your Media

An application built to remove the noise of social media algorithms that lead to doomscrolling—creating a focused space where all your most important and relevant media lives. 

The app allows you to search for your favorite regular creators and view their 5 most recent uploads. To keep consumption intentional, you can only follow up to **5 creators at a time** (your *"Starting 5"*). Each creator gets a dedicated page with tools designed to promote intentional viewing over passive consumption.

---

### Learning Log

Today I learned how important it is to carefully inspect the data structure returned by an API and understand how fields are nested. 

When making requests to the YouTube Data API, accessing a channel ID required navigating through multiple layers:

`response` ➔ `.data` ➔ `.items` ➔ `[index]` ➔ `.id` ➔ `.channelId`

Working with APIs can feel a lot like opening a Russian nesting doll—you have to unpack each layer to get to the data you actually need.

## Lesson 2 
I learned to keep being consistent I need to limit the scope of the project. My goal
now is to make a project that anyone can use locally for when they are tired of 
getting endless notifications which distract them and make their experience on YouTube 
and other platforms unintentional. 

## Lesson 3 
I'm learning as a project gets bigger it is very helpful to make maps of how your data is going to flow, for example: 

async function subscribeToChannelsFromCli() -> This function checks to see if what the user types matches with a channel name in the file, channel.json. If it doesn't match, 
fuse.search will try to see if it matches enough with a channel name in the list of channels in channel.json. If it doesn't match enough, the CLI will say 
there is no channel here. If it matches the channel exactly, the flag for subscribed will be set in channel.json. If it matches somewhat (define somewhat later), there will be a prompt that says
"did you mean" the first match in the list of possible matches, and if the user says yes, it will take that query that corresponds with the channel in the list of channel names 
and change the channel flag to subscribed. The method also checks to see if there are 5 channels subscribed to in the channel array to make sure the user 
doesn't subscribe to more than 5 people.

async function loadSavedChannels() - Loads the channel array from channel.json that represents the set of channels that have already been queried.

async function loadSavedCreators() - This loads saved creator credentials needed, which is essentially an in-between layer that allows the resources we need to be saved in channel.json, which has metadata for channels and whether they have been subscribed to by the user (this comes from our application). 

async function queryCreator(query) -> Allows us to query a creator for the user to have access to, to see the channel's metadata to see the channel they may want to subscribe
to. If it's a new channel, we will go to the search endpoint in the YouTube API, which will give us the metadata we need for a specific channel's metadata,
which will allow us to display that information to the user to see if they want to subscribe via the channels endpoint in YouTube's API. This will also 
save this channel's metadata so that for future queries of the same creator we will show it.

async function saveCreatorsToJson(query) -> Saves creator metadata needed for channel metadata. We need channel metadata so the user can know the creator's identity 
so that they can subscribe. 

async function queryChannel(channelID) -> Saves creator metadata for their channel to keep track of creator identity and to keep track of whether they are subscribed or not. 

async function getRecentUploads(channelId) -> 

async function start5() -> 

Future - There may be unnecessary calls in queryChannel