// Instantiating dependencies into the route file here, so we can structure our routes properly.
const express = require("express");
const axios = require("axios");
const redis = require("redis");

const router = express.Router(); // Instantiating our Router, so we can build routes.
const redisPort = process.env.REDIS_URL || 6379; // 6379 is the defaul port on our computers.
const redisClient = redis.createClient(redisPort); // This creates our Redis Client.

// CheckCache is a custom function we are firing. This is considered middleware. With how we buid our route and methods within the route, it
// will run on our router.get BEFORE the parameters of the router.get path fire off.
// This piece of middleware simply checks to see if we are receiving any data back when we request it from the
checkCache = (req, res, next) => {
  const { slug, id } = req.params;

  redisClient.get(`${slug}:${id}`, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    }

    if (data != null) {
      res.send(data);
    } else {
      next();
    }
  });
};

// Now that everyting has been instantiated, and we have created necessary middleware, we can setup our below function to store the query
// data in redis, and set an expiration for the data that does end up being stored.

router.get("/:slug/:id", checkCache, async (req, res) => {
  try {
    const { slug, id } = req.params;

    const swapiInfo = await axios.get(
      `https://rec-swapi.herokuapp.com/api/${slug}/${id}`
    );

    const swapiData = swapiInfo.data;

    // The below, is our key-value set, this line of code dictates when the cache of data will expire.

    redisClient.setex(`${slug}:${id}`, 30, JSON.stringify(swapiData));

    return res.json(swapiData);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// The above route and methods built in, cut down loading times IMMENSELY when reloading or revisiting web-pages
// that have been visited within the last 30 seconds on this API. Standard load times are around 300-400 milliseconds,
// but with the router method we have built with the checkCache middleware method, the loading times for a page you have
// visited within the last thirty seconds will remain cached, and can therefore be re-loaded MUCH faster.
// This saves us nearly half a second of load times when traversing between pages.

module.exports = router;
