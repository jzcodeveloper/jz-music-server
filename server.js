require("colors");

const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Use routes
app.use("/", require("./routes/database"));
app.use("/", require("./routes/dump"));
// app.use("/", require("./routes/offline-database"));
// app.use("/", require("./routes/offline-streaming"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`.blue));
