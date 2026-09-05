import { defineConfig } from '@rslib/core'

export default defineConfig({
  lib: [
    { dts: true, syntax: ['node 22'] },
    { format: 'cjs', syntax: ['node 22'] }
  ]
})
