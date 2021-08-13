var multiparty = require("multiparty");
var fs = require("fs");
var credentialManager = require('../auth/credentialmanager.js');
var formparser = require("../middleware/formparser.js");
var tokenVerifier = require("../middleware/tokenverifier.js");

const neededFormKeys1 = ["username", "password"];
const neededFormKeys2 = ["token"];

module.exports = function (app) {
    app.post("/getsessiontoken", function (req, res) {
        formparser.parseForm(req, res, neededFormKeys1, function(fields, files, generatedForm, response) {
            var username = generatedForm["username"];
            var password = generatedForm["password"];
            var generatedToken = credentialManager.generateToken(username, password);

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
        formparser.parseForm(req, res, neededFormKeys2, function(fields, files, generatedForm, response) {
            var token = generatedForm["token"];
            var generatedToken = credentialManager.generateOneTimeToken(token);

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

    app.post("/istokenvalid", function (req, res) {
        formparser.parseForm(req, res, neededFormKeys2, function(fields, files, generatedForm, response) {
            var token = generatedForm["token"];

            response["error"] = false;
            response["isValid"] = credentialManager.isTokenValid(token);

            res.send(response);
        });
    });

    app.post("/revokesessiontoken", function (req, res) {
        formparser.parseForm(req, res, neededFormKeys2, function(fields, files, generatedForm, response) {
            var token = generatedForm["token"];
            response["error"] = credentialManager.revokeToken(token);
            res.send(response);
        });
    });

    app.get("/isinsecure", function (req, res) {
        var response = {};
        response["isInsecure"] = credentialManager.isInsecure();
        res.send(response);
    });
};
