var express = require("express");
var tokenVerifier = require("../middleware/tokenverifier.js");

module.exports = function (app) {
    app.use("/download", tokenVerifier.verifyOneTimeToken, express.static(global.fileStorage, {dotfiles: "allow"}));
}
