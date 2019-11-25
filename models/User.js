const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  name: {
    type: String,
    required: true
  },
  
  email: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  favoriteAlbums: [
    {
      type: Schema.Types.ObjectId,
      ref: "Album"
    }
  ],

  favoriteArtists: [
    {
      type: Schema.Types.ObjectId,
      ref: "Artist"
    }
  ],

  favoriteSongs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Song"
    }
  ],

  playlists: [
    {
      type: Schema.Types.ObjectId,
      ref: "Playlist"
    }
  ]
});

module.exports = mongoose.model("User", User);
