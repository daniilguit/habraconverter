habraconverter = (function () {
  function convert(content) {
    var result = [];
    var state = {styles:{}};
    convertElement(content, state, result);
    for (var style in state.styles) {
      if (state.styles[style]) {
        result.push(STYLES[style].close);
      }
    }
    return result.join('');
  }

  var STYLES = {
    italic:{open:'<em>', close:'</em>'},
    bold:{open:'<b>', close:'</b>'},
    underlined:{open:'<u>', close:'</u>'},
    strikeout:{open:'<s>', close:'</s>'},
    sup:{open:'<sup>', close:'</sup>'},
    sub:{open:'<sub>', close:'</sub>'},
    monospace:{open:'<source>\n', close:'</source>'}
  };

  function convertElement(element, state, result) {
    var tagName = element.tagName;
    if (!/H\d/.test(tagName)) {
      var sourceElement = tagName ? element : element.parentNode;
      var myStyles = getBasicStyles(sourceElement);
      for (var style in state.styles) {
        if (state.styles[style] && !myStyles[style]) {
          result.push(STYLES[style].close);
        } else if (!state.styles[style] && myStyles[style]) {
          result.push(STYLES[style].open);
        }
      }
      state.styles = myStyles;
    }
    if (/^((H\d)|LI|UL|OL|TABLE|TR|TD)$/.test(tagName)) {
      simpleWrapChildren(tagName.toLowerCase(), element, state, result);
    } else if ('IMG' == tagName) {
      result.push('<img src="' + element.src + '">');
    } else if ('A' == tagName) {
      wrapChildren('<a href="' + element.href + '">', '</a>', element, state, result);
    } else if (null == tagName) {
      result.push(convertText(element.nodeValue));
    } else if ('BR' == tagName) {
      result.push('\n');
    } else if ('HR' == tagName) {
      result.push('<hr/>\n')
    } else {
      convertElements(element.childNodes, state, result);
      if ('block' == getComputedStyles(element).display) {
        result.push('\n');
      }
    }
  }

  function convertText(text) {
    return text
      .replace(/“|”/g, '"')

  }

var NEW_LINE_AFTER_CLOSE_TAG = {table:true, ul:true, ol:true, h1:true, h2:true, h3:true, h4:true, h5:true, h6:true};
var NEW_LINE_AFTER_OPEN_TAG = {table:true, ul:true, ol:true};

  function simpleWrapChildren(withTag, element, state, result) {
    wrapChildren(
      '<' + withTag + '>'  + (NEW_LINE_AFTER_OPEN_TAG[withTag] ? '\n':''), 
      '</' + withTag + '>' + (NEW_LINE_AFTER_CLOSE_TAG[withTag] ? '\n':''), 
      element, state, result
      );
  }

  function wrapChildren(start, end, element, state, result) {
    result.push(start);
    convertElements(element.childNodes, state, result);
    result.push(end);
  }

  function getComputedStyles(element) {
    return element.currentStyle || document.defaultView.getComputedStyle(element, null)
  }

  function getBasicStyles(element) {
    var style = getComputedStyles(element);
    return {
      italic:/italic/.test(style.fontStyle),
      bold:/bold/.test(style.fontWeight),
      underlined:/underline/.test(style.textDecoration),
      strikeout:/line-through/.test(style.textDecoration),
      sup:/super/.test(style.verticalAlign),
      sub:/sub/.test(style.verticalAlign),
      monospace:/Courier/.test(style.fontFamily)
    }
  }

  function convertElements(elements, state, result) {
    for (var i = 0; i < elements.length; i++) {
      convertElement(elements[i], state, result);
    }
  }

  return {
    convert:convert
  }
})();

