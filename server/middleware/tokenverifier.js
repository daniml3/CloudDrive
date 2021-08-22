var multiparty = require("multiparty");
var credentialManager = require('../auth/credentialmanager.js');

const neededFormKeys = ["sessionToken"];

function verifyTokenInternal(req, res, next, temporalToken) {
    var token = req.query.sessionToken;
    var isTokenValid;
    var response = {};

    if (token) {
        isTokenValid = temporalToken ?
            credentialManager.isTemporalTokenValid(token) : credentialManager.isTokenValid(token);
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
    verifyTokenInternal(req, res, next, false);
};

function verifyTemporalToken(req, res, next) {
    verifyTokenInternal(req, res, next, true);
};

module.exports = {
    verifyToken: verifyToken,
    verifyTemporalToken: verifyTemporalToken
};
