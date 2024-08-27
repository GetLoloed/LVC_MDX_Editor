import React from 'react'

const MarkdownEditor = ({ content, onContentChange }) => {
  return (
    <div className="h-full">
      <textarea
        className="w-full h-full p-2 border rounded resize-none"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Écrivez votre contenu Markdown ici..."
      />
    </div>
  )
}

export default MarkdownEditor