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

function setSelection(startNode, startOffset, endNode, endOffset) {
	var range = document.createRange();
	range.setStart(startNode, startOffset);
	range.setEnd(endNode, endOffset);

	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

function TextNodeSearcher(container) {
	this.container = container;
}

TextNodeSearcher.prototype.setQuery = function (str) {
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

function getPreviousTextNode(node, container, wrap) {
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

function matchLast(re, str) {
	var last;
	re.lastIndex = 0;
	for (var m = re.exec(str); m; m = re.exec(str))
		last = m;
	return last;
}

TextNodeSearcher.prototype.selectNext = function () {
	if (!this.queryStr)
		return;

	var sel = window.getSelection();
	var startNode = sel.focusNode;
	var startOffset = 0;
	if (!startNode || startNode.nodeType != Node.TEXT_NODE ||
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

TextNodeSearcher.prototype.selectPrevious = function () {
	if (!this.queryStr)
		return;

	var sel = window.getSelection();
	var endNode = sel.anchorNode;
	var endOffset = 0;
	if (!endNode || endNode.nodeType != Node.TEXT_NODE ||
			!this.container.contains(endNode))
		endNode = getPreviousTextNode(endNode, this.container, true);
	else
		endOffset = sel.anchorOffset;

	for (var node = endNode; node;
			node = getPreviousTextNode(node, this.container, true)) {
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
	module.exports = TextNodeSearcher;
else
	global.TextNodeSearcher = TextNodeSearcher;
}(this));
