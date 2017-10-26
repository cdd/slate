(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SlateHyperscript = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Has own property.
 *
 * @type {Function}
 */

var has = Object.prototype.hasOwnProperty

/**
 * To string.
 *
 * @type {Function}
 */

var toString = Object.prototype.toString

/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty(val) {
  // Null and Undefined...
  if (val == null) return true

  // Booleans...
  if ('boolean' == typeof val) return false

  // Numbers...
  if ('number' == typeof val) return val === 0

  // Strings...
  if ('string' == typeof val) return val.length === 0

  // Functions...
  if ('function' == typeof val) return val.length === 0

  // Arrays...
  if (Array.isArray(val)) return val.length === 0

  // Errors...
  if (val instanceof Error) return val.message === ''

  // Objects...
  if (val.toString == toString) {
    switch (val.toString()) {

      // Maps, Sets, Files and Errors...
      case '[object File]':
      case '[object Map]':
      case '[object Set]': {
        return val.size === 0
      }

      // Plain objects...
      case '[object Object]': {
        for (var key in val) {
          if (has.call(val, key)) return false
        }

        return true
      }
    }
  }

  // Anything else...
  return false
}

/**
 * Export `isEmpty`.
 *
 * @type {Function}
 */

module.exports = isEmpty

},{}],2:[function(require,module,exports){
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var isObject = require('isobject');

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor,prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};

},{"isobject":3}],3:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHyperscript = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _slate = (window.Slate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/**
 * Create selection point constants, for comparison by reference.
 *
 * @type {Object}
 */

var ANCHOR = {};
var CURSOR = {};
var FOCUS = {};

/**
 * The default Slate hyperscript creator functions.
 *
 * @type {Object}
 */

var CREATORS = {
  anchor: function anchor(tagName, attributes, children) {
    return ANCHOR;
  },
  block: function block(tagName, attributes, children) {
    return _slate.Block.create(_extends({}, attributes, {
      nodes: createChildren(children)
    }));
  },
  cursor: function cursor(tagName, attributes, children) {
    return CURSOR;
  },
  document: function document(tagName, attributes, children) {
    return _slate.Document.create(_extends({}, attributes, {
      nodes: createChildren(children)
    }));
  },
  focus: function focus(tagName, attributes, children) {
    return FOCUS;
  },
  inline: function inline(tagName, attributes, children) {
    return _slate.Inline.create(_extends({}, attributes, {
      nodes: createChildren(children)
    }));
  },
  mark: function mark(tagName, attributes, children) {
    var marks = _slate.Mark.createSet([attributes]);
    var nodes = createChildren(children, { marks: marks });
    return nodes;
  },
  selection: function selection(tagName, attributes, children) {
    return _slate.Range.create(attributes);
  },
  state: function state(tagName, attributes, children) {
    var data = attributes.data;

    var document = children.find(_slate.Document.isDocument);
    var selection = children.find(_slate.Range.isRange) || _slate.Range.create();
    var props = {};

    // Search the document's texts to see if any of them have the anchor or
    // focus information saved, so we can set the selection.
    if (document) {
      document.getTexts().forEach(function (text) {
        if (text.__anchor != null) {
          props.anchorKey = text.key;
          props.anchorOffset = text.__anchor;
          props.isFocused = true;
        }

        if (text.__focus != null) {
          props.focusKey = text.key;
          props.focusOffset = text.__focus;
          props.isFocused = true;
        }
      });
    }

    if (props.anchorKey && !props.focusKey) {
      throw new Error('Slate hyperscript must have both `<anchor/>` and `<focus/>` defined if one is defined, but you only defined `<anchor/>`. For collapsed selections, use `<cursor/>`.');
    }

    if (!props.anchorKey && props.focusKey) {
      throw new Error('Slate hyperscript must have both `<anchor/>` and `<focus/>` defined if one is defined, but you only defined `<focus/>`. For collapsed selections, use `<cursor/>`.');
    }

    if (!(0, _isEmpty2.default)(props)) {
      selection = selection.merge(props).normalize(document);
    }

    var state = _slate.State.create({ data: data, document: document, selection: selection });
    return state;
  },
  text: function text(tagName, attributes, children) {
    var nodes = createChildren(children, { key: attributes.key });
    return nodes;
  }
};

/**
 * Create a Slate hyperscript function with `options`.
 *
 * @param {Object} options
 * @return {Function}
 */

function createHyperscript() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var creators = resolveCreators(options);

  function create(tagName, attributes) {
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    var creator = creators[tagName];

    if (!creator) {
      throw new Error('No hyperscript creator found for tag: "' + tagName + '"');
    }

    if (attributes == null) {
      attributes = {};
    }

    if (!(0, _isPlainObject2.default)(attributes)) {
      children = [attributes].concat(children);
      attributes = {};
    }

    children = children.filter(function (child) {
      return Boolean(child);
    }).reduce(function (memo, child) {
      return memo.concat(child);
    }, []);

    var element = creator(tagName, attributes, children);
    return element;
  }

  return create;
}

/**
 * Create an array of `children`, storing selection anchor and focus.
 *
 * @param {Array} children
 * @param {Object} options
 * @return {Array}
 */

function createChildren(children) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var array = [];
  var length = 0;

  // When creating the new node, try to preserve a key if one exists.
  var firstText = children.find(function (c) {
    return _slate.Text.isText(c);
  });
  var key = options.key ? options.key : firstText ? firstText.key : undefined;
  var node = _slate.Text.create({ key: key });

  // Create a helper to update the current node while preserving any stored
  // anchor or focus information.
  function setNode(next) {
    var _node = node,
        __anchor = _node.__anchor,
        __focus = _node.__focus;

    if (__anchor != null) next.__anchor = __anchor;
    if (__focus != null) next.__focus = __focus;
    node = next;
  }

  children.forEach(function (child) {
    // If the child is a non-text node, push the current node and the new child
    // onto the array, then creating a new node for future selection tracking.
    if (_slate.Node.isNode(child) && !_slate.Text.isText(child)) {
      if (node.text.length || node.__anchor != null || node.__focus != null) array.push(node);
      array.push(child);
      node = _slate.Text.create();
      length = 0;
    }

    // If the child is a string insert it into the node.
    if (typeof child == 'string') {
      setNode(node.insertText(node.text.length, child, options.marks));
      length += child.length;
    }

    // If the node is a `Text` add its text and marks to the existing node. If
    // the existing node is empty, and the `key` option wasn't set, preserve the
    // child's key when updating the node.
    if (_slate.Text.isText(child)) {
      var __anchor = child.__anchor,
          __focus = child.__focus;

      var i = node.text.length;

      if (!options.key && node.text.length == 0) {
        setNode(node.set('key', child.key));
      }

      child.getLeaves().forEach(function (leaf) {
        var marks = leaf.marks;

        if (options.marks) marks = marks.union(options.marks);
        setNode(node.insertText(i, leaf.text, marks));
        i += leaf.text.length;
      });

      if (__anchor != null) node.__anchor = __anchor + length;
      if (__focus != null) node.__focus = __focus + length;

      length += child.text.length;
    }

    // If the child is a selection object store the current position.
    if (child == ANCHOR || child == CURSOR) node.__anchor = length;
    if (child == FOCUS || child == CURSOR) node.__focus = length;
  });

  // Make sure the most recent node is added.
  array.push(node);

  return array;
}

/**
 * Resolve a set of hyperscript creators an `options` object.
 *
 * @param {Object} options
 * @return {Object}
 */

function resolveCreators(options) {
  var _options$blocks = options.blocks,
      blocks = _options$blocks === undefined ? {} : _options$blocks,
      _options$inlines = options.inlines,
      inlines = _options$inlines === undefined ? {} : _options$inlines,
      _options$marks = options.marks,
      marks = _options$marks === undefined ? {} : _options$marks;


  var creators = _extends({}, CREATORS, options.creators || {});

  Object.keys(blocks).map(function (key) {
    creators[key] = normalizeNode(key, blocks[key], 'block');
  });

  Object.keys(inlines).map(function (key) {
    creators[key] = normalizeNode(key, inlines[key], 'inline');
  });

  Object.keys(marks).map(function (key) {
    creators[key] = normalizeMark(key, marks[key]);
  });

  return creators;
}

/**
 * Normalize a node creator with `key` and `value`, of `kind`.
 *
 * @param {String} key
 * @param {Function|Object|String} value
 * @param {String} kind
 * @return {Function}
 */

function normalizeNode(key, value, kind) {
  if (typeof value == 'function') {
    return value;
  }

  if (typeof value == 'string') {
    value = { type: value };
  }

  if ((0, _isPlainObject2.default)(value)) {
    return function (tagName, attributes, children) {
      var attrKey = attributes.key,
          rest = _objectWithoutProperties(attributes, ['key']);

      var attrs = _extends({}, value, {
        kind: kind,
        key: attrKey,
        data: _extends({}, value.data || {}, rest)
      });

      return CREATORS[kind](tagName, attrs, children);
    };
  }

  throw new Error('Slate hyperscript ' + kind + ' creators can be either functions, objects or strings, but you passed: ' + value);
}

/**
 * Normalize a mark creator with `key` and `value`.
 *
 * @param {String} key
 * @param {Function|Object|String} value
 * @return {Function}
 */

function normalizeMark(key, value) {
  if (typeof value == 'function') {
    return value;
  }

  if (typeof value == 'string') {
    value = { type: value };
  }

  if ((0, _isPlainObject2.default)(value)) {
    return function (tagName, attributes, children) {
      var attrs = _extends({}, value, {
        data: _extends({}, value.data || {}, attributes)
      });

      return CREATORS.mark(tagName, attrs, children);
    };
  }

  throw new Error('Slate hyperscript mark creators can be either functions, objects or strings, but you passed: ' + value);
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = createHyperscript();
exports.createHyperscript = createHyperscript;

},{"is-empty":1,"is-plain-object":2}]},{},[4])(4)
});