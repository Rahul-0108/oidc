const axios = require("axios");
const jwt = require("jsonwebtoken");

class Bentley {
 constructor(provider) {
  this.provider = provider;
 }
 async getTokenPKCEFlow(code, code_verifier) {
  try {
   const tokenResponse = await axios.post(
    `https://qa-imsoidc.bentley.com/connect/token?grant_type=authorization_code&redirect_uri=http://localhost:8000/callback&code=${code}&code_verifier=${code_verifier}`,
    {
     client_id: this.provider.client_id,
     client_secret: this.provider.client_secret,
    },
    { headers: { "content-type": "application/json" } }
   );
   return tokenResponse;
  } catch (error) {
   console.log(error.message);
   console.log("Auth Code flow not supported");
   process.exit(0);
  }
 }
}

module.exports = Bentley;
