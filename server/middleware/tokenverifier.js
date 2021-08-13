var multiparty = require("multiparty");
var credentialManager = require('../auth/credentialmanager');

const neededFormKeys = ["sessionToken"];

function verifyToken(req, res, next) {
    var token = req.query.sessionToken;
    var isTokenValid;
    var response = {};

    if (token) {
        isTokenValid = credentialManager.isTokenValid(token);
        if (isTokenValid) {
            next();
            return;
        }
    }

    response["error"] = true;
    response["denied"] = true;
    response["errorMessage"] = "Invalid credentials";
    res.send(response);
};

module.exports = {
    verifyToken: verifyToken
};
