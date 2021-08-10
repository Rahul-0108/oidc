const axios = require("axios");
const jwt = require("jsonwebtoken");

class Bentley {
 constructor(provider) {
  this.provider = provider;
 }
 async getToken(code) {
  try {
   const tokenResponse = await axios.post(
    `https://qa-imsoidc.bentley.com/connect/token?grant_type=authorization_code&client_id=${this.provider.client_id}&code=${code}&redirect_uri=http://localhost:8000/callback&client_secret=${this.provider.client_secret}`,
    { headers: { "content-type": "application/x-www-form-urlencoded" } }
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
