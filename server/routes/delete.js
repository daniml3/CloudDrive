var multiparty = require("multiparty");
var fs = require("fs");
var formparser = require("../middleware/formparser.js");
var tokenVerifier = require("../middleware/tokenverifier.js");

const neededFormKeys = ["targetPath", "isFile"];

module.exports = function (app) {
    app.post("/delete", tokenVerifier.verifyToken, function (req, res) {
        formparser.parseForm(req, res, neededFormKeys, function(fields, files, generatedForm, response) {
            var targetPath = generatedForm["targetPath"];
            var isFile = generatedForm["isFile"];

            if (targetPath.includes("..")) {
                global.LOG(global.WARNING, "Tried to perform an illegal operation "
                           + "(tried to access to the directory " + targetDirectory + ")");
                response["error"] = true;
                response["errorMessage"] = "Illegal request";
                res.send(response);
                return;
            }

            var directory = global.fileStorage + "/" + targetPath;
            response["error"] = false;

            try {
                if (isFile == "true") {
                    fs.unlinkSync(directory);
                } else {
                    fs.rmdirSync(directory, {recursive: true})
                }
            } catch (err) {
                global.LOG(global.ERROR, err);
                response["error"] = true;
                response["errorMessage"] = "Unknown error while deleting the path";
            }

            res.send(response);
        });
    });
};
