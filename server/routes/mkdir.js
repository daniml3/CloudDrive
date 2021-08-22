var multiparty = require("multiparty");
var fs = require("fs");
var formparser = require("../middleware/formparser.js");
var tokenVerifier = require("../middleware/tokenverifier.js");
var actionVerifier = require("../middleware/actionverifier.js");

const neededFormKeys = ["targetDirectory"];

module.exports = function (app) {
    app.post("/mkdir", tokenVerifier.verifyToken, function (req, res) {
        formparser.parseForm(req, res, neededFormKeys, function(fields, files, generatedForm, response) {
            var targetDirectory = generatedForm["targetDirectory"];

            if (actionVerifier.isPathIllegal(res, targetDirectory)) {
                return;
            }

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
