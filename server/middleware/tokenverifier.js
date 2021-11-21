var multiparty = require("multiparty");
var credentialManager = require('../auth/credentialmanager.js');
var logger = require("../utils/logger.js");

const neededFormKeys = ["sessionToken"];

function verifyTokenInternal(req, res, next, temporalToken, filePath, token) {
    var isTokenValid;
    var response = {};

    if (token || credentialManager.isInsecure()) {
        isTokenValid = temporalToken ?
            credentialManager.isTemporalTokenValid(token, filePath) : credentialManager.isTokenValid(token);
        if (isTokenValid) {
            next();
            return;
        }
    }

    response["error"] = true;
    response["denied"] = true;
    response["errorCode"] = global.ERR_NO_PERMISSION;
    response["errorMessage"] = "Invalid credentials";
    res.send(response);
}

function verifyToken(req, res, next) {
    verifyTokenInternal(req, res, next, false, null, credentialManager.getSessionToken(req));
};

function verifyTemporalToken(req, res, next) {
    var filePath = "";
    var splittedPath = req.originalUrl.split("/");

    for (var i = 0; i < splittedPath.length; i++) {
        if (i >= 3) {
            filePath += "/";
            filePath += splittedPath[i];
        }
    }

    filePath = decodeURI(filePath);
    verifyTokenInternal(req, res, next, true, filePath, req.params.token);
};

module.exports = {
    verifyToken: verifyToken,
    verifyTemporalToken: verifyTemporalToken
};
