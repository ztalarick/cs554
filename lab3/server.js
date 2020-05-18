const bluebird = require("bluebird");
const express = require("express");
const app = express();
const redis = require("redis");
const client = redis.createClient();
const data = require('./data.js');
const unflatten = require('flat').unflatten
const flatten = require('flat')

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

app.get("/api/people/history", async (req, res) => {
  let items = await client.lrangeAsync("Visitors", 0, 19).map(JSON.parse);
  console.log(items);
  let jsonItems = [];
  let lookup;
  for(let i = 0; i < items.length; i++){
    // lookup = await client.getAsync(items[i]);
    lookup = await data.getById2(items[i]);
    jsonItems.push(unflatten(lookup));
  }
  res.send(jsonItems);
});

app.get("/api/people/:id", async (req, res) => {
  let cacheForUser = await client.getAsync(req.params.id);
  let visitors;
  if(cacheForUser){
    visitors = await client.lpushAsync("Visitors", req.params.id);
    res.send(unflatten(cacheForUser)); //UNFLATTEN THIS
  }else{
    try {
      let user = await data.getById(req.params.id)
      let cache = await client.setAsync(req.params.id, JSON.stringify(user));
      //i need to store the ids visited in an array so i can get it later
      visitors = await client.lpushAsync("Visitors", req.params.id);
      res.json(user);
    } catch (e) {
      console.log("Error: " + e);
    }
  }
});




app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
