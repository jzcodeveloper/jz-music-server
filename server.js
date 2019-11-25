require("colors");

const PORT = 5000;

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const db = "";
// const offlineDB = "mongodb://localhost:27017/jz-music-player-offline";

// Use routes
app.use("/", require("./routes/database"));
app.use("/", require("./routes/dump"));
// app.use("/", require("./routes/offline-database"));
// app.use("/", require("./routes/offline-streaming"));

// Connect to MongoDB
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useFindAndModify: false
  })
  .then(() => console.log("MongoDB Connected".green))
  .catch(err => console.log("Could not connect to MongoDB".red));

// Starts server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`.blue));
