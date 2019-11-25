const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Album = new Schema({
  album: {
    type: String
  },
  
  albumArt: {
    type: Schema.Types.ObjectId,
    ref: "AlbumArt"
  },

  albumArtist: {
    type: String
  },

  count: {
    type: Number
  },

  duration: {
    type: Number
  },

  songs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Song"
    }
  ],

  timesPlayed: {
    type: Number
  }
});

module.exports = mongoose.model("Album", Album);
