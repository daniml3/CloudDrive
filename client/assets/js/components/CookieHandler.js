class CookieHandler {
    constructor() {
        return this;
    }

    setCookie(key, value) {
        document.cookie = key + "=" + value;
    }

    getCookie(key) {
        if (!document.cookie)  {
            return null;
        }

        var splittedCookies = document.cookie.split("; ");
        var cookie = splittedCookies.find(row => row.startsWith(key + "="));

        if (!cookie) {
            return null;
        }

        return cookie.split('=')[1];
    }
}
