import { expect, test } from '@playwright/test'
import { createRsbuild } from '@rsbuild/core'
import { pluginSsg } from 'rsbuild-plugin-ssg'

test('should resolve directory routes', async ({ page }) => {
  const rsbuild = await createRsbuild({
    config: {
      plugins: [
        pluginSsg({ basePath: 'tests/routing/pages', pattern: '**/*.ts' })
      ],
      logLevel: 'warn'
    }
  })

  const { server } = await rsbuild.startDevServer()

  const url = 'http://localhost:3000'

  try {
    await expect(await page.request.get(url)).toBeOK()

    await expect(await page.request.get(`${url}/about`)).toBeOK()

    await expect(await page.request.get(`${url}/blog`)).toBeOK()

    await expect(await page.request.get(`${url}/blog/post`)).toBeOK()
  } finally {
    await server.close()
  }
})
