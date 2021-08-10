const { prompt } = require("enquirer");
const http = require("http");
const open = require("open");
const jwt = require("jsonwebtoken");
const Autho = require("./Autho");
const Linkedin = require("./Linkedin");
const Github = require("./Github");
const Facebook = require("./Facebook");
const Google = require("./Google");
const Bentley = require("./Bentley");
const providers = require("./Providers");
let provider;

async function main() {
 const response = await prompt({
  type: "input",
  name: "social",
  message: "Choose Login Provider(Autho,Linkedin,Github,Facebook,Google,Bentley)",
 });
 let authorizeEndpoint;
 switch (response.social.toLowerCase()) {
  case "autho":
   provider = new Autho(providers.Auth0);
   authorizeEndpoint = providers.Auth0.authorizeEndpoint;
   break;

  case "linkedin":
   provider = new Linkedin(providers.Linkedin);
   authorizeEndpoint = providers.Linkedin.authorizeEndpoint;
   break;

  case "github":
   provider = new Github(providers.Github);
   authorizeEndpoint = providers.Github.authorizeEndpoint;
   break;

  case "facebook":
   provider = new Facebook(providers.Facebook);
   //if we provide no scope then it Grants read-only access to public information (including user profile info, repository info, and gists)
   authorizeEndpoint = providers.Facebook.authorizeEndpoint;
   break;

  case "google":
   provider = new Google(providers.Google);
   authorizeEndpoint = providers.Google.authorizeEndpoint;
   break;

  case "bentley":
   provider = new Bentley(providers.Bentley);
   authorizeEndpoint = providers.Bentley.authorizeEndpoint;
   break;
  default:
   console.log("Please type a valid provider name");
 }
 if (provider) {
  runServer();
  await open(authorizeEndpoint);
 }
}

function runServer() {
 const server = http.createServer(async (req, res) => {
  if (req.url.startsWith("/callback")) {
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
    res.end("Your Sign-in is successful...............Please return to the App");
    try {
     const tokenResponse = await provider.getToken(code[1]);
     await provider.validateToken(tokenResponse.data);
    } catch (error) {
     console.log(error.message);
    }
   }
  }
 });

 server.listen(8000, () => {});
}
main();
