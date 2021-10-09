const logPath = process.env.CD_WORKING_DIRECTORY + "/last-log.txt";
var fs = require("fs");

function log(level, text) {
    var content = new Date().toISOString() + " [" + level + "]: " + text;
    console.log(content);
    try {
      fs.appendFileSync(logPath, content + "\n");
    } catch (err) {}
}

module.exports = {
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
    LOG_PATH: logPath,
    LOG: log
};
