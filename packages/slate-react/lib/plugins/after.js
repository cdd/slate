'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slateBase64Serializer = require('slate-base64-serializer');

var _slateBase64Serializer2 = _interopRequireDefault(_slateBase64Serializer);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _slatePlainSerializer = require('slate-plain-serializer');

var _slatePlainSerializer2 = _interopRequireDefault(_slatePlainSerializer);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _slate = require('slate');

var _eventHandlers = require('../constants/event-handlers');

var _eventHandlers2 = _interopRequireDefault(_eventHandlers);

var _hotkeys = require('../constants/hotkeys');

var _hotkeys2 = _interopRequireDefault(_hotkeys);

var _content = require('../components/content');

var _content2 = _interopRequireDefault(_content);

var _defaultNode = require('../components/default-node');

var _defaultNode2 = _interopRequireDefault(_defaultNode);

var _defaultPlaceholder = require('../components/default-placeholder');

var _defaultPlaceholder2 = _interopRequireDefault(_defaultPlaceholder);

var _findDomNode = require('../utils/find-dom-node');

var _findDomNode2 = _interopRequireDefault(_findDomNode);

var _findNode = require('../utils/find-node');

var _findNode2 = _interopRequireDefault(_findNode);

var _findPoint = require('../utils/find-point');

var _findPoint2 = _interopRequireDefault(_findPoint);

var _findRange = require('../utils/find-range');

var _findRange2 = _interopRequireDefault(_findRange);

var _getEventRange = require('../utils/get-event-range');

var _getEventRange2 = _interopRequireDefault(_getEventRange);

var _getEventTransfer = require('../utils/get-event-transfer');

var _getEventTransfer2 = _interopRequireDefault(_getEventTransfer);

var _setEventTransfer = require('../utils/set-event-transfer');

var _setEventTransfer2 = _interopRequireDefault(_setEventTransfer);

var _environment = require('../constants/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:core:after');

/**
 * The after plugin.
 *
 * @param {Object} options
 * @return {Object}
 */

function AfterPlugin() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var isDraggingInternally = null;

  /**
   * On before change, enforce the editor's schema.
   *
   * @param {Change} change
   * @param {Editor} editor
   */

  function onBeforeChange(change, editor) {
    var state = change.state;

    var schema = editor.getSchema();
    var prevState = editor.getState();

    // PERF: Skip normalizing if the document hasn't changed, since schemas only
    // normalize changes to the document, not selection.
    if (prevState && state.document == prevState.document) return;

    debug('onBeforeChange');

    change.normalize(_slate.coreSchema);
    change.normalize(schema);
  }

  /**
   * On before input, correct any browser inconsistencies.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onBeforeInput(event, change, editor) {
    debug('onBeforeInput', { event: event });

    event.preventDefault();
    change.insertText(event.data);
  }

  /**
   * On blur.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onBlur(event, change, editor) {
    debug('onBlur', { event: event });

    change.blur();
  }

  /**
   * On click.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onClick(event, change, editor) {
    if (editor.props.readOnly) return true;

    var state = change.state;
    var document = state.document;

    var node = (0, _findNode2.default)(event.target, state);
    var isVoid = node && (node.isVoid || document.hasVoidParent(node.key));

    if (isVoid) {
      // COMPAT: In Chrome & Safari, selections that are at the zero offset of
      // an inline node will be automatically replaced to be at the last offset
      // of a previous inline node, which screws us up, so we always want to set
      // it to the end of the node. (2016/11/29)
      change.focus().collapseToEndOf(node);
    }

    debug('onClick', { event: event });
  }

  /**
   * On copy.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCopy(event, change, editor) {
    debug('onCopy', { event: event });

    onCutOrCopy(event, change);
  }

  /**
   * On cut.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCut(event, change, editor) {
    debug('onCut', { event: event });

    onCutOrCopy(event, change);
    var window = (0, _getWindow2.default)(event.target);

    // Once the fake cut content has successfully been added to the clipboard,
    // delete the content in the current selection.
    window.requestAnimationFrame(function () {
      editor.change(function (c) {
        return c.delete();
      });
    });
  }

  /**
   * On cut or copy.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCutOrCopy(event, change, editor) {
    var window = (0, _getWindow2.default)(event.target);
    var native = window.getSelection();
    var state = change.state;
    var startKey = state.startKey,
        endKey = state.endKey,
        startText = state.startText,
        endBlock = state.endBlock,
        endInline = state.endInline;

    var isVoidBlock = endBlock && endBlock.isVoid;
    var isVoidInline = endInline && endInline.isVoid;
    var isVoid = isVoidBlock || isVoidInline;

    // If the selection is collapsed, and it isn't inside a void node, abort.
    if (native.isCollapsed && !isVoid) return;

    // Create a fake selection so that we can add a Base64-encoded copy of the
    // fragment to the HTML, to decode on future pastes.
    var fragment = state.fragment;

    var encoded = _slateBase64Serializer2.default.serializeNode(fragment);
    var range = native.getRangeAt(0);
    var contents = range.cloneContents();
    var attach = contents.childNodes[0];

    // If the end node is a void node, we need to move the end of the range from
    // the void node's spacer span, to the end of the void node's content.
    if (isVoid) {
      var _r = range.cloneRange();
      var n = isVoidBlock ? endBlock : endInline;
      var node = (0, _findDomNode2.default)(n);
      _r.setEndAfter(node);
      contents = _r.cloneContents();
      attach = contents.childNodes[contents.childNodes.length - 1].firstChild;
    }

    // COMPAT: in Safari and Chrome when selecting a single marked word,
    // marks are not preserved when copying.
    // If the attatched is not void, and the startKey and endKey is the same,
    // check if there is marks involved. If so, set the range start just before the
    // startText node
    if ((_environment.IS_CHROME || _environment.IS_SAFARI) && !isVoid && startKey === endKey) {
      var hasMarks = startText.characters.slice(state.selection.anchorOffset, state.selection.focusOffset).filter(function (char) {
        return char.marks.size !== 0;
      }).size !== 0;
      if (hasMarks) {
        var _r2 = range.cloneRange();
        var _node = (0, _findDomNode2.default)(startText);
        _r2.setStartBefore(_node);
        contents = _r2.cloneContents();
        attach = contents.childNodes[contents.childNodes.length - 1].firstChild;
      }
    }

    // Remove any zero-width space spans from the cloned DOM so that they don't
    // show up elsewhere when pasted.
    var zws = [].slice.call(contents.querySelectorAll('[data-slate-zero-width]'));
    zws.forEach(function (zw) {
      return zw.parentNode.removeChild(zw);
    });

    // COMPAT: In Chrome and Safari, if the last element in the selection to
    // copy has `contenteditable="false"` the copy will fail, and nothing will
    // be put in the clipboard. So we remove them all. (2017/05/04)
    if (_environment.IS_CHROME || _environment.IS_SAFARI) {
      var els = [].slice.call(contents.querySelectorAll('[contenteditable="false"]'));
      els.forEach(function (el) {
        return el.removeAttribute('contenteditable');
      });
    }

    // Set a `data-slate-fragment` attribute on a non-empty node, so it shows up
    // in the HTML, and can be used for intra-Slate pasting. If it's a text
    // node, wrap it in a `<span>` so we have something to set an attribute on.
    if (attach.nodeType == 3) {
      var span = window.document.createElement('span');

      // COMPAT: In Chrome and Safari, if we don't add the `white-space` style
      // then leading and trailing spaces will be ignored. (2017/09/21)
      span.style.whiteSpace = 'pre';

      span.appendChild(attach);
      contents.appendChild(span);
      attach = span;
    }

    attach.setAttribute('data-slate-fragment', encoded);

    // Add the phony content to the DOM, and select it, so it will be copied.
    var body = window.document.querySelector('body');
    var div = window.document.createElement('div');
    div.setAttribute('contenteditable', true);
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.appendChild(contents);
    body.appendChild(div);

    // COMPAT: In Firefox, trying to use the terser `native.selectAllChildren`
    // throws an error, so we use the older `range` equivalent. (2016/06/21)
    var r = window.document.createRange();
    r.selectNodeContents(div);
    native.removeAllRanges();
    native.addRange(r);

    // Revert to the previous selection right after copying.
    window.requestAnimationFrame(function () {
      body.removeChild(div);
      native.removeAllRanges();
      native.addRange(range);
    });
  }

  /**
   * On drag end.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragEnd(event, change, editor) {
    debug('onDragEnd', { event: event });

    isDraggingInternally = null;
  }

  /**
   * On drag over.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragOver(event, change, editor) {
    debug('onDragOver', { event: event });

    isDraggingInternally = false;
  }

  /**
   * On drag start.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragStart(event, change, editor) {
    debug('onDragStart', { event: event });

    isDraggingInternally = true;

    var state = change.state;
    var document = state.document;

    var node = (0, _findNode2.default)(event.target, state);
    var isVoid = node && (node.isVoid || document.hasVoidParent(node.key));

    if (isVoid) {
      var encoded = _slateBase64Serializer2.default.serializeNode(node, { preserveKeys: true });
      (0, _setEventTransfer2.default)(event, 'node', encoded);
    } else {
      var fragment = state.fragment;

      var _encoded = _slateBase64Serializer2.default.serializeNode(fragment);
      (0, _setEventTransfer2.default)(event, 'fragment', _encoded);
    }
  }

  /**
   * On drop.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDrop(event, change, editor) {
    debug('onDrop', { event: event });

    var state = change.state;
    var document = state.document,
        selection = state.selection;

    var target = (0, _getEventRange2.default)(event, state);
    if (!target) return;

    var transfer = (0, _getEventTransfer2.default)(event);
    var type = transfer.type,
        fragment = transfer.fragment,
        node = transfer.node,
        text = transfer.text;


    change.focus();

    // If the drag is internal and the target is after the selection, it
    // needs to account for the selection's content being deleted.
    if (isDraggingInternally && selection.endKey == target.endKey && selection.endOffset < target.endOffset) {
      target = target.move(selection.startKey == selection.endKey ? 0 - selection.endOffset + selection.startOffset : 0 - selection.endOffset);
    }

    if (isDraggingInternally) {
      change.delete();
    }

    change.select(target);

    if (type == 'text' || type == 'html') {
      var _target = target,
          anchorKey = _target.anchorKey;

      var hasVoidParent = document.hasVoidParent(anchorKey);

      if (hasVoidParent) {
        var n = document.getNode(anchorKey);

        while (hasVoidParent) {
          n = document.getNextText(n.key);
          if (!n) break;
          hasVoidParent = document.hasVoidParent(n.key);
        }

        if (n) change.collapseToStartOf(n);
      }

      text.split('\n').forEach(function (line, i) {
        if (i > 0) change.splitBlock();
        change.insertText(line);
      });
    }

    if (type == 'fragment') {
      change.insertFragment(fragment);
    }

    if (type == 'node' && _slate.Block.isBlock(node)) {
      change.insertBlock(node).removeNodeByKey(node.key);
    }

    if (type == 'node' && _slate.Inline.isInline(node)) {
      change.insertInline(node).removeNodeByKey(node.key);
    }
  }

  /**
   * On input.
   *
   * @param {Event} eventvent
   * @param {Change} change
   */

  function onInput(event, change, editor) {
    debug('onInput', { event: event });

    var window = (0, _getWindow2.default)(event.target);
    var state = change.state;

    // Get the selection point.

    var native = window.getSelection();
    var anchorNode = native.anchorNode,
        anchorOffset = native.anchorOffset;

    var point = (0, _findPoint2.default)(anchorNode, anchorOffset, state);
    if (!point) return;

    // Get the text node and leaf in question.
    var document = state.document,
        selection = state.selection;

    var node = document.getDescendant(point.key);
    var leaves = node.getLeaves();
    var start = 0;
    var end = 0;

    var leaf = leaves.find(function (r) {
      end += r.text.length;
      if (end >= point.offset) return true;
      start = end;
    });

    // Get the text information.
    var text = leaf.text;
    var textContent = anchorNode.textContent;

    var block = document.getClosestBlock(node.key);
    var lastText = block.getLastText();
    var lastLeaf = leaves.last();
    var lastChar = textContent.charAt(textContent.length - 1);
    var isLastText = node == lastText;
    var isLastLeaf = leaf == lastLeaf;

    // COMPAT: If this is the last leaf, and the DOM text ends in a new line,
    // we will have added another new line in <Leaf>'s render method to account
    // for browsers collapsing a single trailing new lines, so remove it.
    if (isLastText && isLastLeaf && lastChar == '\n') {
      textContent = textContent.slice(0, -1);
    }

    // If the text is no different, abort.
    if (textContent == text) return;

    // Determine what the selection should be after changing the text.
    var delta = textContent.length - text.length;
    var corrected = selection.collapseToEnd().move(delta);
    var entire = selection.moveAnchorTo(point.key, start).moveFocusTo(point.key, end);

    // Change the current state to have the leaf's text replaced.
    change.select(entire).delete().insertText(textContent, leaf.marks).select(corrected);
  }

  /**
   * On key down.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onKeyDown(event, change, editor) {
    debug('onKeyDown', { event: event });

    var _change = change,
        state = _change.state;


    if (_hotkeys2.default.SPLIT_BLOCK(event)) {
      if (state.isInVoid) {
        return change.collapseToStartOfNextText();
      } else {
        change = change.splitBlock();
        state.activeMarks.forEach(function (mark) {
          change = change.addMark(mark);
        });
        return change;
      }
    }

    if (_hotkeys2.default.DELETE_CHAR_BACKWARD(event)) {
      return change.deleteCharBackward();
    }

    if (_hotkeys2.default.DELETE_CHAR_FORWARD(event)) {
      return change.deleteCharForward();
    }

    if (_hotkeys2.default.DELETE_LINE_BACKWARD(event)) {
      return change.deleteLineBackward();
    }

    if (_hotkeys2.default.DELETE_LINE_FORWARD(event)) {
      return change.deleteLineForward();
    }

    if (_hotkeys2.default.DELETE_WORD_BACKWARD(event)) {
      return change.deleteWordBackward();
    }

    if (_hotkeys2.default.DELETE_WORD_FORWARD(event)) {
      return change.deleteWordForward();
    }

    if (_hotkeys2.default.REDO(event)) {
      return change.redo();
    }

    if (_hotkeys2.default.UNDO(event)) {
      return change.undo();
    }

    // COMPAT: Certain browsers don't handle the selection updates properly. In
    // Chrome, the selection isn't properly extended. And in Firefox, the
    // selection isn't properly collapsed. (2017/10/17)
    if (_hotkeys2.default.COLLAPSE_LINE_BACKWARD(event)) {
      event.preventDefault();
      return change.collapseLineBackward();
    }

    if (_hotkeys2.default.COLLAPSE_LINE_FORWARD(event)) {
      event.preventDefault();
      return change.collapseLineForward();
    }

    if (_hotkeys2.default.EXTEND_LINE_BACKWARD(event)) {
      event.preventDefault();
      return change.extendLineBackward();
    }

    if (_hotkeys2.default.EXTEND_LINE_FORWARD(event)) {
      event.preventDefault();
      return change.extendLineForward();
    }

    // COMPAT: If a void node is selected, or a zero-width text node adjacent to
    // an inline is selected, we need to handle these hotkeys manually because
    // browsers won't know what to do.
    if (_hotkeys2.default.COLLAPSE_CHAR_BACKWARD(event)) {
      var isInVoid = state.isInVoid,
          previousText = state.previousText,
          document = state.document;

      var isPreviousInVoid = previousText && document.hasVoidParent(previousText.key);
      if (isInVoid || isPreviousInVoid) {
        event.preventDefault();
        return change.collapseCharBackward();
      }
    }

    if (_hotkeys2.default.COLLAPSE_CHAR_FORWARD(event)) {
      var _isInVoid = state.isInVoid,
          nextText = state.nextText,
          _document = state.document;

      var isNextInVoid = nextText && _document.hasVoidParent(nextText.key);
      if (_isInVoid || isNextInVoid) {
        event.preventDefault();
        return change.collapseCharForward();
      }
    }

    if (_hotkeys2.default.EXTEND_CHAR_BACKWARD(event)) {
      var _isInVoid2 = state.isInVoid,
          _previousText = state.previousText,
          _document2 = state.document;

      var _isPreviousInVoid = _previousText && _document2.hasVoidParent(_previousText.key);
      if (_isInVoid2 || _isPreviousInVoid) {
        event.preventDefault();
        return change.extendCharBackward();
      }
    }

    if (_hotkeys2.default.EXTEND_CHAR_FORWARD(event)) {
      var _isInVoid3 = state.isInVoid,
          _nextText = state.nextText,
          _document3 = state.document;

      var _isNextInVoid = _nextText && _document3.hasVoidParent(_nextText.key);
      if (_isInVoid3 || _isNextInVoid) {
        event.preventDefault();
        return change.extendCharForward();
      }
    }
  }

  /**
   * On paste.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onPaste(event, change, editor) {
    debug('onPaste', { event: event });

    var transfer = (0, _getEventTransfer2.default)(event);
    var type = transfer.type,
        fragment = transfer.fragment,
        text = transfer.text;


    if (type == 'fragment') {
      change.insertFragment(fragment);
    }

    if (type == 'text' || type == 'html') {
      var state = change.state;
      var document = state.document,
          selection = state.selection,
          startBlock = state.startBlock;

      if (startBlock.isVoid) return;

      var defaultBlock = startBlock;
      var defaultMarks = document.getMarksAtRange(selection.collapseToStart());
      var frag = _slatePlainSerializer2.default.deserialize(text, { defaultBlock: defaultBlock, defaultMarks: defaultMarks }).document;
      change.insertFragment(frag);
    }
  }

  /**
   * On select.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onSelect(event, change, editor) {
    debug('onSelect', { event: event });

    var window = (0, _getWindow2.default)(event.target);
    var state = change.state;
    var document = state.document;

    var native = window.getSelection();

    // If there are no ranges, the editor was blurred natively.
    if (!native.rangeCount) {
      change.blur();
      return;
    }

    // Otherwise, determine the Slate selection from the native one.
    var range = (0, _findRange2.default)(native, state);
    if (!range) return;

    var _range = range,
        anchorKey = _range.anchorKey,
        anchorOffset = _range.anchorOffset,
        focusKey = _range.focusKey,
        focusOffset = _range.focusOffset;

    var anchorText = document.getNode(anchorKey);
    var focusText = document.getNode(focusKey);
    var anchorInline = document.getClosestInline(anchorKey);
    var focusInline = document.getClosestInline(focusKey);
    var focusBlock = document.getClosestBlock(focusKey);
    var anchorBlock = document.getClosestBlock(anchorKey);

    // COMPAT: If the anchor point is at the start of a non-void, and the
    // focus point is inside a void node with an offset that isn't `0`, set
    // the focus offset to `0`. This is due to void nodes <span>'s being
    // positioned off screen, resulting in the offset always being greater
    // than `0`. Since we can't know what it really should be, and since an
    // offset of `0` is less destructive because it creates a hanging
    // selection, go with `0`. (2017/09/07)
    if (anchorBlock && !anchorBlock.isVoid && anchorOffset == 0 && focusBlock && focusBlock.isVoid && focusOffset != 0) {
      range = range.set('focusOffset', 0);
    }

    // COMPAT: If the selection is at the end of a non-void inline node, and
    // there is a node after it, put it in the node after instead. This
    // standardizes the behavior, since it's indistinguishable to the user.
    if (anchorInline && !anchorInline.isVoid && anchorOffset == anchorText.text.length) {
      var block = document.getClosestBlock(anchorKey);
      var next = block.getNextText(anchorKey);
      if (next) range = range.moveAnchorTo(next.key, 0);
    }

    if (focusInline && !focusInline.isVoid && focusOffset == focusText.text.length) {
      var _block = document.getClosestBlock(focusKey);
      var _next = _block.getNextText(focusKey);
      if (_next) range = range.moveFocusTo(_next.key, 0);
    }

    range = range.normalize(document);
    change.select(range);
  }

  /**
   * Render.
   *
   * @param {Object} props
   * @param {State} state
   * @param {Editor} editor
   * @return {Object}
   */

  function render(props, state, editor) {
    var handlers = _eventHandlers2.default.reduce(function (obj, handler) {
      obj[handler] = editor[handler];
      return obj;
    }, {});

    return _react2.default.createElement(_content2.default, _extends({}, handlers, {
      autoCorrect: props.autoCorrect,
      autoFocus: props.autoFocus,
      className: props.className,
      children: props.children,
      editor: editor,
      readOnly: props.readOnly,
      role: props.role,
      schema: editor.getSchema(),
      spellCheck: props.spellCheck,
      state: state,
      style: props.style,
      tabIndex: props.tabIndex,
      tagName: props.tagName
    }));
  }

  /**
   * Add default rendering rules to the schema.
   *
   * @type {Object}
   */

  var schema = {
    rules: [{
      match: function match(obj) {
        return obj.kind == 'block' || obj.kind == 'inline';
      },
      render: _defaultNode2.default
    }, {
      match: function match(obj) {
        return obj.kind == 'block' && _slate.Text.isTextList(obj.nodes) && obj.text == '';
      },
      placeholder: _defaultPlaceholder2.default
    }]
  };

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onBeforeChange: onBeforeChange,
    onBeforeInput: onBeforeInput,
    onBlur: onBlur,
    onClick: onClick,
    onCopy: onCopy,
    onCut: onCut,
    onDragEnd: onDragEnd,
    onDragOver: onDragOver,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onInput: onInput,
    onKeyDown: onKeyDown,
    onPaste: onPaste,
    onSelect: onSelect,
    render: render,
    schema: schema
  };
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = AfterPlugin;