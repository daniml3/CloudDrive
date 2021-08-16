function copyToClipboard(text) {
    var text = document.createTextNode(text);
    var range = document.createRange();
    var selection = window.getSelection;
    document.body.appendChild(text);
    range.selectNodeContents(text);
    selection().removeAllRanges();
    selection().addRange(range);
    document.execCommand('copy');
    selection().removeAllRanges();
    text.remove();
}
