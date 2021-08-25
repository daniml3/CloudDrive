var multiparty = require("multiparty");

function parseForm(req, res, neededFormKeys, callback) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        var generatedForm = {};
        var response = {};

        if (!fields) {
            response["error"] = true;
            response["errorMessage"] = "Missing request body";
            res.send(response);
            return;
        }

        for (i = 0; i < Object.keys(fields).length; i++) {
            generatedForm[Object.keys(fields)[i]] = Object.values(fields)[i][0];
        }

        for (i = 0; i < neededFormKeys.length; i++ ) {
            var key = neededFormKeys[i];
            if (!generatedForm[key]) {
                logger.LOG(logger.ERROR, "Missing form key " + key);
                response["error"] = true;
                response["errorMessage"] = "Missing form key " + key;
                res.send(response);
                return;
            }
        }

        callback(fields, files, generatedForm, response);
    });
}

module.exports = {
    parseForm: parseForm
};
