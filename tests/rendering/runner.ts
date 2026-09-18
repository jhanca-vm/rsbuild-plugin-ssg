import process from 'node:process'

import { createRsbuild, loadConfig } from '@rsbuild/core'

const target = process.argv[2]
const path = `tests/rendering/${target}/config.js`

try {
  const config = await loadConfig({ path })

  config.content.logLevel = 'warn'

  const rsbuild = await createRsbuild({ config })

  await rsbuild.startDevServer()

  process.send?.('ready')
} catch (error) {
  console.error(error)
  process.exit(1)
}
