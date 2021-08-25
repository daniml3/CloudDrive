var multiparty = require("multiparty");
var fs = require("fs");
var formparser = require("../middleware/formparser.js");
var tokenVerifier = require("../middleware/tokenverifier.js");
var actionVerifier = require("../middleware/actionverifier.js");
var logger = require("../utils/logger.js");

const neededFormKeys = ["targetDirectory", "isInitialChunk", "isLastChunk"];

module.exports = function (app) {
    app.post("/upload", tokenVerifier.verifyToken, function (req, res) {
        formparser.parseForm(req, res, neededFormKeys, function(fields, files, generatedForm, response) {
            var isInitialChunk = generatedForm["isInitialChunk"];
            var isLastChunk = generatedForm["isLastChunk"];
            var filename;

            response["error"] = false;
            try {
                for (i = 0; i < Object.keys(files).length; i++) {
                    var targetDirectory = generatedForm["targetDirectory"];

                    if (actionVerifier.isPathIllegal(res, targetDirectory)) {
                        return;
                    }

                    var file = Object.values(files)[i][0];
                    var filename = generatedForm["filename"];
                    var origin = file["path"];
                    var target = global.tempFileStorage + targetDirectory + "/";

                    try {
                        fs.mkdirSync(target, { recursive: true });
                        if (isInitialChunk == "true") {
                            fs.unlinkSync(target + filename);
                        }
                    } catch (err) {}
                    if (isInitialChunk == "true") {
                        logger.LOG(logger.INFO, "Receiving initial chunk for file " + filename);
                        fs.copyFileSync(origin, target + filename);
                    } else {
                        logger.LOG(logger.INFO, "Receiving chunk for file " + filename);
                        data = fs.readFileSync(origin);
                        fs.appendFileSync(target + filename, data);
                    }

                    if (isLastChunk == "true") {
                        logger.LOG(logger.INFO, "Finished receiving chunks, moving the file");
                        var origin = target + filename;
                        target = global.fileStorage + targetDirectory + "/" + filename;
                        fs.copyFileSync(origin, target);
                        fs.unlinkSync(origin);
                    }
                }
            } catch (err) {
                logger.LOG(logger.ERROR, err);
                response["error"] = true;
                response["errorMessage"] = "Failed to copy the file(s)";
            }

            res.send(response);
        });
    });
}
