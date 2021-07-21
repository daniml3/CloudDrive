var multiparty = require("multiparty");
var fs = require("fs");

const neededFormKeys = ["targetPath", "isFile"];

module.exports = function (app) {
    app.post("/delete", function (req, res) {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var generatedForm = {};
            var response = {};
            var targetPath;
            var isFile;

            if (!fields) {
                response["error"] = true;
                response["errorMessage"] = "Missing request body";
                res.send(response);
                return;
            }

            for (i = 0; i < Object.keys(fields).length; i++) {
                generatedForm[Object.keys(fields)[i]] = Object.values(fields)[i];
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

            targetPath = generatedForm["targetPath"][0];
            isFile = generatedForm["isFile"];

            var directory = global.fileStorage + "/" + targetPath;
            response["error"] = false;

            try {
                if (isFile == "true") {
                    fs.unlinkSync(directory);
                } else {
                    fs.rmdirSync(directory, {recursive: true})
                }
            } catch (err) {
                console.log(err);
                response["error"] = true;
                response["errorMessage"] = "Unknown error while deleting the path";
            }

            res.send(response);
        });
    });
};
