/**
 * Arche may be freely distributed under the CFOSS license.
 */
(function (root, Arche) {
  if (typeof module == 'object') (module.exports = Arche) // CommonJS
  else if (typeof define == 'function') define(() => Arche) // AMD
  else (root.Arche = Arche) // Browser
}(typeof globalThis == 'object' ? globalThis : this, (function () {
const isArray = Array.isArray

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

function _CreatorElement(creator) {
  return function _Element(...args) {
    if (args.length == 1) {
      return __CreatorElement(creator, args[0])
    }
    return CreatorElement(creator, ...args)
  }
}

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