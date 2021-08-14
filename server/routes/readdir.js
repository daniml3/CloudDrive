var multiparty = require("multiparty");
var fs = require("fs");
var formparser = require("../middleware/formparser.js");

const neededFormKeys = ["targetDirectory"];

module.exports = function (app) {
    app.post("/readdir", function (req, res) {
        formparser.parseForm(req, res, neededFormKeys, function(fields, files, generatedForm, response) {
            var targetDirectory = generatedForm["targetDirectory"];

            if (targetDirectory.includes("..")) {
                global.LOG(global.WARNING, "Tried to perform an illegal operation "
                           + "(tried to access to the directory " + targetDirectory + ")");
                response["error"] = true;
                response["errorMessage"] = "Illegal request";
                res.send(response);
                return;
            }

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
