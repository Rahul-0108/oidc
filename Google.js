const axios = require("axios");
const jwt = require("jsonwebtoken");

class Google {
 constructor(provider) {
  this.provider = provider;
 }
 async getToken(code) {
  const tokenResponse = await axios.post(
   `https://oauth2.googleapis.com/token?code=${code}&client_id=${this.provider.client_id}&client_secret=${this.provider.client_secret}&redirect_uri=http://localhost:8000/callback&grant_type=authorization_code`,
   { headers: { Accept: "application/json" } }
  );
  return tokenResponse;
 }

 async validateToken(token) {
  console.log("Token response from /token  Endpoint");
  console.log(token);
  console.log(".well-known/openid-configuration Endpoint");
  const discoveryDocument = await axios.get(`https://accounts.google.com/.well-known/openid-configuration`);
  console.log(discoveryDocument.data);

  const remoteIdTokenvalidationResult = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token.id_token}`);
  console.log("Validating id_token from remote endpoint provided by google");
  console.log(remoteIdTokenvalidationResult.data);

  const jwksPEM = await axios.get("https://www.googleapis.com/oauth2/v1/certs"); //  Google provides the Public Key in PEM format also
  console.log("JWKS Endpoint PEM Public Keys");
  console.log(jwksPEM.data);

  const decodedToken = jwt.decode(token.id_token, { complete: true });
  const { header } = decodedToken;
  if (!header || header.alg !== "RS256") {
   throw new Error("Token is not RS256 encoded");
  }
  jwt.verify(
   token.id_token,
   jwksPEM.data[header.kid],
   {
    algorithms: ["RS256"],
    issuer: "https://accounts.google.com",
    nonce: "MyPROFILE",
    audience: this.provider.client_id,
   },
   async (err, decoded) => {
    if (err) {
     throw new Error("Unauthorized user");
    } else {
     console.log("Valid User");
     const userinfoData = await axios.get(`https://openidconnect.googleapis.com/v1/userinfo`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
     });
     console.log("UserInfo Data");
     console.log(userinfoData.data);

     const userinfoData2 = await axios.get(
      `https://www.googleapis.com/plus/v1/people/me?key=AIzaSyAegqpixMnLb_cVWbsLVq_eqg6XEzqkY_c&personFields=names,emailAddresses`
     );
     console.log("UserInfo Data");
     console.log(userinfoData2);
     process.exit(0);
    }
   }
  );
 }
}

module.exports = Google;
