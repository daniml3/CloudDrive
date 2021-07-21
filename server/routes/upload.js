var multiparty = require("multiparty");
var fs = require("fs");
var splitFile = require('split-file');

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
                generatedForm[Object.keys(fields)[i]] = Object.values(fields)[i];
            }

            console.log(generatedForm);

            if (!generatedForm["targetDirectory"]) {
                console.log("Missing target directory");
                response["error"] = true;
                response["errorMessage"] = "Missing target directory";
                res.send(response);
                return;
            }

            isInitialChunk = generatedForm["isInitialChunk"];

            response["error"] = false;
            try {
                for (i = 0; i < Object.keys(files).length; i++) {
                    var targetDirectory = generatedForm["targetDirectory"];
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
                        console.log("Receiving upload for file " + filename);
                        fs.copyFileSync(origin, target + filename);
                    } else {
                        console.log("Received another chunk for " + filename);
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