var crypto = require("crypto");
var logger = require("../utils/logger.js");

const randomNumberMax = 1000;
const maxSessionTokenLongevity = 48 * 60 * 1000 * 60; // 48 hours
const maxTemporalTokenLongevity = 1 * 60 * 1000 * 60; // 1 hour

var tokenList = [];
var temporalTokenList = [];
var temporalTokensToRevoke = [];
var passwordHash = "sha256";
var insecure = true;
var authDatabase;

function getRandomNumber(maximum) {
    return Math.round(Math.random() * maximum);
}

function generateReferenceToken(reference) {
    var numberToken = 0;
    for (var i = 0; i < reference.length; i++) {
        var character = reference[i];
        numberToken += (character.charCodeAt(0) * getRandomNumber(randomNumberMax));
    }

    return numberToken;
}

function hash(string) {
   return crypto.createHash(passwordHash).update(string).digest("hex");
}

function getToken(reference) {
    var referenceToken = generateReferenceToken(reference);
    var timestampToken = (Date.now() / 1000) * getRandomNumber(randomNumberMax);
    return hash((referenceToken & timestampToken).toString());
}

function generateToken(username, password, longevity) {
    if (insecure) {
        return getToken("INSECURE");
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

    return generateTokenInternal(username, longevity, tokenList);
}

function generateTemporalToken(token, longevity) {
    if (insecure) {
        return getToken("INSECURE");
    }

    if (longevity > maxTemporalTokenLongevity) {
        longevity = maxTemporalTokenLongevity;
    }

    if (!isTokenValid(token)) {
        return null;
    }

    return generateTokenInternal(token, longevity, temporalTokenList);
}

function generateTokenInternal(reference, longevity, tokenArray) {
    var generatedToken = getToken(reference);
    tokenArray.push(generatedToken);
    if (longevity > 0) {
        setTimeout(function() {
            removeElementFromArray(tokenArray, generatedToken);
        }, longevity);
    } else {
        temporalTokensToRevoke.push(generatedToken);
    }
    return generatedToken;
}

function removeElementFromArray(array, element) {
    var index = array.indexOf(element);
    if (index > -1) {
      array.splice(index, 1);
    }
}

function isTokenValid(token) {
    return tokenList.includes(token) || insecure;
}

function isTemporalTokenValid(token) {
    var isValid = temporalTokenList.includes(token) || insecure;

    if (temporalTokensToRevoke.includes(token)) {
        removeElementFromArray(temporalTokenList, token);
        removeElementFromArray(temporalTokensToRevoke, token);
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

module.exports = {
    generateToken: generateToken,
    generateTemporalToken: generateTemporalToken,
    isTokenValid: isTokenValid,
    isTemporalTokenValid: isTemporalTokenValid,
    revokeToken: revokeToken,
    parseConfig: parseConfig,
    isInsecure: isInsecure
};
