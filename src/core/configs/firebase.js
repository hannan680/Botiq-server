const admin = require("firebase-admin");
// const serviceAccount = require("../configs/serviceAccountKey.json");

const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;

// Decode the base64 string
const credentialsJSON = Buffer.from(base64Credentials, "base64").toString(
  "utf-8"
);

// Parse the JSON string into an object
const serviceAccount = JSON.parse(credentialsJSON);

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://uhb-news-f915a-default-rtdb.firebaseio.com",
  storageBucket: "uhb-news-f915a.appspot.com",
});

module.exports = firebase;
