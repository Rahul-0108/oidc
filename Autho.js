const axios = require("axios").default;
const { prompt } = require("enquirer");
const open = require("open");
const jwt = require("jsonwebtoken");
const Helper = require("./Helper");

class Autho {
 constructor(provider) {
  this.provider = provider;
 }
 
 // To validate token , just follow these things : The token you are receiving hasn’t been tampered with. The token
 // you are receiving hasn’t expired.That certain pieces of JSON data encoded in the token are what you expect them
 //to be
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

 async getToken(code, isHybridFlow) {
  const tokenResponse = await axios.post(
   this.provider.token_Endpoint,
   {
    grant_type: "authorization_code",
    client_id: this.provider.client_id,
    client_secret: this.provider.client_secret,
    code: code,
    redirect_uri: !isHybridFlow
     ? "http://localhost:8000/callback"
     : "http://localhost:8000/autho.implicit.formpost.callback.html",
   },
   { headers: { "content-type": "application/json" } }
  );
  return tokenResponse;
 }

 async getTokenPKCEFlow(code, code_verifier) {
  const tokenResponse = await axios.post(
   this.provider.token_Endpoint,
   {
    grant_type: "authorization_code",
    client_id: this.provider.client_id,
    code_verifier,
    client_secret: this.provider.client_secret,
    code: code,
    redirect_uri: "http://localhost:8000/callback",
   },
   { headers: { "content-type": "application/json" } }
  );
  return tokenResponse;
 }

 async executeDeviceCodeFlow() {
  // https://auth0.github.io/device-flow-playground/
  // https://auth0.com/docs/flows/device-authorization-flow
  // https://auth0.com/docs/flows/call-your-api-using-the-device-authorization-flow#request-device-code
  console.log("Welcome to OIDC Social Providers CMD APP");
  const response = await prompt({
   type: "input",
   name: "login",
   message: "Please type y to login in our App",
  });
  if (response.login.toLowerCase() == "y") {
   let options = {
    method: "POST",
    url: this.provider.deviceCodeDomain + "device/code",
    headers: { "content-type": "application/json" },
    data: { client_id: this.provider.deviceCodeApplicationClientID, scope: "openid profile email offline_access" },
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
    url: this.provider.deviceCodeDomain + "token",
    headers: { "content-type": "application/json" },
    data: {
     grant_type: "urn:ietf:params:oauth:grant-type:device_code",
     device_code: data.device_code,
     client_id: this.provider.deviceCodeApplicationClientID,
    },
   };
   // Start polling for Tokens at interval value of data.interval(=5 seconds)
   while (1) {
    try {
     const tokenResponse = await axios.request(options);
     console.log(tokenResponse.data);
     await this.validateToken(tokenResponse.data);
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

 certToPEM(cert) {
  let pem = cert.match(/.{1,64}/g).join("\n");
  pem = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  console.log("Build Public Certificate to verify Token\n" + pem);
  return pem;
 }
}
module.exports = Autho;
