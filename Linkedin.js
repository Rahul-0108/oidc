// https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow?tabs=cURL

// https://www.linkedin.com/developers/apps
// https://esther-liao.medium.com/how-to-get-a-linkedin-access-token-a53f9b62f0ce

const axios = require("axios");

class Linkedin {
 constructor(provider) {
  this.provider = provider;
 }
 async getToken(code) {
  const tokenResponse = await axios.post(
   `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=http://localhost:8000/callback&client_id=${this.provider.client_id}&client_secret=${this.provider.client_secret}`,
   {
    headers: { "content-type": "application/x-www-form-urlencoded" },
   }
  );
  return tokenResponse;
 }

 async validateToken(token) {
  //Linkedin accessToken is not a jwt so can not be validated locally,on calling apis,Linkedin validates it
  console.log("Token from the /token endpoint");
  console.log(token);
  let tokenResponse = await axios.get(`https://api.linkedin.com/v2/me`, {
   headers: { Authorization: `Bearer ${token.access_token}` },
  });
  console.log("Profile Data");
  console.log(tokenResponse.data);

  tokenResponse = await axios.get(`https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))`, {
   headers: { Authorization: `Bearer ${token.access_token}` },
  });
  console.log("Email Data");
  console.log(JSON.stringify(tokenResponse.data));

  tokenResponse = await axios.get(
   `https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))`,
   {
    headers: { Authorization: `Bearer ${token.access_token}` },
   }
  );
  console.log("Profile Picture url");
  console.log(JSON.stringify(tokenResponse.data));
  process.exit(0);
 }
}

module.exports = Linkedin;
