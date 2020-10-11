/**
 * Arche v0.0.1
 * https://github.com/richytong/arche
 * (c) 2019-2020 Richard Tong
 * rubico may be freely distributed under the MIT license.
 */

const isArray = Array.isArray

/**
 * @name elementSetAttribute
 *
 * @synopsis
 * ```coffeescript [specscript]
 * Element = Object
 *
 * var element Element,
 *   key string,
 *   value string|number|Object,
 *
 * elementSetAttribute(element, key, value) -> element
 * ```
 */
const elementSetAttribute = function (element, key, value) {
  if (value == null) {
    return element
  }
  if (value.constructor == Object) { // style
    for (const subKey in value) {
      element[key][subKey] = value[subKey]
    }
  } else {
    element.setAttribute(key, value)
  }
  return element
}

/**
 * @name creatorCreateElement
 *
 * @synopsis
 * ```coffeescript [specscript]
 * Element = Object
 *
 * var type string|function,
 *   props Object,
 *   children string|Object|Array<string|Object>,
 *   element Element,
 *   creator { createElement: (type, props?, children?)=>element },
 *
 * creatorCreateElement(creator, type, props, children) -> element
 * ```
 */
const creatorCreateElement = function (creator, type, props, children) {
  if (creator.createElement.length == 1) {
    const element = creator.createElement(type) // document.createElement
    for (const key in props) {
      elementSetAttribute(element, key, props[key])
    }
    const childrenLength = children.length
    let childrenIndex = -1
    while (++childrenIndex < childrenLength) {
      const child = children[childrenIndex]
      if (typeof child == 'string') {
        element.appendChild(creator.createTextNode(child))
      } else {
        element.appendChild(child)
      }
    }
    return element
  }
  return creator.createElement(type, props, ...children) // React.createElement
}

/**
 * @name Arche
 *
 * @synopsis
 * ```coffeescript [specscript]
 * Element = Object
 *
 * var type string|function,
 *   props Object,
 *   children string|Object|Array<string|Object>,
 *   element Element,
 *   creator { createElement: (type, props?, children?)=>element },
 *   rootElement type=>((props, children?)|children)=>element {
 *     Script: ((props, children?)|children)=>element,
 *     Html: ((props, children?)|children)=>element,
 *     Body: (props, children?)|children)=>element,
 *     Section: (props, children?)|children)=>element,
 *     Article: (props, children?)|children)=>element,
 *     Span: (props, children?)|children)=>element,
 *     Div: (props, children?)|children)=>element,
 *     Img: (props, children?)|children)=>element,
 *     H1: (props, children?)|children)=>element,
 *     H2: (props, children?)|children)=>element,
 *     H3: (props, children?)|children)=>element,
 *     H4: (props, children?)|children)=>element,
 *     H5: (props, children?)|children)=>element,
 *     H6: (props, children?)|children)=>element,
 *
 *     A: (props, children?)|children)=>element,
 *     P: (props, children?)|children)=>element,
 *     B: (props, children?)|children)=>element,
 *     Q: (props, children?)|children)=>element,
 *     I: (props, children?)|children)=>element,
 *     Ul: (props, children?)|children)=>element,
 *     Ol: (props, children?)|children)=>element,
 *     Li: (props, children?)|children)=>element,
 *     Textarea: (props, children?)|children)=>element,
 *     Button: (props, children?)|children)=>element,
 *     Iframe: (props, children?)|children)=>element,
 *     Blockquote: (props, children?)|children)=>element,
 *     Br: (props, children?)|children)=>element,
 *     Code: (props, children?)|children)=>element,
 *     Pre: (props, children?)|children)=>element,
 *   }
 *
 * Arche(creator) -> rootElement
 * ```
 *
 * @description
 * > Arche (/ˈɑːrki/; Ancient Greek: ἀρχή) is a Greek word with primary senses "beginning", "origin" or "source of action" (ἐξ' ἀρχῆς: from the beginning, οr ἐξ' ἀρχῆς λόγος: the original argument), and later "first principle" or "element". ([wikipedia](https://en.wikipedia.org/wiki/Arche))
 *
 * HTML as JavaScript.
 *
 * ```javascript [playground]
 * const ReactElement = Arche(React)
 * // supply the React library
 *
 * const { Div, H1, P } = ReactElement
 * // some common building blocks are provided on ReactElement
 * // as property functions.
 *
 * const myElement = Div([
 *   H1('I am a heading'),
 *   P('heyo'),
 *   P('lorem ipsum'),
 * ])
 *
 * console.log(myElement)
 * // {
 * //   $$typeof: Symbol(react.element),
 * //   type: 'div',
 * //   props: {
 * //     children: [
 * //       { $$typeof: Symbol(react.element), type: 'h1', props: { children: 'I am a heading' } },
 * //       { $$typeof: Symbol(react.element), type: 'p', props: { children: 'heyo' } },
 * //       { $$typeof: Symbol(react.element), type: 'p', props: { children: 'heyo' } },
 * //     ],
 * //   },
 * // }
 * ```
 *
 * Create dynamic components with props:
 * ```javascript [playground]
 * const ReactElement = Arche(React)
 * const { Div, P, Button } = ReactElement
 *
 * const UserCard = ReactElement(({
 *   firstName, lastName, age,
 * }) => Div([
 *   H1(`${firstName} ${lastName}`),
 *   P({ style: { color: 'lightgrey' } }, [age]),
 * ]))
 * ```
 *
 * Complete interop with React hooks (converted from [this example](https://reactjs.org/docs/hooks-intro.html)):
 * ```javascript [playground]
 * const ReactElement = Arche(React)
 * const { Div, P, Button } = ReactElement
 * const { useState } = React
 *
 * const Example = ReactElement(() => {
 *   const [count, setCount] = useState(0)
 *
 *   return Div([
 *     P(`You clicked ${count} times`),
 *     Button({
 *       onClick() {
 *         setCount(count + 1)
 *       },
 *     }, 'Click me'),
 *   ])
 * })
 * ```
 */

const Arche = function (creator) {
  const rootElement = type => function creatingElement(arg0, arg1) {
    if (isArray(arg0)) {
      return creatorCreateElement(creator, type, {}, arg0)
    }
    if (typeof arg0 == 'string') {
      return creatorCreateElement(creator, type, {}, [arg0])
    }
    if (isArray(arg1)) {
      return creatorCreateElement(creator, type, arg0, arg1)
    }
    return creatorCreateElement(creator, type, arg0, [arg1])
  }

  rootElement.Script = rootElement('script')
  rootElement.Html = rootElement('html')
  rootElement.Body = rootElement('body')
  rootElement.Section = rootElement('section')
  rootElement.Article = rootElement('article')
  rootElement.Span = rootElement('span')
  rootElement.Div = rootElement('div')
  rootElement.Img = rootElement('img')
  rootElement.H1 = rootElement('h1')
  rootElement.H2 = rootElement('h2')
  rootElement.H3 = rootElement('h3')
  rootElement.H4 = rootElement('h4')
  rootElement.H5 = rootElement('h5')
  rootElement.H6 = rootElement('h6')

  rootElement.A = rootElement('a')
  rootElement.P = rootElement('p')
  rootElement.B = rootElement('b')
  rootElement.Q = rootElement('q')
  rootElement.I = rootElement('i')
  rootElement.Ul = rootElement('ul')
  rootElement.Ol = rootElement('ol')
  rootElement.Li = rootElement('li')
  rootElement.Textarea = rootElement('textarea')
  rootElement.Button = rootElement('button')
  rootElement.Iframe = rootElement('iframe')
  rootElement.Blockquote = rootElement('blockquote')
  rootElement.Br = rootElement('br')
  rootElement.Code = rootElement('code')
  rootElement.Pre = rootElement('pre')

  return rootElement
}

export default Arche
