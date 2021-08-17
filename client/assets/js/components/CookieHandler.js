class CookieHandler {
    constructor() {
        return this;
    }

    setCookie(key, value) {
        document.cookie = key + "=" + value;
    }

    getCookie(key) {
        return this.getCookieDefault(key, null);
    }

    getCookieDefault(key, def) {
        if (!document.cookie)  {
            return def;
        }

        var splittedCookies = document.cookie.split("; ");
        var cookie = splittedCookies.find(row => row.startsWith(key + "="));

        if (!cookie) {
            return def;
        }

        return cookie.split('=')[1];
    }
}
