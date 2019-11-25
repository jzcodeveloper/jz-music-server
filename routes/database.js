require("colors");
const express = require("express");
const router = express.Router();
const mm = require("music-metadata");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary");
const { execSync } = require("child_process");

cloudinary.config({
  cloud_name: "",
  api_key: "",
  api_secret: ""
});

const Song = require("../models/Song");
const Album = require("../models/Album");
const Artist = require("../models/Artist");
const AlbumArt = require("../models/AlbumArt");

let writing = false;

//Gets metadata from files in a given directory, and stores it in a DB for further use
router.get("/database", async (req, res) => {
  if (!writing) {
    writing = true;
    try {
      const pathname = path.resolve(__dirname, "../music");
      const files = fs.readdirSync(`${pathname}`);

      //Looping through all the files
      for (const file of files) {
        //Getting song metadata
        const metadata = await mm.parseFile(`${pathname}/${file}`, {
          native: true
        });

        //Transforming the album art data from buffer to a base 64 string
        const picture = metadata.common.picture;
        const buffer = picture ? picture[0].data : "";
        const albumart = Buffer.from(buffer).toString("base64") || "";

        //Uploading song to cloudinary and getting the url back for further processing
        const { secure_url } = await cloudinary.v2.uploader.upload(
          `${pathname}/${file}`,
          {
            public_id: file.substring(0, file.indexOf(".")),
            resource_type: "auto",
            use_filename: true
          }
        );
        console.log("[Song Uploaded]: ".magenta + file);

        //Filling an object with all relevant metadata
        const metadataArray = {
          album: metadata.common.album,
          albumArtist: metadata.common.albumartist,
          artist: metadata.common.artist,
          artists: metadata.common.artists,
          duration: metadata.format.duration,
          genre: metadata.common.genre,
          title: metadata.common.title,
          year: metadata.common.year,
          url: secure_url
        };

        //Fills the AlbumArt model
        let albumArt = await AlbumArt.findOne({ album: metadataArray.album });

        if (!albumArt) {
          const newAlbumArt = new AlbumArt({
            album: metadataArray.album,
            albumArt: albumart,
            albumArtist: "DJ Zeta"
          });
          albumArt = await newAlbumArt.save();
        }

        //Fills the Song model
        const song = await Song.findOneAndUpdate(
          {
            artist: metadataArray.artist,
            title: metadataArray.title,
            album: metadataArray.album
          },
          { url: metadataArray.url },
          { new: true }
        );

        if (!song) {
          const newSong = new Song({
            ...metadataArray,
            albumArt: albumArt._id,
            timesPlayed: 0
          });
          await newSong.save();
        } else continue;

        //Fills the Album model
        const albums = await Song.aggregate([
          {
            $group: {
              _id: "$album",
              duration: { $sum: "$duration" },
              count: { $sum: 1 },
              albumArt: { $first: "$albumArt" },
              albumArtist: { $first: "$albumArtist" }
            }
          }
        ]);
        //Loop through the albums array
        for (const item of albums) {
          const songs = await Song.find({ album: item });
          const albumFields = {
            album: item._id,
            duration: item.duration,
            count: item.count,
            albumArt: item.albumArt,
            albumArtist: item.albumArtist,
            songs: songs.map(song => song._id),
            timesPlayed: 0
          };

          const album = await Album.findOne({ album: albumFields.album });

          if (album) {
            //console.log("Album already stored in DB");
            await Album.findOneAndUpdate(
              { album: albumFields.album },
              { $set: albumFields }
            );
          } else {
            const newAlbum = new Album(albumFields);
            await newAlbum.save();
          }
        }

        //Fills the Artist model
        const artists = await Song.aggregate([
          {
            $group: {
              _id: "$artist",
              duration: { $sum: "$duration" },
              count: { $sum: 1 },
              albumArt: { $first: "$albumArt" },
              albumArtist: { $first: "$albumArtist" }
            }
          }
        ]);
        //Loop through the artists array
        for (const item of artists) {
          const songs = await Song.find({ artist: item });
          const artistFields = {
            artist: item._id,
            duration: item.duration,
            count: item.count,
            albumArt: item.albumArt,
            albumArtist: item.albumArtist,
            songs: songs.map(song => song._id),
            timesPlayed: 0
          };

          const artist = await Artist.findOne({ artist: artistFields.artist });

          if (artist) {
            //console.log("Artist already stored in DB");
            await Artist.findOneAndUpdate(
              { artist: artistFields.artist },
              { $set: artistFields }
            );
          } else {
            const newArtist = new Artist(artistFields);
            await newArtist.save();
          }
        }

        //Using mongodump command
        const opath = "D:\\Program Files\\MongoDB\\Server\\4.0\\bin";

        const dump = {
          host: "ds033484.mlab.com:33484",
          db: "jz-music-player",
          user: "Javier",
          pass: "jzmp123",
          dpath: path.join(__dirname, "../dump")
        };

        const dumpCommand = `mongodump -h ${dump.host} -d ${dump.db} -u ${dump.user} -p ${dump.pass} -o "${dump.dpath}"`;
        const dumpData = execSync(dumpCommand, {
          cwd: opath
        });

        //Using mongorestore command
        const restore = {
          host: "localhost:27017",
          db: "jz-music-player"
        };

        const restoreCommand = `mongorestore --drop -h ${restore.host} -d ${restore.db} "${dump.dpath}/${dump.db}"`;
        const restoreData = execSync(restoreCommand, {
          cwd: opath
        });
      }

      console.log("Done".blue);
      writing = false;
      res.json({ message: "Done" });
    } catch (error) {
      console.log(error);
      writing = false;
      res.status(500).json({ error });
    }
  } else {
    res.status(500).json({ message: "Currently writing in the DB" });
  }
});

module.exports = router;
