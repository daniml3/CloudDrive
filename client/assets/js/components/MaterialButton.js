// Class for creating a material styled-button programatically
class MaterialButton {

    maxLength = 15;

    constructor(content, classes) {
        this.object = document.createElement("button");
        this.object.className = "material-button " + classes;
        this.content = content;
        this.text = content;

        this.childIcon = document.createElement("img");
        this.childIcon.draggable = false;
        this.object.append(this.childIcon);

        this.childText = document.createElement("p");

        if (this.text.length > this.maxLength) {
           while (this.text.length > this.maxLength - 3) {
               this.text = this.text.slice(0, -1);
           }

           this.text += "...";
        }

        this.childText.innerHTML = this.text;
        this.childText.after(this.childIcon);
        this.object.append(this.childText);

        this.register();
        return this;
    }

    get() {
        return this.object;
    }

    setIcon(icon) {
        this.childIcon.src = icon;
    }

    register()  {
        if (!document.fileButtons) {
            document.fileButtons = [];
        }

        document.fileButtons += this;
    }
}