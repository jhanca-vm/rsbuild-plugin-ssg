import { renderToString } from 'preact-render-to-string'

import Counter from './counter'

import '../styles/global.css'
import './island-preact?client'

export default function Page() {
  return (
    <html>
      <head>
        <title>preact</title>
      </head>
      <body>
        <h1>preact</h1>
        <island-preact
          data-name="counter"
          dangerouslySetInnerHTML={{ __html: renderToString(<Counter />) }}
        />
      </body>
    </html>
  )
}
