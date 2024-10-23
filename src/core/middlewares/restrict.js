// src/core/middlewares/restrict.js
const admin = require("firebase-admin");
const firebase = require("../configs/firebase");

const restrict = (requiredRole) => {
  return async (req, res, next) => {
    const idToken = req.headers.authorization?.split(" ")[1]; // Get the token from Authorization header

    if (!idToken) {
      return res.status(401).send("Unauthorized: No token provided");
    }

    try {
      // Verify the token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Retrieve the user from Firestore or Realtime Database
      const userSnapshot = await admin
        .firestore()
        .collection("users")
        .doc(decodedToken.uid)
        .get();

      if (!userSnapshot.exists) {
        return res.status(404).send("User not found");
      }

      const userData = userSnapshot.data();
      const userRole = userData.role;

      if (userRole === requiredRole) {
        req.user = { uid: decodedToken.uid, ...userData };
        next(); // Call next middleware if role matches
      } else {
        return res.status(403).send("Forbidden: Insufficient permissions");
      }
    } catch (error) {
      console.error("Error verifying token or fetching user role:", error);
      return res.status(401).send("Unauthorized: Invalid token");
    }
  };
};

module.exports = restrict;
