
import { Editor } from 'slate-react'
import { State } from 'slate'

import React from 'react'
import initialState from './state.json'

/**
 * Check list item.
 *
 * @type {Component}
 */

class CheckListItem extends React.Component {

  /**
   * On change, set the new checked value on the block.
   *
   * @param {Event} event
   */

  onChange = (event) => {
    const checked = event.target.checked
    const { editor, node } = this.props
    editor.change(c => c.setNodeByKey(node.key, { data: { checked }}))
  }

  /**
   * Render a check list item, using `contenteditable="false"` to embed the
   * checkbox right next to the block's text.
   *
   * @return {Element}
   */

  render() {
    const { attributes, children, node } = this.props
    const checked = node.data.get('checked')
    return (
      <div
        className={`check-list-item ${checked ? 'checked' : ''}`}
        contentEditable={false}
        {...attributes}
      >
        <span>
          <input
            type="checkbox"
            checked={checked}
            onChange={this.onChange}
          />
        </span>
        <span contentEditable suppressContentEditableWarning>
          {children}
        </span>
      </div>
    )
  }

}

/**
 * The rich text example.
 *
 * @type {Component}
 */

class CheckLists extends React.Component {

  /**
   * Deserialize the initial editor state.
   *
   * @type {Object}
   */

  state = {
    state: State.fromJSON(initialState)
  }

  /**
   * On change, save the new state.
   *
   * @param {Change} change
   */

  onChange = ({ state }) => {
    this.setState({ state })
  }

  /**
   * On key down...
   *
   * If enter is pressed inside of a check list item, make sure that when it
   * is split the new item starts unchecked.
   *
   * If backspace is pressed when collapsed at the start of a check list item,
   * then turn it back into a paragraph.
   *
   * @param {Event} event
   * @param {Change} change
   * @return {State|Void}
   */

  onKeyDown = (event, change) => {
    const { state } = change

    if (
      event.key == 'Enter' &&
      state.startBlock.type == 'check-list-item'
    ) {
      change.splitBlock().setBlock({ data: { checked: false }})
      return true
    }

    if (
      event.key == 'Backspace' &&
      state.isCollapsed &&
      state.startBlock.type == 'check-list-item' &&
      state.selection.startOffset == 0
    ) {
      change.setBlock('paragraph')
      return true
    }
  }

  /**
   * Render.
   *
   * @return {Element}
   */

  render() {
    return (
      <div>
        <div className="editor">
          <Editor
            spellCheck
            placeholder="Get to work..."
            state={this.state.state}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            renderNode={this.renderNode}
          />
        </div>
      </div>
    )
  }

  /**
   * Render a Slate node.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderNode = (props) => {
    switch (props.node.type) {
      case 'check-list-item': return <CheckListItem {...props} />
    }
  }

}

/**
 * Export.
 */

export default CheckLists
