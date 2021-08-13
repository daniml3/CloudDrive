document.sessionHandler = new SessionHandler();
document.authManager = new AuthManager();
document.cookieHandler = new CookieHandler();

var sessionHandler = document.sessionHandler;
var authManager = document.authManager;
var cookieHandler = document.cookieHandler;

window.onload = function() {
    sessionHandler.init();
    authManager.init(true);

    document.getElementById("login-button").onclick = function() {
        var username = document.getElementById("username-input").value;
        var password = document.getElementById("password-input").value;
        var statusText = document.getElementById("login-status-text");

        if (!(username && password)) {
            statusText.innerHTML = "Missing credentials";
        } else {
            statusText.innerHTML = "Verifying credentials";
            authManager.login(username, password, function(loggedIn) {
                if (loggedIn) {
                    statusText.innerHTML = "Redirecting";
                    window.location.replace(sessionHandler.serverAddress);
                } else {
                    statusText.innerHTML = "Invalid credentials";
                }
            });
        }
    };
};
