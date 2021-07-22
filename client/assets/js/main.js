var currentDirectory = "/";
var parentDirecotry = "/";

window.onload = function() {
    document.getElementById("create-directory-button").onclick = function() {
        $("#create-directory-dialog").modal("show");
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
                item.directory = parentDirecotry;
                item.setIcon("assets/img/folder.svg");

                container.appendChild(item.get());
            }

            for (i = 0; i < fileList.length; i++) {
                fileData = fileList[i];
                filename = fileData["name"];
                isFile = fileData["isFile"];
                item = new FileItem(filename, "file-item", isFile);
                item.directory = filename;

                container.appendChild(item.get());
            }
        }
    };

    request.send(formData);
}

function enterDirectory(dir) {
    if (dir != parentDirecotry) {
        parentDirecotry = currentDirectory;
        currentDirectory = currentDirectory + dir + "/";
    } else {
        currentDirectory = parentDirecotry;
    }
    generateItemViews();
}

class MaterialButton {

    maxLength = 15;

    constructor(content, classes, isFile) {
        this.object = document.createElement("button");
        this.object.className = "material-button " + classes;
        this.content = content;
        this.text = content;

        this.childIcon = document.createElement("img");
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
        this.get().selected = false;     

        this.get().onclick = function() {
            var clickTimestamp = Date.now();
            if (clickTimestamp - this.lastClick < 400 && !isFile) {
                enterDirectory(item.directory);
            } else {
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