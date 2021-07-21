var multiparty = require("multiparty");
var fs = require("fs");

module.exports = function (app) {
    app.post("/mkdir", function (req, res) {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var generatedForm = {};
            var response = {};
            var targetDirectory;

            if (!fields) {
                response["error"] = true;
                response["errorMessage"] = "Missing request body";
                res.send(response);
                return;
            }

            for (i = 0; i < Object.keys(fields).length; i++) {
                generatedForm[Object.keys(fields)[i]] = Object.values(fields)[i];
            }

            if (!generatedForm["targetDirectory"]) {
                console.log("Missing target directory");
                response["error"] = true;
                response["errorMessage"] = "Missing target directory";
                res.send(response);
                return;
            }
            
            targetDirectory = generatedForm["targetDirectory"];

            var directory = global.fileStorage + "/" + targetDirectory + "/";
            response["error"] = false;

            try {
                fs.mkdirSync(directory, { recursive: true });
            } catch (err) {
                response["error"] = true;
                response["errorMessage"] = "Unknown error while creating the directory";
            }

            res.send(response);
        });
    });
};