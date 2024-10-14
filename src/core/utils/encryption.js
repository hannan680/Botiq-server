const crypto = require("crypto");

// Make sure ENCRYPTION_KEY is 32 bytes (256 bits)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

function ensureKeyLength(key) {
  // If the key is provided as a hex string, convert it to a buffer
  let keyBuffer =
    typeof key === "string" ? Buffer.from(key, "hex") : Buffer.from(key);

  // If the key is too short, hash it to get a 32-byte key
  if (keyBuffer.length < 32) {
    keyBuffer = crypto.createHash("sha256").update(keyBuffer).digest();
  }
  // If the key is too long, truncate it
  else if (keyBuffer.length > 32) {
    keyBuffer = keyBuffer.slice(0, 32);
  }

  return keyBuffer;
}

exports.encrypt = (text) => {
  const key = ensureKeyLength(ENCRYPTION_KEY);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

exports.decrypt = (encryptedData) => {
  const key = ensureKeyLength(ENCRYPTION_KEY);
  const [ivHex, authTagHex, encryptedText] = encryptedData.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
