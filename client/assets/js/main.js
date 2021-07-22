var currentDirectory = "/";

window.onload = function() {
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
        request.open("POST", "http://192.168.1.133:3333/mkdir");
        request.send(formData);

        document.getElementById("directory-name-box").value = "";
        generateItemViews();
    };

    document.getElementById("confirm-upload-file-button").onclick = function() {
        var request = new XMLHttpRequest();
        var formData = new FormData();
        request.open("POST", "http://192.168.1.133:3333/upload");
     
        formData.append("file", document.getElementById("file-to-upload").files[0]);
        formData.append("targetDirectory", currentDirectory);

        request.upload.addEventListener("progress", function(event) {
            var percent = (event.loaded / event.total) * 100;
            document.getElementById("upload-progress-bar").value = Math.round(percent);
            if (percent >= 100) {
                setTimeout(function() {
                    generateItemViews();
                    $("#upload-file-dialog").modal("hide");
                }, 1000);
            }
        }, false);
        request.send(formData);
    };

    generateItemViews();
};

function generateItemViews() {
    var formData = new FormData();
    var request = new XMLHttpRequest();
    var container = document.getElementById("file-button-container");

    formData.append("targetDirectory", currentDirectory);
    request.open("POST", "http://192.168.1.133:3333/readdir");
    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE) {
            document.getElementById("file-button-container").innerHTML = "";
            fileList = JSON.parse(request.responseText)["fileList"];
            parentAvailable = JSON.parse(request.responseText)["parentAvailable"];
            if (parentAvailable) {
                item = new FileItem("..", "file-item", false);
                item.directory = getParentDirectory();
                item.setIcon("assets/img/folder.svg");
                console.log(getParentDirectory());

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

function enterDirectory(dir) {
    currentDirectory = dir;
    generateItemViews();
}

function getAbsoluteDirectory(dir) {
    return currentDirectory + dir + "/";;
}

function getParentDirectory() {
    parent = currentDirectory.slice(0, -1);
    return parent.replace(parent.split("/").pop(),"");
}

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
                    console.log(item.directory);
                } else {
                    var progressBar = document.getElementById("download-progress-bar");
                    progressBar.value = 0;
                    
                    document.getElementById("file-contextual-menu-title").innerHTML = content;
                    document.getElementById("delete-file-button").onclick = function() {
                        // TODO handle deletion
                    };

                    document.getElementById("download-file-button").onclick = function() {
                        var formData = new FormData();
                        var request = new XMLHttpRequest();
                    
                        formData.append("targetFile", currentDirectory + item.content);
                        request.open("POST", "http://192.168.1.133:3333/download");
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