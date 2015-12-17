(function (global) {

function Searcher(container) {
	this.container = container;
}

Searcher.prototype.highlight = function () {
	// if (this.isHighlighted)

};

Searcher.prototype.selectNext = function () {
	// Searcher_selectNext(this.container);
	var sel = window.getSelection();
	var range = sel.getRangeAt(0);
	// range.startContainer
	// range.startOffset
	void range;
};

/*
function Searcher_selectNext(parentNode) {
	for (var el = parentNode.firstChild; el; el = el.nextSibling) {
		if (el.firstChild) {
			Searcher_selectNext(parentNode);
		} else if (el.nodeType == 3) { // NODE_TEXT
			var text = el.nodeValue;
			void text;
		}
	}
}
*/

/*
var range = document.createRange();

range.setStart(startNode, startOffset);
range.setEnd(endNode, endOffset);

var s = window.getSelection();
l.removeAllRanges();
s.addRange(range);
*/

if (global.module)
	module.exports = Searcher;
else
	global.Searcher = Searcher;
}(this));
