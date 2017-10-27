'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _typeOf = require('type-of');

var _typeOf2 = _interopRequireDefault(_typeOf);

var _slate = require('slate');

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * String.
 *
 * @type {String}
 */

var String = new _immutable.Record({
  kind: 'string',
  text: ''
});

/**
 * A rule to (de)serialize text nodes. This is automatically added to the HTML
 * serializer so that users don't have to worry about text-level serialization.
 *
 * @type {Object}
 */

var TEXT_RULE = {
  deserialize: function deserialize(el) {
    if (el.tagName && el.tagName.toLowerCase() === 'br') {
      return {
        kind: 'text',
        leaves: [{
          kind: 'leaf',
          text: '\n'
        }]
      };
    }

    if (el.nodeName == '#text') {
      if (el.value && el.value.match(/<!--.*?-->/)) return;

      return {
        kind: 'text',
        leaves: [{
          kind: 'leaf',
          text: el.value || el.nodeValue
        }]
      };
    }
  },
  serialize: function serialize(obj, children) {
    if (obj.kind === 'string') {
      return children.split('\n').reduce(function (array, text, i) {
        if (i != 0) array.push(_react2.default.createElement('br', null));
        array.push(text);
        return array;
      }, []);
    }
  }
};

/**
 * A default `parseHtml` function that returns the `<body>` using `DOMParser`.
 *
 * @param {String} html
 * @return {Object}
 */

function defaultParseHtml(html) {
  if (typeof DOMParser === 'undefined') {
    throw new Error('The native `DOMParser` global which the `Html` serializer uses by default is not present in this environment. You must supply the `options.parseHtml` function instead.');
  }

  var parsed = new DOMParser().parseFromString(html, 'text/html');
  var body = parsed.body;

  return body;
}

/**
 * HTML serializer.
 *
 * @type {Html}
 */

var Html =

/**
 * Create a new serializer with `rules`.
 *
 * @param {Object} options
 *   @property {Array} rules
 *   @property {String|Object|Block} defaultBlock
 *   @property {Function} parseHtml
 */

function Html() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, Html);

  _initialiseProps.call(this);

  var _options$defaultBlock = options.defaultBlock,
      defaultBlock = _options$defaultBlock === undefined ? 'paragraph' : _options$defaultBlock,
      _options$parseHtml = options.parseHtml,
      parseHtml = _options$parseHtml === undefined ? defaultParseHtml : _options$parseHtml,
      _options$rules = options.rules,
      rules = _options$rules === undefined ? [] : _options$rules;


  if (options.defaultBlockType) {
    _slateDevLogger2.default.deprecate('0.23.0', 'The `options.defaultBlockType` argument of the `Html` serializer is deprecated, use `options.defaultBlock` instead.');
    defaultBlock = options.defaultBlockType;
  }

  defaultBlock = _slate.Node.createProperties(defaultBlock);

  this.rules = [].concat(_toConsumableArray(rules), [TEXT_RULE]);
  this.defaultBlock = defaultBlock;
  this.parseHtml = parseHtml;
}

/**
 * Deserialize pasted HTML.
 *
 * @param {String} html
 * @param {Object} options
 *   @property {Boolean} toRaw
 * @return {State}
 */

/**
 * Deserialize an array of DOM elements.
 *
 * @param {Array} elements
 * @return {Array}
 */

/**
 * Deserialize a DOM element.
 *
 * @param {Object} element
 * @return {Any}
 */

/**
 * Deserialize a `mark` object.
 *
 * @param {Object} mark
 * @return {Array}
 */

/**
 * Serialize a `state` object into an HTML string.
 *
 * @param {State} state
 * @param {Object} options
 *   @property {Boolean} render
 * @return {String|Array}
 */

/**
 * Serialize a `node`.
 *
 * @param {Node} node
 * @return {String}
 */

/**
 * Serialize a `leaf`.
 *
 * @param {Leaf} leaf
 * @return {String}
 */

/**
 * Serialize a `string`.
 *
 * @param {String} string
 * @return {String}
 */

/**
 * Filter out cruft newline nodes inserted by the DOM parser.
 *
 * @param {Object} element
 * @return {Boolean}
 */

;

/**
 * Add a unique key to a React `element`.
 *
 * @param {Element} element
 * @return {Element}
 */

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.deserialize = function (html) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$toJSON = options.toJSON,
        toJSON = _options$toJSON === undefined ? false : _options$toJSON;


    if (options.toRaw) {
      _slateDevLogger2.default.deprecate('0.23.0', 'The `options.toRaw` argument of the `Html` serializer is deprecated, use `options.toJSON` instead.');
      toJSON = options.toRaw;
    }

    var defaultBlock = _this.defaultBlock,
        parseHtml = _this.parseHtml;

    var fragment = parseHtml(html);
    var children = Array.from(fragment.childNodes);
    var nodes = _this.deserializeElements(children);

    // COMPAT: ensure that all top-level inline nodes are wrapped into a block.
    nodes = nodes.reduce(function (memo, node, i, original) {
      if (node.kind == 'block') {
        memo.push(node);
        return memo;
      }

      if (i > 0 && original[i - 1].kind != 'block') {
        var _block = memo[memo.length - 1];
        _block.nodes.push(node);
        return memo;
      }

      var block = _extends({
        kind: 'block',
        data: {},
        isVoid: false
      }, defaultBlock, {
        nodes: [node]
      });

      memo.push(block);
      return memo;
    }, []);

    // TODO: pretty sure this is no longer needed.
    if (nodes.length == 0) {
      nodes = [_extends({
        kind: 'block',
        data: {},
        isVoid: false
      }, defaultBlock, {
        nodes: [{
          kind: 'text',
          leaves: [{
            kind: 'leaf',
            text: '',
            marks: []
          }]
        }]
      })];
    }

    var json = {
      kind: 'state',
      document: {
        kind: 'document',
        data: {},
        nodes: nodes
      }
    };

    var ret = toJSON ? json : _slate.State.fromJSON(json);
    return ret;
  };

  this.deserializeElements = function () {
    var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var nodes = [];

    elements.filter(_this.cruftNewline).forEach(function (element) {
      var node = _this.deserializeElement(element);
      switch ((0, _typeOf2.default)(node)) {
        case 'array':
          nodes = nodes.concat(node);
          break;
        case 'object':
          nodes.push(node);
          break;
      }
    });

    return nodes;
  };

  this.deserializeElement = function (element) {
    var node = void 0;

    if (!element.tagName) {
      element.tagName = '';
    }

    var next = function next(elements) {
      if (Object.prototype.toString.call(elements) == '[object NodeList]') {
        elements = Array.from(elements);
      }

      switch ((0, _typeOf2.default)(elements)) {
        case 'array':
          return _this.deserializeElements(elements);
        case 'object':
          return _this.deserializeElement(elements);
        case 'null':
        case 'undefined':
          return;
        default:
          throw new Error('The `next` argument was called with invalid children: "' + elements + '".');
      }
    };

    for (var i = 0; i < _this.rules.length; i++) {
      var rule = _this.rules[i];
      if (!rule.deserialize) continue;
      var ret = rule.deserialize(element, next);
      var type = (0, _typeOf2.default)(ret);

      if (type != 'array' && type != 'object' && type != 'null' && type != 'undefined') {
        throw new Error('A rule returned an invalid deserialized representation: "' + node + '".');
      }

      if (ret === undefined) {
        continue;
      } else if (ret === null) {
        return null;
      } else if (ret.kind == 'mark') {
        node = _this.deserializeMark(ret);
      } else {
        node = ret;
      }

      break;
    }

    return node || next(element.childNodes);
  };

  this.deserializeMark = function (mark) {
    var type = mark.type,
        data = mark.data;


    var applyMark = function applyMark(node) {
      if (node.kind == 'mark') {
        return _this.deserializeMark(node);
      } else if (node.kind == 'text') {
        node.leaves = node.leaves.map(function (leaf) {
          leaf.marks = leaf.marks || [];
          leaf.marks.push({ type: type, data: data });
          return leaf;
        });
      } else {
        node.nodes = node.nodes.map(applyMark);
      }

      return node;
    };

    return mark.nodes.reduce(function (nodes, node) {
      var ret = applyMark(node);
      if (Array.isArray(ret)) return nodes.concat(ret);
      nodes.push(ret);
      return nodes;
    }, []);
  };

  this.serialize = function (state) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var document = state.document;

    var elements = document.nodes.map(_this.serializeNode);
    if (options.render === false) return elements;

    var html = _server2.default.renderToStaticMarkup(_react2.default.createElement(
      'body',
      null,
      elements
    ));
    var inner = html.slice(6, -7);
    return inner;
  };

  this.serializeNode = function (node) {
    if (node.kind === 'text') {
      var leaves = node.getLeaves();
      return leaves.map(_this.serializeLeaf);
    }

    var children = node.nodes.map(_this.serializeNode);

    for (var i = 0; i < _this.rules.length; i++) {
      var rule = _this.rules[i];
      if (!rule.serialize) continue;
      var ret = rule.serialize(node, children);
      if (ret) return addKey(ret);
    }

    throw new Error('No serializer defined for node of type "' + node.type + '".');
  };

  this.serializeLeaf = function (leaf) {
    var string = new String({ text: leaf.text });
    var text = _this.serializeString(string);

    return leaf.marks.reduce(function (children, mark) {
      for (var i = 0; i < _this.rules.length; i++) {
        var rule = _this.rules[i];
        if (!rule.serialize) continue;
        var ret = rule.serialize(mark, children);
        if (ret) return addKey(ret);
      }

      throw new Error('No serializer defined for mark of type "' + mark.type + '".');
    }, text);
  };

  this.serializeString = function (string) {
    for (var i = 0; i < _this.rules.length; i++) {
      var rule = _this.rules[i];
      if (!rule.serialize) continue;
      var ret = rule.serialize(string, string.text);
      if (ret) return ret;
    }
  };

  this.cruftNewline = function (element) {
    return !(element.nodeName === '#text' && element.value == '\n');
  };
};

var key = 0;

function addKey(element) {
  return _react2.default.cloneElement(element, { key: key++ });
}

/**
 * Export.
 *
 * @type {Html}
 */

exports.default = Html;