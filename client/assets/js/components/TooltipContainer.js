class TooltipContainer {
    constructor(content, div) {
        this.tooltip = document.createElement("span");
        this.tooltip.className = "d-inline-block";
        this.tooltip.setAttribute("data-toggle", "tooltip");
        this.tooltip.setAttribute("title", content);
        this.tooltip.appendChild(div);
        return this;
    }

    get() {
        return this.tooltip;
    }
}
