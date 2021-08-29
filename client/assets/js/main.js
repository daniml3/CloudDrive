document.sessionHandler = new SessionHandler();
document.deleteQueue = new DeleteQueue();
document.authHandler = new AuthHandler();
document.cookieHandler = new CookieHandler();
document.themeHandler = new ThemeHandler();

var sessionHandler = document.sessionHandler;
var deleteQueue = document.deleteQueue;
var authHandler = document.authHandler;
var cookieHandler = document.cookieHandler;
var themeHandler = document.themeHandler;

var animator = new Animator();

document.onreadystatechange = function() {
    if (document.readyState == "complete") {
        themeHandler.configureCurrentTheme();
    }
};

// Setup the session, the window buttons and generate the items
window.onload = function() {
    sessionHandler.init();
    authHandler.addLoggedInCallback(function() {
        sessionHandler.startFileItemLoop();
        setTimeout(function() {
            animator.fade(document.body, 1, 0.05, null);
        }, 100);
    });
    authHandler.init(false);

    console.log("Using " + sessionHandler.getServerAddress() + " as server address");
    document.getElementById("create-directory-button").onclick = function() {
        $("#create-directory-dialog").modal("show");
    };

    document.getElementById("upload-file-button").onclick = function () {
        $("#upload-file-dialog").modal("show");
    };

    document.getElementById("confirm-create-directory-button").onclick = function() {
        var boxData = document.getElementById("directory-name-box").value;
        var formData = new FormData();

        formData.append("targetDirectory", sessionHandler.currentDirectory + boxData);

        var request = new XMLHttpRequest();
        request.open("POST", sessionHandler.APICall("/mkdir"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                var response = JSON.parse(request.responseText);
                if (response["error"]) {
                    document.getElementById("error-message").innerHTML = response["errorMessage"];
                    $("#error-dialog").modal("show");
                }
            }
        }
        request.send(formData);

        document.getElementById("directory-name-box").value = "";
        sessionHandler.generateItemViews();
    };

    document.getElementById("confirm-upload-file-button").onclick = function () {
        var uploadHandler = new UploadHandler(document.getElementById("file-to-upload").files[0]);
        uploadHandler.sendChunk();
    };

    document.getElementById("delete-selected-button").onclick = function () {
        deleteQueue.clear();
        for (i = 0; i < sessionHandler.fileButtonList.length; i++) {
            var fileItem = sessionHandler.fileButtonList[i];
            if (fileItem.isSelected()) {
                deleteQueue.addFileToQueue(fileItem);
            }
        }
        deleteQueue.startDeleting();
    }

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

    document.getElementById("logout-button").onclick = function() {
        authHandler.logout();
    };

    var request = new XMLHttpRequest();
    request.open("GET", sessionHandler.APICall("/isinsecure"));
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            var response = request.responseText;
            if (response["isInsecure"]) {
                authHandler.login("INSECURE", "INSECURE");
                sessionHandler.startFileItemLoop();
            }
        }
    };
    request.send();
};
