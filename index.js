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

Searcher.prototype.setQuery = function (str) {
	if (str == this.queryStr)
		return;

	this.queryStr = str;
	this.query = new RegExp(addAccents(str), "ig");
};

function shouldDescendInto(node) {
	return node.nodeName != "SCRIPT" && node.nodeName != "STYLE";
}

function getNextTextNode(node, container, wrap) {
	outer: do {
		if (shouldDescendInto(node) && node.firstChild) {
			node = node.firstChild;
		} else if (node.nextSibling) {
			node = node.nextSibling;
		} else {
			do {
				if (node == container) {
					if (!wrap)
						return null;
					wrap = false;
					continue outer;
				}
				node = node.parentNode;
			} while (!node.nextSibling);
			node = node.nextSibling;
		}
	} while (node.nodeType != Node.TEXT_NODE);
	return node;
}

function getPrevTextNode(node, container, wrap) {
	do {
		if (node == container) {
			if (!wrap)
				return null;
			while (shouldDescendInto(node) && node.lastChild)
				node = node.lastChild;
			wrap = false;
		} else if (node.previousSibling) {
			node = node.previousSibling;
			while (shouldDescendInto(node) && node.lastChild)
				node = node.lastChild;
		} else {
			node = node.parentNode;
		}
	} while (node.nodeType != Node.TEXT_NODE);
	return node;
}

function getFirstTextNode(container) {
	return getNextTextNode(container, container, false);
}

function getLastTextNode(container) {
	return getPrevTextNode(container, container, true);
}

function matchLast(re, str) {
	var last;
	re.lastIndex = 0;
	for (var m = re.exec(str); m; m = re.exec(str))
		last = m;
	return last;
}

Searcher.prototype.selectNext = function () {
	if (!this.queryStr)
		return;

	var sel = window.getSelection();
	var startNode = sel.focusNode;
	var startOffset = 0;
	if (!startNode)
		startNode = getFirstTextNode(this.container);
	else if (startNode.nodeType != Node.TEXT_NODE ||
			!this.container.contains(startNode))
		startNode = getNextTextNode(startNode, this.container, true);
	else
		startOffset = sel.focusOffset;

	for (var node = startNode; node;
			node = getNextTextNode(node, this.container, true)) {
		var str = node.data;
		this.query.lastIndex = startOffset;
		if (startOffset)
			startOffset = 0;
		var m = this.query.exec(str);
		if (m) {
			setSelection(node, m.index, node, m.index + m[0].length);
			return;
		}
	}
};

Searcher.prototype.selectPrev = function () {
	if (!this.queryStr)
		return;

	var sel = window.getSelection();
	var endNode = sel.anchorNode;
	var endOffset = 0;
	if (!endNode)
		endNode = getLastTextNode(this.container);
	else if (endNode.nodeType != Node.TEXT_NODE ||
			!this.container.contains(endNode))
		endNode = getPrevTextNode(endNode, this.container, true);
	else
		endOffset = sel.anchorOffset;

	for (var node = endNode; node;
			node = getPrevTextNode(node, this.container, true)) {
		var str = node.data;
		if (endOffset < Infinity) {
			str = node.data.substr(0, endOffset);
			endOffset = Infinity;
		}
		var m = matchLast(this.query, str);
		if (m) {
			setSelection(node, m.index, node, m.index + m[0].length);
			return;
		}
	}
};

if (global.module)
	module.exports = Searcher;
else
	global.Searcher = Searcher;
}(this));
