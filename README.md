# Text Node Searcher

Search for text in a web page

## API

### Contructor

* `new TextNodeSeacher(Object options)`

	Create a searcher for text nodes

#### Options

* `container`: `Element` (default: `document.body`)

	Search for nodes within the given container

* `highlightTagName`: `String` (default: `"highlight"`)

	Use the given tag name for highlight elements

### Methods

* `setQuery(String query)`

	Set the search query

* `selectNext()`

	Select the next text segment matching the query

* `selectPrevious()`

	Select the previous text segment matching the query

* `highlight()`

	Highlight matching search results

* `unhighlight()`

	Remove any highlighting of search results

### Properties

* `Element container`

	The container within which text will be searched

* `RegExp query`

	The current query. Use setQuery unless you actually want to specify a
	regular expression.

## TODO

- Match text that spans multiple text nodes

## License

Fair
