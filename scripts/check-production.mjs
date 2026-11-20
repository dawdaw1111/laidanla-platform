import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'

const pages = process.env.PAGES_TEST === '1'
const baseURL = process.env.PREVIEW_URL || (pages
  ? 'http://127.0.0.1:4174/laidanla-platform/'
  : 'http://127.0.0.1:4174/')
const urlFor = path => new URL(path, baseURL)
const server = process.env.PREVIEW_URL ? null : spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4174',
    '--strictPort', ...(pages ? ['--mode', 'pages'] : [])],
  { stdio: 'ignore', windowsHide: true },
)
let browser
try {
  let ready = false
  for (let i = 0; i < 40; i++) {
    try { ready = (await fetch(urlFor('preview.html'))).ok } catch {}
    if (ready) break
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  assert(ready, '生产预览服务未启动')
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(urlFor('preview.html').href)
  await page.locator('img').evaluateAll(images => images.forEach(img => { img.loading = 'eager' }))
  await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0))
  assert.equal(await page.locator('.card:visible').count(), 20)
  await page.getByRole('button', { name: '商家端', exact: true }).click()
  assert.equal(await page.locator('.card:visible').count(), 8)
  await page.getByRole('button', { name: '创作者端', exact: true }).click()
  assert.equal(await page.locator('.card:visible').count(), 5)
  await page.getByRole('button', { name: '全部页面', exact: true }).click()
  await page.screenshot({ path: '../来单啦-精修版验收/页面总览.png', fullPage: true })
  await page.getByRole('link', { name: /登录与身份选择/ }).click()
  await page.waitForURL(urlFor(pages ? '#/login' : 'login').href)
  assert((await page.reload()).ok(), 'The login deep link must return HTTP 200')
  await page.locator('main').first().waitFor()
  await page.goto(urlFor('review.html').href)
  await page.evaluate(()=>document.fonts.ready)
  assert(await page.evaluate(()=>document.fonts.check('400 14px Geist')), 'Review font did not load')
  await page.getByRole('tab', { name: '商家工作台', exact: true }).click()
  assert.match(await page.locator('#refined-link').getAttribute('href'), /merchant/)
  assert.equal(await page.locator('#original-link').isVisible(), !pages)
  assert.equal(await page.locator('#page-selector option').count(),20)
  for(let index=0;index<20;index++){
    await page.locator('#page-selector').selectOption(String(index))
    await Promise.all([page.locator('#refined-shot').evaluate(img=>img.decode()),page.locator('#original-shot').evaluate(img=>img.decode())])
    assert.match(await page.locator('#refined-shot').getAttribute('src'),new RegExp('-'+String(index).padStart(2,'0')+'\\.webp$'))
  }
  await page.locator('#page-selector').selectOption('1')

  await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0))
  await page.screenshot({path:'../来单啦-精修版验收/原版与精修对比.png',fullPage:true})
  for (const route of ['/login', '/merchant', '/creator/orders', '/tasks']) {
    await page.goto(urlFor(pages ? '#' + route : route.slice(1)).href)
    await page.locator('main').first().waitFor()
    assert.match(await page.title(), /来单啦/)
  }
  assert.deepEqual(errors, [])
  console.log('生产构建冒烟检查通过：20 个页面入口、角色筛选、直接路由，无运行时异常。')
} finally {
  if (browser) await browser.close()
  server?.kill()
}
