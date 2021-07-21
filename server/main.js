var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var multiparty = require('multiparty');
var fs = require("fs");

var app = express();

var port = 3333;

const fileStorage = "./files/";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(port, () => {
    console.log('We are live on ' + port);
});

app.post('/upload', function(req, res) {
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        var generatedForm = {};
        var response = {};
        var filesToUpload = [];

        if (!fields) {
            response['error'] = true;
            response['errorMessage'] = "Missing request body";
            res.send(response);
            return;
        }

        for (i = 0; i < Object.keys(fields).length; i++) {
            generatedForm[Object.keys(fields)[i]] = Object.values(fields)[i];
        }

        console.log(generatedForm);

        if (!generatedForm['targetDirectory']) {
            console.log('Missing target directory');
            response['error'] = true;
            response['errorMessage'] = "Missing target directory";
            res.send(response);
            return;
        }

        if (String(generatedForm['targetDirectory']).charAt(0) != "/") {
            console.log("Invalid target directory");
            response['error'] = true;
            response['errorMessage'] = "Invalid target directory (missing / at the start)";
            res.send(response);
            return;
        }

        response["error"] = false;
        try {
            for (i = 0; i < Object.keys(files).length; i++) {
                var targetDirectory = generatedForm["targetDirectory"];
                var file = Object.values(files)[i][0];
                var filename = file["originalFilename"];
                var origin = file["path"];
                var target = __dirname + "/" + fileStorage + targetDirectory + "/";

                console.log("Receiving the file " + filename);

                try {
                    fs.mkdirSync(target, {recursive: true});
                } catch (err) {}
                fs.copyFileSync(origin, target + filename);
                console.log("Done copying, deleting cached file");
                fs.unlinkSync(origin);
                console.log("Done");
            }
        } catch (err) {
            response["error"] = true;
            response["errorMessage"] = "Failed to copy the file(s)";
        }

        res.send(response);
    });
});
