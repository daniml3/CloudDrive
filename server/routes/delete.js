var multiparty = require("multiparty");
var fs = require("fs");

module.exports = function (app) {
    app.post("/delete", function (req, res) {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var generatedForm = {};
            var response = {};
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

            if (!generatedForm["targetPath"]) {
                console.log("Missing target path");
                response["error"] = true;
                response["errorMessage"] = "Missing target path";
                res.send(response);
                return;
            }

            targetPath = generatedForm["targetPath"][0];
            var directory = global.fileStorage + "/" + targetPath;
            response["error"] = false;

            try {
                fs.unlinkSync(directory);
            } catch (err) {
                response["error"] = true;
                response["errorMessage"] = "Unknown error while deleting the path";
            }

            res.send(response);
        });
    });
};
