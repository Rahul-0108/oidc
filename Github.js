//https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow

//https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps
//https://github.com/settings/applications/1682408

const axios = require("axios");

class Github {
 async getToken(code) {
  //if we provide no scope then it Grants read-only access to public information (including user profile info, repository info, and gists)
  const tokenResponse = await axios.post(
   `https://github.com/login/oauth/access_token?client_id=2a2041735c6b19d94dac&client_secret=8833dcab2d236f58f1f729cb138c40e3f7160501&code=${code}&redirect_uri=http://localhost:8000/callback`,
   { headers: { Accept: "application/json" } }
  );
  return tokenResponse;
 }

 async validateToken(token) {
  // No nedd to validate accessToken as it is not a jwt,Github will itself verify the accessToen when making api calls
  console.log("Token from the /token endpoint");
  console.log(token);
  const splitArray = token.split("&");
  const accessToken = splitArray[0].split("=");
  let tokenResponse = await axios.get(`https://api.github.com/user`, {
   headers: { Authorization: `token ${accessToken[1]}` },
  });
  console.log("Profile Data");
  console.log(tokenResponse.data);
 }
}

module.exports = Github;
