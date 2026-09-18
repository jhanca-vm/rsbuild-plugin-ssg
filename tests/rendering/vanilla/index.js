import styles from '../styles/counter.module.css'
import '../styles/global.css'
import './counter?client'

export default `
  <html>
    <head>
      <title>vanilla</title>
    </head>
    <body>
      <h1>vanilla</h1>
      <button class="${styles.button}">Clicks: 0</button>
    </body>
  </html>
`
