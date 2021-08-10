// https://medium.com/authpack/easy-google-auth-with-node-js-99ac40b97f4c
// https://athiththan11.medium.com/google-drive-image-upload-with-oauth-2-0-ab0d3b4a75bc
// https://github.com/athiththan11/G-Drive-OAuth-Image-Upload/blob/3ed9ae6f1e144cdc3824fe37af5b43ba4691dc61/api/drive.api.js#L131
// https://console.cloud.google.com/apis/credentials
// https://developers.google.com/identity/protocols/oauth2/openid-connect#scope-param
// https://developers.google.com/identity/protocols/oauth2/web-server
// https://developers.google.com/identity/protocols/oauth2/scopes
// https://developers.google.com/oauthplayground/ : All available google apis and required scope for using the api we will get here

// We do not need to add scopes to our client application in the console.cloud.google.com oauth consent screen, we can directly use these scopes while calling the
// /authorize endpoint , but it is a good practice to add these scopes in the console.cloud.google.com oauth consent screen
// openid profile email are required scopes for Openid Connect

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

     //  https://developers.google.com/identity/protocols/oauth2/web-server#callinganapi : The scope for calling this api is given at the top of the page of this url
     const googleDriveAllFiles = await axios.get(`https://www.googleapis.com/drive/v2/files`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
     });
     const driveFiles = googleDriveAllFiles.data.items.map((file) => file.title);
     console.log("All files from Google Drive");
     console.log(driveFiles);
     //  https://developers.google.com/identity/protocols/oauth2/scopes : Search People API scopes from here
     //  https://developers.google.com/people/api/rest/v1/people/get : personFields use
     const peopleAPIData = await axios.get(
      `https://people.googleapis.com/v1/people/me?personFields=ageRanges,birthdays,organizations,phoneNumbers,genders`,
      {
       headers: { Authorization: `Bearer ${token.access_token}` },
      }
     );
     console.log("People API Data");
     console.log("gender");
     console.log(peopleAPIData.data.genders);
     console.log("birthday");
     console.log(peopleAPIData.data.birthdays);
     console.log("phoneNumbers");
     console.log(peopleAPIData.data.phoneNumbers);
     console.log("ageRanges");
     console.log(peopleAPIData.data.ageRanges);
     process.exit(0);
    }
   }
  );
 }
}

module.exports = Google;
