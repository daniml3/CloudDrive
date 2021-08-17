document.sessionHandler = new SessionHandler();
document.authHandler = new AuthHandler();
document.cookieHandler = new CookieHandler();

var sessionHandler = document.sessionHandler;
var authHandler = document.authHandler;
var cookieHandler = document.cookieHandler;

var animator = new Animator();

window.onload = function() {
    sessionHandler.init();
    authHandler.init(true);

    document.getElementById("login-button").onclick = function() {
        var username = document.getElementById("username-input").value;
        var password = document.getElementById("password-input").value;
        var statusText = document.getElementById("login-status-text");

        if (!(username && password)) {
            statusText.innerHTML = "Missing credentials";
        } else {
            statusText.innerHTML = "Verifying credentials";
            authHandler.login(username, password, function(loggedIn) {
                if (loggedIn) {
                    statusText.innerHTML = "Redirecting";
                    animator.fade(document.body, 0, 0.05, function() {
                        sessionHandler.goToMain();
                    });
                } else {
                    statusText.innerHTML = "Invalid credentials";
                }
            });
        }
    };
};
