var multiparty = require("multiparty");
var fs = require("fs");
var formparser = require("../middleware/formparser.js");
var tokenVerifier = require("../middleware/tokenverifier.js");
var actionVerifier = require("../middleware/actionverifier.js");

const checkDiskSpace = require('check-disk-space').default;
const neededFormKeys1 = ["targetDirectory"];
const neededFormKeys2 = ["targetDirectory", "requestTimestamp"];

module.exports = function (app) {
    app.post("/readdir", tokenVerifier.verifyToken, function (req, res) {
        formparser.parseForm(req, res, neededFormKeys1, function(fields, files, generatedForm, response) {
            var targetDirectory = generatedForm["targetDirectory"];

            if (actionVerifier.isPathIllegal(res, targetDirectory)) {
                return;
            }

            response["error"] = false;
            response["fileList"] = [];
            response["freeSpace"] = 0;
            response["totalSpace"] = 0;
            var directory = global.fileStorage + "/" + targetDirectory + "/";
            try {
                var list = fs.readdirSync(directory);
                for (i = 0; i < list.length; i++) {
                    isFile = fs.statSync(directory + list[i]).isFile();
                    response["fileList"][i] = { "name": list[i], "isFile": isFile };
                }
                response["parentAvailable"] = (targetDirectory != "/");
            } catch (err) {
                response["error"] = true;
                response["errorCode"] = err.code;
                response["errorMessage"] = "Error while listing the directory";;
            }

            checkDiskSpace(targetDirectory).then((diskSpace) => {
                response["freeSpace"] = diskSpace.free;
                response["totalSpace"] = diskSpace.size;
                res.send(response);
            });
        });
    });

    app.post("/watchdir", tokenVerifier.verifyToken, function (req, res) {
        formparser.parseForm(req, res, neededFormKeys2, function(fields, files, generatedForm, response) {
            var targetDirectory = generatedForm["targetDirectory"];
            var requestTimestamp = generatedForm["requestTimestamp"];

            if (actionVerifier.isPathIllegal(res, targetDirectory)) {
                return;
            }

            response["error"] = false;
            var directory = global.fileStorage + "/" + targetDirectory + "/";
            try {
                var currentStats = fs.statSync(directory);
                var timeDifference = currentStats.mtimeMs - requestTimestamp;
                if (timeDifference > 0) {
                    res.send(response);
                } else {
                    fs.watch(directory, function(eventType, filename) {
                        res.send(response);
                        this.close();
                    });
                }
            } catch (err) {
                response["error"] = true;
                res.send(response);
            }
        });
    });
}
