// https://developer.bentley.com/apis/overview/authorization/

const axios = require("axios");
var querystring = require("querystring");
const { prompt } = require("enquirer");
const jwt = require("jsonwebtoken");
const open = require("open");
const Helper = require("./Helper");

class Bentley {
 constructor(provider) {
  this.provider = provider;
 }
 async getToken(code) {
  try {
   const tokenResponse = await axios.post(
    this.provider.token_Endpoint,
    querystring.stringify({
     // the body parameters must be url encoded
     grant_type: "authorization_code",
     code: code,
     client_id: this.provider.client_id,
     client_secret: this.provider.client_secret,
     redirect_uri: "http://localhost:8000/callback",
     scope: this.provider.scope,
    }),
    { headers: { "content-type": "application/x-www-form-urlencoded" } }
   );
   return tokenResponse;
  } catch (error) {
   console.log(error.message);
  }
 }

 async getTokenPKCEFlow(code, code_verifier) {
  try {
   const tokenResponse = await axios.post(
    this.provider.token_Endpoint,
    querystring.stringify({
     grant_type: "authorization_code",
     client_id: this.provider.client_idSPA,
     code_verifier,
     code: code,
     redirect_uri: "http://localhost:8000/callback",
     scope: this.provider.scopeSPA, // cannot get refresh token for PKCE flow, so cannot use offline_access scope for this flow
    }),
    { headers: { "content-type": "application/x-www-form-urlencoded" } }
   );
   return tokenResponse;
  } catch (error) {
   console.log(error.message);
  }
 }

 async getTokenHybridFlow(code, code_verifier) {
  try {
   const tokenResponse = await axios.post(
    this.provider.tokenEndpointHybrid,
    querystring.stringify({
     grant_type: "authorization_code",
     client_id: this.provider.client_idHybrid,
     code_verifier,
     code: code,
     redirect_uri: "http://localhost:5000/signin-oidc",
     scope: "openid profile email", // cannot get refresh token for PKCE flow, so cannot use offline_access scope for this flow
    }),
    { headers: { "content-type": "application/x-www-form-urlencoded" } }
   );
   return tokenResponse;
  } catch (error) {
   console.log(error.message);
  }
 }

 async executeDeviceCodeFlow() {
  console.log("Welcome to OIDC Social Providers CMD APP");
  const response = await prompt({
   type: "input",
   name: "login",
   message: "Please type y to login in our App",
  });
  if (response.login.toLowerCase() == "y") {
   let options = {
    method: "POST",
    url: this.provider.deviceCodeAuthorizationEndpoint,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: querystring.stringify({
     client_id: this.provider.deviceCodeClientId,
     scope: this.provider.deviceCodeScope,
    }),
   };
   const deviceResponse = await axios.request(options);
   const data = deviceResponse.data;
   console.log("/device/code Data");
   console.log(data);
   console.log(
    "Please go to the following url: " + data.verification_uri + " and type the following user Code : " + data.user_code
   );
   console.log("or Please authorize the App in the opened browser tab");
   await open(data.verification_uri_complete);

   options = {
    method: "POST",
    url: this.provider.token_Endpoint,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: querystring.stringify({
     grant_type: "urn:ietf:params:oauth:grant-type:device_code",
     device_code: data.device_code,
     client_id: this.provider.deviceCodeClientId,
    }),
   };
   // Start polling for Tokens at interval value of data.interval(=5 seconds)
   while (1) {
    try {
     const tokenResponse = await axios.request(options);
     console.log(tokenResponse.data);
     // do not validate the access token, only resource server should validate an access Token locally, We will just call the /userInfo to get the user Data
     const userInfoData = await axios.get(this.provider.userinfo, {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
     });
     console.log(userInfoData.data);
     console.log("You are successfully logged-in in our  App");
     break;
    } catch (error) {
     console.log(error.response.data.error + ": " + error.response.data.error_description);
     if (error.response.data.error == "expired_token") {
      console.log("you did not authorize the App on time. Please retry to login");
      break;
     }
     if (error.response.data.error == "access_denied") {
      console.log("you did not authorize the App. Please retry to login");
      break;
     }
    }
    await Helper.sleep(data.interval);
   }
  }
 }

 async validateToken(token) {
  console.log("Token response from /token  Endpoint");
  console.log(token);
  const allAvailableEndpoints = await axios.get(this.provider.well_known_Enpoint);
  console.log("All available Endpoints");
  console.log(allAvailableEndpoints.data);
  const jwks = await axios.get(this.provider.jwk_endpoint);
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
  jwt.verify(token.id_token, actualKey, { algorithms: ["RS256"], issuer: this.provider.issuer }, async (err, decoded) => {
   if (err) {
    throw new Error("Unauthorized user");
   } else {
    console.log("Valid User");
    const userInfoData = await axios.get(this.provider.userinfo, {
     headers: { Authorization: `Bearer ${token.access_token}` },
    });
    console.log(userInfoData.data);
   }
  });
 }

 certToPEM(cert) {
  let pem = cert.match(/.{1,64}/g).join("\n");
  pem = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  console.log("Build Public Certificate to verify Token\n" + pem);
  return pem;
 }
}

module.exports = Bentley;
