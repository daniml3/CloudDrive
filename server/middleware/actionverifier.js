function isPathIllegal(res, path) {
    var response = {};

    if (path.includes("..")) {
        logger.LOG(logger.WARNING, "Tried to perform an illegal operation "
                   + "(tried to access to the directory " + path + ")");
        response["error"] = true;
        response["errorMessage"] = "Illegal request";
        res.send(response);
        return true;
    }

    return false;
}

module.exports = {
    isPathIllegal: isPathIllegal
};
