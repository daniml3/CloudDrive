class CutHandler {
    constructor() {
        this.elementList = [];
    }

    cut(elementPath) {
        if (!this.isCut(elementPath)) {
            var element = new CutElement(elementPath);
            element.addToList();
            this.elementList.push(element);
        }
    }

    uncut(elementPath) {
        var elementToUncut = this.getElementByPath(elementPath);
        if (elementToUncut) {
            elementToUncut.removeFromList();
            this.elementList.splice(elementToUncut, 1);
        }
    }

    isCut(elementPath) {
        return (this.getElementByPath(elementPath) != null);
    }

    getElementByPath(elementPath) {
        for (var i = 0; i < this.elementList.length; i++) {
            var element = this.elementList[i];
            if (elementPath == element.elementPath) {
                return element;
            }
        }

        return null;
    }

    uncutAll() {
        for (var i = 0; i < this.elementList.length; i++) {
            this.elementList[i].removeFromList();
        }
        this.elementList = [];
    }

    pasteHere() {
        this.pasteNext();
    }

    pasteNext() {
            var element = this.elementList[0];
            var originPath = element.elementPath;
            var splittedPath = originPath.split("/");
            var filename = splittedPath[splittedPath.length - 1];
            var targetPath = document.sessionHandler.currentDirectory + "/" + filename;

            var formData = new FormData();
            var request = new XMLHttpRequest();
            var handler = this;

            formData.append("originPath", originPath);
            formData.append("targetPath", targetPath);
            request.open("POST", sessionHandler.APICall("/move"));
            request.onreadystatechange = function() {
                handler.uncut(element.elementPath);
                if (handler.elementList.length > 0) {
                    handler.pasteNext();
                }
            }
            request.send(formData);

    }
}
