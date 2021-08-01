class SessionHandler {
    cosntructor() {
        this.createEmptyFileButtonList();
        this.lastFileList = [];
        this.skipAutoViewGeneration = false;
        this.pendingViewRegen = true;
    }

    init() {
        this.serverAddress = window.location.href.replace("#", "");
        if (this.serverAddress.slice(-1) == "/") {
            this.serverAddress = this.serverAddress.slice(0, -1)
        }

        this.currentDirectory = "/";
    }

    generateItemViews() {
        this.generateItemViews(false);
    }

    generateItemViews(shouldReSchedule) {
        var formData = new FormData();
        var request = new XMLHttpRequest();
        var container = document.getElementById("file-button-container");
        var handler = this;

        formData.append("targetDirectory", this.currentDirectory);
        request.open("POST", this.APICall("/readdir"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (!(handler.skipAutoViewGeneration && shouldReSchedule)) {
                    var response = JSON.parse(request.responseText);
                    if (request.status == 200 && response["error"]) {
                        document.getElementById("error-message").innerHTML = response["errorMessage"];
                        $("#error-dialog").modal("show");
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
                            container.innerHTML = "";
                            handler.lastFileList = fileList;
                            var parentAvailable = JSON.parse(request.responseText)["parentAvailable"];
                            if (parentAvailable) {
                                var item = new FileItem("..", "", false, handler);
                                item.directory = handler.getParentDirectory();
                                item.setIcon("assets/img/folder.svg");
                                item.disableSelected = true;

                                container.appendChild(item.get());
                            }

                            for (var i = 0; i < fileList.length; i++) {
                                var fileData = fileList[i];
                                var filename = fileData["name"];
                                var isFile = fileData["isFile"];
                                var item = new FileItem(filename, "", isFile, handler);
                                item.directory = handler.getAbsoluteDirectory(filename);
                                item.register();

                                container.appendChild(item.get());
                            }
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

    APICall(route) {
        return this.serverAddress + route;
    }

    enterDirectory(directory) {
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
        this.generateItemViews(true);
    }
}
