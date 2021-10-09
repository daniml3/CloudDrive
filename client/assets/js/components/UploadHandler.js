// Uploads a file to the server in chunks of the given size
// The backend will handle the file reconstruction
class UploadHandler {
    constructor (file, sessionHandler) {
        this.chunkSize = 10 * 1000 * 1000; // 10MB
        this.start = 0;
        this.file = file;
    }

    sendChunk() {
        var handler = this;
        var file = handler.file;
        var formData = new FormData();
        var chunk = file.slice(handler.start, handler.start + handler.chunkSize);
        var request = new XMLHttpRequest();

        document.getElementById("file-to-upload").disabled = true;

        formData.append("file", chunk);
        formData.append("targetDirectory", sessionHandler.currentDirectory);
        formData.append("filename", file.name);
        formData.append("isInitialChunk", (handler.start == 0));
        formData.append("isLastChunk", handler.isLastChunk(file));

        request.open("POST", sessionHandler.APICall("/upload"));
        request.upload.addEventListener("progress", function (event) {
            handler.setProgress(((handler.start + event.loaded) / file.size) * 100);
        }, false);
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                var response = JSON.parse(request.responseText);
                if (response["error"]) {
                    document.getElementById("error-message").innerHTML = response["errorMessage"];
                    $("#error-dialog").modal("show");
                } else {
                    if (handler.isLastChunk(file)) {
                        handler.setProgress(100);
                        setTimeout(function() {
                            $("#upload-file-dialog").modal("hide");
                            document.getElementById("file-to-upload").disabled = false;
                        }, 1000);
                    } else {
                        handler.start += handler.chunkSize;
                        if (handler.start < file.size) {
                            handler.sendChunk();
                        }
                    }
                }
            }
        }
        request.send(formData);
    }

    isLastChunk(file) {
        return (this.start + this.chunkSize > file.size);
    }

    setProgress(progress) {
        document.getElementById("upload-progress-bar").value = Math.round(progress);
    }
}
