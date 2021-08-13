var express = require("express");
var credentialManager = require("../auth/credentialmanager.js");
var tokenVerifier = require("../middleware/tokenverifier.js");

module.exports = function (app) {
    app.use("/download", tokenVerifier.verifyToken, express.static(global.fileStorage, {dotfiles: "allow"}));
}
