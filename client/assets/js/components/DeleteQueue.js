class DeleteQueue {
    constructor() {
        this.clear();
        this.index = 0;
    }

    addFileToQueue(file) {
        this.queue.push(file);
    }

    startDeleting() {
        if (this.queue.length > 0) {
            $("#delete-file-dialog").modal("show");
            this.deleteNext();
        }
    }

    deleteNext() {
        var fileItem = this.queue[this.index];
        var formData = new FormData();
        var request = new XMLHttpRequest();
        var deleteQueue = this;

        formData.append("targetPath", sessionHandler.currentDirectory + fileItem.content);
        formData.append("isFile", fileItem.isFile);
        request.open("POST", sessionHandler.APICall("/delete"));
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                 deleteQueue.index++;
                 if (deleteQueue.index >= deleteQueue.queue.length) {
                     deleteQueue.index = 0;
                 } else {
                     deleteQueue.deleteNext();
                 }
            }
        }
        request.send(formData);
    }
    clear() {
        this.queue = [];
    }
}
