# Text Node Searcher

Search for text in a web page

## API

### Contructor

* `new TextNodeSeacher(Element container)`

	Create a searcher for text nodes in the given container.
	`container` defaults to `document.body`.

### Methods

* `setQuery(String query)`

	Set the search query

* `selectNext()`

	Select the next text segment matching the query

* `selectPrevious()`

	Select the previous text segment matching the query

### Properties

* `Element container`

	The container within which text will be searched

* `RegExp query`

	The current query. Use setQuery unless you actually want to specify a
	regular expression.

## TODO

- Match text that spans multiple text nodes
- Highlight matches

## License

Fair
