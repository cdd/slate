'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _findDomNode = require('./find-dom-node');

var _findDomNode2 = _interopRequireDefault(_findDomNode);

var _findRange = require('./find-range');

var _findRange2 = _interopRequireDefault(_findRange);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get the target range from a DOM `event`.
 *
 * @param {Event} event
 * @param {State} state
 * @return {Range}
 */

function getEventRange(event, state) {
  if (event.nativeEvent) {
    event = event.nativeEvent;
  }

  var _event = event,
      x = _event.x,
      y = _event.y;

  if (x == null || y == null) return null;

  // Resolve a range from the caret position where the drop occured.
  var window = (0, _getWindow2.default)(event.target);
  var r = void 0;

  // COMPAT: In Firefox, `caretRangeFromPoint` doesn't exist. (2016/07/25)
  if (window.document.caretRangeFromPoint) {
    r = window.document.caretRangeFromPoint(x, y);
  } else {
    var position = window.document.caretPositionFromPoint(x, y);
    r = window.document.createRange();
    r.setStart(position.offsetNode, position.offset);
    r.setEnd(position.offsetNode, position.offset);
  }

  // Resolve a Slate range from the DOM range.
  var range = (0, _findRange2.default)(r, state);
  if (!range) return null;

  var document = state.document;

  var node = document.getNode(range.anchorKey);
  var parent = document.getParent(node.key);
  var el = (0, _findDomNode2.default)(parent);

  // If the drop target is inside a void node, move it into either the next or
  // previous node, depending on which side the `x` and `y` coordinates are
  // closest to.
  if (parent.isVoid) {
    var rect = el.getBoundingClientRect();
    var isPrevious = parent.kind == 'inline' ? x - rect.left < rect.left + rect.width - x : y - rect.top < rect.top + rect.height - y;

    range = isPrevious ? range.moveToEndOf(document.getPreviousText(node.key)) : range.moveToStartOf(document.getNextText(node.key));
  }

  return range;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = getEventRange;