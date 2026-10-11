# Arche
![arche-logo](https://raw.githubusercontent.com/a-synchronous/assets/master/arche-logo-226x226.png)
> Arche (/ˈɑːrki/; Ancient Greek: ἀρχή) is a Greek word with primary senses "beginning", "origin" or "source of action" (ἐξ' ἀρχῆς: from the beginning, οr ἐξ' ἀρχῆς λόγος: the original argument), and later "first principle" or "element".

Source code: [GitHub](https://github.com/richytong/Arche) |
License: [CFOSS](https://cloutsworld.com/en-us/legal/license/cfoss)

![Node.js CI](https://github.com/richytong/arche/actions/workflows/nodejs.yml/badge.svg)
[![codecov](https://codecov.io/gh/richytong/arche/branch/master/graph/badge.svg)](https://codecov.io/gh/richytong/arche)
[![npm version](https://img.shields.io/npm/v/arche.svg?style=flat)](https://www.npmjs.com/package/arche)

## Vanilla Microfrontends

A web page is a render of an HTML document.

An HTML document loads JavaScript scripts and CSS stylesheets.

JavaScript scripts can load JavaScript scripts.

Principles:
  * Front end development for the web should be done in HTML, CSS, and JavaScript.

## Getting Started

Vanilla microfrontends starts with an HTML document. Whenever a browser navigates to a web page, the first file it downloads and reads is the HTML document of the web page.

Here's a project structure you can use. The `public` directory will have all of the files that will be public to the world wide web.

```
public/
    index.html
    styles.css
    index.js
```

The HTML document of a web page loads JavaScript scripts and CSS stylesheets. JavaScript scripts are defined with `<script></script>` tags, and CSS stylesheets with `<link>` tags. Add this to `index.html`.

The HTML document is read line by line, from top to bottom.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Vanilla Microfrontends.</title>

  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <h1>Welcome to Vanilla Microfrontends.</h1>
  <p>This HTML document is the first file a browser downloads and reads when it navigates to this web page.</p>

  <script src="https://cdn.jsdelivr.net/npm/arche"></script>
  <script src="/index.js"></script>
</body>
</html>
```

CSS stylesheets are downloaded and read right after the HTML document. Add this to `styles.css`.

```css
body {
  color: #FFF;
  background-color: #7FB665;
}

h1 {
  font-size: 32px;
}

p {
  font-size: 14px;
}
```

JavaScript scripts are run from where they are defined in the HTML. Add this to `index.js`.

```javascript
console.log("Welcome to Vanilla Microfrontends.")

const DocumentElement = Arche(document)
const { P } = DocumentElement

const p = P("This element was added from index.js.")

document.body.appendChild(p)
```

Now all you have to do to see the website you just created is serve the `public` folder. I recommend installing the `static-web-server` command line tool from [Static Web Server](https://static-web-server.net/).

Install `static-web-server` with the following command:
```sh
curl --proto '=https' --tlsv1.2 -sSfL https://get.static-web-server.net | sh
```

Now you can serve the `public` folder. Serve the `public` folder with the following command:
```sh
static-web-server --port=8080 --root=./public
```

Finally, navigate to `http://localhost:8080/`.

## Getting Started with React
[React](https://react.dev/) is a library and paradigm for creating web and native user interfaces in JavaScript. If you are still new to React, please watch this [video](https://www.instagram.com/p/DeVlsXRuVzU/).

Here is a project structure you can use for a website made with React.
```
public/
    index.html
    styles.css
    index.js
```

Add this to the index.html file.
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Vanilla Microfrontends with React.</title>

  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <div id="react-root"></div>

  <script src="https://cdn.jsdelivr.net/npm/arche"></script>
  <script src="https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js" crossorigin></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js" crossorigin></script>
  <script src="/index.js"></script>
</body>
</html>
```

Add this to `styles.css`.

```css
body {
  color: #FFF;
  background-color: #7FB665;
}

h1 {
  font-size: 32px;
}

p {
  font-size: 14px;
}

#click-example {
  margin-top: 20px;
}
```

Add this to `index.js`.

```javascript
const ReactElement = Arche(React)
const { Div, H1, P, Button } = ReactElement
const { useState } = React

const ClickExample = ReactElement(() => {
  const [count, setCount] = useState(0)

  return Div({ id: 'click-example' }, [
    P(`You clicked ${count} times`),
    Button({
      onClick() {
        setCount(count + 1)
      },
    }, 'Click me'),
  ])
})

const Root = ReactElement(() => {
  return [
    H1('Welcome to Vanilla Microfrontends with React.'),
    P('All of the content on this page was added with React.'),
    ClickExample(),
  ]
})

ReactDOM.render(Root(), document.getElementById('react-root'))
```

Serve the `public` folder.

```sh
static-web-server --port=8080 --root=./public
```

Navigate to `http://localhost:8080/`.

## React Tips

### Global
Set `ReactElement` globally for a better developer experience.

```javascript
// global.js
const ReactElement = Arche(React)

window.ReactElement = ReactElement

for (const elementName in ReactElement) {
  window[elementName] = ReactElement[elementName]
}

// set missing elements
window.Aside = ReactElement('aside')
window.Svg = ReactElement('svg')
window.Path = ReactElement('path')
```

### Using React Context
To use React Context with Arche, wrap `YourContext.Provider` with `ReactElement` and supply `value` as a prop, specifying children in the next argument.

JSX example:
```javascript
function ArticleWrapper () {
  const [theme, setTheme] = React.useState(themes[0])

  return (
    <ThemeContext.Provider value={{
      theme,
      changeTheme: setTheme
    }}>
      <ThemeSwitcher />
      <Article />
    </ThemeContext.Provider>
  )
}
```

Translates to the following with Arche:
```javascript
const ArticleWrapper = ReactElement(() => {
  const [theme, setTheme] = React.useState(themes[0])

  return ReactElement(ThemeContext.Provider)({
    value: { theme, changeTheme: setTheme },
  }, [ThemeSwitcher(), Article()])
})
```

### Using React Fragments
To use React fragments (`<>`), just return an array.

```javascript [playground]
const ReactElement = Arche(React)
const { Div, H1, Img } = ReactElement

const Placeholders = ReactElement(() => [
  Img({ src: 'https://placehold.co/300x150', alt: 'placeholder' }),
  Img({ src: 'https://placehold.co/300x150', alt: 'placeholder' }),
])

const Root = ReactElement(() => [
  H1('Fragment Example'),
  Placeholders(),
])

ReactDOM.render(Root(), document.getElementById('react-root'))
```

### Using styled
To install Styled Components, add the following script to the `<head></head>` tag of the HTML document of your web page.
```
<script src="https://cdn.jsdelivr.net/npm/styled-components@6.1.19/dist/styled-components.min.js"></script>
```

Arche accepts a `styled` option from css-in-js libraries like [Styled Components](https://styled-components.com/) to enable a `css` prop on `ReactElement` and `TypedReactElement`.

```javascript
const ReactElement = Arche(React, { styled })
```

Elements can now specify a `css` prop to use css-in-js.

```javascript [playground]
const ReactElement = Arche(React, { styled })
const { Div, H1, P } = ReactElement

const MyComponent = ReactElement(() => {
  return Div({
    css: `
      height: 500px;
      width: 100%;
      background-color: pink;
    `,
  }, [
    H1('Styled Example'),
    P('Text'),
  ])
})

ReactDOM.render(MyComponent(), document.getElementById('react-root'))
```

# Contributing
Your feedback and contributions are welcome. If you have a suggestion, please raise an issue. Prior to that, please search through the issues first in case your suggestion has been made already. If you decide to work on an issue, please create a pull request.

Pull requests should provide some basic context and link the relevant issue. If you are interested in contributing, the [help wanted](https://github.com/richytong/arche/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) tag is a good place to start.

For more information please see [CONTRIBUTING.md](https://github.com/richytong/arche/blob/master/CONTRIBUTING.md)

# License
Arche is distributed under the [CFOSS License](https://cloutsworld.com/en-us/legal/license/cfoss).

# Support
 * minimum Node.js version: 14
 * minimum Chrome version: 63
 * minimum Firefox version: 57
 * minimum Edge version: 79
 * minimum Safari version: 11.1
