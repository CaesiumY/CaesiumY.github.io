import React from 'react'
import { Link } from 'gatsby'
import { TARGET_CLASS } from '../../utils/visible'

import './index.scss'

export const ThumbnailItem = ({ node }) => (
  <Link className={`thumbnail ${TARGET_CLASS}`} to={node.fields.slug}>
    <div key={node.fields.slug}>
      {node.frontmatter.thumbnail && (
        <div className="image-container">
          <img
            src={node.frontmatter.thumbnail.publicURL}
            alt={node.frontmatter.title || node.fields.slug}
          />
        </div>
      )}

      <h3>{node.frontmatter.title || node.fields.slug}</h3>
      <p>
        <span className="thumbnail-category">
          {node.frontmatter.category || ''}{' '}
        </span>
        <span>{node.frontmatter.date || ''}</span>
      </p>
      <p dangerouslySetInnerHTML={{ __html: node.excerpt }} />
    </div>
  </Link>
)
