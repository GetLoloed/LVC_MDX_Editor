import React from 'react'
import showdown from 'showdown'

const converter = new showdown.Converter()

const MarkdownPreview = ({ content }) => {
  const htmlContent = converter.makeHtml(content)

  return (
    <div
      className="markdown-preview h-full p-4 border rounded overflow-auto"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}

export default MarkdownPreview