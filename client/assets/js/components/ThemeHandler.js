class ThemeHandler {
    constructor() {
        this.lightDarkProperties = ["color-main", "color-secondary", "color-main-text", "color-main-shadow", "header-background"];
        this.lightModeValues = ["#FFFFFF", "#DDDDDD", "#000000", "#444444", "#F5F5F5"];
        this.darkModeValues = ["#222222", "#555555", "#FFFFFF", "#000000", "#333333"];
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
