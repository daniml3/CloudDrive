class AuthManager {
    constructor() {
        this.loggedIn = false;
        this.token = null;
        this.tokenCookieKey = "CloudDriveSessionToken";
        this.loggedInCallbacks = [];
    }

    init(isLoginPage) {
        this.token = document.cookieHandler.getCookie(this.tokenCookieKey);

        var formData = new FormData();
        var request = new XMLHttpRequest();
        var sessionHandler = document.sessionHandler;
        var manager = this;

        request.open("POST", sessionHandler.APICall("/validatetoken"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                var response = JSON.parse(request.responseText);
                manager.loggedIn = response["isValid"];

                if (!manager.loggedIn && !isLoginPage) {
                    sessionHandler.goToLogin();
                } else if (manager.loggedIn && isLoginPage){
                    sessionHandler.goToMain();
                }

                if (manager.loggedIn) {
                    for (var i = 0; i < manager.loggedInCallbacks.length; i++) {
                        manager.loggedInCallbacks[i]();
                    }
                }
            }
        };

        formData.append("token", this.token);
        request.send(formData);
    }


    login(username, password, callback) {
        var formData = new FormData();
        var request = new XMLHttpRequest();
        var sessionHandler = document.sessionHandler;
        var manager = this;

        request.open("POST", sessionHandler.APICall("/getsessiontoken"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                var response = JSON.parse(request.responseText)
                if (!response["error"]) {
                    manager.token = response["sessionToken"];
                    manager.loggedIn = true;
                    document.cookieHandler.setCookie(manager.tokenCookieKey, manager.token);
                }
                if (callback) {
                    callback(manager.loggedIn);
                }
            }
        };
        formData.append("username", username);
        formData.append("password", password);
        request.send(formData);
    }

    logout() {
        var formData = new FormData();
        var request = new XMLHttpRequest();
        var sessionHandler = document.sessionHandler;
        var manager = this;

        request.open("POST", sessionHandler.APICall("/revokesessiontoken"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                sessionHandler.goToLogin();
            }
        };

        formData.append("token", this.token);
        request.send(formData);
    }

    getOneTimeToken(callback) {
        if (!this.loggedIn) {
            return null;
        }

        var formData = new FormData();
        var request = new XMLHttpRequest();
        var sessionHandler = document.sessionHandler;
        var manager = this;

        request.open("POST", sessionHandler.APICall("/getonetimetoken"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                var response = JSON.parse(request.responseText)
                if (!response["error"]) {
                    callback(response["oneTimeToken"]);
                }
                console.log(response);
            }
        };

        formData.append("token", this.token);
        request.send(formData);
    }

    isLoggedIn() {
        return (this.loggedIn && this.token != null);
    }

    addLoggedInCallback(callback) {
        this.loggedInCallbacks.push(callback);
    }

    getToken() {
        return this.token;
    }
}
