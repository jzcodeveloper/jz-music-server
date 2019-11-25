const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Playlist = new Schema({
  name: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },

  count: {
    type: Number
  },

  duration: {
    type: Number
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  songs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Song"
    }
  ]
});

module.exports = mongoose.model("Playlist", Playlist);
