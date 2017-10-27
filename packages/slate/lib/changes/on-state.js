'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _state = require('../models/state');

var _state2 = _interopRequireDefault(_state);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Set `properties` on the state.
 *
 * @param {Change} change
 * @param {Object|State} properties
 */

Changes.setState = function (change, properties) {
  properties = _state2.default.createProperties(properties);
  var state = change.state;


  change.applyOperation({
    type: 'set_state',
    properties: properties,
    state: state
  });
};

/**
 * Deprecated.
 */

Changes.setData = function (change, data) {
  _slateDevLogger2.default.deprecate('0.26.0', 'The `change.setData` method is deprecated, use `change.setState` instead.');
  change.setState({ data: data });
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;