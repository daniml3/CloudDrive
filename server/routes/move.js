var multiparty = require("multiparty");
var fs = require("fs");
var formparser = require("../middleware/formparser.js");
var tokenVerifier = require("../middleware/tokenverifier.js");
var actionVerifier = require("../middleware/actionverifier.js");

const neededFormKeys = ["originPath", "targetPath"];

module.exports = function (app) {
    app.post("/move", tokenVerifier.verifyToken, function (req, res) {
        formparser.parseForm(req, res, neededFormKeys, function(fields, files, generatedForm, response) {
            var originPath = global.fileStorage + generatedForm["originPath"];
            var targetPath = global.fileStorage + generatedForm["targetPath"];

            if (actionVerifier.isPathIllegal(res, originPath)
                || actionVerifier.isPathIllegal(res, targetPath)) {
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
