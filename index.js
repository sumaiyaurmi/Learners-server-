const express = require('express');
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;




app.get("/", (req, res) => {
    res.send("studybuddy server is running");
  });
  app.listen(port, () => {
    console.log(`study server running on port ${port}`);
  });