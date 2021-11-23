class ThemeHandler {
    constructor() {
        this.lightDarkProperties = ["color-main", "color-secondary", "color-main-text", "white-black-icon-invert"];
        this.lightModeValues = ["#FFFFFF", "#F0F0F0", "#000000", "0"];
        this.darkModeValues = ["#262626", "#191919", "#FFFFFF", "100"];
        this.isDark = false;
        this.darkModeEnabledCookie = "DarkModeEnabled";
    }

    applyTheme(isDark) {
        var values = isDark ? this.darkModeValues : this.lightModeValues;
        for (var i = 0; i < values.length; i++) {
            document.body.style.setProperty("--" + this.lightDarkProperties[i], values[i]);
        }
        this.isDark = isDark;
    }

    configureCurrentTheme() {
        var darkModeEnabled = document.cookieHandler.getCookieDefault(this.darkModeEnabledCookie, false) == "true";
        this.applyTheme(darkModeEnabled);
    }
}
