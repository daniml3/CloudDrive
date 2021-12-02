class Context {

    isInsecure = false;

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
            }
        };

        request.send();
        return request;
    }
}
