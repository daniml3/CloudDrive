var multiparty = require("multiparty");
var fs = require("fs");
var formparser = require("../middleware/formparser.js");
var tokenVerifier = require("../middleware/tokenverifier.js");

const neededFormKeys = ["targetDirectory"];

module.exports = function (app) {
    app.post("/readdir", tokenVerifier.verifyToken, function (req, res) {
        formparser.parseForm(req, res, neededFormKeys, function(fields, files, generatedForm, response) {
            var targetDirectory = generatedForm["targetDirectory"];

            if (targetDirectory.includes("..")) {
                global.LOG(global.WARNING, "Tried to perform an illegal operation "
                           + "(tried to access to the directory " + targetDirectory + ")");
                response["error"] = true;
                response["errorMessage"] = "Illegal request";
                res.send(response);
                return;
            }

            response["error"] = false;
            response["fileList"] = [];
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
                response["errorMessage"] = "Error while listing the directory (" + directory + err.code + ")";
            }

            res.send(response);
        });
    });

    app.post("/watchdir", tokenVerifier.verifyToken, function (req, res) {
        formparser.parseForm(req, res, neededFormKeys, function(fields, files, generatedForm, response) {
            var targetDirectory = generatedForm["targetDirectory"];

            if (targetDirectory.includes("..")) {
                global.LOG(global.WARNING, "Tried to perform an illegal operation "
                           + "(tried to access to the directory " + targetDirectory + ")");
                response["error"] = true;
                response["errorMessage"] = "Illegal request";
                res.send(response);
                return;
            }

            response["error"] = false;
            var directory = global.fileStorage + "/" + targetDirectory + "/";
            try {
                fs.watch(directory, function(eventType, filename) {
                    try {
                        res.send(response);
                    } catch (err) {
                        // TODO: figure out why this errors even if the request has been sent successfully
                    }
                });
            } catch (err) {
                response["error"] = true;
                res.send(response);
            }
        });
    });
}
