var multiparty = require("multiparty");
var fs = require("fs");
var credentialManager = require('../auth/credentialmanager');
var tokenVerifier = require("../middleware/tokenverifier.js");

const neededFormKeys1 = ["username", "password"];
const neededFormKeys2 = ["token"];
const authDatabase = {"username": "daniml3", "password": "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"};

module.exports = function (app) {
    app.post("/retrievesession", function (req, res) {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var generatedForm = {};
            var response = {};
            var username;
            var password;
            var generatedToken;

            if (!fields) {
               response["error"] = true;
                response["errorMessage"] = "Missing request body";
                res.send(response);
                return;
            }

            for (i = 0; i < Object.keys(fields).length; i++) {
                generatedForm[Object.keys(fields)[i]] = Object.values(fields)[i][0];
            }

            for (i = 0; i < neededFormKeys1.length; i++ ) {
                var key = neededFormKeys1[i];
                if (!generatedForm[key]) {
                    global.LOG(global.ERROR, "Missing form key " + key);
                    response["error"] = true;
                    response["errorMessage"] = "Missing form key " + key;
                    res.send(response);
                    return;
                }
            }

            username = generatedForm["username"];
            password = generatedForm["password"];

            generatedToken = credentialManager.generateToken(username, password);
            if (!generatedToken) {
                response["error"] = true;
                response["errorMessage"] = "Invalid credentials";
            } else {
                response["error"] = false;
                response["sessionToken"] = generatedToken;
            }

            res.send(response);
        });
    });

    app.post("/getonetimetoken", function (req, res) {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var generatedForm = {};
            var response = {};
            var username;
            var password;
            var isValid;
            var token;

            if (!fields) {
               response["error"] = true;
                response["errorMessage"] = "Missing request body";
                res.send(response);
                return;
            }

            for (i = 0; i < Object.keys(fields).length; i++) {
                generatedForm[Object.keys(fields)[i]] = Object.values(fields)[i][0];
            }

            for (i = 0; i < neededFormKeys2.length; i++ ) {
                var key = neededFormKeys2[i];
                if (!generatedForm[key]) {
                    global.LOG(global.ERROR, "Missing form key " + key);
                    response["error"] = true;
                    response["errorMessage"] = "Missing form key " + key;
                    res.send(response);
                    return;
                }
            }

            token = generatedForm["token"];

            generatedToken = credentialManager.generateOneTimeToken(token);
            if (!generatedToken) {
                response["error"] = true;
                response["errorMessage"] = "Invalid credentials";
            } else {
                response["error"] = false;
                response["oneTimeToken"] = generatedToken;
            }

            res.send(response);
        });
    });

    app.post("/validatetoken", function (req, res) {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var generatedForm = {};
            var response = {};
            var username;
            var password;
            var token;

            if (!fields) {
               response["error"] = true;
                response["errorMessage"] = "Missing request body";
                res.send(response);
                return;
            }

            for (i = 0; i < Object.keys(fields).length; i++) {
                generatedForm[Object.keys(fields)[i]] = Object.values(fields)[i][0];
            }

            for (i = 0; i < neededFormKeys2.length; i++ ) {
                var key = neededFormKeys2[i];
                if (!generatedForm[key]) {
                    global.LOG(global.ERROR, "Missing form key " + key);
                    response["error"] = true;
                    response["errorMessage"] = "Missing form key " + key;
                    res.send(response);
                    return;
                }
            }

            token = generatedForm["token"];

            response["error"] = false;
            response["isValid"] = credentialManager.isTokenValid(token);

            res.send(response);
        });
    });

    app.post("/revoketoken", function (req, res) {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var generatedForm = {};
            var response = {};
            var username;
            var password;
            var token;

            if (!fields) {
               response["error"] = true;
                response["errorMessage"] = "Missing request body";
                res.send(response);
                return;
            }

            for (i = 0; i < Object.keys(fields).length; i++) {
                generatedForm[Object.keys(fields)[i]] = Object.values(fields)[i][0];
            }

            for (i = 0; i < neededFormKeys2.length; i++ ) {
                var key = neededFormKeys2[i];
                if (!generatedForm[key]) {
                    global.LOG(global.ERROR, "Missing form key " + key);
                    response["error"] = true;
                    response["errorMessage"] = "Missing form key " + key;
                    res.send(response);
                    return;
                }
            }

            token = generatedForm["token"];

            response["error"] = credentialManager.revokeToken(token);

            res.send(response);
        });
    });
};
