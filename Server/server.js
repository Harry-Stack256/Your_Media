
///ttps://thelinuxcode.com/create-routes-on-server-side-in-nodejs/






import "dotenv/config";
import express from "express";
import creatorRouter from "./Router/creator.js";
//the file system that supports promises 
import fs from 'fs/promises';

const app = express();

app.use("/creator", creatorRouter);
app.get("/about", (req, res) => res.send("About Page"));
app.get("/", (req, res) => res.send("root page"));

app.listen(3013, () => {
  console.log("Express server running at http://localhost:3013");
});
