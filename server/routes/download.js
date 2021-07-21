var express = require("express");

module.exports = function (app) {
    app.use("/download", express.static(global.fileStorage));
}
