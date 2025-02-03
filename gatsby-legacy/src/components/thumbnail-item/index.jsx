import React from 'react'
import { Link } from 'gatsby'
import { TARGET_CLASS } from '../../utils/visible'
import Image from 'gatsby-image'

import './index.scss'

export const ThumbnailItem = ({ node }) => (
  <Link className={`thumbnail ${TARGET_CLASS}`} to={node.fields.slug}>
    <div key={node.fields.slug}>
      {node.frontmatter.thumbnail && (
        <div className="image-container">
          <Image
            className="thumbnail-image"
            fluid={node.frontmatter.thumbnail.childImageSharp.fluid} // TODO: change img tag into gatsby supported image tag & find out difference between fixed & fluid
            alt={node.frontmatter.title || node.fields.slug}
            title={node.frontmatter.title || node.fields.slug}
            style={{
              position: 'absolute',
            }}
          />
        </div>
      )}

      <p className="thumbnail-category">{node.frontmatter.category || ''}</p>
      <h3>{node.frontmatter.title || node.fields.slug}</h3>
      <p>{node.frontmatter.date || ''}</p>
      <p dangerouslySetInnerHTML={{ __html: node.excerpt }} />
    </div>
  </Link>
)
