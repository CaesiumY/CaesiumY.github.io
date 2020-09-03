import React from 'react'

export const PostContainer = ({ html }) => (
  <div
    style={{ wordBreak: 'keep-all' }}
    dangerouslySetInnerHTML={{ __html: html }}
  />
)
