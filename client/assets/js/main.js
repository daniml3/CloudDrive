var sessionHandler = new SessionHandler();

// Setup the window buttons and generate the items
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

        formData.append("targetDirectory", currentDirectory + boxData);

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

    sessionHandler.generateItemViews();
};