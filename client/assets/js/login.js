document.sessionHandler = new SessionHandler();
document.authHandler = new AuthHandler();
document.cookieHandler = new CookieHandler();
document.themeHandler = new ThemeHandler();
document.dimmer = new Dimmer();

var sessionHandler = document.sessionHandler;
var authHandler = document.authHandler;
var cookieHandler = document.cookieHandler;
var themeHandler = document.themeHandler;
var dimmer = document.dimmer;

var animator = new Animator();

function performLogin() {
    var username = document.getElementById("username-input").value;
    var password = document.getElementById("password-input").value;
    var longevitySeconds = document.getElementById("session-longevity").value;
    var statusText = document.getElementById("login-status-text");

    if (!(username && password)) {
        statusText.innerHTML = "Missing credentials";
    } else {
        dimmer.applyDim(true);
        statusText.innerHTML = "Verifying credentials";
        setTimeout(function() {
            authHandler.login(username, password, longevitySeconds, function(loggedIn) {
                dimmer.resetDim();
                if (loggedIn) {
                    statusText.innerHTML = "Redirecting";
                    animator.fade(document.body, 0, 0.05, function() {
                        sessionHandler.reload();
                    });
                } else {
                    statusText.innerHTML = "Invalid credentials";
                }
            });
        }, 500);
    }
};

window.onload = function() {
    var usernameInput = document.getElementById("username-input");
    var passwordInput = document.getElementById("password-input");
    var inputList = [usernameInput, passwordInput];

    themeHandler.configureCurrentTheme();
    sessionHandler.init(true);
    authHandler.init(true);

    document.getElementById("preferences-button").onclick = function() {
        var darkModeSwitch = document.getElementById("dark-mode-switch");
        var darkModeEnabled = cookieHandler.getCookieDefault(themeHandler.darkModeEnabledCookie, false) == "true";
        darkModeSwitch.checked = darkModeEnabled;
        $("#preferences-dialog").modal("show");
    };

    document.getElementById("save-preferences-button").onclick = function() {
        var darkModeSwitch = document.getElementById("dark-mode-switch");
        cookieHandler.setPersistentCookie(themeHandler.darkModeEnabledCookie, darkModeSwitch.checked, 365);
        themeHandler.configureCurrentTheme();
        $("#preferences-dialog").modal("hide");
    };

    document.getElementById("login-button").onclick = performLogin;
    for (var i = 0; i < inputList.length; i++) {
        inputList[i].addEventListener("keyup", function(event) {
            if (event.which == 13) {
                performLogin();
            }
        });
    }
};
