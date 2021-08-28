var multiparty = require("multiparty");
var credentialManager = require('../auth/credentialmanager.js');
var logger = require("../utils/logger.js");

const neededFormKeys = ["sessionToken"];

function verifyTokenInternal(req, res, next, temporalToken, filePath) {
    var token = req.query.sessionToken;
    var isTokenValid;
    var response = {};

    if (token) {
        isTokenValid = temporalToken ?
            credentialManager.isTemporalTokenValid(token, filePath) : credentialManager.isTokenValid(token);
        if (isTokenValid) {
            next();
            return;
        }
    }

    response["error"] = true;
    response["denied"] = true;
    response["errorMessage"] = "Invalid credentials" + (temporalToken ? "" : " (session invalid or expired)");
    res.send(response);
}

function verifyToken(req, res, next) {
    verifyTokenInternal(req, res, next, false, null);
};

function verifyTemporalToken(req, res, next) {
    var filePath = "";
    var splittedPath = req.originalUrl.split("/");

    for (var i = 0; i < splittedPath.length; i++) {
        if (i >= 2) {
            filePath += "/";
            filePath += splittedPath[i];
        }
    }

    filePath = filePath.split("?")[0];

    verifyTokenInternal(req, res, next, true, filePath);
};

module.exports = {
    verifyToken: verifyToken,
    verifyTemporalToken: verifyTemporalToken
};
