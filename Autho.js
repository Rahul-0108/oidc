const axios = require("axios");
const jwt = require("jsonwebtoken");
const { Touchscreen } = require("puppeteer");

class Autho {
 async validateToken(token) {
  console.log("Token response from /token  Endpoint");
  console.log(token);
  const allAvailableEndpoints = await axios.get("https://dev-p54mppx8.auth0.com/.well-known/openid-configuration");
  console.log("All available Endpoints");
  console.log(allAvailableEndpoints.data);
  const jwks = await axios.get("https://dev-p54mppx8.auth0.com/.well-known/jwks.json");
  console.log("JWKS Endpoint Public Keys");
  console.log(jwks.data);
  const decodedToken = jwt.decode(token.id_token, { complete: true });
  const { header } = decodedToken;
  if (!header || header.alg !== "RS256") {
   throw new Error("Token is not RS256 encoded");
  }
  let signingKey;
  jwks.data.keys.forEach((element) => {
   if (
    element.use === "sig" &&
    element.kty === "RSA" &&
    ((element.x5c && element.x5c.length) || (element.n && element.e)) &&
    element.kid == header.kid
   ) {
    signingKey = { kid: element.kid, nbf: element.nbf, publicKey: this.certToPEM(element.x5c[0]) };
   }
  });
  const actualKey = signingKey.publicKey || signingKey.rsaPublicKey;
  jwt.verify(
   token.id_token,
   actualKey,
   { algorithms: ["RS256"], issuer: "https://dev-p54mppx8.auth0.com/" },
   async (err, decoded) => {
    if (err) {
     throw new Error("Unauthorized user");
    } else {
     console.log("Valid User");
     const userInfoData = await axios.get("https://dev-p54mppx8.auth0.com/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
     });
     console.log(userInfoData.data);
     return;
    }
   }
  );
 }

 async getToken(code) {
  const tokenResponse = await axios.post(
   "https://dev-p54mppx8.auth0.com/oauth/token",
   {
    grant_type: "authorization_code",
    client_id: "ZoO6Iaitgk95Txs67UCkIepHrNvPBm1h",
    client_secret: "qZUyxh18jRhHqK4ZhKbK3sLDHzMGpunLUolU_kBu6qAPaaOsdnw2CjA66tAb4oAS",
    code: code,
    redirect_uri: "http://localhost:8000/callback",
   },
   { headers: { "content-type": "application/json" } }
  );
  return tokenResponse;
 }

 certToPEM(cert) {
  let pem = cert.match(/.{1,64}/g).join("\n");
  pem = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  console.log("Build Public Certificate to verify Token\n" + pem);
  return pem;
 }
}
module.exports = Autho;
