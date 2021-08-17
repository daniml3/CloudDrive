class ThemeHandler {
    constructor() {
        this.lightDarkProperties = ["color-main", "color-main-text", "color-main-shadow", "header-background"];
        this.lightModeValues = ["white", "black", "gray", "rgb(208, 208, 208)"];
        this.darkModeValues = ["#222222", "white", "black", "#333333"];
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
