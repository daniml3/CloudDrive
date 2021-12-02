class Context {

    isInsecure = false;
    chunkSize = 90 * 1000 * 1000;

    constructor() {
    }

    init() {
        var request = new XMLHttpRequest();
        var context = this;

        request.open("GET", sessionHandler.APICall("/context"));
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                var response = JSON.parse(request.responseText);
                context.isInsecure = response["isInsecure"];
                context.chunkSize = response["chunkSize"];
            }
        };

        request.send();
        return request;
    }
}
