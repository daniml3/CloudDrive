var multiparty = require("multiparty");
var credentialManager = require('../auth/credentialmanager.js');

const neededFormKeys = ["sessionToken"];

function verifyTokenInternal(req, res, next, oneTimeToken) {
    var token = req.query.sessionToken;
    var isTokenValid;
    var response = {};

    if (token) {
        isTokenValid = oneTimeToken ?
            credentialManager.isTokenValidOnce(token) : credentialManager.isTokenValid(token);
        if (isTokenValid) {
            next();
            return;
        }
    }

    response["error"] = true;
    response["denied"] = true;
    response["errorMessage"] = "Invalid credentials";
    res.send(response);
}

function verifyToken(req, res, next) {
    verifyTokenInternal(req, res, next, false);
};

function verifyOneTimeToken(req, res, next) {
    verifyTokenInternal(req, res, next, true);
};

module.exports = {
    verifyToken: verifyToken,
    verifyOneTimeToken: verifyOneTimeToken
};
