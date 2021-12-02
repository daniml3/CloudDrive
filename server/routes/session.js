var multiparty = require("multiparty");
var fs = require("fs");
var credentialManager = require('../auth/credentialmanager.js');
var formparser = require("../middleware/formparser.js");
var tokenVerifier = require("../middleware/tokenverifier.js");

const neededFormKeys1 = ["username", "password", "sessionLongevity"];
const neededFormKeys2 = ["token"];
const neededFormKeys3 = ["token", "tokenLongevitySeconds"];
const neededFormKeys4 = ["token", "filePath"];

module.exports = function (app) {
    app.post("/getsessiontoken", function (req, res) {
        formparser.parseForm(req, res, neededFormKeys1, function(fields, files, generatedForm, response) {
            var username = generatedForm["username"];
            var password = generatedForm["password"];
            var longevity = generatedForm["sessionLongevity"] * 1000;
            var generatedToken = credentialManager.generateToken(username, password, longevity);

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

    app.post("/gettemporaltoken", function (req, res) {
        formparser.parseForm(req, res, neededFormKeys2, function(fields, files, generatedForm, response) {
            var token = generatedForm["token"];
            var filePath = generatedForm["filePath"];
            var longevityMilliseconds = generatedForm["tokenLongevitySeconds"] * 1000;
            var generatedToken = credentialManager.generateTemporalToken(token, longevityMilliseconds, filePath);

            if (!generatedToken) {
                response["error"] = true;
                response["errorMessage"] = "Invalid credentials";
            } else {
                response["error"] = false;
                response["temporalToken"] = generatedToken;
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

    app.get("/context", function (req, res) {
        var response = {};
        response["isInsecure"] = credentialManager.isInsecure();
        response["chunkSize"] = global.chunkSize;
        res.send(response);
    });
};
