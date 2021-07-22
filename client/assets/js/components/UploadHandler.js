// Uploads a file to the server in chunks of the given size
// The backend will handle the file reconstruction
class UploadHandler {
    constructor (file, sessionHandler) {
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
        formData.append("targetDirectory", sessionHandler.currentDirectory);
        formData.append("filename", file.name);
        formData.append("isInitialChunk", (handler.start == 0));

        request.open("POST", sessionHandler.APICall("/upload"));
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