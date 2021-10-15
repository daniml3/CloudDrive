class CutHandler {
    constructor() {
        this.elementList = {};
        this.animator = new Animator();
        this.lastAlpha = 1;
    }

    cut(filename, elementPath) {
        if (!this.isCut(elementPath)) {
            var element = new CutElement(filename, elementPath);
            element.addToList();
            this.elementList[elementPath] = element;
        }
    }

    uncut(elementPath) {
        var element = this.elementList[elementPath].removeFromList();;
        delete this.elementList[elementPath];
    }

    isCut(elementPath) {
        return (this.getElementByPath(elementPath) != null);
    }

    getElementByPath(elementPath) {
        return this.elementList[elementPath];
    }

    uncutAll() {
        var elements = Object.values(cutHandler.elementList);
        for (var i = 0; i < elements.length; i++) {
            elements[i].removeFromList();
        }
        this.elementList = {};
    }

    pasteHere() {
        if (Object.keys(this.elementList).length > 0) {
            this.pasteNext();
        }
    }

    pasteNext() {
        var element = Object.values(this.elementList)[0];
        var originPath = element.elementPath;
        var splittedPath = originPath.split("/");
        var targetPath = document.sessionHandler.currentDirectory + "/" + element.filename;

        var formData = new FormData();
        var request = new XMLHttpRequest();
        var handler = this;

        formData.append("originPath", originPath);
        formData.append("targetPath", targetPath);
        request.open("POST", sessionHandler.APICall("/move"));
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                handler.uncut(element.elementPath);
                if (Object.values(handler.elementList).length > 0) {
                    handler.pasteNext();
                } else {
                    document.sessionHandler.watchCurrentDirectory();
                }
            }
        }

        element.element.classList.add("constant-fade-in-out");
        request.send(formData);
    }
}
