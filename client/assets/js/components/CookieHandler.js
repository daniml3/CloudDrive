class CookieHandler {
    constructor() {
        return this;
    }

    setCookie(key, value) {
        document.cookie = key + "=" + value;
    }

    setPersistentCookie(key, value, durationDays) {
        var date = new Date();
        date.setTime(date.getTime() + (durationDays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + date.toUTCString();
        document.cookie = key + "=" + value + ";" + expires + ";path=/";
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
