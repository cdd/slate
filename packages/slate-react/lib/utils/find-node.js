'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _findClosestNode = require('./find-closest-node');

var _findClosestNode2 = _interopRequireDefault(_findClosestNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Find a Slate node from a DOM `element`.
 *
 * @param {Element} element
 * @return {Node|Null}
 */

function findNode(element, state) {
  var closest = (0, _findClosestNode2.default)(element, '[data-key]');
  if (!closest) return null;

  var key = closest.getAttribute('data-key');
  if (!key) return null;

  var node = state.document.getNode(key);
  return node || null;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = findNode;