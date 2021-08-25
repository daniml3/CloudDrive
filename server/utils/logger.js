function log(level, text) {
    console.log("[" + level + "]: " + text);
}

module.exports = {
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
    LOG: log
};
