function getCookie(cookieList, cookieName) {
    if (!cookieList || !cookieName) {
        return null;
    }

    var splittedCookies = cookieList.split("; ");
    for (var i = 0; i < splittedCookies.length; i++) {
        var cookie = splittedCookies[i].split("=");
        if (cookie[0] == cookieName) {
            return cookie[1];
        }
    }

    return null;
}

module.exports = {
    getCookie: getCookie
};
