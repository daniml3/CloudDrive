class CutElement {
    constructor(filename, elementPath) {
        this.filename = filename;
        this.elementPath = elementPath;
    }

    addToList() {
        var element = document.createElement("div");
        var container = document.getElementById("file-clipboard-container");
        var cutElement = this;

        element.classList.add("material-button");
        element.classList.add("cut-element");
        element.innerHTML = this.elementPath;
        element.onclick = function() {
            document.cutHandler.uncut(cutElement.elementPath);
        };

        container.appendChild(element);;
        this.element = element;
    }

    removeFromList() {
        var container = document.getElementById("file-clipboard-container");
        container.removeChild(this.element);
    }
}
