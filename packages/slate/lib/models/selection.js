'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _range = require('./range');

var _range2 = _interopRequireDefault(_range);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Deprecated.
 */

var Selection = {
  create: function create() {
    _slateDevLogger2.default.deprecate('0.27.0', 'The `Selection` model has been renamed to `Range`.');
    return _range2.default.create.apply(_range2.default, arguments);
  },
  createList: function createList() {
    _slateDevLogger2.default.deprecate('0.27.0', 'The `Selection` model has been renamed to `Range`.');
    return _range2.default.createList.apply(_range2.default, arguments);
  },
  createProperties: function createProperties() {
    _slateDevLogger2.default.deprecate('0.27.0', 'The `Selection` model has been renamed to `Range`.');
    return _range2.default.createProperties.apply(_range2.default, arguments);
  },
  fromJSON: function fromJSON() {
    _slateDevLogger2.default.deprecate('0.27.0', 'The `Selection` model has been renamed to `Range`.');
    return _range2.default.fromJSON.apply(_range2.default, arguments);
  },
  fromJS: function fromJS() {
    _slateDevLogger2.default.deprecate('0.27.0', 'The `Selection` model has been renamed to `Range`.');
    return _range2.default.fromJS.apply(_range2.default, arguments);
  },
  isSelection: function isSelection() {
    _slateDevLogger2.default.deprecate('0.27.0', 'The `Selection` model has been renamed to `Range`.');
    return _range2.default.isRange.apply(_range2.default, arguments);
  }
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Selection;