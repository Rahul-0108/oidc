const Helper = require("./Helper");
const codeChallenge = Helper.getCodeChallenge();
const providers = {
 Auth0: {
  // https://manage.auth0.com/dashboard/us/dev-p54mppx8/applications/ZoO6Iaitgk95Txs67UCkIepHrNvPBm1h/settings
  authorizeEndpoint:
   "https://dev-p54mppx8.auth0.com/authorize?response_type=code&client_id=ZoO6Iaitgk95Txs67UCkIepHrNvPBm1h&redirect_uri=http://localhost:8000/callback&scope=openid profile email offline_access&state=STATE",
  authorizeEndpointPKCE: `https://dev-p54mppx8.auth0.com/authorize?response_type=code&code_challenge=${codeChallenge.challenge}&code_challenge_method=S256&client_id=ZoO6Iaitgk95Txs67UCkIepHrNvPBm1h&redirect_uri=http://localhost:8000/callback&scope=openid profile email offline_access&state=STATE`,
  authorizeEndpointImplicit:
   "https://dev-p54mppx8.auth0.com/authorize?response_type=id_token token&response_mode=form_post&client_id=ZoO6Iaitgk95Txs67UCkIepHrNvPBm1h&redirect_uri=http://localhost:8000/callback&scope=openid profile email&state=STATE&nonce=NONCE",
  authorizeEndpointHybrid:
   "https://dev-p54mppx8.auth0.com/authorize?response_type=code id_token&response_mode=form_post&client_id=ZoO6Iaitgk95Txs67UCkIepHrNvPBm1h&redirect_uri=http://localhost:8000/callback&scope=openid profile email offline_access&state=STATE&nonce=NONCE",
  well_known_Enpoint: "https://dev-p54mppx8.auth0.com/.well-known/openid-configuration",
  jwk_endpoint: "https://dev-p54mppx8.auth0.com/.well-known/jwks.json",
  issuer: "https://dev-p54mppx8.auth0.com/",
  userinfo: "https://dev-p54mppx8.auth0.com/userinfo",
  token_Endpoint: "https://dev-p54mppx8.auth0.com/oauth/token",
  client_id: "ZoO6Iaitgk95Txs67UCkIepHrNvPBm1h",
  client_secret: "qZUyxh18jRhHqK4ZhKbK3sLDHzMGpunLUolU_kBu6qAPaaOsdnw2CjA66tAb4oAS",
  logoutUrl: `https://dev-p54mppx8.auth0.com/v2/logout?client_id=ZoO6Iaitgk95Txs67UCkIepHrNvPBm1h&returnTo=`,
  // Register a new Application of Native type in Autho for Device code Flow
  deviceCodeDomain: "https://dev-p54mppx8.auth0.com/oauth/", //https://manage.auth0.com/dashboard/us/dev-p54mppx8/applications/NjwhpnHVgFEsxBrRjnnheTRvPWQhIZ6P/settings
  deviceCodeApplicationClientID: "NjwhpnHVgFEsxBrRjnnheTRvPWQhIZ6P",
 },
 Linkedin: {
  authorizeEndpoint:
   "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=78h70r4utzrm3i&redirect_uri=http://localhost:8000/callback&state=STATE&scope=r_liteprofile r_emailaddress w_member_social",
  client_id: "78h70r4utzrm3i",
  client_secret: "mwyxoAgBld5cnLJ5",
 },
 Github: {
  authorizeEndpoint:
   "https://github.com/login/oauth/authorize?client_id=2a2041735c6b19d94dac&redirect_uri=http://localhost:8000/callback&state=STATE&allow_signup=true",
  client_id: "2a2041735c6b19d94dac",
  client_secret: "8833dcab2d236f58f1f729cb138c40e3f7160501",
 },
 Facebook: {
  authorizeEndpoint:
   "https://www.facebook.com/v11.0/dialog/oauth?client_id=265101321715922&redirect_uri=http://localhost:8000/callback&scope=public_profile,email,user_birthday,user_gender,user_hometown,user_friends&state=STATE&auth_type=rerequest&display=popup",
  client_id: "265101321715922",
  client_secret: "3e512e2cdef8123efd07e7862228da7d",
 },
 Google: {
  authorizeEndpoint:
   "https://accounts.google.com/o/oauth2/v2/auth?client_id=896179419315-94vjhknuoe8cpjuolpb8e9a3nj8kf7ce.apps.googleusercontent.com&redirect_uri=http://localhost:8000/callback&response_type=code&scope=openid profile email https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/user.organization.read https://www.googleapis.com/auth/user.phonenumbers.read&access_type=offline&state=STATE&nonce=MyPROFILE&include_granted_scopes=true&prompt=consent",
  pkceImplicitConfig: `authorization_endpoint=https://accounts.google.com/o/oauth2/v2/auth&client_id=896179419315-94vjhknuoe8cpjuolpb8e9a3nj8kf7ce.apps.googleusercontent.com&redirect_uri=http://localhost:8000/callback.html&scope=openid profile email https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/user.organization.read https://www.googleapis.com/auth/user.phonenumbers.read&access_type=offline&include_granted_scopes=true&prompt=consent&client_secret=bvfs719rXKa8XPVixysG1-5c&token_endpoint=https://oauth2.googleapis.com/token`,
  client_id: "896179419315-94vjhknuoe8cpjuolpb8e9a3nj8kf7ce.apps.googleusercontent.com",
  client_secret: "bvfs719rXKa8XPVixysG1-5c",
  deviceCodeApplicationClientID: "115389025412-15a4u4u80n6jdlot57j0ap4tgf44n55j.apps.googleusercontent.com",
  deviceCodeApplicationClientSecret: "nWj4TEzDZibEmj5jURnlTPpW",
 },
 Bentley: {
  authorizeEndpoint: `https://ims.bentley.com/connect/authorize?response_type=code&client_id=webapp-YdGmqkvUNc1EqItAlmbX65uHd&redirect_uri=http://localhost:8000/callback&scope=openid itwinjs organization imodels:read library:modify users:read projects:read projects:modify storage:modify library:read storage:read email profile imodels:modify realitydata:read offline_access&state=STATE`,
  authorizeEndpointPKCE: `https://ims.bentley.com/connect/authorize?response_type=code&code_challenge=${codeChallenge.challenge}&code_challenge_method=S256&client_id=spa-VNg1NHNYYXr9gmlNgooEmy9di&redirect_uri=http://localhost:8000/callback&scope=designelementclassification:modify insights:read clashdetection:modify forms:modify changedelements:read issues:read validation:modify clashdetection:read forms:read issues:modify validation:read webhooks:read webhooks:modify changedelements:modify email insights:modify projects:read openid profile organization itwinjs transformations:read transformations:modify synchronization:modify synchronization:read library:modify realitydata:modify imodels:read realitydata:read library:read imodels:modify storage:modify storage:read projects:modify users:read designelementclassification:read&state=STATE`,
  client_id: "webapp-YdGmqkvUNc1EqItAlmbX65uHd",
  client_idSPA: "spa-VNg1NHNYYXr9gmlNgooEmy9di",
  client_secret: "Pq4Jv0PhuqbECfUjaobCUfdNx2n9Q5Sw1yq8ZCIQtLG0vugUzYKxX+1MV2dUFrwyKJGATiaoZ0cO49hTTW5Uhg==",
  scope:
   "openid itwinjs organization imodels:read library:modify users:read projects:read projects:modify storage:modify library:read storage:read email profile imodels:modify realitydata:read offline_access",
  scopeSPA:
   "designelementclassification:modify insights:read clashdetection:modify forms:modify changedelements:read issues:read validation:modify clashdetection:read forms:read issues:modify validation:read webhooks:read webhooks:modify changedelements:modify email insights:modify projects:read openid profile organization itwinjs transformations:read transformations:modify synchronization:modify synchronization:read library:modify realitydata:modify imodels:read realitydata:read library:read imodels:modify storage:modify storage:read projects:modify users:read designelementclassification:read",
  well_known_Enpoint: "https://ims.bentley.com/.well-known/openid-configuration",
  jwk_endpoint: "https://ims.bentley.com/.well-known/openid-configuration/jwks",
  issuer: "https://ims.bentley.com",
  userinfo: "https://ims.bentley.com/connect/userinfo",
  token_Endpoint: "https://ims.bentley.com/connect/token",
  deviceCodeAuthorizationEndpoint: "https://ims.bentley.com/as/device_authz.oauth2",
  deviceCodeScope: "offline_access openid profile organization email imodelhub",
  deviceCodeClientId: "itwinxr-hololens-app",
  authorizeEndpointHybrid: `https://qa-imsoidc.bentley.com/connect/authorize?response_type=code id_token&response_mode=form_post&client_id=imsoidc-example-hybrid-public-client&redirect_uri=http://localhost:5000/signin-oidc&scope=openid profile email&state=STATE&nonce=MyProfile&code_challenge=${codeChallenge.verifier}`, // we are going to use plain code challenge here(the same verifier will be used as challenge also , we won't do hashing of the code_verifier because we are getting error while creating code_challenge using hash of code_verifier) https://www.oauth.com/playground/authorization-code-with-pkce.html
  tokenEndpointHybrid: "https://qa-imsoidc.bentley.com/connect/token",
  client_idHybrid: "imsoidc-example-hybrid-public-client",
  logoutUrl: `https://ims.bentley.com/connect/endsession?post_logout_redirect_uri=`,
  qaLogoutUrl: `https://qa-imsoidc.bentley.com/connect/endsession?post_logout_redirect_uri=`,
 },
 codeChallenge,
};

module.exports = providers;
