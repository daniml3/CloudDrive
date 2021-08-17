class Animator {
    constructor() {
        return this;
    }

    fade(fadeTarget, targetAlpha, offset, callback) {
        fadeTarget.style.opacity = 1 - targetAlpha;
        offset = offset || 0.1;
        var alphaOffset = (targetAlpha > 0) ? offset : offset * -1;
        var fadeEffect = setInterval(function () {
            if ((fadeTarget.style.opacity < targetAlpha && targetAlpha > 0)
                 || (fadeTarget.style.opacity > targetAlpha && targetAlpha <= 0)) {
                fadeTarget.style.opacity = parseFloat(fadeTarget.style.opacity) + alphaOffset;
            } else {
                clearInterval(fadeEffect);
                if (callback) {
                    callback();
                }
            }
        }, 20);
    }
}
