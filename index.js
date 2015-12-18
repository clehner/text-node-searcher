(function (global) {

function addAccents(str) {
	// http://www.the-art-of-web.com/javascript/search-highlight/
	return str
		// .replace(/([ao])e/ig, "$1")
		.replace(/e/ig, "[eèéêë]")
		.replace(/a/ig, "([aàâä]|ae)")
		.replace(/i/ig, "[iîï]")
		.replace(/o/ig, "([oôö]|oe)")
		.replace(/u/ig, "[uùûü]")
		.replace(/y/ig, "[yÿ]");
}

function setSelection(startNode, startOffset, endNode, endOffset) {
	var range = document.createRange();
	range.setStart(startNode, startOffset);
	range.setEnd(endNode, endOffset);

	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

function Searcher(container) {
	this.container = container;
}

Searcher.prototype.highlight = function () {
	// if (this.isHighlighted)

};

Searcher.prototype.setQuery = function (str) {
	if (str == this.queryStr)
		return;

	this.queryStr = str;
	this.queryLen = str.length;
	this.query = new RegExp(addAccents(str), "i");
};

Searcher.prototype.selectNext = function () {
	// Searcher_selectNext(this.container);
	var sel = window.getSelection();
	// var range = sel.getRangeAt(0);
	setSelection(sel.anchorNode, sel.anchorOffset + 1,
		sel.extentNode, sel.extentOffset + 1);
};

Searcher.prototype.selectPrev = function () {
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
