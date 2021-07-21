var express = require("express");
var multiparty = require("multiparty");
var fs = require("fs");

var app = express();

var port = 3333;

global.fileStorage = __dirname + "/" + "./files/";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(port, () => {
    console.log("We are live on " + port);
});

app.use(express.static("../client/"));

var routeList = fs.readdirSync("./routes/");
for (i = 0; i < routeList.length; i++) {
    require("./routes/" + routeList[i].split(".")[0])(app);
}