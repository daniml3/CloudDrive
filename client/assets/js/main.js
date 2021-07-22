var currentDirectory = "/";
var serverAddress = window.location.href.replace("#", "");

if (serverAddress.slice(-1) == "/") {
    serverAddress = serverAddress.slice(0, -1)
}

// Setup the window buttons and generate the items
window.onload = function() {
    console.log("Using " + serverAddress + " as server address");
    document.getElementById("create-directory-button").onclick = function() {
        $("#create-directory-dialog").modal("show");
    };

    document.getElementById("upload-file-button").onclick = function () {
        $("#upload-file-dialog").modal("show");
    };

    document.getElementById("confirm-create-directory-button").onclick = function() {
        var boxData = document.getElementById("directory-name-box").value;
        var formData = new FormData();

        formData.append("targetDirectory", currentDirectory + boxData);

        var request = new XMLHttpRequest();
        request.open("POST", APICall("/mkdir"));
        request.send(formData);

        document.getElementById("directory-name-box").value = "";
        generateItemViews();
    };

    document.getElementById("confirm-upload-file-button").onclick = function () {
        var uploadHandler = new UploadHandler(document.getElementById("file-to-upload").files[0]);
        uploadHandler.sendChunk();
    };

    generateItemViews();
};

// Uploads a file to the server in chunks of the given size
// The backend will handle the file reconstruction
class UploadHandler {
    constructor (file) {
        this.chunkSize = 50 * 1000 * 1000; // 50MB
        this.start = 0;
        this.file = file;
        this.lastChunk = false;
    }

    sendChunk() {
        var handler = this;
        var file = handler.file;
        var formData = new FormData();
        var chunk = file.slice(handler.start, handler.start + handler.chunkSize);
        var request = new XMLHttpRequest();

        formData.append("file", chunk);
        formData.append("targetDirectory", currentDirectory);
        formData.append("filename", file.name);
        formData.append("isInitialChunk", (handler.start == 0));

        request.open("POST", APICall("/upload"));
        request.upload.addEventListener("progress", function (event) {
            handler.setProgress(((handler.start + event.loaded) / file.size) * 100);
        }, false);
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (handler.start + handler.chunkSize > file.size) {
                    handler.chunkSize = file.size - handler.start;
                    handler.lastChunk = true;
                    handler.setProgress(100);
                    setTimeout(function() {
                        $("#upload-file-dialog").modal("hide");
                    }, 1000);
                } else {
                    handler.lastChunk = false;
                    handler.start += handler.chunkSize;
                }
                if (handler.start < file.size && !handler.lastChunk) {
                    handler.sendChunk();
                }
            }
        }
        request.send(formData);
    }

    setProgress(progress) {
        document.getElementById("upload-progress-bar").value = Math.round(progress);
    }
}

// Generates a set of buttons representing the files and directories that are
// available on the server on the given path
function generateItemViews() {
    var formData = new FormData();
    var request = new XMLHttpRequest();
    var container = document.getElementById("file-button-container");

    formData.append("targetDirectory", currentDirectory);
    request.open("POST", APICall("/readdir"));
    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE) {
            document.getElementById("file-button-container").innerHTML = "";
            fileList = JSON.parse(request.responseText)["fileList"];
            parentAvailable = JSON.parse(request.responseText)["parentAvailable"];
            if (parentAvailable) {
                item = new FileItem("..", "file-item", false);
                item.directory = getParentDirectory();
                item.setIcon("assets/img/folder.svg");

                container.appendChild(item.get());
            }

            for (i = 0; i < fileList.length; i++) {
                fileData = fileList[i];
                filename = fileData["name"];
                isFile = fileData["isFile"];
                item = new FileItem(filename, "file-item", isFile);
                item.directory = getAbsoluteDirectory(filename);;

                container.appendChild(item.get());
            }
        }
    };

    request.send(formData);
}

// Changes the current directory and regenerates the buttons
function enterDirectory(dir) {
    console.log("Entering to the directory " + dir);
    currentDirectory = dir;
    generateItemViews();
}

// Returns the absolute directory for a given relative directory
function getAbsoluteDirectory(dir) {
    return currentDirectory + dir + "/";;
}

// Returns the parent directory of the give directory
function getParentDirectory() {
    splittedDirectory = currentDirectory.split("/");
    parent = "";
    for (i = 0; i < splittedDirectory.length - 2; i++) {
        parent += splittedDirectory[i] + "/";
    }
    return parent;
}

// Class for creating a material styled-button programatically
class MaterialButton {

    maxLength = 15;

    constructor(content, classes, isFile) {
        this.object = document.createElement("button");
        this.object.className = "material-button " + classes;
        this.content = content;
        this.text = content;

        this.childIcon = document.createElement("img");
        this.childIcon.draggable = false;
        this.object.append(this.childIcon);

        this.childText = document.createElement("p");

        if (this.text.length > this.maxLength) {
           while (this.text.length > this.maxLength - 3) {
               this.text = this.text.slice(0, -1);
           }

           this.text += "...";
        }

        this.childText.innerHTML = this.text;
        this.childText.after(this.childIcon);
        this.object.append(this.childText);

        this.register();
        return this;
    }

    get() {
        return this.object;
    }

    setIcon(icon) {
        this.childIcon.src = icon;
    }

    register()  {
        if (!document.fileButtons) {
            document.fileButtons = [];
        }

        document.fileButtons += this;
    }
}

// Extension of the material button that includes file & directory handling
class FileItem extends MaterialButton {
    constructor(content, classes, isFile) {
        super(content, classes, isFile);
        this.lastClick = 0;
        this.object.selected = false;
        var item = this;

        this.object.onclick = function() {
            var clickTimestamp = Date.now();
            var isDoubleClick = (clickTimestamp - this.lastClick < 400);
            if (isDoubleClick) {
                if (!isFile) {
                    enterDirectory(item.directory);
                } else {
                    var progressBar = document.getElementById("download-progress-bar");
                    progressBar.value = 0;

                    document.getElementById("file-contextual-menu-title").innerHTML = content;
                    document.getElementById("delete-file-button").onclick = function() {
                        var formData = new FormData();
                        var request = new XMLHttpRequest();

                        formData.append("targetPath", currentDirectory + item.content);
                        request.open("POST", APICall("/delete"));
                        request.onreadystatechange = function() {
                            if (request.readyState === XMLHttpRequest.DONE) {
                                generateItemViews();
                                $("#file-contextual-menu").modal("hide");
                            }
                        }
                        request.send(formData);
                    };

                    document.getElementById("download-file-button").onclick = function() {
                        var formData = new FormData();
                        var request = new XMLHttpRequest();

                        formData.append("targetFile", currentDirectory + item.content);
                        request.open("POST", APICall("/download"));
                        request.responseType = "blob";
                        request.addEventListener("progress", function(event) {
                            var percent = (event.loaded / event.total) * 100;
                            progressBar.value = Math.round(percent);
                        }, false);
                        request.onload = function(e) {
                            if (this.status == 200) {
                                var blob = new Blob([this.response]);
                                let downloadElement = document.createElement("a");
                                document.body.appendChild(downloadElement);
                                downloadElement.href = window.URL.createObjectURL(blob);
                                downloadElement.download = item.content;
                                downloadElement.click();
                                window.URL.revokeObjectURL(downloadElement.href);
                            }
                        };
                        request.send(formData);
                    };
                    $("#file-contextual-menu").modal("show");
                    this.selected = true;
                }
            }

            if (!isDoubleClick || isFile) {
                if (this.selected) {
                    this.classList.remove("file-item-selected");
                } else {
                    this.classList.add("file-item-selected");
                }
                this.selected = !this.selected;
            }
            this.lastClick = clickTimestamp;
        };

        this.setIcon("assets/img/" + (isFile ? "file.svg" : "folder.svg"));
    }
}

function APICall(route) {
    return serverAddress + route;
}
