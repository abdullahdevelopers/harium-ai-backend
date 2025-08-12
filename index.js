const express = require("express");
const request = require("request");
const cors = require("cors");
const dotenv = require("dotenv");
const querystring = require("querystring");

dotenv.config();
const app = express();
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;

// Step 1: Login route
app.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email";
  const authUrl = "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI
    });
  res.redirect(authUrl);
});

// Step 2: Callback from Spotify
app.get("/callback", (req, res) => {
  const code = req.query.code || null;

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code"
    },
    headers: {
      Authorization: "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64")
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.redirect(`${FRONTEND_URI}#access_token=${access_token}`);
    } else {
      res.send("Error getting token");
    }
  });
});

// Step 3: Protected API example
app.get("/protected", (req, res) => {
  const token = req.query.access_token;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  res.send("You are logged in!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});