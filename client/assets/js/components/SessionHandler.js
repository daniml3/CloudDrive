const skipHideModalList = ["upload-file-dialog", "file-clipboard-dialog"];

class SessionHandler {
    cosntructor() {
        this.createEmptyFileButtonList();
        this.lastFileList = null;
        this.directoryChanging = true;
    }

    init(isLogin) {
        var splittedAddress = window.location.href.split("/");
        var parsedAddress = false;
        var handler = this;
        this.serverAddress = "";
        this.createEmptyFileButtonList();
        for (var i = 0; i < splittedAddress.length; i++) {
            switch (i) {
                case 0: // Protocol (http(s))
                case 2: // Domain (domain.example.com)
                    this.serverAddress += splittedAddress[i];
                    break;
                case 1: // Add the removed // by split
                    this.serverAddress += "//";
                    break;
                default:
                    parsedAddress = true;
            }

            if (parsedAddress) {
                break;
            }
        }

        if (!isLogin) {
            document.body.onfocus = function() {
                handler.watchCurrentDirectory();
            };
        }
    }

    generateItemViews() {
        var formData = new FormData();
        var request = new XMLHttpRequest();
        var container = document.getElementById("file-button-container");
        var handler = this;

        formData.append("targetDirectory", this.currentDirectory);
        request.open("POST", this.APICall("/readdir"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (true) {
                    var response = (request.status == 200) ? JSON.parse(request.responseText) : {};
                    if (request.status == 200 && response["error"]) {
                        var errorMessage = response["errorMessage"];
                        errorMessage += "(" + handler.errorCodeToMessage(response["errorCode"]) + ")";
                        document.getElementById("error-message").innerHTML = errorMessage;
                        $("#error-dialog").modal("show");
                        if (response["denied"]) {
                            window.setTimeout(function () {
                                handler.reload();
                            }, 1500);
                        }
                        handler.directoryChanging = false
                        handler.enterDirectory("/");
                    } else if (request.status != 200) {
                        handler.directoryChanging = false;
                    } else {
                        var fileList = response["fileList"];
                        var finishGeneration = function() {
                            var currentDirectoryDiv = document.getElementById("current-directory-text");
                            handler.createEmptyFileButtonList();
                            container.innerHTML = "";
                            if (response["parentAvailable"]) {
                                var item = new FileItem("..", "", false, handler);
                                var tooltip = new TooltipContainer("Parent directory", item.get());
                                item.directory = handler.getParentDirectory();
                                item.setIcon("assets/img/folder.svg");
                                item.disableSelected = true;
                                tooltip.get().appendChild(item.get());
                                item.fadeIn(null);

                                container.appendChild(tooltip.get());
                            }

                            for (var i = 0; i < fileList.length; i++) {
                                var fileData = fileList[i];
                                var filename = fileData["name"];
                                var isFile = fileData["isFile"];
                                var item = new FileItem(filename, "", isFile, handler);
                                var tooltip = new TooltipContainer(filename, item.get());
                                item.directory = handler.getAbsoluteDirectory(filename);
                                item.fadeIn(function() {
                                    if (i >= fileList.length - 1) {
                                        handler.directoryChanging = false;
                                    }
                                });

                                container.appendChild(tooltip.get());
                            }

                            if (fileList.length <= 0) {
                                if (!handler.directoryChanging) {
                                    handler.watchCurrentDirectory();
                                }
                                handler.directoryChanging = false;
                            }

                            currentDirectoryDiv.innerHTML = handler.currentDirectory;
                            if (currentDirectoryDiv.classList.contains("constant-fade-in-out")) {
                                currentDirectoryDiv.classList.remove("constant-fade-in-out");
                            }

                            var freeSpaceBar = document.getElementById("free-space-bar");
                            var freeSpace = response["freeSpace"];
                            var totalSpace = response["totalSpace"];
                            freeSpaceBar.style.width = 100 - ((freeSpace * 100) / totalSpace) + "%";
                        };

                        if (JSON.stringify(handler.lastFileList) != JSON.stringify(fileList)) {
                            var modalList = $(".modal");
                                for (var i = 0; i < modalList.length; i++) {
                                var modal = modalList[i];
                                if (!skipHideModalList.includes(modal.id)) {
                                    $("#" + modal.id).modal("hide");
                                }
                            }

                            handler.lastFileList = fileList;
                            var fileButtonCount = handler.fileButtonList.length;
                            var finishedFadeCount = 0;
                            if (fileButtonCount > 0) {
                                for (var i = 0; i < fileButtonCount; i++) {
                                    handler.fileButtonList[i].fadeOut(function() {
                                        finishedFadeCount++;
                                        if (finishedFadeCount >= fileButtonCount) {
                                            finishGeneration();
                                        }
                                    });
                                }
                            } else {
                                finishGeneration();
                            }
                        }
                    }
                }
            }
        };

        request.send(formData);
    }

    APICall(route) {
        return encodeURI(this.serverAddress + route);
    }

    enterDirectory(directory) {
        if (this.currentDirectory == directory || this.directoryChanging) {
            return;
        }

        console.log("Entering to the directory " + directory);
        this.currentDirectory = directory;
        this.directoryChanging = true;
        document.getElementById("current-directory-text").classList.add("constant-fade-in-out");
        this.watchCurrentDirectory();
    }

    getAbsoluteDirectory(dir) {
        return this.currentDirectory + dir + "/";;
    }

    getParentDirectory() {
        var splittedDirectory = this.currentDirectory.split("/");
        var parent = "";
        for (var i = 0; i < splittedDirectory.length - 2; i++) {
            parent += splittedDirectory[i] + "/";
        }
        return parent;
    }

    getServerAddress() {
        return this.serverAddress;
    }

    createEmptyFileButtonList() {
        this.fileButtonList = [];
    }

    startFileItemLoop() {
        this.enterDirectory("/");
    }

    watchCurrentDirectory() {
        if (this.directoryWatcher != null) {
            if (this.directoryWatcher.status == 0) {
                this.directoryWatcher.abort();
            }
        }

        this.directoryWatcher = new XMLHttpRequest();
        var request = this.directoryWatcher;
        var formData = new FormData();
        var container = document.getElementById("file-button-container");
        var handler = this;

        formData.append("targetDirectory", this.currentDirectory);
        formData.append("requestTimestamp", Date.now());
        request.open("POST", this.APICall("/watchdir"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE && request.status != 0) {
                switch (request.status) {
                    case 502:
                    case 503:
                    case 504:
                        document.getElementById("error-message").innerHTML =
                            "Server connection error (" + request.status + "), refreshing session";
                        $("#error-dialog").modal("show");
                        setTimeout(function() {
                            handler.reload();
                        }, 2000);
                        break;
                    default:
                       handler.watchCurrentDirectory();
                }
            }
        };

        this.generateItemViews();
        request.send(formData);
    }

    reload() {
        window.location.reload(true);
    }

    errorCodeToMessage(errorCode) {
        switch (errorCode) {
            case "ENOENT":
                return "No such file or directory";
            case "EACCES":
                return "Session expired or invalid";
            default:
                return "Unknown error";
        }
    }
}
