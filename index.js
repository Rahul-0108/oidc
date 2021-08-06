const { prompt } = require("enquirer");
const http = require("http");
const open = require("open");
const jwt = require("jsonwebtoken");
const Autho = require("./Autho");
const Linkedin = require("./Linkedin");
const Github = require("./Github");
let provider;

async function main() {
 const response = await prompt({
  type: "input",
  name: "social",
  message: "Choose Login Provider(Autho,Linkedin,Github,Google)",
 });

 switch (response.social) {
  case "Autho":
   provider = new Autho();
   runServer();
   await open(
    "https://dev-p54mppx8.auth0.com/authorize?response_type=code&client_id=ZoO6Iaitgk95Txs67UCkIepHrNvPBm1h&redirect_uri=http://localhost:8000/callback&scope=openid profile email offline_access&state=STATE"
   );
   break;

  case "Linkedin":
   provider = new Linkedin();
   runServer();
   await open(
    "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=78h70r4utzrm3i&redirect_uri=http://localhost:8000/callback&state=STATE&scope=r_liteprofile r_emailaddress w_member_social"
   );
   break;

  case "Github":
   provider = new Github();
   runServer();
   await open(
    "https://github.com/login/oauth/authorize?client_id=2a2041735c6b19d94dac&redirect_uri=http://localhost:8000/callback&state=STATE&allow_signup=true"
   );
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
   if (state[1] == "STATE") {
    res.end("Your Sign-in is successful...............Please return to the App");
    const tokenResponse = await provider.getToken(code[1]);
    console.log(tokenResponse.data);
    await provider.validateToken(tokenResponse.data);
    process.exit(0);
   }
  }
 });

 server.listen(8000, () => {});
}
main();
