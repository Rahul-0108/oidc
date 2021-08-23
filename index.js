const { prompt } = require("enquirer");
const http = require("http");
var express = require("express");
var app = express();
const cookieParser = require("cookie-parser");
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
let isImplicitFlowFormPost = false;
let isHybridFlow = false;
let isPkceFlow = false;
let pkceImplicitConfig;

async function main() {
 console.log(
  "Choose Login Provider(Autho,Autho.PKCE,Autho.Implicit,Autho.Hybrid,Autho.Device,Linkedin,Github,Facebook,Google,Google.PKCE,Google.Implicit,Google.Device,Bentley)"
 );
 console.log(
  "1.Autho\n2.Autho.PKCE\n3.Autho.Implicit\n4.Autho.Device\n5.Linkedin\n6.Github\n7.Facebook\n8.Google\n9.Google.PKCE\n10.Google.Implicit\n11.Google.Device\n12.Bentley\n13.Autho.Hybrid"
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
   isImplicitFlowFormPost = true;
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

  case "13":
   provider = new Autho(providers.Auth0);
   authorizeEndpoint = providers.Auth0.authorizeEndpointHybrid;
   isHybridFlow = true;
   break;
  default:
   console.log("Please type a valid provider name");
 }
 if (provider && (authorizeEndpoint || pkceImplicitConfig)) {
  runServer();
  // only for Google PKCE and Implicit Flow
  if (isImplicitFlow || isPkceFlow) {
   await open(`http://localhost:8000/callback.html?flow=${isPkceFlow ? "PKCE" : "Impl"}&clientSideUrl=${pkceImplicitConfig}`);
  } else if (isImplicitFlowFormPost || isHybridFlow) {
   await open(`http://localhost:8000/autho.implicit.formpost.callback.html`);
  } else {
   await open(authorizeEndpoint);
  }
 }
}

function runServer() {
 app.use(express.static("public"));
 app.use(cookieParser());

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
     loginData += `<a href=${providers.Auth0.logoutUrl}http://localhost:8000/logout>Click here to logout</a>`;
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

 /////////////////////////////////////////////////////////////////////////////////////////////////
 // Implicit Flow with Form POST
 app.post("/callback", async function (req, res) {
  console.log(req.url);
  let body = "";
  let data;
  let token = {};
  req.on("data", function (chunk) {
   body += chunk;
  });
  req.on("end", async function () {
   data = body.split("&");
   for (let i = 0; i <= data.length - 1; i++) {
    let splitValue = data[i].split("=");
    token[splitValue[0]] = splitValue[1];
   }
   if (token.state == "STATE") {
    if (isImplicitFlowFormPost) {
     //now validate the id_token and extract all user information from it and make the user logged in your app if the token is valid
     await provider.validateToken(token);
     //TODO:We should encrypt the id_token value before storing in cookie and make the cookie secure from any attack
     res.cookie("token", token.id_token, { httpOnly: true }); // using httpOnly,clientside Javascript code cannot read the cookie value, so protected from cross-scripting attack
     res.redirect("http://localhost:8000/autho.implicit.formpost.callback.html");
    } else if (isHybridFlow) {
     //now validate the id_token and extract all user information from it and make the user logged in your app if the token is valid
     //here we will assume the id_token is valid
     // When you decode and parse your ID token, you will notice an additional claim, c_hash, which contains a hash of the code. This claim is mandatory when an ID token is issued at the same time as a code, and you should validate it:

     // 1.Using the hash algorithm specified in the alg claim in the ID Token header, hash the octets of the ASCII representation of the code.

     // 2.Base64url-encode the left-most half of the hash.

     //3.Check that the result matches the c_hash value.

     //TODO:We should encrypt the id_token value before storing in cookie and make the cookie secure from any attack
     res.cookie("token", token.id_token, { httpOnly: true }); // using httpOnly,clientside Javascript code cannot read the cookie value, so protected from cross-scripting attack
     res.redirect("http://localhost:8000/autho.implicit.formpost.callback.html");
     // We are securely going to retrive the Access Token and Refresh token from the backend channel when we need them, not rquired immediately as id_token is already got for login
     const tokenResponse = await provider.getToken(token.code, true);
     await provider.validateToken(tokenResponse.data);
    }
   }
  });
 });

 app.get("/login", async function (req, res) {
  res.redirect(authorizeEndpoint);
 });

 app.get("/implicitFormPostLogout", function (req, res) {
  res.clearCookie("token");
  res.redirect(providers.Auth0.logoutUrl + "http://localhost:8000/autho.implicit.formpost.callback.html");
 });

 app.get("/validateToken", async function (req, res) {
  let isValid = true;
  if (!req.cookies.token) {
   isValid = false;
  }
  // Validate this id_token from Cookie
  if (isValid) {
   // If Valid
   res.status(200).send({ isAuthenticated: true });
  } else {
   res.status(200).send({ isAuthenticated: false });
  }
 });

 //////////////////////////////////////////////////////////////////////////////////////////////////

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
