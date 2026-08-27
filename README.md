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