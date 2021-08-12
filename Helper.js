const crypto = require("crypto");

class Helper {
 static getCodeChallenge() {
  const verifier = Helper.base64URLEncode(crypto.randomBytes(32));
  const challenge = Helper.base64URLEncode(Helper.sha256(verifier));
  return { verifier, challenge };
 }

 static base64URLEncode(str) {
  return str.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
 }

 static sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest();
 }
}

module.exports = Helper;
