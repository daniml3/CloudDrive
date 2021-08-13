class SessionHandler {
    cosntructor() {
        this.createEmptyFileButtonList();
        this.lastFileList = [];
        this.skipAutoViewGeneration = false;
        this.pendingViewRegen = true;
    }

    init() {
        var splittedAddress = window.location.href.split("/");
        var parsedAddress = false;
        this.serverAddress = "";
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
        this.generateItemViews(false);
    }

    generateItemViews(shouldReSchedule) {
        var formData = new FormData();
        var request = new XMLHttpRequest();
        var container = document.getElementById("file-button-container");
        var handler = this;

        if (!document.authManager.isLoggedIn()) {
            return;
        }

        formData.append("targetDirectory", this.currentDirectory);
        request.open("POST", this.APICall("/readdir", true));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (!(handler.skipAutoViewGeneration && shouldReSchedule)) {
                    var response = (request.status == 200) ? JSON.parse(request.responseText) : {};
                    if (request.status == 200 && response["error"]) {
                        document.getElementById("error-message").innerHTML = response["errorMessage"];
                        $("#error-dialog").modal("show");
                        if (response["denied"]) {
                            window.setTimeout(function () {
                                window.location.replace(handler.serverAddress);
                            }, 1500);
                        }
                        handler.enterDirectory("/");
                    } else if (request.status != 200) {
                        document.getElementById("error-message").innerHTML = "Failed to connect to the server";
                        $("#error-dialog").modal("show");
                    } else {
                        var fileList = response["fileList"];

                        if (JSON.stringify(handler.lastFileList) != JSON.stringify(fileList)
                            || handler.pendingViewRegen) {
                            handler.pendingViewRegen = false;
                            handler.createEmptyFileButtonList();
                            handler.lastFileList = fileList;
                            container.innerHTML = "";

                            if (response["parentAvailable"]) {
                                var item = new FileItem("..", "", false, handler);
                                var tooltip = new TooltipContainer("Parent directory", item.get());
                                item.directory = handler.getParentDirectory();
                                item.setIcon("assets/img/folder.svg");
                                item.disableSelected = true;
                                tooltip.get().appendChild(item.get());

                                container.appendChild(tooltip.get());
                            }

                            for (var i = 0; i < fileList.length; i++) {
                                var fileData = fileList[i];
                                var filename = fileData["name"];
                                var isFile = fileData["isFile"];
                                var item = new FileItem(filename, "", isFile, handler);
                                var tooltip = new TooltipContainer(filename, item.get());
                                item.directory = handler.getAbsoluteDirectory(filename);

                                container.appendChild(tooltip.get());
                            }

                            document.getElementById("current-directory-text").innerHTML = handler.currentDirectory;
                        }
                    }
                }

                handler.skipAutoViewGeneration = false;
                if (shouldReSchedule) {
                    window.setTimeout(function() {
                        handler.generateItemViews(true)
                    }, 500);
                }
            }
        };

        request.send(formData);
    }

    APICall(route, needsAuth) {
        var call = this.serverAddress + route;
        if (needsAuth) {
            call += "?sessionToken=" + document.authManager.getToken();
        }
        return call;
    }

    enterDirectory(directory) {
        if (this.currentDirectory == directory) {
            return;
        }

        console.log("Entering to the directory " + directory);
        this.currentDirectory = directory;
        this.skipAutoViewGeneration = true;
        this.pendingViewRegen = true;
        this.generateItemViews();
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
        this.generateItemViews(true);
    }
}
