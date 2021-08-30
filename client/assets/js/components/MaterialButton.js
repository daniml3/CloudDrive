// Class for creating a material styled button programatically
class MaterialButton {

    constructor(content, classes) {
        this.object = document.createElement("button");
        this.object.className = "material-button " + classes;
        this.content = content;
        this.text = content;

        this.childIcon = document.createElement("img");
        this.childIcon.className = "unclickable unselectable";
        this.object.append(this.childIcon);

        this.childText = document.createElement("p");
        this.childText.className = "unclickable unselectable";

        this.childText.innerHTML = this.text;
        this.childText.after(this.childIcon);
        this.object.append(this.childText);

        this.childIcon.draggable = false;
        this.childText.draggable = false;
        this.draggable = false;

        return this;
    }

    get() {
        return this.object;
    }

    setIcon(icon) {
        this.childIcon.src = icon;
    }

    fadeOut(callback) {
        var animator = new Animator();
        animator.fade(this.get(), 0, null, callback);
    }

    fadeIn(callback) {
        var animator = new Animator();
        animator.fade(this.get(), 1, null, callback);
    }
}
