// Extension of the material button that includes file & directory handling
class FileItem extends MaterialButton {

    disabledSelectedList = [".."];

    constructor(content, classes, isFile, sessionHandler) {
        super(content, classes + " file-item");
        this.lastClick = 0;
        this.object.selected = false;
        this.sessionHandler = sessionHandler;
        this.isFile = isFile;
        this.directory = sessionHandler.currentDirectory
        this.absoluteDirectory = this.directory + this.content;

        var item = this;

        this.object.onclick = function() {
            var clickTimestamp = Date.now();
            var isDoubleClick = (clickTimestamp - item.lastClick < 400);
            if (isDoubleClick) {
                if (!isFile) {
                    sessionHandler.enterDirectory(item.directory);
                } else {
                    document.getElementById("file-contextual-menu-title").innerHTML = content;

                    document.getElementById("download-file-button").onclick = function() {
                        var longevitySeconds = document.getElementById("download-url-longevity").value;
                        document.authHandler.getTemporalToken(longevitySeconds, item.absoluteDirectory, function (token) {
                            window.open(sessionHandler.APICall("/download/" + token + item.absoluteDirectory));
                        });
                    };

                    var genFileUrlButton = document.getElementById("genenrate-file-url-button");
                    var originalButtonText = genFileUrlButton.innerHTML;
                    genFileUrlButton.onclick = function() {
                        var longevitySeconds = document.getElementById("download-url-longevity").value;
                        document.authHandler.getTemporalToken(longevitySeconds, item.absoluteDirectory, function (token) {
                            var txt = sessionHandler.APICall("/download/" + token + item.absoluteDirectory);
                            copyToClipboard(txt);
                            genFileUrlButton.innerHTML = "Copied!";
                            setTimeout(function() {
                                genFileUrlButton.innerHTML = originalButtonText;
                            }, 2000);
                         });
                    };
                    $("#file-contextual-menu").modal("show");
                    item.selected = true;
                }
            }

            if ((!isDoubleClick || isFile) && !item.disabledSelectedList.includes(item.getName())) {
                if (item.selected) {
                    this.classList.remove("file-item-selected");
                } else {
                    this.classList.add("file-item-selected");
                }
                item.selected = !item.selected;
            }
            item.lastClick = clickTimestamp;
        };

        this.setIcon("assets/img/" + (isFile ? "file.svg" : "folder.svg"));
        this.childIcon.classList.add("white-black-icon");
        this.sessionHandler.fileButtonList.push(this);
    }

    isSelected() {
        return this.selected;
    }

    getName() {
        return this.content;
    }
}
