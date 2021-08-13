var crypto = require("crypto");

const randomNumberMax = 1000;
const authDatabase = {"daniml3": "d6dce3a93ab73dfb517486a31a73a777c968a3988eaf879f4860ac41432a2066"};

var tokenList = [];
var oneTimeTokenList = [];

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
   return crypto.createHash("sha256").update(string).digest("hex");
}

function getToken(username) {
    var usernameToken = generateUsernameToken(username);
    var timestampToken = (Date.now() / 1000) * getRandomNumber(randomNumberMax);
    return hash((usernameToken & timestampToken).toString());
}

function generateToken(username, password) {
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
    var token;

    if (!isTokenValid(token)) {
        return null;
    }

    token = getToken(token);
    oneTimeTokenList.push(token);
    return token;
}

function removeElementFromArray(array, element) {
    var index = array.indexOf(element);
    if (index > -1) {
      array.splice(index, 1);
    }
}

function isTokenValid(token) {
    return tokenList.includes(token);
}

function isTokenValidOnce(token) {
    var isValidOnce = oneTimeTokenList.includes(token);

    if (isValidOnce) {
        removeElementFromArray(oneTimeTokenList, token);
    }

    return isValidOnce;
}

function revokeToken(token) {
    if (!isTokenValid(token)) {
        return true;
    }

    removeElementFromArray(tokenList, token);
    return false;
}

module.exports = {
    generateToken: generateToken,
    generateOneTimeToken: generateOneTimeToken,
    isTokenValid: isTokenValid,
    isTokenValidOnce: isTokenValidOnce,
    revokeToken: revokeToken
};
