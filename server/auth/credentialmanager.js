var crypto = require("crypto");
var logger = require("../utils/logger.js");
var cookieHandler = require("../utils/cookiehandler.js");

const randomNumberMax = 1000;
const maxSessionTokenLongevity = 48 * 60 * 1000 * 60; // 48 hours
const maxTemporalTokenLongevity = 24 * 60 * 1000 * 60; // 24 hours

var tokenList = [];
var tokensToRevoke = [];
var temporalTokenList = [];
var temporalTokensToRevoke = [];
var passwordHash = "sha256";
var insecure = true;
var authDatabase;

function getRandomNumber(maximum) {
    return Math.round(Math.random() * maximum);
}

function hash(string) {
   return crypto.createHash(passwordHash).update(string).digest("hex");
}

function getToken() {
    return crypto.randomBytes(32).toString("hex");
}

function generateToken(username, password, longevity) {
    if (insecure) {
        return getToken();
    }

    if (longevity > maxSessionTokenLongevity) {
        longevity = maxSessionTokenLongevity;
    }

    var databasePassword = authDatabase[username];
    var requestedPassword = hash(password);
    var token;

    if (authDatabase[username] != requestedPassword) {
        return null;
    }

    return generateTokenInternal(longevity, tokenList, tokensToRevoke);
}

function generateTemporalToken(token, longevity, filePath) {
    var tokenData = {};
    if (insecure) {
        return getToken();
    }

    if (longevity > maxTemporalTokenLongevity) {
        longevity = maxTemporalTokenLongevity;
    }

    if (!isTokenValid(token) || !filePath) {
        return null;
    }

    var generatedToken = getToken();
    tokenData["token"] = generatedToken;
    tokenData["filePath"] = filePath;

    temporalTokenList.push(tokenData);
    if (longevity > 0) {
        setTimeout(function() {
            removeElementFromArray(temporalTokenList, tokenData);
            logger.LOG(logger.INFO, "Revoked the temporal token " + getShortToken(generatedToken));
        }, longevity);
    } else {
        temporalTokensToRevoke.push(tokenData);
    }

    logger.LOG(logger.INFO, "Generated the temporal token " + getShortToken(generatedToken) + " with a longevity of " + longevity);
    return generatedToken;
}

function generateTokenInternal(longevity, tokenArray, revokeList) {
    var generatedToken = getToken();
    tokenArray.push(generatedToken);
    if (longevity > 0) {
        setTimeout(function() {
            removeElementFromArray(tokenArray, generatedToken);
            logger.LOG(logger.INFO, "Revoked the token " + getShortToken(generatedToken));
        }, longevity);
    } else {
        revokeList.push(generatedToken);
    }

    logger.LOG(logger.INFO, "Generated the session token " + getShortToken(generatedToken) + " with a longevity of " + longevity);
    return generatedToken;
}

function getShortToken(token) {
    return token.substring(0, 10) + "...";
}

function removeElementFromArray(array, element) {
    var index = array.indexOf(element);
    if (index > -1) {
      array.splice(index, 1);
    }
}

function isTokenValid(token) {
    return isTokenValidInternal(token, tokenList, tokensToRevoke);
}

function isTemporalTokenValid(token, filePath) {
    var isValid = false;
    var tokenData = null;

    for (var i = 0; i < temporalTokenList.length; i++) {
        var currentTokenData = temporalTokenList[i];
        var currentToken = currentTokenData["token"];
        var currentFilePath = currentTokenData["filePath"];

        if (currentToken == token) {
            if (currentFilePath == filePath) {
                tokenData = currentTokenData;
                isValid = true;
            }
        }
    }

    if (temporalTokensToRevoke.includes(tokenData)) {
        removeElementFromArray(temporalTokenList, tokenData);
        removeElementFromArray(temporalTokensToRevoke, tokenData);
        logger.LOG(logger.INFO, "Revoked the temporal token " + getShortToken(tokenData["token"]));
    }

    return isValid;
}

function isTokenValidInternal(token, tokenArray, revokeList) {
    var isValid = tokenArray.includes(token) || insecure;

    if (revokeList.includes(token)) {
        removeElementFromArray(tokenArray, token);
        removeElementFromArray(revokeList, token);
        logger.LOG(logger.INFO, "Revoked the token " + getShortToken(token));
    }

    return isValid;
}

function revokeToken(token) {
    if (!isTokenValid(token)) {
        return true;
    }

    removeElementFromArray(tokenList, token);
    return false;
}

function parseConfig(config) {
    authDatabase = config["authDatabase"];
    passwordHash = config ["hash"];

    if (!crypto.getHashes().includes(passwordHash)) {
        throw "Invalid hash " + passwordHash;
    }

    logger.LOG(logger.INFO, "Successfully loaded the auth config");
    insecure = false;
}

function isInsecure() {
    return insecure;
}

function getSessionToken(req) {
    return cookieHandler.getCookie(req.headers.cookie, "CloudDriveSessionToken");
}

module.exports = {
    generateToken: generateToken,
    generateTemporalToken: generateTemporalToken,
    isTokenValid: isTokenValid,
    isTemporalTokenValid: isTemporalTokenValid,
    revokeToken: revokeToken,
    parseConfig: parseConfig,
    isInsecure: isInsecure,
    getSessionToken : getSessionToken
};
