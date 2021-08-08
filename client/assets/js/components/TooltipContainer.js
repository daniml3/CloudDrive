class TooltipContainer {
    constructor(content) {
        var tooltip = document.createElement("span");
        tooltip.className = "d-inline-block";
        tooltip.setAttribute("data-toggle", "tooltip");
        tooltip.setAttribute("title", content);
        return tooltip;
    }
}
