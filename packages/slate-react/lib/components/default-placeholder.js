'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _slatePropTypes = require('slate-prop-types');

var _slatePropTypes2 = _interopRequireDefault(_slatePropTypes);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Default placeholder.
 *
 * @type {Component}
 */

var DefaultPlaceholder = function (_React$Component) {
  _inherits(DefaultPlaceholder, _React$Component);

  function DefaultPlaceholder() {
    _classCallCheck(this, DefaultPlaceholder);

    return _possibleConstructorReturn(this, (DefaultPlaceholder.__proto__ || Object.getPrototypeOf(DefaultPlaceholder)).apply(this, arguments));
  }

  _createClass(DefaultPlaceholder, [{
    key: 'render',


    /**
     * Render.
     *
     * @return {Element}
     */

    value: function render() {
      var _props = this.props,
          editor = _props.editor,
          state = _props.state;

      if (!editor.props.placeholder) return null;
      if (state.document.getBlocks().size > 1) return null;

      var style = {
        pointerEvents: 'none',
        display: 'inline-block',
        width: '0',
        maxWidth: '100%',
        whiteSpace: 'nowrap',
        opacity: '0.333'
      };

      return _react2.default.createElement(
        'span',
        { contentEditable: false, style: style },
        editor.props.placeholder
      );
    }

    /**
     * Property types.
     *
     * @type {Object}
     */

  }]);

  return DefaultPlaceholder;
}(_react2.default.Component);

/**
 * Export.
 *
 * @type {Component}
 */

DefaultPlaceholder.propTypes = {
  editor: _propTypes2.default.object.isRequired,
  isSelected: _propTypes2.default.bool.isRequired,
  node: _slatePropTypes2.default.node.isRequired,
  parent: _slatePropTypes2.default.node.isRequired,
  readOnly: _propTypes2.default.bool.isRequired,
  state: _slatePropTypes2.default.state.isRequired };
exports.default = DefaultPlaceholder;