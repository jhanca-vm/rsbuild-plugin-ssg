import { renderToString } from 'react-dom/server'

import Counter from './counter'

import '../styles/global.css'
import './island-react?client'

export default function Page() {
  return (
    <html>
      <head>
        <title>react</title>
      </head>
      <body>
        <h1>react</h1>
        <island-react
          data-name="counter"
          dangerouslySetInnerHTML={{ __html: renderToString(<Counter />) }}
        ></island-react>
      </body>
    </html>
  )
}
