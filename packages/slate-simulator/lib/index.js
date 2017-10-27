'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slate = require('slate');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Event handlers that can be simulated.
 *
 * @type {Array}
 */

var EVENT_HANDLERS = ['onBeforeInput', 'onBlur', 'onCopy', 'onCut', 'onDrop', 'onFocus', 'onKeyDown', 'onPaste', 'onSelect'];

/**
 * Simulator.
 *
 * @type {Simulator}
 */

var Simulator =

/**
 * Create a new `Simulator` with `plugins` and an initial `state`.
 *
 * @param {Object} attrs
 */

function Simulator(props) {
  _classCallCheck(this, Simulator);

  var plugins = props.plugins,
      state = props.state;

  var stack = new _slate.Stack({ plugins: plugins });
  this.props = props;
  this.stack = stack;
  this.state = state;
};

/**
 * Generate the event simulators.
 */

EVENT_HANDLERS.forEach(function (handler) {
  var method = getMethodName(handler);

  Simulator.prototype[method] = function (e) {
    if (e == null) e = {};

    var stack = this.stack,
        state = this.state;

    var editor = createEditor(this);
    var event = createEvent(e);
    var change = state.change();

    stack.handle(handler, change, editor, event);
    stack.handle('onBeforeChange', change, editor);
    stack.handle('onChange', change, editor);

    this.state = change.state;
    return this;
  };
});

/**
 * Get the method name from a `handler` name.
 *
 * @param {String} handler
 * @return {String}
 */

function getMethodName(handler) {
  return handler.charAt(2).toLowerCase() + handler.slice(3);
}

/**
 * Create a fake editor from a `stack` and `state`.
 *
 * @param {Stack} stack
 * @param {State} state
 */

function createEditor(_ref) {
  var stack = _ref.stack,
      state = _ref.state,
      props = _ref.props;

  var editor = {
    getSchema: function getSchema() {
      return stack.schema;
    },
    getState: function getState() {
      return state;
    },
    props: _extends({
      autoCorrect: true,
      autoFocus: false,
      onChange: function onChange() {},
      readOnly: false,
      spellCheck: true
    }, props)
  };

  return editor;
}

/**
 * Create a fake event with `attributes`.
 *
 * @param {Object} attributes
 * @return {Object}
 */

function createEvent(attributes) {
  var event = _extends({
    preventDefault: function preventDefault() {
      return event.isDefaultPrevented = true;
    },
    stopPropagation: function stopPropagation() {
      return event.isPropagationStopped = true;
    },
    isDefaultPrevented: false,
    isPropagationStopped: false
  }, attributes);

  return event;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Simulator;