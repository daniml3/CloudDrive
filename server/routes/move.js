var multiparty = require("multiparty");
var fs = require("fs");

const neededFormKeys = ["originPath", "targetPath"];

module.exports = function (app) {
    app.post("/move", function (req, res) {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var generatedForm = {};
            var response = {};
            var originPath;
            var targetPath;

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

            originPath = global.fileStorage + generatedForm["originPath"];
            targetPath = global.fileStorage + generatedForm["targetPath"];

            response["error"] = false;

            try {
                fs.renameSync(originPath, targetPath);
            } catch (err) {
                response["error"] = true;
                response["errorMessage"] = "Unknown error while moving the files or directories";
            }

            res.send(response);
        });
    });
};
