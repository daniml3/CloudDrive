var multiparty = require("multiparty");

module.exports = function (app) {
    app.post('/download', function (req, res) {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var generatedForm = {};
            var response = {};
            var targetFile;

            if (!fields) {
                response["error"] = true;
                response["errorMessage"] = "Missing request body";
                res.send(response);
                return;
            }

            for (i = 0; i < Object.keys(fields).length; i++) {
                generatedForm[Object.keys(fields)[i]] = Object.values(fields)[i];
            }

            if (!generatedForm["targetFile"]) {
                response["error"] = true;
                response["errorMessage"] = "Missing target file to download";
                res.send(response);
                return;
            }

            targetFile = global.fileStorage + generatedForm["targetFile"];
            res.download(targetFile);
        });
    });
}
