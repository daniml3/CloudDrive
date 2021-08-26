class SessionHandler {
    cosntructor() {
        this.createEmptyFileButtonList();
        this.lastFileList = null;
        this.directoryChanging = true;
    }

    init() {
        var splittedAddress = window.location.href.split("/");
        var parsedAddress = false;
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
                        document.getElementById("error-message").innerHTML = response["errorMessage"];
                        $("#error-dialog").modal("show");
                        if (response["denied"]) {
                            window.setTimeout(function () {
                                handler.goToLogin();
                            }, 1500);
                        }
                        handler.enterDirectory("/");
                    } else if (request.status != 200) {
                        document.getElementById("error-message").innerHTML = "Failed to connect to the server";
                        $("#error-dialog").modal("show");
                    } else {
                        var fileList = response["fileList"];
                        var finishGeneration = function() {
                            var onGenerationFinish = function() {
                                handler.directoryChanging = false;
                            };
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
                                        onGenerationFinish();
                                    }
                                });

                                container.appendChild(tooltip.get());
                            }

                            if (fileList.length <= 0) {
                                onGenerationFinish();
                            }

                            currentDirectoryDiv.innerHTML = handler.currentDirectory;
                            if (currentDirectoryDiv.classList.contains("current-directory-text-loading")) {
                                currentDirectoryDiv.classList.remove("current-directory-text-loading");
                            }
                        };

                        if (JSON.stringify(handler.lastFileList) != JSON.stringify(fileList)) {
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
        return this.APICallWithToken(route, document.authHandler.getToken());
    }

    APICallWithToken(route, token) {
        return this.serverAddress + route + "?sessionToken=" + token;
    }

    enterDirectory(directory) {
        if (this.currentDirectory == directory || this.directoryChanging) {
            return;
        }

        console.log("Entering to the directory " + directory);
        this.currentDirectory = directory;
        this.directoryChanging = true;
        document.getElementById("current-directory-text").classList.add("current-directory-text-loading");
        this.generateItemViews();
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
            if (this.directoryWatcher.status != 200) {
                this.directoryWatcher.abort();
            }
        }

        this.directoryWatcher = new XMLHttpRequest();
        var request = this.directoryWatcher;
        var formData = new FormData();
        var container = document.getElementById("file-button-container");
        var handler = this;

        formData.append("targetDirectory", this.currentDirectory);
        request.open("POST", this.APICall("/watchdir"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE && request.status != 0) {
                if (request.status == 200) {
                    handler.generateItemViews();
                }
                handler.watchCurrentDirectory();
            }
        };

        request.send(formData);
    }

    goToMain() {
        window.location.replace(this.getServerAddress());
    }

    goToLogin() {
        window.location.replace("login");
    }
}
