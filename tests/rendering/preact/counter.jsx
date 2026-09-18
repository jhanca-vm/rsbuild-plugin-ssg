import { useState } from 'preact/hooks'

import styles from '../styles/counter.module.css'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button class={styles.button} onClick={() => setCount(count + 1)}>
      Clicks: {count}
    </button>
  )
}
