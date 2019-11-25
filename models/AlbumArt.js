const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AlbumArt = new Schema({
  album: {
    type: String
  },
  
  albumArt: {
    type: String
  }
});

module.exports = mongoose.model("AlbumArt", AlbumArt);
