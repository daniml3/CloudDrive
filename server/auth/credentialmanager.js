var crypto = require("crypto");

const randomNumberMax = 1000;
const authDatabase = {"daniml3": "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"};

var tokenList = [];
var invalidTokenList = [];

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

function isTokenValid(token) {
    return tokenList.includes(token) && !invalidTokenList.includes(token);
}

function revokeToken(token) {
    if (!isTokenValid(token)) {
        return true;
    }

    invalidTokenList.push(token);
    return false;
}

module.exports = {
    generateToken: generateToken,
    isTokenValid: isTokenValid,
    revokeToken: revokeToken
};
