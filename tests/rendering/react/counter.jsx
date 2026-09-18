import { useState } from 'react'

import styles from '../styles/counter.module.css'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button className={styles.button} onClick={() => setCount(count + 1)}>
      Clicks: {count}
    </button>
  )
}
