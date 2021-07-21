var multiparty = require("multiparty");
var fs = require("fs");

module.exports = function (app) {
    app.post("/readdir", function (req, res) {
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
}