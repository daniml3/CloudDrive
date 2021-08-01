var sessionHandler = new SessionHandler();
var deleteQueue = new DeleteQueue();

// Setup the session, the window buttons and generate the items
window.onload = function() {
    sessionHandler.init();
    console.log("Using " + sessionHandler.getServerAddress() + " as server address");
    document.getElementById("create-directory-button").onclick = function() {
        $("#create-directory-dialog").modal("show");
    };

    document.getElementById("upload-file-button").onclick = function () {
        $("#upload-file-dialog").modal("show");
    };

    document.getElementById("confirm-create-directory-button").onclick = function() {
        var boxData = document.getElementById("directory-name-box").value;
        var formData = new FormData();

        formData.append("targetDirectory", sessionHandler.currentDirectory + boxData);

        var request = new XMLHttpRequest();
        request.open("POST", sessionHandler.APICall("/mkdir"));
        request.send(formData);

        document.getElementById("directory-name-box").value = "";
        sessionHandler.generateItemViews();
    };

    document.getElementById("confirm-upload-file-button").onclick = function () {
        var uploadHandler = new UploadHandler(document.getElementById("file-to-upload").files[0]);
        uploadHandler.sendChunk();
    };

    document.getElementById("delete-selected-button").onclick = function () {
        deleteQueue.clear();
        for (i = 0; i < sessionHandler.fileButtonList.length; i++) {
            var fileItem = sessionHandler.fileButtonList[i];
            if (fileItem.isSelected()) {
                deleteQueue.addFileToQueue(fileItem);
            }
        }
        deleteQueue.startDeleting();
    }

    sessionHandler.startFileItemLoop();
};