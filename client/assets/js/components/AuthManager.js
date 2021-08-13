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

        request.open("POST", sessionHandler.APICall("/validatetoken", false));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                var response = JSON.parse(request.responseText);
                manager.loggedIn = response["isValid"];

                if (!manager.loggedIn && !isLoginPage) {
                    console.log(manager.token);
                    window.location.replace("login");
                } else if (manager.loggedIn && isLoginPage){
                    window.location.replace(sessionHandler.serverAddress);
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

        request.open("POST", sessionHandler.APICall("/retrievesession", false));
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
                console.log(request.responseText);
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

        request.open("POST", sessionHandler.APICall("/revoketoken", false));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                window.location.replace(sessionHandler.serverAddress);
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
