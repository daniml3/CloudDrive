var multiparty = require("multiparty");
var fs = require("fs");
var credentialManager = require('../auth/credentialmanager');
var formparser = require("../middleware/formparser.js");
var tokenVerifier = require("../middleware/tokenverifier.js");

const neededFormKeys1 = ["username", "password"];
const neededFormKeys2 = ["token"];
const authDatabase = {"username": "daniml3", "password": "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"};

module.exports = function (app) {
    app.post("/retrievesession", function (req, res) {
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

    app.post("/validatetoken", function (req, res) {
        formparser.parseForm(req, res, neededFormKeys2, function(fields, files, generatedForm, response) {
            var token = generatedForm["token"];

            response["error"] = false;
            response["isValid"] = credentialManager.isTokenValid(token);

            res.send(response);
        });
    });

    app.post("/revoketoken", function (req, res) {
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
