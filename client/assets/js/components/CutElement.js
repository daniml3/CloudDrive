class CutElement {
    constructor(filename, elementPath) {
        this.filename = filename;
        this.elementPath = elementPath;
    }

    addToList() {
        var element = document.createElement("div");
        var container = document.getElementById("cut-files-container");
        var cutElement = this;

        element.classList.add("material-button");
        element.classList.add("cut-element");
        element.innerHTML = this.elementPath;
        element.onclick = function() {
            cutElement.removeFromList();
        };

        container.appendChild(element);;
        this.element = element;
    }

    removeFromList() {
        var container = document.getElementById("cut-files-container");
        container.removeChild(this.element);
    }
}
