var crypto = require("crypto");
var logger = require("../utils/logger.js");
var fs = require("fs");

const randomNumberMax = 1000;
const maxSessionTokenLongevity = 48 * 60 * 1000 * 60; // 48 hours
const maxTemporalTokenLongevity = 1 * 60 * 1000 * 60; // 1 hour

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

    return generateTokenInternal(username, longevity, tokenList, tokensToRevoke);
}

function generateTemporalToken(token, longevity, filePath) {
    var tokenData = {};
    if (insecure) {
        return getToken("INSECURE");
    }

    if (longevity > maxTemporalTokenLongevity) {
        longevity = maxTemporalTokenLongevity;
    }

    if (!isTokenValid(token) || !filePath) {
        return null;
    }

    try {
        var generatedToken = getToken(token);

        tokenData["token"] = generatedToken;
        tokenData["filePath"] = filePath;

        temporalTokenList.push(tokenData);
        if (longevity > 0) {
            setTimeout(function() {
                removeElementFromArray(temporalTokenList, tokenData);
            }, longevity);
        } else {
            temporalTokensToRevoke.push(tokenData);
        }

        return generatedToken;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function generateTokenInternal(reference, longevity, tokenArray, revokeList) {
    var generatedToken = getToken(reference);
    tokenArray.push(generatedToken);
    if (longevity > 0) {
        setTimeout(function() {
            removeElementFromArray(tokenArray, generatedToken);
        }, longevity);
    } else {
        revokeList.push(generatedToken);
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
            try {
                if (currentFilePath == filePath) {
                    tokenData = currentTokenData;
                    isValid = true;
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    if (temporalTokensToRevoke.includes(currentTokenData)) {
        removeElementFromArray(temporalTokenList, tokenData);
        removeElementFromArray(temporalTokensToRevoke, tokenData);
    }

    return isValid;
}

function isTokenValidInternal(token, tokenArray, revokeList) {
    var isValid = tokenArray.includes(token) || insecure;

    if (revokeList.includes(token)) {
        removeElementFromArray(tokenArray, token);
        removeElementFromArray(revokeList, token);
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
