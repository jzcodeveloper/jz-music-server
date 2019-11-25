require("colors");
const express = require("express");
const fs = require("fs");
const router = express.Router();

//Offline streaming using album + song
router.get("/offline-streaming/:album/:song", async (req, res) => {
  try {
    const { album, song } = req.params;
    const rootPath = `\\\\JAVIERJOSE-PC\\Lo Mejor de Cada Género 128 kbps\\Lo Mejor de Cada Género 128 kbps`;
    const fullPath = `${rootPath}\\${album}\\${song}`;

    const stat = fs.statSync(fullPath);
    const total = stat.size;
    if (req.headers.range) {
      const { range } = req.headers;
      const parts = range.replace(/bytes=/, "").split("-");
      const partialStart = parts[0];
      const partialEnd = parts[1];
      const start = parseInt(partialStart, 10);
      const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
      const chunkSize = end - start + 1;
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Accept-Ranges": `bytes`,
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4"
      });
      fs.createReadStream(fullPath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": total,
        "Content-Type": "audio/mpeg"
      });
      fs.createReadStream(fullPath).pipe(res);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

module.exports = router;
