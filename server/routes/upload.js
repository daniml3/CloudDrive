var multiparty = require("multiparty");
var fs = require("fs");

const neededFormKeys = ["targetDirectory"];

module.exports = function (app) {
    app.post("/upload", function (req, res) {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var generatedForm = {};
            var response = {};
            var filename;
            var isInitialChunk;

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
                    console.log("Missing form key " + key);
                    response["error"] = true;
                    response["errorMessage"] = "Missing form key " + key;
                    res.send(response);
                    return;
                }
            }

            isInitialChunk = generatedForm["isInitialChunk"];

            response["error"] = false;
            try {
                for (i = 0; i < Object.keys(files).length; i++) {
                    var targetDirectory = generatedForm["targetDirectory"];

                    if (targetDirectory.includes("..")) {
                        response["error"] = true;
                        response["errorMessage"] = "Illegal request";
                        res.send(response);
                        return;
                    }

                    var file = Object.values(files)[i][0];
                    var filename = generatedForm["filename"];
                    var origin = file["path"];
                    var target = global.fileStorage + targetDirectory + "/";

                    console.log("Receiving the file " + filename);
                    console.log(origin);
                    var fs = require('fs');

                    try {
                        fs.mkdirSync(target, { recursive: true });
                        if (isInitialChunk == "true") {
                            fs.unlinkSync(target + filename);
                        }
                    } catch (err) {}
                    if (isInitialChunk == "true") {
                        console.log("Receiving initial chunk for file " + filename);
                        fs.copyFileSync(origin, target + filename);
                    } else {
                        console.log("Receiving chunk for file " + filename);
                        data = fs.readFileSync(origin);
                        fs.appendFileSync(target + filename, data);
                    }
                }
            } catch (err) {
                console.log(err);
                response["error"] = true;
                response["errorMessage"] = "Failed to copy the file(s)";
            }

            res.send(response);
        });
    });
}
