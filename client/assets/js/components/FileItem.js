// Extension of the material button that includes file & directory handling
class FileItem extends MaterialButton {
    constructor(content, classes, isFile, sessionHandler) {
        super(content, classes + " file-item");
        this.lastClick = 0;
        this.object.selected = false;
        var item = this;

        this.object.onclick = function() {
            var clickTimestamp = Date.now();
            var isDoubleClick = (clickTimestamp - this.lastClick < 400);
            if (isDoubleClick) {
                if (!isFile) {
                    sessionHandler.enterDirectory(item.directory);
                } else {
                    var progressBar = document.getElementById("download-progress-bar");
                    progressBar.value = 0;

                    document.getElementById("file-contextual-menu-title").innerHTML = content;
                    document.getElementById("delete-file-button").onclick = function() {
                        var formData = new FormData();
                        var request = new XMLHttpRequest();

                        formData.append("targetPath", sessionHandler.currentDirectory + item.content);
                        request.open("POST", sessionHandler.APICall("/delete"));
                        request.onreadystatechange = function() {
                            if (request.readyState === XMLHttpRequest.DONE) {
                                sessionHandler.generateItemViews();
                                $("#file-contextual-menu").modal("hide");
                            }
                        }
                        request.send(formData);
                    };

                    document.getElementById("download-file-button").onclick = function() {
                        var formData = new FormData();
                        var request = new XMLHttpRequest();

                        formData.append("targetFile", sessionHandler.currentDirectory + item.content);
                        request.open("POST", sessionHandler.APICall("/download"));
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