class ThemeHandler {
    constructor() {
        this.lightDarkProperties = ["color-main", "color-main-text", "header-background", "white-black-icon-invert"];
        this.lightModeValues = ["#FFFFFF", "#000000", "#F0F0F0", "0"];
        this.darkModeValues = ["#262626", "#FFFFFF", "#191919", "100"];
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
