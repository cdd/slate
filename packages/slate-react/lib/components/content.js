'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _slatePropTypes = require('slate-prop-types');

var _slatePropTypes2 = _interopRequireDefault(_slatePropTypes);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _eventHandlers = require('../constants/event-handlers');

var _eventHandlers2 = _interopRequireDefault(_eventHandlers);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _findClosestNode = require('../utils/find-closest-node');

var _findClosestNode2 = _interopRequireDefault(_findClosestNode);

var _findDomRange = require('../utils/find-dom-range');

var _findDomRange2 = _interopRequireDefault(_findDomRange);

var _findRange = require('../utils/find-range');

var _findRange2 = _interopRequireDefault(_findRange);

var _scrollToSelection = require('../utils/scroll-to-selection');

var _scrollToSelection2 = _interopRequireDefault(_scrollToSelection);

var _environment = require('../constants/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:content');

/**
 * Content.
 *
 * @type {Component}
 */

var Content = function (_React$Component) {
  _inherits(Content, _React$Component);

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  /**
   * Property types.
   *
   * @type {Object}
   */

  function Content(props) {
    _classCallCheck(this, Content);

    var _this = _possibleConstructorReturn(this, (Content.__proto__ || Object.getPrototypeOf(Content)).call(this, props));

    _this.componentDidMount = function () {
      if (_environment.SUPPORTED_EVENTS.beforeinput) {
        _this.element.addEventListener('beforeinput', _this.onNativeBeforeInput);
      }

      _this.updateSelection();

      if (_this.props.autoFocus) {
        _this.element.focus();
      }
    };

    _this.componentDidUpdate = function () {
      _this.updateSelection();
    };

    _this.updateSelection = function () {
      var state = _this.props.state;
      var selection = state.selection;

      var window = (0, _getWindow2.default)(_this.element);
      var native = window.getSelection();
      var rangeCount = native.rangeCount;

      // If both selections are blurred, do nothing.

      if (!rangeCount && selection.isBlurred) return;

      // If the selection has been blurred, but is still inside the editor in the
      // DOM, blur it manually.
      if (selection.isBlurred) {
        if (!_this.isInEditor(native.anchorNode)) return;
        native.removeAllRanges();
        _this.element.blur();
        debug('updateSelection', { selection: selection, native: native });
        return;
      }

      // If the selection isn't set, do nothing.
      if (selection.isUnset) return;

      // Otherwise, figure out which DOM nodes should be selected...
      var current = !!rangeCount && native.getRangeAt(0);
      var range = (0, _findDomRange2.default)(selection);

      if (!range) {
        _slateDevLogger2.default.error('Unable to find a native DOM range from the current selection.', { selection: selection });
        return;
      }

      // If the new range matches the current selection, do nothing.
      if (current && range.startContainer == current.startContainer && range.startOffset == current.startOffset && range.endContainer == current.endContainer && range.endOffset == current.endOffset) {
        return;
      }

      // Otherwise, set the `isUpdatingSelection` flag and update the selection.
      _this.tmp.isUpdatingSelection = true;
      native.removeAllRanges();
      native.addRange(range);
      (0, _scrollToSelection2.default)(native);

      // Then unset the `isUpdatingSelection` flag after a delay.
      setTimeout(function () {
        // COMPAT: In Firefox, it's not enough to create a range, you also need to
        // focus the contenteditable element too. (2016/11/16)
        if (_environment.IS_FIREFOX) _this.element.focus();
        _this.tmp.isUpdatingSelection = false;
      });

      debug('updateSelection', { selection: selection, native: native });
    };

    _this.ref = function (element) {
      _this.element = element;
    };

    _this.isInEditor = function (target) {
      var element = _this.element;
      // COMPAT: Text nodes don't have `isContentEditable` property. So, when
      // `target` is a text node use its parent node for check.

      var el = target.nodeType === 3 ? target.parentNode : target;
      return el.isContentEditable && (el === element || (0, _findClosestNode2.default)(el, '[data-slate-editor]') === element);
    };

    _this.onNativeBeforeInput = function (event) {
      if (_this.props.readOnly) return;
      if (!_this.isInEditor(event.target)) return;

      var inputType = event.inputType;

      if (inputType !== 'insertText' && inputType !== 'insertReplacementText') return;

      var _event$getTargetRange = event.getTargetRanges(),
          _event$getTargetRange2 = _slicedToArray(_event$getTargetRange, 1),
          targetRange = _event$getTargetRange2[0];

      if (!targetRange) return;

      // `data` should have the text for the `insertText` input type and
      // `dataTransfer` should have the text for the `insertReplacementText` input
      // type, but Safari uses `insertText` for spell check replacements and sets
      // `data` to `null`.
      var text = event.data == null ? event.dataTransfer.getData('text/plain') : event.data;

      if (text == null) return;

      event.preventDefault();

      var _this$props = _this.props,
          editor = _this$props.editor,
          state = _this$props.state;
      var selection = state.selection;

      var range = (0, _findRange2.default)(targetRange, state);

      editor.change(function (change) {
        change.insertTextAtRange(range, text, selection.marks);

        // If the text was successfully inserted, and the selection had marks on it,
        // unset the selection's marks.
        if (selection.marks && state.document != change.state.document) {
          change.select({ marks: null });
        }
      });
    };

    _this.renderNode = function (child, isSelected) {
      var _this$props2 = _this.props,
          editor = _this$props2.editor,
          readOnly = _this$props2.readOnly,
          schema = _this$props2.schema,
          state = _this$props2.state;
      var document = state.document,
          decorations = state.decorations;

      var decs = document.getDecorations(schema);
      if (decorations) decs = decorations.concat(decs);
      return _react2.default.createElement(_node2.default, {
        block: null,
        editor: editor,
        decorations: decs,
        isSelected: isSelected,
        key: child.key,
        node: child,
        parent: document,
        readOnly: readOnly,
        schema: schema,
        state: state
      });
    };

    _this.tmp = {};
    _this.tmp.key = 0;
    _this.tmp.isUpdatingSelection = false;

    _eventHandlers2.default.forEach(function (handler) {
      _this[handler] = function (event) {
        _this.onEvent(handler, event);
      };
    });
    return _this;
  }

  /**
   * When the editor first mounts in the DOM we need to:
   *
   *   - Add native DOM event listeners.
   *   - Update the selection, in case it starts focused.
   *   - Focus the editor if `autoFocus` is set.
   */

  /**
   * Default properties.
   *
   * @type {Object}
   */

  _createClass(Content, [{
    key: 'componentWillUnmount',


    /**
     * When unmounting, remove DOM event listeners.
     */

    value: function componentWillUnmount() {
      if (_environment.SUPPORTED_EVENTS.beforeinput) {
        this.element.removeEventListener('beforeinput', this.onNativeBeforeInput);
      }
    }

    /**
     * On update, update the selection.
     */

    /**
     * Update the native DOM selection to reflect the internal model.
     */

    /**
     * The React ref method to set the root content element locally.
     *
     * @param {Element} element
     */

    /**
     * Check if an event `target` is fired from within the contenteditable
     * element. This should be false for edits happening in non-contenteditable
     * children, such as void nodes and other nested Slate editors.
     *
     * @param {Element} target
     * @return {Boolean}
     */

  }, {
    key: 'onEvent',


    /**
     * On `event` with `handler`.
     *
     * @param {String} handler
     * @param {Event} event
     */

    value: function onEvent(handler, event) {
      // COMPAT: Composition events can change the DOM out of under React, so we
      // increment this key to ensure that a full re-render happens. (2017/10/16)
      if (handler == 'onCompositionEnd') {
        this.tmp.key++;
      }

      // If the `onSelect` handler fires while the `isUpdatingSelection` flag is
      // set it's a result of updating the selection manually, so skip it.
      if (handler == 'onSelect' && this.tmp.isUpdatingSelection) {
        return;
      }

      // COMPAT: There are situations where a select event will fire with a new
      // native selection that resolves to the same internal position. In those
      // cases we don't need to trigger any changes, since our internal model is
      // already up to date, but we do want to update the native selection again
      // to make sure it is in sync. (2017/10/16)
      if (handler == 'onSelect') {
        var state = this.props.state;
        var selection = state.selection;

        var window = (0, _getWindow2.default)(event.target);
        var native = window.getSelection();
        var range = (0, _findRange2.default)(native, state);

        if (range && range.equals(selection)) {
          this.updateSelection();
          return;
        }
      }

      // Don't handle drag events coming from embedded editors.
      if (handler == 'onDragEnd' || handler == 'onDragEnter' || handler == 'onDragExit' || handler == 'onDragLeave' || handler == 'onDragOver' || handler == 'onDragStart') {
        var target = event.target;

        var targetEditorNode = (0, _findClosestNode2.default)(target, '[data-slate-editor]');
        if (targetEditorNode !== this.element) return;
      }

      // Some events require being in editable in the editor, so if the event
      // target isn't, ignore them.
      if (handler == 'onBeforeInput' || handler == 'onBlur' || handler == 'onCompositionEnd' || handler == 'onCompositionStart' || handler == 'onCopy' || handler == 'onCut' || handler == 'onFocus' || handler == 'onInput' || handler == 'onKeyDown' || handler == 'onKeyUp' || handler == 'onPaste' || handler == 'onSelect') {
        if (!this.isInEditor(event.target)) return;
      }

      this.props[handler](event);
    }

    /**
     * On a native `beforeinput` event, use the additional range information
     * provided by the event to insert text exactly as the browser would.
     *
     * @param {InputEvent} event
     */

  }, {
    key: 'render',


    /**
     * Render the editor content.
     *
     * @return {Element}
     */

    value: function render() {
      var _this2 = this;

      var props = this.props;
      var className = props.className,
          readOnly = props.readOnly,
          state = props.state,
          tabIndex = props.tabIndex,
          role = props.role,
          tagName = props.tagName;

      var Container = tagName;
      var document = state.document,
          selection = state.selection;

      var indexes = document.getSelectionIndexes(selection, selection.isFocused);
      var children = document.nodes.toArray().map(function (child, i) {
        var isSelected = !!indexes && indexes.start <= i && i < indexes.end;
        return _this2.renderNode(child, isSelected);
      });

      var handlers = _eventHandlers2.default.reduce(function (obj, handler) {
        obj[handler] = _this2[handler];
        return obj;
      }, {});

      var style = _extends({
        // Prevent the default outline styles.
        outline: 'none',
        // Preserve adjacent whitespace and new lines.
        whiteSpace: 'pre-wrap',
        // Allow words to break if they are too long.
        wordWrap: 'break-word'
      }, readOnly ? {} : { WebkitUserModify: 'read-write-plaintext-only' }, props.style);

      // COMPAT: In Firefox, spellchecking can remove entire wrapping elements
      // including inline ones like `<a>`, which is jarring for the user but also
      // causes the DOM to get into an irreconcilable state. (2016/09/01)
      var spellCheck = _environment.IS_FIREFOX ? false : props.spellCheck;

      debug('render', { props: props });

      return _react2.default.createElement(
        Container,
        _extends({}, handlers, {
          'data-slate-editor': true,
          key: this.tmp.key,
          ref: this.ref,
          'data-key': document.key,
          contentEditable: readOnly ? null : true,
          suppressContentEditableWarning: true,
          className: className,
          onBlur: this.onBlur,
          onFocus: this.onFocus,
          onCompositionEnd: this.onCompositionEnd,
          onCompositionStart: this.onCompositionStart,
          onCopy: this.onCopy,
          onCut: this.onCut,
          onDragEnd: this.onDragEnd,
          onDragOver: this.onDragOver,
          onDragStart: this.onDragStart,
          onDrop: this.onDrop,
          onInput: this.onInput,
          onKeyDown: this.onKeyDown,
          onKeyUp: this.onKeyUp,
          onPaste: this.onPaste,
          onSelect: this.onSelect,
          autoCorrect: props.autoCorrect ? 'on' : 'off',
          spellCheck: spellCheck,
          style: style,
          role: readOnly ? null : role || 'textbox',
          tabIndex: tabIndex
          // COMPAT: The Grammarly Chrome extension works by changing the DOM out
          // from under `contenteditable` elements, which leads to weird behaviors
          // so we have to disable it like this. (2017/04/24)
          , 'data-gramm': false
        }),
        children,
        this.props.children
      );
    }

    /**
     * Render a `child` node of the document.
     *
     * @param {Node} child
     * @param {Boolean} isSelected
     * @return {Element}
     */

  }]);

  return Content;
}(_react2.default.Component);

/**
 * Mix in handler prop types.
 */

Content.propTypes = {
  autoCorrect: _propTypes2.default.bool.isRequired,
  autoFocus: _propTypes2.default.bool.isRequired,
  children: _propTypes2.default.array.isRequired,
  className: _propTypes2.default.string,
  editor: _propTypes2.default.object.isRequired,
  readOnly: _propTypes2.default.bool.isRequired,
  role: _propTypes2.default.string,
  schema: _slatePropTypes2.default.schema.isRequired,
  spellCheck: _propTypes2.default.bool.isRequired,
  state: _slatePropTypes2.default.state.isRequired,
  style: _propTypes2.default.object,
  tabIndex: _propTypes2.default.number,
  tagName: _propTypes2.default.string };
Content.defaultProps = {
  style: {},
  tagName: 'div' };
_eventHandlers2.default.forEach(function (handler) {
  Content.propTypes[handler] = _propTypes2.default.func.isRequired;
});

/**
 * Export.
 *
 * @type {Component}
 */

exports.default = Content;