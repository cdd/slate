
import Plain from 'slate-plain-serializer'
import { Editor } from 'slate-react'

import React from 'react'

/**
 * The plain text example.
 *
 * @type {Component}
 */

class PlainText extends React.Component {

  /**
   * Deserialize the initial editor state.
   *
   * @type {Object}
   */

  state = {
    state: Plain.deserialize('This is editable plain text, just like a <textarea>!')
  }

  /**
   * On change.
   *
   * @param {Change} change
   */

  onChange = ({ state }) => {
    this.setState({ state })
  }

  /**
   * Render the editor.
   *
   * @return {Component} component
   */

  render() {
    return (
      <div className="editor">
        <Editor
          placeholder="Enter some plain text..."
          state={this.state.state}
          onChange={this.onChange}
        />
      </div>
    )
  }

}

/**
 * Export.
 */

export default PlainText
