'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

var _schema = require('../models/schema');

var _schema2 = _interopRequireDefault(_schema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Normalize the document and selection with a `schema`.
 *
 * @param {Change} change
 * @param {Schema} schema
 */

Changes.normalize = function (change, schema) {
  change.normalizeDocument(schema);
};

/**
 * Normalize the document with a `schema`.
 *
 * @param {Change} change
 * @param {Schema} schema
 */

Changes.normalizeDocument = function (change, schema) {
  var state = change.state;
  var document = state.document;

  change.normalizeNodeByKey(document.key, schema);
};

/**
 * Normalize a `node` and its children with a `schema`.
 *
 * @param {Change} change
 * @param {Node|String} key
 * @param {Schema} schema
 */

Changes.normalizeNodeByKey = function (change, key, schema) {
  assertSchema(schema);

  // If the schema has no validation rules, there's nothing to normalize.
  if (!schema.hasValidators) return;

  var state = change.state;
  var document = state.document;

  var node = document.assertNode(key);
  normalizeNodeAndChildren(change, node, schema);
};

/**
 * Normalize a `node` and its children with a `schema`.
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Schema} schema
 */

function normalizeNodeAndChildren(change, node, schema) {
  if (node.kind == 'text') {
    normalizeNode(change, node, schema);
    return;
  }

  // We can't just loop the children and normalize them, because in the process
  // of normalizing one child, we might end up creating another. Instead, we
  // have to normalize one at a time, and check for new children along the way.
  // PERF: use a mutable array here instead of an immutable stack.
  var keys = node.nodes.toArray().map(function (n) {
    return n.key;
  });

  // While there is still a child key that hasn't been normalized yet...

  var _loop = function _loop() {
    var ops = change.operations.length;
    var key = void 0;

    // PERF: use a mutable set here since we'll be add to it a lot.
    var set = new _immutable.Set().asMutable();

    // Unwind the stack, normalizing every child and adding it to the set.
    while (key = keys[0]) {
      var child = node.getChild(key);
      normalizeNodeAndChildren(change, child, schema);
      set.add(key);
      keys.shift();
    }

    // Turn the set immutable to be able to compare against it.
    set = set.asImmutable();

    // PERF: Only re-find the node and re-normalize any new children if
    // operations occured that might have changed it.
    if (change.operations.length != ops) {
      node = refindNode(change, node);

      // Add any new children back onto the stack.
      node.nodes.forEach(function (n) {
        if (set.has(n.key)) return;
        keys.unshift(n.key);
      });
    }
  };

  while (keys.length) {
    _loop();
  }

  // Normalize the node itself if it still exists.
  if (node) {
    normalizeNode(change, node, schema);
  }
}

/**
 * Re-find a reference to a node that may have been modified or removed
 * entirely by a change.
 *
 * @param {Change} change
 * @param {Node} node
 * @return {Node}
 */

function refindNode(change, node) {
  var state = change.state;
  var document = state.document;

  return node.kind == 'document' ? document : document.getDescendant(node.key);
}

/**
 * Normalize a `node` with a `schema`, but not its children.
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Schema} schema
 */

function normalizeNode(change, node, schema) {
  var max = schema.rules.length;
  var iterations = 0;

  function iterate(t, n) {
    var failure = n.validate(schema);
    if (!failure) return;

    // Run the `normalize` function for the rule with the invalid value.
    var value = failure.value,
        rule = failure.rule;

    rule.normalize(t, n, value);

    // Re-find the node reference, in case it was updated. If the node no longer
    // exists, we're done for this branch.
    n = refindNode(t, n);
    if (!n) return;

    // Increment the iterations counter, and check to make sure that we haven't
    // exceeded the max. Without this check, it's easy for the `validate` or
    // `normalize` function of a schema rule to be written incorrectly and for
    // an infinite invalid loop to occur.
    iterations++;

    if (iterations > max) {
      throw new Error('A schema rule could not be validated after sufficient iterations. This is usually due to a `rule.validate` or `rule.normalize` function of a schema being incorrectly written, causing an infinite loop.');
    }

    // Otherwise, iterate again.
    iterate(t, n);
  }

  iterate(change, node);
}

/**
 * Assert that a `schema` exists.
 *
 * @param {Schema} schema
 */

function assertSchema(schema) {
  if (_schema2.default.isSchema(schema)) {
    return;
  } else if (schema == null) {
    throw new Error('You must pass a `schema` object.');
  } else {
    throw new Error('You passed an invalid `schema` object: ' + schema + '.');
  }
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;