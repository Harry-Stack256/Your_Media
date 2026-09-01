### Your Media

An application built to remove the noise of social media algorithms that lead to doomscrolling—creating a focused space where all your most important and relevant media lives. 

The app allows you to search for your favorite regular creators and view their 5 most recent uploads. To keep consumption intentional, you can only follow up to **5 creators at a time** (your *"Starting 5"*). Each creator gets a dedicated page with tools designed to promote intentional viewing over passive consumption.

---

### Learning Log

Today I learned how important it is to carefully inspect the data structure returned by an API and understand how fields are nested. 

When making requests to the YouTube Data API, accessing a channel ID required navigating through multiple layers:

`response` ➔ `.data` ➔ `.items` ➔ `[index]` ➔ `.id` ➔ `.channelId`

Working with APIs can feel a lot like opening a Russian nesting doll—you have to unpack each layer to get to the data you actually need.

## Leason 2 
I learning to keep being consistent I need to limit the scope of the project. My goal
now is to make a project that anyone can use locally for when they are tired of 
getting endless notifications which distracts them and makes there experinece on yt 
and other platforms unintentional 

## Lesson 3 
I'm learning as project get bigger it is very helpful to make maps of how your data is going to flow for example 

async function subscribeToChannelsFromCli()->  This function checks to see if what the user types matchs with a channel name in the file , channel.json. If it doesn't match
fuse.search will try to see if it matchs enough with a channel name in the list of channels in channel.json. If it doesn't match enough the ClI will say 
they is no channel here .If it matchs the channel exacatly the flag for subscribed will be in channel.json. If it match somewhat , there will be a prompt that says
did you mean the first match in the list of possible match and if the user says yes , it will take that query that corressponds with the channel in and list of channels 
and change the channel flag to subscribed. The method also check to see if there are 5 channels subed to in the channel array to make sure the user 
doesn't subscribe to more then 5 people.

async function loadSavedChannels()- Loads the a channel array form channel.json that represents the set of channels that have already been quired

async function loadSavedCreators()-This loads saved creators credentials needed which is essentially a inbetween layer that allows to get the resources we need  to be saved in channel.json which has meta data for channels and if they have  been subscribed to by the user(this comes from are application) . 

async function queryCreator(query)-> allows us to query a creator for the user to have access to , to see the channels meta data to see the channel they may want to subscribe
to. If its a new channel we will go to the search endpoint in youtube api which will give us the meta data we need for a specfic channel meta data .
Which will allows us to display that infomation to the user to see if they want to subscribe via the channels endpoint in youtubes api . This will also 
save this channels meta data so for future queries of the same ceator we will show 

async function saveCreatorsToJson(query)-> saves creators meta data needed for channel meta data . We need channel meta data so the user can know the creators identity 
so that they can subscribe 

async function queryChannel(channelID)->saves creators meta data  for there channel to keep track of cretor identity and to keep track if they are subed or not 

async function getRecentUploads(channelId)-> 

async function start5()->

Future -There may be unnesscary calls in query channel 