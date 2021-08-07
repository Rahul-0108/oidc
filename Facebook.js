// https://medium.com/authpack/facebook-auth-with-node-js-c4bb90d03fc0
// https://developers.facebook.com/docs/facebook-login/web/
// https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow#checklogin
// https://developers.facebook.com/apps/?show_reminder=true
// https://medium.com/@byn9826/verify-facebook-login-by-python-e02ac1e23e37
// https://developers.facebook.com/tools/explorer

//This app is yet not able to authenticate other users due to privacy policy of Facebook

const axios = require("axios");

class Facebook {
 async getToken(code) {
  //if we provide no scope then it Grants read-only access to public information (including user profile info, repository info, and gists)
  const tokenResponse = await axios.post(
   `https://graph.facebook.com/v11.0/oauth/access_token?client_id=265101321715922&redirect_uri=http://localhost:8000/callback&client_secret=3e512e2cdef8123efd07e7862228da7d&code=${code}`,
   { headers: { Accept: "application/json" } }
  );
  return tokenResponse;
 }

 async validateToken(token) {
  console.log("Access token Received from /token endpoint");
  console.log(token);
  // get app AccessToken using client Credentials flow to validate the access token received
  const appAccessToken = await axios.get(
   `https://graph.facebook.com/oauth/access_token?client_id=265101321715922&client_secret=3e512e2cdef8123efd07e7862228da7d&grant_type=client_credentials`,
   { headers: { Accept: "application/json" } }
  );
  console.log("App access Token from Client Credentials flow");
  console.log(appAccessToken.data);

  const tokenResponse = await axios.get(
   `https://graph.facebook.com/debug_token?input_token=${token.access_token}&access_token=${appAccessToken.data.access_token}`, //validate the received access Token
   { headers: { Accept: "application/json" } }
  );
  console.log("Access token validation Results");
  console.log(tokenResponse.data);

  const scopesGranted = await axios.get(`https://graph.facebook.com/me/permissions?access_token=${token.access_token}`, {
   //check for scopes permissions granted by user
   headers: { Accept: "application/json" },
  });
  console.log("check for scopes permissions granted by user");
  console.log(scopesGranted.data);

  const userdata = await axios.get(
   `https://graph.facebook.com/me?fields=id,name,email,birthday,gender,hometown,friends&access_token=${token.access_token}`, // get user data
   {
    headers: { Accept: "application/json" },
   }
  );
  console.log("User Information");
  console.log(userdata.data);

  const logout = await axios.delete(
   `https://graph.facebook.com/${userdata.data.id}/permissions?access_token=${token.access_token}`,
   {
    headers: { Accept: "application/json" },
   }
  );
  console.log("removed all scopes granted to the app by the user");
  console.log(logout.data);
 }
}

module.exports = Facebook;
