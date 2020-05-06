const express = require("express"); // The same as creating an instance in flask with instantiation. Express has been instantiated into this express const-var

const port = process.env.PORT || 4000; // This is the port we are setting the server up on.
const swapiRoutes = require("./routes/swapiRoutes");

const app = express();

app.use("/", swapiRoutes);

app.listen(port, () => {
  console.log(`Swapi-Redis server running on port ${port}`);
  // This method is simply to ensure that when we run NPM start, if starting the NPM port is successful, our console will return the above message.
});
