var multiparty = require("multiparty");
var fs = require("fs");
var tokenVerifier = require("../middleware/tokenverifier.js");

const neededFormKeys = ["targetDirectory", "isInitialChunk", "isLastChunk"];

module.exports = function (app) {
    app.post("/upload", tokenVerifier.verifyToken, function (req, res) {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var generatedForm = {};
            var response = {};
            var filename;
            var isInitialChunk;
            var isLastChunk;

            if (!fields) {
                response["error"] = true;
                response["errorMessage"] = "Missing request body";
                res.send(response);
                return;
            }

            for (i = 0; i < Object.keys(fields).length; i++) {
                generatedForm[Object.keys(fields)[i]] = Object.values(fields)[i][0];
            }

            for (i = 0; i < neededFormKeys.length; i++ ) {
                var key = neededFormKeys[i];
                if (!generatedForm[key]) {
                    global.LOG(global.ERROR, "Missing form key " + key);
                    response["error"] = true;
                    response["errorMessage"] = "Missing form key " + key;
                    res.send(response);
                    return;
                }
            }

            isInitialChunk = generatedForm["isInitialChunk"];
            isLastChunk = generatedForm["isLastChunk"];

            response["error"] = false;
            try {
                for (i = 0; i < Object.keys(files).length; i++) {
                    var targetDirectory = generatedForm["targetDirectory"];

                    if (targetDirectory.includes("..")) {
                        global.LOG(global.WARNING, "Tried to perform an illegal operation "
                                   + "(tried to access to the directory " + targetDirectory + ")");
                        response["error"] = true;
                        response["errorMessage"] = "Illegal request";
                        res.send(response);
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
                        global.LOG(global.INFO, "Receiving initial chunk for file " + filename);
                        fs.copyFileSync(origin, target + filename);
                    } else {
                        global.LOG(global.INFO, "Receiving chunk for file " + filename);
                        data = fs.readFileSync(origin);
                        fs.appendFileSync(target + filename, data);
                    }

                    if (isLastChunk == "true") {
                        global.LOG(global.INFO, "Finished receiving chunks, moving the file");
                        var origin = target + filename;
                        target = global.fileStorage + targetDirectory + "/" + filename;
                        fs.copyFileSync(origin, target);
                        fs.unlinkSync(origin);
                    }
                }
            } catch (err) {
                global.LOG(global.ERROR, err);
                response["error"] = true;
                response["errorMessage"] = "Failed to copy the file(s)";
            }

            res.send(response);
        });
    });
}
