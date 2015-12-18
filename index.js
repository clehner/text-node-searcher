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

function getNextTextNode(node, container, wrap) {
	do {
		if (node.firstChild) {
			console.log('firstchild');
			node = node.firstChild;
		} else if (node.nextSibling) {
			console.log('nextsib');
			node = node.nextSibling;
		} else {
			do {
				if (node == container)
					return wrap ? getFirstTextNode(container) : null;
				console.log('parent');
				node = node.parentNode;
			} while (!node.nextSibling);
				console.log('next sib');
			node = node.nextSibling;
		}
	} while (node.nodeType != Node.TEXT_NODE);
	return node;
}

function getPrevTextNode(node, container, wrap) {
	do {
		if (node.previousSibling) {
			console.log('previous sib');
			node = node.previousSibling;
			while (node.lastChild)
				node = node.lastChild;
		} else if (node.parentNode != container) {
			node = node.parentNode;
		} else {
			return wrap ? getLastTextNode(container) : null;
		}
	} while (node.nodeType != Node.TEXT_NODE);
	return node;
}

function getFirstTextNode(container) {
	return getNextTextNode(container, container);
}

function getLastTextNode(container) {
	return getPrevTextNode(container, container);
}

Searcher.prototype.selectNext = function () {
	if (!this.queryLen)
		return;

	var sel = window.getSelection();
	var startNode = sel.focusNode || getFirstTextNode(this.container);
	var startOffset = sel.focusOffset;
	if (!startNode)
		return;
	if (!startNode.data)
		console.log('start', startNode);

	for (var node = startNode, str = node.data.substr(startOffset);
		node;
		node = getNextTextNode(node, this.container, true),
			str = node.data)
	{
		var m = str.match(this.query);
		if (m) {
			var i = m.index;
			console.log('next node', node, 'index', i);
			setSelection(node, i, node, i + m[0].length);
			return;
		}
	}
};

Searcher.prototype.selectPrev = function () {
	if (!this.queryLen)
		return;

	var sel = window.getSelection();
	var endNode = sel.anchorNode || getLastTextNode(this.container);
	var endOffset = sel.anchorOffset;
	if (!endNode)
		return;
	if (!endNode.data)
		console.log('end', endNode);

	for (var node = endNode, str = endNode.data.substr(0, endOffset);
		node;
		node = getPrevTextNode(node, this.container, true),
		str = node.data)
	{
		var m = str.match(this.query);
		if (m) {
			var i = m.index;
			console.log('prev node', node, 'index', i);
			setSelection(node, i, node, i + m[0].length);
			return;
		}
	}
};

if (global.module)
	module.exports = Searcher;
else
	global.Searcher = Searcher;
}(this));
