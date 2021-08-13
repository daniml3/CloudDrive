var express = require("express");
var multiparty = require("multiparty");
var fs = require("fs");
var credentialManager = require("./auth/credentialmanager.js");

var app = express();

global.port = process.env.CLOUDDRIVE_PORT || 3000;
global.fileStorage = process.env.CLOUDDRIVE_STORAGE ||  __dirname + "/" + "./files/";
global.tempFileStorage = process.env.CLOUDDRIVE_TEMP_STORAGE || __dirname + "/" + "./temporal/";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

global.INFO = "INFO";
global.WARNING = "WARNING";
global.ERROR = "ERROR";

global.LOG = function (level, text) {
    console.log("[" + level + "]: " + text);
}

app.listen(global.port, () => {
    global.LOG(INFO, "We are live on " + port);
    global.LOG(INFO, "Storage directory at " + global.fileStorage);
    global.LOG(INFO, "Temporal storage directory at " + global.tempFileStorage);
});

app.use(express.static("../client/", {extensions: ["html"]}));

try {
    fs.rmdirSync(global.tempFileStorage, {recursive: true});
    global.LOG(global.INFO, "Cleaned the temporal files directory");
} catch (err) {}

var authConfigFile = process.env.CLOUDDRIVE_AUTH_CONFIG || __dirname + "/" + "../authConfig.json";
try {
    credentialManager.parseConfig(JSON.parse(fs.readFileSync(authConfigFile, "utf8")));
} catch (err) {
    global.LOG(global.WARNING, "Failed to load the auth config at " + authConfigFile);
    global.LOG(global.WARNING, "The server will run without security");
    global.LOG(global.ERROR, err);
    credentialManager.setInsecure(true);
}

var routeList = fs.readdirSync("./routes/");
for (i = 0; i < routeList.length; i++) {
    global.LOG(INFO, "Loading route " + routeList[i]);
    require("./routes/" + routeList[i].split(".")[0])(app);
}
