
///ttps://thelinuxcode.com/create-routes-on-server-side-in-nodejs/






import "dotenv/config";
import express from "express";
import creatorRouter from "./Router/creator.js";
//the file system that supports promises 
import fs from 'fs/promises';

const app = express();

app.get('/api/creators/:name', async (req, res) => {
  const creator = await queryCreator(req.params.name);
  res.json(creator);
});

app.get('/api/channels/:id', async (req, res) => {
  const channel = await queryChannel(req.params.id);
  res.json(channel);
});

app.post('/api/channels/:id/subscribe', async (req, res) => {
  const updated = await subscribeToChannel(req.params.id);
  res.json(updated);
});

app.get('/api/feed', async (req, res) => {
  const feed = await start5();
  res.json(feed);
});
