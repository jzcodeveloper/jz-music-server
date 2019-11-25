const express = require("express");
const path = require("path");
const { execSync } = require("child_process");
const router = express.Router();

router.get("/dump", async (req, res) => {
  const opath = "D:\\Program Files\\MongoDB\\Server\\4.0\\bin";

  const dump = {
    host: "ds033484.mlab.com:33484",
    db: "jz-music-player",
    user: "Javier",
    pass: "jzmp123",
    dpath: path.join(__dirname, "../dump")
  };

  const dumpCommand = `mongodump -h ${dump.host} -d ${dump.db} -u ${
    dump.user
  } -p ${dump.pass} -o "${dump.dpath}"`;
  const dumpData = execSync(dumpCommand, {
    cwd: opath
  });

  const restore = {
    host: "localhost:27017",
    db: "jz-music-player"
  };

  const restoreCommand = `mongorestore --drop -h ${restore.host} -d ${
    restore.db
  } "${dump.dpath}/${dump.db}"`;
  const restoreData = execSync(restoreCommand, {
    cwd: opath
  });

  res.json("Done");
});

module.exports = router;
