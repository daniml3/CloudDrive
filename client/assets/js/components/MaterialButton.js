// Class for creating a material styled button programatically
class MaterialButton {

    maxLength = 15;

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

        if (this.text.length > this.maxLength) {
           while (this.text.length > this.maxLength - 3) {
               this.text = this.text.slice(0, -1);
           }

           this.text += "...";
        }

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
        var fadeTarget = this.get();
        fadeTarget.style.opacity = 1;
        var fadeEffect = setInterval(function () {
            if (fadeTarget.style.opacity > 0) {
                fadeTarget.style.opacity = parseFloat(fadeTarget.style.opacity) - 0.1;
            } else {
                clearInterval(fadeEffect);
                if (callback) {
                    callback();
                }
            }
        }, 20);
    }

    fadeIn(callback) {
        var fadeTarget = this.get();
        fadeTarget.style.opacity = 0;
        var fadeEffect = setInterval(function () {
            if (fadeTarget.style.opacity < 1) {
                fadeTarget.style.opacity = parseFloat(fadeTarget.style.opacity) + 0.1;
            } else {
                clearInterval(fadeEffect);
                if (callback) {
                    callback();
                }
            }
        }, 20);
    }
}
