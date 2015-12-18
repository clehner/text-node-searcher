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

function log() {
	var str;
	try {
		str = [].slice.call(arguments).join(", ");
	} catch(e) {
		str = e.message;
	}
	document.body.appendChild(document.createElement("pre"))
		.appendChild(document.createTextNode(str));
}
window.log = log;

function getFirstTextNode(container) {
	return getNextTextNode(container, container);
}

function getNextTextNode(node, container) {
	do {
		if (node.firstChild) {
			console.log('firstchild')
			node = node.firstChild;
		} else if (node.nextSibling) {
			console.log('nextsib')
			node = node.nextSibling;
		} else {
			do {
				if (node == container)
					return null;
				console.log('parent')
				node = node.parentNode;
			} while (!node.nextSibling);
				console.log('next sib')
			node = node.nextSibling;
		}
	} while (node.nodeType != Node.TEXT_NODE);
	console.log('ret', node.nodeValue)
	return node;
}

function nodeValue(node) {
	return node.nodeValue;
}

function textNodesToString(nodes) {
	return nodes.map(nodeValue).join("");
}

Searcher.prototype.selectNext = function () {
	if (!this.queryLen)
		return;

	var sel = window.getSelection();
	var startNode = sel.extentNode || getFirstTextNode(this.container);
	var startOffset = sel.extentOffset;
	var textNodesTextLen = startNode.nodeValue.length - startOffset;
	var textNodes = [startNode];
	var lastTextNode = startNode;
	while (textNodesTextLen < this.queryLen) {
		// console.log('add another.', textNodesTextLen)
		lastTextNode = getNextTextNode(lastTextNode, this.container);
		if (!lastTextNode)
			return;
		textNodes.push(lastTextNode);
		textNodesTextLen += lastTextNode.nodeValue.length;
	}
	var str = textNodesToString(textNodes);
	log(textNodesTextLen, textNodes.length, str);
	textNodesToString(textNodes);
	var m = str.search(this.query);
	if (m) {
		var i = m.index;
		var firstNodeLen = textNodes[0].nodeValue.length;
		while (i > firstNodeLen) {
			textNodesTextLen -= firstNodeLen;
			i -= firstNodeLen;
			textNodes.shift();
		}
		startNode = textNodes[0];
		startOffset = i;
		// m[0].length
		setSelection(startNode, startOffset,
			startNode, startOffset + 1);
	}
	//	set selection



	// log(node, offset);
	/*
	setSelection(sel.anchorNode, sel.anchorOffset + 1,
		sel.extentNode, sel.extentOffset + 1);
		*/
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
