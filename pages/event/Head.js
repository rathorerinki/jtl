import Head from 'next/head'
import React, { useEffect } from 'react'

export default function HeadPage(props) {
  return (
    <>
      {props.content && props.title && (
        <Head>
          <title>{props.title}</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <meta charSet='utf-8' />

          {/* <!-- Site Name, Title, and Description to be displayed --> */}
          <meta property='og:title' content={props.title} key='ogtitle' />
          <meta property='og:type' content={props.title} key='ogtype' />
          <meta name='description' content={props.content} key='description' />
          <meta property='og:content' content={props.content} key='ogConent' />

          {/* Image to display */}
          <meta property='og:image:width' content='150' />
          <meta property='og:image:height' content='150' />
          <meta property='og:image' itemProp='image' content={props.photo} key='ogImage' />
          <meta property='og:image:alt' content='Display Picture' />

          <meta property='twitter:card' content={props.title} key='twcard' />
          <meta property='twitter:site' content='https://event.gojumptheline.io/' key='twurl' />
          <meta property='twitter:title' content={props.title} key='twtitle' />
          <meta property='twitter:description' content={props.content} key='twcontent' />
          <meta property='twitter:image' content={props.photo} key='twimage' />
        
        </Head>
      )}
    </>
  )
}
