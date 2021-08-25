var multiparty = require("multiparty");
var fs = require("fs");
var formparser = require("../middleware/formparser.js");
var tokenVerifier = require("../middleware/tokenverifier.js");
var actionVerifier = require("../middleware/actionverifier.js");
var logger = require("../utils/logger.js");

const neededFormKeys = ["targetPath", "isFile"];

module.exports = function (app) {
    app.post("/delete", tokenVerifier.verifyToken, function (req, res) {
        formparser.parseForm(req, res, neededFormKeys, function(fields, files, generatedForm, response) {
            var targetPath = generatedForm["targetPath"];
            var isFile = generatedForm["isFile"];

            if (actionVerifier.isPathIllegal(res, targetPath)) {
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
                logger.LOG(global.ERROR, err);
                response["error"] = true;
                response["errorMessage"] = "Unknown error while deleting the path";
            }

            res.send(response);
        });
    });
};
