var express = require("express");
var multiparty = require("multiparty");
var fs = require("fs");
var credentialManager = require("./auth/credentialmanager.js");
var logger = require("./utils/logger.js");

var app = express();

const apiVersion = 1.1;

global.port = process.env.CLOUDDRIVE_PORT || 3000;
global.fileStorage = process.env.CLOUDDRIVE_STORAGE ||  __dirname + "/" + "./files/";
global.tempFileStorage = process.env.CLOUDDRIVE_TEMP_STORAGE || __dirname + "/" + "./temporal/";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(global.port, () => {
    logger.LOG(logger.INFO, "We are live on " + port);
    logger.LOG(logger.INFO, "Storage directory at " + global.fileStorage);
    logger.LOG(logger.INFO, "Temporal storage directory at " + global.tempFileStorage);
    logger.LOG(logger.INFO, "API version " + apiVersion);
});

app.use(express.static("../client/", {extensions: ["html"]}));

try {
    fs.rmdirSync(global.tempFileStorage, {recursive: true});
    logger.LOG(logger.INFO, "Cleaned the temporal files directory");
} catch (err) {}

var authConfigFile = process.env.CLOUDDRIVE_AUTH_CONFIG || __dirname + "/" + "../authConfig.json";
try {
    credentialManager.parseConfig(JSON.parse(fs.readFileSync(authConfigFile, "utf8")));
} catch (err) {
    logger.LOG(logger.WARNING, "Failed to load the auth config at " + authConfigFile);
    logger.LOG(logger.WARNING, "The server will run without security");
    logger.LOG(logger.ERROR, err);
}

var routeList = fs.readdirSync("./routes/");
for (i = 0; i < routeList.length; i++) {
    logger.LOG(logger.INFO, "Loading route " + routeList[i]);
    require("./routes/" + routeList[i].split(".")[0])(app);
}
