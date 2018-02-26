# inline-sources

A Node module you can use to combine your HTML, CSS, and JavaScript code into one file, reducing the number of network requests a client has to make and therefore possibly speeding up the page loading process.

## Getting started

### Prerequsites

* Node ^7.8 (for await/async support)

### Installation

NPM:
```
npm i -S inline-sources
```

Yarn:
```
yarn add inline-sources
```

## Usage
```
require('inline-sources')('entryFile.html', 'outputFile.html');
```

The entry file can also be a CSS file, although bundling CSS is already available in CSS preprocessors.

## How it works

The script opens the entry file and looks for any "link"/"script" tags and puts the code directly in the HTML using the "style"/"script" tags respectively. If the linked CSS files have "@import" statements within them, they will be resolved recursively so that the output file is a complete HTML/CSS/JS bundle that does not necessitate further requests to obtain stylesheets and scripts.

Sources starting with 'http(s)://' are obtained using GET requests. Other sources are obtained using the Node's file system framework.

## Example

### entry.html
```
<html>
<head>
  <link rel="stylesheet" href="first.css">
</head>
<body>
  <p>Some content...</p>
  <script src="script.js"></script>
</body>
</html>
```

### first.css
```
@import url(second.css);

body {
  background-color: green;
}
```

### second.css
```
p {
  color: blue;
}
```

### script.js
```
document.getElementsByTagName('p')[0].innerHTML = 'Surprise!';
```

### output.html
```
<html>
<head>
  <style>
p {
  color: blue;
}

body {
  background-color: green;
}
</style>
</head>
<body>
  <p>Some content...</p>
  <script>
document.getElementsByTagName('p')[0].innerHTML = 'Surprise!';
</script>
</body>
</html>
