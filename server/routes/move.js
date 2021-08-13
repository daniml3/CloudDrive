var multiparty = require("multiparty");
var fs = require("fs");
var formparser = require("../middleware/formparser.js");
var tokenVerifier = require("../middleware/tokenverifier.js");

const neededFormKeys = ["originPath", "targetPath"];

module.exports = function (app) {
    app.post("/move", tokenVerifier.verifyToken, function (req, res) {
        formparser.parseForm(req, res, neededFormKeys, function(fields, files, generatedForm, response) {
            var originPath = global.fileStorage + generatedForm["originPath"];
            var targetPath = global.fileStorage + generatedForm["targetPath"];

            if (originPath.includes("..") || targetPath.includes("..")) {
                global.LOG(global.WARNING, "Tried to perform an illegal operation "
                           + "(tried to access to the directory " + targetDirectory
                           + " and/or " + targetPath + ")");
                response["error"] = true;
                response["errorMessage"] = "Illegal request";
                res.send(response);
                return;
            }

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
