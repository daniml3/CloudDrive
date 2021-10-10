class Dimmer {
    constructor() {
        this.dimlayerId = "dimlayer";
        this.resetDim();
    }

    getDimElement() {
        var dimlayer = document.getElementById(this.dimlayerId);
        if (dimlayer != null) {
            return dimlayer;
        } else {
            var newDimlayer = document.createElement("div");
            newDimlayer.id = this.dimlayerId;
            newDimlayer.classList.add("dimlayer");
            document.body.appendChild(newDimlayer);
            return newDimlayer;
        }
    }

    applyDim(rejectClicks) {
        var element = this.getDimElement();
        element.style.opacity = 0.75;
        element.style.pointerEvents = rejectClicks ? "auto" : "none";
    }

    resetDim() {
        var element = this.getDimElement();
        element.style.opacity = 0;
        element.style.pointerEvents = "none";
    }
}
