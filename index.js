/**
 * Arche may be freely distributed under the CFOSS license.
 */

(function (root, Arche) {
  if (typeof module == 'object') (module.exports = Arche) // CommonJS
  else if (typeof define == 'function') define(() => Arche) // AMD
  else (root.Arche = Arche) // Browser
}(typeof globalThis == 'object' ? globalThis : this, (function () { 'use strict'

const isArray = Array.isArray

/**
 * @name elementSetAttribute
 *
 * @synopsis
 * ```coffeescript [specscript]
 * elementSetAttribute(
 *   element Element,
 *   key string,
 *   value string|number|object
 * ) -> element
 * ```
 */
const elementSetAttribute = function (element, key, value) {
  if (value == null) { // boolean
    element.setAttribute(key, value)
  }
  else if (typeof value == 'boolean') {
    if (value) {
      element.setAttribute(key, key)
    } else {
      element.removeAttribute(key)
    }
  }
  else if (value.constructor == Object) { // style
    for (const subKey in value) {
      element[key][subKey] = value[subKey]
    }
  }
  else if (typeof value == 'function') { // onClick
    const eventType = key.toLowerCase().replace(/^on/, '')
    element.addEventListener(eventType, value)
  }
  else {
    element.setAttribute(key, value)
  }
  return element
}

/**
 * @name memoizeCappedWithResolver
 *
 * @synopsis
 * ```coffeescript [specscript]
 * memoizeCappedWithResolver(
 *   func function,
 *   cap number,
 *   resolver function,
 * ) -> memoized function
 * ```
 *
 * @description
 * Memoize a function with a resolver. Clear cache when size reaches cap.
 */

const memoizeCappedWithResolver = function (func, cap, resolver) {
  const cache = new Map()
  const memoized = function (...args) {
    if (cache.size > cap) {
      cache.clear()
    }
    const key = resolver(...args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func(...args)
    cache.set(key, result)
    return result
  }
  memoized.cache = cache
  return memoized
}

/**
 * @name creatorCreateElement
 *
 * @synopsis
 * ```coffeescript [specscript]
 * creator {
 *   createElement: (
 *     elementType string,
 *     props? object,
 *     children? Array<creator.Element>
 *   )=>(creatorElement creator.Element)
 * }
 *
 * creatorCreateElement(
 *   creator,
 *   elementType string|function,
 *   propsOrTextOrChildren object|string|Array,
 *   textOrChildren string|Array,
 * ) -> creatorElement creator.Element
 * ```
 */
function creatorCreateElement(
  creator,
  elementType,
  propsOrTextOrChildren,
  textOrChildren
) {
  if (creator.createElement.length == 1) {
    const element = creator.createElement(elementType) // document.createElement
    for (const key in propsOrTextOrChildren) {
      elementSetAttribute(element, key, propsOrTextOrChildren[key])
    }
    const childrenLength = textOrChildren.length
    let childrenIndex = -1
    while (++childrenIndex < childrenLength) {
      const child = textOrChildren[childrenIndex]
      if (typeof child == 'string') {
        element.appendChild(creator.createTextNode(child))
      } else {
        element.appendChild(child)
      }
    }
    return element
  }

  return creator.createElement(
    elementType,
    propsOrTextOrChildren,
    ...textOrChildren
  )
}

/**
 * @name CreatorElement
 *
 * @synopsis
 * ```coffeescript [specscript]
 * CreatorElement(
 *   creator {
 *     createElement: (
 *       elementType string,
 *       props? object,
 *       children? Array<creator.Element>
 *     )=>(creatorElement creator.Element)
 *   },
 *   elementType string,
 *   propsOrTextOrChildren object|string|Array,
 *   textOrChildren string|Array,
 * ) -> creatorElement creator.Element
 * ```
 */
function CreatorElement(
  creator,
  elementType,
  propsOrTextOrChildren,
  textOrChildren
) {
  if (isArray(propsOrTextOrChildren)) {
    return creatorCreateElement(
      creator,
      elementType,
      {},
      propsOrTextOrChildren
    )
  }

  if (typeof propsOrTextOrChildren == 'string') {
    return creatorCreateElement(
      creator,
      elementType,
      {},
      [propsOrTextOrChildren]
    )
  }

  if (isArray(textOrChildren)) {
    return creatorCreateElement(
      creator,
      elementType,
      propsOrTextOrChildren,
      textOrChildren
    )
  }

  if (textOrChildren == null) {
    return creatorCreateElement(
      creator,
      elementType,
      propsOrTextOrChildren,
      []
    )
  }

  return creatorCreateElement(
    creator,
    elementType,
    propsOrTextOrChildren,
    [textOrChildren]
  )
}


/**
 * @name __CreatorElement
 *
 * @synopsis
 * ```coffeescript [specscript]
 * creator {
 *   createElement: (
 *     elementType string,
 *     props? object,
 *     children? Array<creator.Element>
 *   )=>(creatorElement creator.Element)
 * }
 *
 * __CreatorElement(creator elementType string) -> _Element
 *
 * _Element(
 *   propsOrTextOrChildren object|string|Array,
 *   textOrChildren string|Array,
 * ) -> creatorElement creator.Element
 * ```
 */
function __CreatorElement(creator, elementType) {
  return function _CreatorElement(propsOrTextOrChildren, textOrChildren) {
    return CreatorElement(
      creator,
      elementType,
      propsOrTextOrChildren,
      textOrChildren
    )
  }
}

/**
 * @name _CreatorElement
 *
 * @synopsis
 * ```coffeescript [specscript]
 * args Array
 *
 * creator {
 *   createElement: (
 *     elementType string,
 *     props? object,
 *     children? Array<creator.Element>
 *   )=>(creatorElement creator.Element)
 * }
 *
 * _CreatorElement(creator) -> _Element
 * _Element(...args) -> creatorElement creator.Element
 * ```
 */
function _CreatorElement(creator) {
  return function _Element(...args) {
    if (args.length == 1) {
      return __CreatorElement(creator, args[0])
    }
    return CreatorElement(creator, ...args)
  }
}

/**
 * @name $__StyledCreatorElement
 *
 * @synopsis
 * ```coffeescript [specscript]
 * creator {
 *   createElement: (
 *     elementType string,
 *     props? object,
 *     children? Array<creator.Element>
 *   )=>(creatorElement creator.Element)
 * }
 *
 * $__StyledCreatorElement(
 *   creator,
 *   options {
 *     styled Styled,
 *     styledMemoizationCap number,
 *   }
 * ) -> _StyledCreatorElement
 *
 * _StyledCreatorElement(elementType string) -> _StyledElement
 *
 * _StyledElement(
 *   propsOrTextOrChildren object|string|Array,
 *   textOrChildren string|Array,
 * ) -> creatorElement creator.Element
 * ```
 */
function $__StyledCreatorElement(creator, options) {
  const { styled, styledMemoizationCap } = options
  return function _StyledCreatorElement(elementType) {
    const styledComponent = memoizeCappedWithResolver(
      styled[elementType],
      styledMemoizationCap,
      array => array[0],
    )

    return function _StyledElement(propsOrTextOrChildren, textOrChildren) {
      if (isArray(propsOrTextOrChildren)) {
        return creatorCreateElement(
          creator,
          elementType,
          {},
          propsOrTextOrChildren
        )
      }

      if (typeof propsOrTextOrChildren == 'string') {
        return creatorCreateElement(
          creator,
          elementType,
          {},
          [propsOrTextOrChildren]
        )
      }

      if (isArray(textOrChildren)) {
        if (propsOrTextOrChildren == null || propsOrTextOrChildren.css == null) {
          return creatorCreateElement(
            creator,
            elementType,
            propsOrTextOrChildren,
            textOrChildren
          )
        }
        const { css, ...props } = propsOrTextOrChildren
        return creatorCreateElement(
          creator,
          styledComponent([css]),
          props,
          textOrChildren
        )
      }

      if (textOrChildren == null) {
        if (propsOrTextOrChildren == null || propsOrTextOrChildren.css == null) {
          return creatorCreateElement(
            creator,
            elementType,
            propsOrTextOrChildren,
            []
          )
        }
        const { css, ...props } = propsOrTextOrChildren
        return creatorCreateElement(creator, styledComponent([css]), props, [])
      }

      if (propsOrTextOrChildren == null || propsOrTextOrChildren.css == null) {
        return creatorCreateElement(
          creator,
          elementType,
          propsOrTextOrChildren,
          [textOrChildren]
        )
      }

      const { css, ...props } = propsOrTextOrChildren
      return creatorCreateElement(
        creator,
        styledComponent([css]),
        props,
        [textOrChildren]
      )
    }
  }
}

/**
 * @name __assignElementNames
 *
 * @synopsis
 * ```coffeescript [specscript]
 * creator {
 *   createElement: (
 *     elementType string,
 *     props? object,
 *     children? Array<creator.Element>
 *   )=>(creatorElement creator.Element)
 * }
 *
 * __assignElementNames(CreatorElement creator.Element) -> ()
 * ```
 */
function __assignElementNames(CreatorElement) {
  CreatorElement.A = CreatorElement('a')
  CreatorElement.P = CreatorElement('p')
  CreatorElement.B = CreatorElement('b')
  CreatorElement.Q = CreatorElement('q')
  CreatorElement.I = CreatorElement('i')
  CreatorElement.S = CreatorElement('s')
  CreatorElement.U = CreatorElement('u')
  CreatorElement.Ul = CreatorElement('ul')
  CreatorElement.Ol = CreatorElement('ol')
  CreatorElement.Li = CreatorElement('li')

  CreatorElement.H1 = CreatorElement('h1')
  CreatorElement.H2 = CreatorElement('h2')
  CreatorElement.H3 = CreatorElement('h3')
  CreatorElement.H4 = CreatorElement('h4')
  CreatorElement.H5 = CreatorElement('h5')
  CreatorElement.H6 = CreatorElement('h6')
  CreatorElement.Hr = CreatorElement('hr')
  CreatorElement.Br = CreatorElement('br')

  CreatorElement.Script = CreatorElement('script')
  CreatorElement.Style = CreatorElement('style')

  CreatorElement.Html = CreatorElement('html')
  CreatorElement.Main = CreatorElement('main')
  CreatorElement.Body = CreatorElement('body')
  CreatorElement.Header = CreatorElement('header')
  CreatorElement.Nav = CreatorElement('nav')
  CreatorElement.Section = CreatorElement('section')
  CreatorElement.Article = CreatorElement('article')
  CreatorElement.Footer = CreatorElement('footer')
  CreatorElement.Span = CreatorElement('span')
  CreatorElement.Div = CreatorElement('div')
  CreatorElement.Img = CreatorElement('img')
  CreatorElement.Video = CreatorElement('video')
  CreatorElement.Picture = CreatorElement('picture')
  CreatorElement.Source = CreatorElement('source')

  CreatorElement.Form = CreatorElement('form')
  CreatorElement.Fieldset = CreatorElement('fieldset')
  CreatorElement.Input = CreatorElement('input')
  CreatorElement.Label = CreatorElement('label')
  CreatorElement.Textarea = CreatorElement('textarea')
  CreatorElement.Select = CreatorElement('select')
  CreatorElement.Option = CreatorElement('option')

  CreatorElement.Button = CreatorElement('button')
  CreatorElement.Iframe = CreatorElement('iframe')
  CreatorElement.Blockquote = CreatorElement('blockquote')
  CreatorElement.Code = CreatorElement('code')
  CreatorElement.Pre = CreatorElement('pre')

  CreatorElement.Polygon = CreatorElement('polygon')
  CreatorElement.Svg = CreatorElement('svg')
  CreatorElement.Path = CreatorElement('path')
  CreatorElement.Rect = CreatorElement('rect')
  CreatorElement.Mask = CreatorElement('mask')

  CreatorElement.Dl = CreatorElement('dl')
  CreatorElement.Dt = CreatorElement('dt')
  CreatorElement.Dd = CreatorElement('dd')

}

/**
 * @name DocumentElement
 *
 * @docs
 * ```coffeescript [specscript]
 * type DocumentElementChildren = string|Array<string|Element>
 *
 * type TypedDocumentElement =
 *   (props object, children DocumentElementChildren)=>(element Element)
 *   |(children DocumentElementChildren)=>(element Element)
 *   |(props object)=>(element Element)
 *
 * DocumentElement(elementType string) -> TypedDocumentElement
 * ```
 *
 * The `DocumentElement` constructor returned from `Arche(document)`. Constructs a `TypedDocumentElement` constructor.
 *
 * Arguments:
 *   * `elementType` - the name of the HTML element that the `TypedDocumentElement` constructor will represent.
 *
 * Return:
 *    * `TypedDocumentElement` - a DOM element constructor.
 *
 * ```javascript
 * const DocumentElement = Arche(document)
 *
 * const H1 = DocumentElement('h1') // H1 is a DOM element constructor
 * ```
 */

/**
 * @name DocumentElement.{ELEMENT_NAME}
 *
 * @docs
 * ```coffeescript [specscript]
 * type DocumentElementChildren = string|Array<string|Element>
 *
 * type TypedDocumentElement =
 *   (props object, children DocumentElementChildren)=>(element Element)
 *   |(children DocumentElementChildren)=>(element Element)
 *   |(props object)=>(element Element)
 *
 * type DocumentElement = (elementType string)=>TypedDocumentElement
 *
 * DocumentElement.{ELEMENT_NAME} -> TypedDocumentElement
 * ```
 *
 * The DocumentElement.{ELEMENT_NAME} constructor.
 *
 * Arguments:
 *   * `props` - an object of element properties. These are equivalent to [html attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes).
 *   * `children` - a string or array of strings and/or [elements](https://developer.mozilla.org/en-US/docs/Web/API/Element). Represents nesting elements in HTML.
 *
 * Return:
 *   * `element` - [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element) - a basic [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) element.
 *
 * ```javascript
 * const my{ELEMENT_NAME} = DocumentElement.{ELEMENT_NAME}({EXAMPLE_ARGUMENTS_1})
 * document.getElementById('#container').appendChild(my{ELEMENT_NAME})
 * ```
 *
 * References:
 *   * [DocumentElement](/docs/DocumentElement)
 */

/**
 * @name ReactElement
 *
 * @docs
 * ```coffeescript [specscript]
 * type React = {
 *   Element: {
 *     $$typeof: Symbol,
 *     props: Object,
 *     type: any,
 *   },
 *   createElement: (
 *     elementType string,
 *     props object,
 *     children string|Array<React.Element|string>
 *
 *   )=>(reactElement React.Element),
 * }
 *
 * type ReactElementChildren = string|Array<React.Element>
 *
 * type TypedReactElement =
 *   (props object, children ReactElementChildren)=>(reactElement React.Element)
 *   |(children ReactElementChildren)=>(reactElement React.Element)
 *   |(props object)=>(reactElement React.Element)
 *
 * type ReactElement =
 *   ReactFunctionComponent=>(reactElement React.Element)
 *   |(elementType string)=>TypedReactElement
 *
 * ReactElement(fn ReactFunctionComponent) -> reactElement React.Element
 * ReactElement(elementType string) -> TypedReactElement
 * ```
 *
 * The `ReactElement` constructor returned from `Arche(React)`. Constructs a `TypedReactElement` constructor.
 *
 * Arguments:
 *   * `elementType` - the name of the HTML element that the `TypedReactElement` constructor will represent.
 *
 * Return:
 *    * `TypedReactElement` - a React element constructor.
 *
 * ```javascript
 * const ReactElement = Arche(React)
 *
 * const H1 = ReactElement('h1') // H1 is a React element constructor
 * ```
 */

/**
 * @name ReactElement.{ELEMENT_NAME}
 *
 * @docs
 * ```coffeescript [specscript]
 * type React = {
 *   Element: {
 *     $$typeof: Symbol,
 *     props: Object,
 *     type: any,
 *   },
 *   createElement: (
 *     elementType string,
 *     props object,
 *     children string|Array<React.Element|string>
 *
 *   )=>(reactElement React.Element),
 * }
 *
 * type ReactElementChildren = string|Array<React.Element>
 *
 * type TypedReactElement =
 *   (props object, children ReactElementChildren)=>(reactElement React.Element)
 *   |(children ReactElementChildren)=>(reactElement React.Element)
 *   |(props object)=>(reactElement React.Element)
 *
 * type ReactElement =
 *   ReactFunctionComponent=>(reactElement React.Element)
 *   |(elementType string)=>TypedReactElement
 *
 * ReactElement.{ELEMENT_NAME} -> TypedReactElement
 * ```
 *
 * The ReactElement.{ELEMENT_NAME} constructor.
 *
 * Arguments:
 *   * `props` - an object of React element properties. These are equivalent to [React props](https://react.dev/learn/passing-props-to-a-component).
 *   * `children` - a string or array of strings and/or React elements. Represents nesting elements in HTML.
 *
 * Return:
 *   * `reactElement` - a basic React element, `reactElement` is recognized by React and used to render the final React application.
 *
 * ```javascript
 * const myReact{ELEMENT_NAME} = ReactElement.{ELEMENT_NAME}({EXAMPLE_ARGUMENTS_1})
 * ReactDOM.render(myReact{ELEMENT_NAME}, document.getElementById('react-root'))
 * ```
 *
 * References:
 *   * [ReactElement](/docs/ReactElement)
 */

/**
 * @name Arche
 *
 * @constructor
 *
 * @docs
 * ```coffeescript [specscript]
 * type DocumentElementChildren = string|Array<string|Element>
 *
 * type TypedDocumentElement =
 *   (props object, children DocumentElementChildren)=>(element Element)
 *   |(children DocumentElementChildren)=>(element Element)
 *   |(props object)=>(element Element)
 *
 * type DocumentElement = (elementType string)=>TypedDocumentElement
 *
 * type React = {
 *   Element: {
 *     $$typeof: Symbol,
 *     props: Object,
 *     type: any,
 *   },
 *   createElement: (
 *     elementType string,
 *     props object,
 *     children string|Array<React.Element|string>
 *   )=>(reactElement React.Element),
 * }
 *
 * type ReactElementChildren = string|Array<React.Element>
 *
 * type TypedReactElement =
 *   (props object, children ReactElementChildren)=>(reactElement React.Element)
 *   |(children ReactElementChildren)=>(reactElement React.Element)
 *   |(props object)=>(reactElement React.Element)
 *
 * type ReactFunctionComponent =
 *   ({ ...props Object, children ReactElementChildren })=>(reactElement React.Element)
 *
 * type ReactElement =
 *   ReactFunctionComponent=>(reactElement React.Element)
 *   |(elementType string)=>TypedReactElement
 *
 * type StyledComponent = ([css string])=>React.Element
 *
 * type styled = Object<[elementName string]: StyledComponent>
 *
 * Arche(document Document) -> DocumentElement
 * Arche(React) -> ReactElement
 * Arche(React, options { styled }) -> ReactElement
 * ```
 *
 * The Arche class. Simplified DOM interface / React in pure JavaScript.
 *
 * Arguments:
 *   * `document` - [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document) - represents any web page loaded in the browser.
 *   * `React` - the [React](https://react.dev/) library.
 *   * `options`
 *     * `styled` - the [styled-components](https://styled-components.com/) library.
 *
 * Return:
 *   * `DocumentElement` - a simplified interface for the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
 *   * `ReactElement` - a pure JavaScript interface for React.
 *
 * ```javascript [playground]
 * {
 *   const DocumentElement = Arche(document)
 *   const H1 = DocumentElement('h1')
 *   const myH1Element = H1('DOM Title')
 *   document.getElementById('dom-container').appendChild(myH1Element)
 * }
 *
 * {
 *   const ReactElement = Arche(React)
 *   const H1 = ReactElement('h1')
 *   const myH1ReactElement = H1('React Title')
 *   ReactDOM.render(myH1ReactElement, document.getElementById('react-root'))
 * }
 * ```
 *
 */

const Arche = function (creator, options = {}) {
  if (creator == null) {
    throw new TypeError('creator not defined')
  }

  const {
    styled,
    styledMemoizationCap = 1000,
  } = options

  const OriginalCreatorElement = _CreatorElement(creator)

  const StyledCreatorElement = $__StyledCreatorElement(creator, {
    styled,
    styledMemoizationCap,
  })

  const CreatorElement = (
    styled == null
    ? OriginalCreatorElement
    : type => typeof type == 'string'
      ? StyledCreatorElement(type)
      : OriginalCreatorElement(type)
  )

  CreatorElement.creator = creator
  __assignElementNames(CreatorElement)

  return CreatorElement
}

return Arche
}())))
