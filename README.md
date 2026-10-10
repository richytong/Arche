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

```javascript [playground]
{
  const DocumentElement = Arche(document)
  const { Div, H1, P } = DocumentElement

  const myElement = Div({ id: 'my-element' }, [
    H1('DOM Example'),
    P('paragraph'),
    P('lorem ipsum'),
  ])

  document.getElementById('dom-container').appendChild(myElement)
}

{
  const ReactElement = Arche(React)
  const { Div, H1, P, Button, Img } = ReactElement

  const UserCard = ReactElement(({
    firstName, lastName, age,
  }) => Div([
    H1(`${firstName} ${lastName}`),
    Img({ src: 'https://placehold.co/300x300', alt: 'placeholder' }),
    P({ style: { color: 'lightgrey' } }, `age: ${age}`),
  ]))

  ReactDOM.render(
    UserCard({ firstName: 'React', lastName: 'ExampleUser', age: 32 }),
    document.getElementById('react-root')
  )
}
```

## Installation
with `npm`

```bash
npm i arche
```

with browser script, sets `window.Arche`

```html
<script src="https://cdn.jsdelivr.net/npm/arche"></script>
```

with [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
```javascript
import Arche from 'https://cdn.jsdelivr.net/npm/arche/es.js'
```

Set `DocumentElement` globally for a better developer experience.

```javascript
// global.js
const DocumentElement = Arche()

window.DocumentElement = DocumentElement

for (const elementName in DocumentElement) {
  window[elementName] = DocumentElement[elementName]
}

// set missing elements
window.Aside = DocumentElement('aside')
window.Svg = DocumentElement('svg')
window.Path = DocumentElement('path')
```

## Using React
To use Arche with [React](https://react.dev/), simply provide the React library.

```javascript
const ReactElement = Arche(React)
```

Create dynamic components with props.

```javascript [playground]
const ReactElement = Arche(React)

const { Div, H1, P, Button, Img } = ReactElement

const UserCard = ReactElement(({
  firstName, lastName, age,
}) => Div([
  H1(`${firstName} ${lastName}`),
  Img({ src: 'https://placehold.co/300x300', alt: 'placeholder' }),
  P({ style: { color: 'lightgrey' } }, `age: ${age}`),
]))

ReactDOM.render(
  UserCard({ firstName: 'Example', lastName: 'Name', age: 32 }),
  document.getElementById('react-root')
)
```

Complete interoperability with React hooks (converted from [this example](https://reactjs.org/docs/hooks-intro.html)).

```javascript [playground]
const ReactElement = Arche(React)
const { Div, P, Button } = ReactElement
const { useState } = React

const Example = ReactElement(() => {
  const [count, setCount] = useState(0)

  return Div([
    P(`You clicked ${count} times`),
    Button({
      onClick() {
        setCount(count + 1)
      },
    }, 'Click me'),
  ])
})

ReactDOM.render(Example(), document.getElementById('react-root'))
```

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

## Using React Context
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

## Using React Fragments
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

## Using styled
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
