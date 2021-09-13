function log(level, text) {
    console.log(new Date().toISOString() + " [" + level + "]: " + text);
}

module.exports = {
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
    LOG: log
};
