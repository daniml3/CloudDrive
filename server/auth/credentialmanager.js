var crypto = require("crypto");

const randomNumberMax = 1000;

var tokenList = [];
var oneTimeTokenList = [];
var passwordHash = "sha256";
var insecure = true;
var authDatabase;

function getRandomNumber(maximum) {
    return Math.round(Math.random() * maximum);
}

function generateUsernameToken(username) {
    var numberToken = 0;
    for (var i = 0; i < username.length; i++) {
        var character = username[i];
        numberToken += (character.charCodeAt(0) * getRandomNumber(randomNumberMax));
    }

    return numberToken;
}

function hash(string) {
   return crypto.createHash(passwordHash).update(string).digest("hex");
}

function getToken(username) {
    var usernameToken = generateUsernameToken(username);
    var timestampToken = (Date.now() / 1000) * getRandomNumber(randomNumberMax);
    return hash((usernameToken & timestampToken).toString());
}

function generateToken(username, password) {
    if (insecure) {
        return getToken("INSECURE");
    }

    var databasePassword = authDatabase[username];
    var requestedPassword = hash(password);
    var token;

    if (authDatabase[username] != requestedPassword) {
        return null;
    }

    token = getToken(username);
    tokenList.push(token);
    return token;
}

function generateOneTimeToken(token) {
    if (insecure) {
        return getToken("INSECURE");
    }

    if (!isTokenValid(token)) {
        return null;
    }

    var generatedToken = getToken(token);
    oneTimeTokenList.push(generatedToken);
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

function isTokenValidOnce(token) {
    var isValidOnce = oneTimeTokenList.includes(token);

    if (isValidOnce) {
        removeElementFromArray(oneTimeTokenList, token);
    }

    return isValidOnce || insecure;
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

    global.LOG(global.INFO, "Successfully loaded the auth config");
    insecure = false;
}

function isInsecure() {
    return insecure;
}

module.exports = {
    generateToken: generateToken,
    generateOneTimeToken: generateOneTimeToken,
    isTokenValid: isTokenValid,
    isTokenValidOnce: isTokenValidOnce,
    revokeToken: revokeToken,
    parseConfig: parseConfig,
    isInsecure: isInsecure
};
