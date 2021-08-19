const { prompt } = require("enquirer");
const http = require("http");
var express = require("express");
var app = express();
const open = require("open");
const Autho = require("./Autho");
const Linkedin = require("./Linkedin");
const Github = require("./Github");
const Facebook = require("./Facebook");
const Google = require("./Google");
const Bentley = require("./Bentley");
const providers = require("./Providers");
let provider;
let authorizeEndpoint;
let isImplicitFlow = false;
let isPkceFlow = false;
let pkceImplicitConfig;

async function main() {
 console.log(
  "Choose Login Provider(Autho,Autho.PKCE,Autho.Implicit,Autho.Device,Linkedin,Github,Facebook,Google,Google.PKCE,Google.Implicit,Google.Device,Bentley)"
 );
 console.log(
  "1.Autho\n2.Autho.PKCE\n3.Autho.Implicit\n4.Autho.Device\n5.Linkedin\n6.Github\n7.Facebook\n8.Google\n9.Google.PKCE\n10.Google.Implicit\n11.Google.Device\n12.Bentley"
 );
 const response = await prompt({
  type: "input",
  name: "social",
  message: "Please Enter your choice:",
 });

 switch (response.social) {
  case "1":
   provider = new Autho(providers.Auth0);
   authorizeEndpoint = providers.Auth0.authorizeEndpoint;
   break;

  case "2": // We will demo PKCE for SPA only for Google. otherwise backend code will demo PKCE
   provider = new Autho(providers.Auth0);
   authorizeEndpoint = providers.Auth0.pkceConfig;
   break;

  case "3":
   provider = new Autho(providers.Auth0);
   authorizeEndpoint = providers.Auth0.authorizeEndpointImplicit;
   isImplicitFlow = true;
   break;

  case "4":
   provider = new Autho(providers.Auth0);
   await provider.executeDeviceCodeFlow();
   break;

  case "5":
   provider = new Linkedin(providers.Linkedin);
   authorizeEndpoint = providers.Linkedin.authorizeEndpoint;
   break;

  case "6":
   provider = new Github(providers.Github);
   authorizeEndpoint = providers.Github.authorizeEndpoint;
   break;

  case "7":
   provider = new Facebook(providers.Facebook);
   //if we provide no scope then it Grants read-only access to public information (including user profile info, repository info, and gists)
   authorizeEndpoint = providers.Facebook.authorizeEndpoint;
   break;

  case "8":
   provider = new Google(providers.Google);
   authorizeEndpoint = providers.Google.authorizeEndpoint;
   break;

  case "9":
   provider = new Google(providers.Google);
   pkceImplicitConfig = providers.Google.pkceImplicitConfig;
   isPkceFlow = true;
   break;

  case "10":
   provider = new Google(providers.Google);
   pkceImplicitConfig = providers.Google.pkceImplicitConfig;
   isImplicitFlow = true;
   break;

  case "11":
   provider = new Google(providers.Google);
   await provider.executeDeviceCodeFlow();
   break;

  case "12":
   provider = new Bentley(providers.Bentley);
   authorizeEndpoint = providers.Bentley.authorizeEndpointPKCE;
   break;
  default:
   console.log("Please type a valid provider name");
 }
 if (provider && (authorizeEndpoint || pkceImplicitConfig)) {
  runServer();
  // only for Google PKCE and Implicit Flow
  if (isImplicitFlow || isPkceFlow) {
   await open(`http://localhost:8000/callback.html?flow=${isPkceFlow ? "PKCE" : "Impl"}&clientSideUrl=${pkceImplicitConfig}`);
  } else {
   await open(authorizeEndpoint);
  }
 }
}

function runServer() {
 app.use(express.static("public"));

 app.get("/callback", async function (req, res) {
  res.header("Content-Type", "text/html");
  console.log(req.url);
  const parameters = req.url.substr(10);
  const data = parameters.split("&");
  const code = data[0].split("=");
  const state = data[1].split("=");
  if (req.url.includes("google")) {
   // for google Provider
   const temp = code[1];
   code[1] = state[1];
   state[1] = temp;
  }
  if (state[1] == "STATE") {
   try {
    let tokenResponse;
    if (authorizeEndpoint.includes("code_challenge_method")) {
     // for PKCE flow
     tokenResponse = await provider.getTokenPKCEFlow(code[1], providers.codeChallenge.verifier);
    } else {
     tokenResponse = await provider.getToken(code[1]);
    }
    await provider.validateToken(tokenResponse.data);
    let loginData = "<h4>Your Sign-in is successful...............Please return to the App</h4>";
    if (authorizeEndpoint.includes("autho")) {
     // for Autho provider, we will implement logout as well
     // Though your application uses Auth0 to authenticate users, you'll still need to track that the user has logged in to your application. In a regular web application,
     // you achieve this by storing information inside a cookie. Log users out of your applications by clearing their sessions.
     // before loggingout user from application , clear cookie which stores user has logged in or not
     // while logout , we will logout user from Autho also . The Auth0 Logout endpoint clears the Single Sign-on (SSO) cookie in Auth0.
     loginData += `<a href=${providers.Auth0.logoutUrl}>Click here to logout</a>`;
    }
    res.send(loginData);
   } catch (error) {
    console.log(error.message);
   }
  }
 });

 app.get("/logout", function (req, res) {
  res.header("Content-Type", "text/html");
  console.log("you are successfully logged out from this app");
  res.send("<h4>Your logout is successful...................</h4>");
  process.exit(0);
 });

 // Implicit Flow with Form POST
 app.post("/callback", async function (req, res) {
  res.header("Content-Type", "text/html");
  console.log(req.url);
  let body = "";
  let data;
  let idToken;
  let state;
  req.on("data", function (chunk) {
   body += chunk;
  });
  req.on("end", function () {
   data = body.split("&");
   idToken = data[0].split("=");
   state = data[1].split("=");
   if (state[1] == "STATE") {
    const id_token = idToken[1];
    //now validate the id_token and extract all user information from it and make the user logged in your app if the token is valid
    let loginData = "<h4>Your Sign-in is successful...............Please return to the App</h4>";
    if (authorizeEndpoint.includes("autho")) {
     // for Autho provider, we will implement logout as well
     // Though your application uses Auth0 to authenticate users, you'll still need to track that the user has logged in to your application. In a regular web application,
     // you achieve this by storing information inside a cookie. Log users out of your applications by clearing their sessions.
     // before loggingout user from application , clear cookie which stores user has logged in or not
     // while logout , we will logout user from Autho also . The Auth0 Logout endpoint clears the Single Sign-on (SSO) cookie in Auth0.
     loginData += `<a href=${providers.Auth0.logoutUrl}>Click here to logout</a>`;
    }
    res.send(loginData);
   }
  });
 });

 // For Google PKCE and Implicit Flow .The client-side code should validate the token also,but since it is a plain html file, so token validation we will do in backend server
 app.post("/validateToken", async function (req, res) {
  let body = "";
  req.on("data", function (chunk) {
   body += chunk;
  });
  req.on("end", async function () {
   try {
    await provider.validateToken(JSON.parse(body));
    res.send({ isValid: true });
   } catch (error) {
    res.send({ isValid: false });
   }
  });
 });

 app.listen(8000, () => {});
}
main();
