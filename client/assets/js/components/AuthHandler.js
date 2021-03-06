class AuthHandler {
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
        var handler = this;

        request.open("POST", sessionHandler.APICall("/istokenvalid"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                var response = JSON.parse(request.responseText);
                handler.loggedIn = response["isValid"];

                if (handler.loggedIn) {
                    for (var i = 0; i < handler.loggedInCallbacks.length; i++) {
                        handler.loggedInCallbacks[i]();
                    }
                }
            }
        };

        formData.append("token", this.token);
        request.send(formData);
    }


    login(username, password, longevity, callback) {
        var formData = new FormData();
        var request = new XMLHttpRequest();
        var sessionHandler = document.sessionHandler;
        var handler = this;

        request.open("POST", sessionHandler.APICall("/getsessiontoken"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                var response = JSON.parse(request.responseText)
                var sessionShouldPersist = document.getElementById("remember-session-switch").checked;
                if (!response["error"]) {
                    handler.token = response["sessionToken"];
                    handler.loggedIn = true;
                    if (sessionShouldPersist) {
                        document.cookieHandler.setPersistentCookie(handler.tokenCookieKey, handler.token, (longevity / 86400));
                    } else {
                        document.cookieHandler.setCookie(handler.tokenCookieKey, handler.token);
                    }
                }
                if (callback) {
                    callback(handler.loggedIn);
                }
            }
        };
        formData.append("username", username);
        formData.append("password", password);
        formData.append("sessionLongevity", longevity);
        request.send(formData);
    }

    logout() {
        var formData = new FormData();
        var request = new XMLHttpRequest();
        var sessionHandler = document.sessionHandler;
        var handler = this;

        document.dimmer.applyDim(true);
        request.open("POST", sessionHandler.APICall("/revokesessiontoken"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                document.dimmer.resetDim();
                setTimeout(function() {
                    sessionHandler.reload();
                }, 500);
            }
        };

        formData.append("token", this.token);
        request.send(formData);
    }

    getTemporalToken(longevitySeconds, filePath, callback) {
        if (!this.loggedIn) {
            return null;
        }

        var formData = new FormData();
        var request = new XMLHttpRequest();
        var sessionHandler = document.sessionHandler;
        var handler = this;

        request.open("POST", sessionHandler.APICall("/gettemporaltoken"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                var response = JSON.parse(request.responseText)
                if (!response["error"]) {
                    callback(response["temporalToken"]);
                }
                console.log(response);
            }
        };

        formData.append("token", this.token);
        formData.append("tokenLongevitySeconds", longevitySeconds);
        formData.append("filePath", filePath);
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
