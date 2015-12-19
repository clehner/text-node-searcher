/*
 * TextNodeSeacher
 * Copyright (c) 2015 Charles Lehner
 *
 * Usage of the works is permitted provided that this instrument is
 * retained with the works, so that any entity that uses the works is
 * notified of this instrument.
 *
 * DISCLAIMER: THE WORKS ARE WITHOUT WARRANTY.
 */

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

function quoteRegex(str) {
	return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}

function setSelection(startNode, startOffset, endNode, endOffset) {
	var range = document.createRange();
	range.setStart(startNode, startOffset);
	range.setEnd(endNode, endOffset);

	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

function selectText(node, offset, len, align) {
	// Put the text into its own element so we can scroll it into view
	var parent = node.parentNode;
	var el = document.createElement("span");
	var middle = offset > 0 ? node.splitText(offset) : node;
	var end = middle.splitText(len);
	el.appendChild(middle);
	parent.insertBefore(el, end);
	el.scrollIntoView(align);

	// Restore the text and set the selection
	parent.removeChild(el);
	parent.insertBefore(middle, end);
	parent.normalize();
	setSelection(node, offset, node, offset + len);
}

function TextNodeSearcher(container) {
	this.container = container || document.body;
}

TextNodeSearcher.prototype.setQuery = function (str) {
	if (str == this.queryStr)
		return;

	this.queryStr = str;
	this.query = new RegExp(addAccents(quoteRegex(str)), "ig");
};

function shouldDescendInto(node) {
	return node.nodeName != "SCRIPT" && node.nodeName != "STYLE";
}

function getNextTextNode(node, container) {
	do {
		if (shouldDescendInto(node) && node.firstChild) {
			node = node.firstChild;
		} else {
			while (!node.nextSibling) {
				node = node.parentNode;
				if (node == container || !node)
					return null;
			}
			node = node.nextSibling;
		}
	} while (node.nodeType != node.TEXT_NODE);
	return node;
}

function getPreviousTextNode(node, container) {
	if (node == container) {
		while (node.lastChild && shouldDescendInto(node))
			node = node.lastChild;
		if (node.nodeType == node.TEXT_NODE)
			return node;
	}
	do {
		if (!node || node == container) {
			return null;
		} else if (node.previousSibling) {
			node = node.previousSibling;
			while (shouldDescendInto(node) && node.lastChild)
				node = node.lastChild;
		} else {
			node = node.parentNode;
		}
	} while (node.nodeType != node.TEXT_NODE);
	return node;
}

function matchLast(re, str) {
	var last;
	re.lastIndex = 0;
	for (var m = re.exec(str); m; m = re.exec(str))
		last = m;
	return last;
}

TextNodeSearcher.prototype.selectNext = function () {
	if (!this.queryStr || !this.container)
		return;

	var sel = window.getSelection();
	var startNode = sel.focusNode;
	var startOffset = 0;
	if (!startNode || !this.container.contains(startNode))
		startNode = getNextTextNode(this.container, this.container);
	else if (startNode.nodeType != startNode.TEXT_NODE)
		startNode = getNextTextNode(startNode, this.container);
	else
		startOffset = sel.focusOffset;

	var wrapped = false;
	for (var node = startNode; node;) {
		var str = node.data;
		this.query.lastIndex = startOffset;
		if (startOffset)
			startOffset = 0;
		var m = this.query.exec(str);
		if (m) {
			selectText(node, m.index, m[0].length, false);
			return;
		}
		node = getNextTextNode(node, this.container);
		if (!node) {
			if (wrapped)
				return;
			wrapped = true;
			node = getNextTextNode(this.container, this.container);
		}
	}
};

TextNodeSearcher.prototype.selectPrevious = function () {
	if (!this.queryStr || !this.container)
		return;

	var sel = window.getSelection();
	var endNode = sel.anchorNode;
	var endOffset = 0;
	if (!endNode || !this.container.contains(endNode))
		endNode = getPreviousTextNode(this.container, this.container);
	else if (endNode.nodeType != endNode.TEXT_NODE)
		endNode = getPreviousTextNode(endNode, this.container);
	else
		endOffset = sel.anchorOffset;

	var wrapped = false;
	for (var node = endNode; node;) {
		var str = node.data;
		if (endOffset < Infinity) {
			str = node.data.substr(0, endOffset);
			endOffset = Infinity;
		}
		var m = matchLast(this.query, str);
		if (m) {
			selectText(node, m.index, m[0].length, false);
			return;
		}
		node = getPreviousTextNode(node, this.container);
		if (!node) {
			if (wrapped)
				return;
			wrapped = true;
			node = getPreviousTextNode(this.container, this.container);
		}
	}
};

if (typeof module != "undefined")
	module.exports = TextNodeSearcher;
else if (global)
	global.TextNodeSearcher = TextNodeSearcher;
}(this));
