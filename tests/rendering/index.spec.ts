import { fork, type ChildProcess } from 'node:child_process'
import path from 'node:path'

import { expect, test } from '@playwright/test'

const targets = ['vanilla', 'react', 'vue', 'preact', 'svelte']

for (const target of targets) {
  test.describe(target, () => {
    let server: ChildProcess

    test.beforeAll(async () => {
      server = fork(path.resolve(import.meta.dirname, 'runner.ts'), [target], {
        execPath: process.execPath,
        execArgv: ['--import', 'tsx'],
        stdio: 'inherit'
      })

      await new Promise<void>((resolve, reject) => {
        server.on('message', (message) => {
          if (message === 'ready') resolve()
        })

        server.on('exit', (code) => {
          if (code) reject()
        })
      })
    })

    test.beforeEach(({ page }) => page.goto('http://localhost:3000'))

    test.afterAll(() => server.kill())

    test('should render static HTML', async ({ page }) => {
      await expect(page).toHaveTitle(target)

      await expect(page.getByRole('heading', { name: target })).toBeVisible()
    })

    test('should inject styles', async ({ page }) => {
      await expect(page.getByRole('heading')).toHaveCSS('font-weight', '600')

      await expect(page.getByRole('button')).toHaveCSS(
        'background-color',
        'rgb(245, 222, 179)'
      )
    })

    test('should run client scripts', async ({ page }) => {
      await page.getByRole('button', { name: 'Clicks: 0' }).click()

      await expect(page.getByRole('button')).toHaveText(/Clicks: 1/)
    })
  })
}
