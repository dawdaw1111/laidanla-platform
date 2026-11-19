import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const root=path.resolve('../来单啦-精修版验收')
const routes=JSON.parse(await fs.readFile(path.join(root,'pages.json'),'utf8'))
const base=process.env.PREVIEW_URL||'http://127.0.0.1:5174'
const output=path.join(root,'响应式页面')
await fs.mkdir(output,{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true})
const errors=[]
async function ready(page,label,width){
  await page.locator('main').first().waitFor()
  await page.evaluate(()=>document.fonts.ready)
  await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0))
  assert(await page.evaluate(()=>document.fonts.check('400 14px Geist')),label+': font')
  const scrollWidth=await page.evaluate(()=>document.documentElement.scrollWidth)
  assert(scrollWidth<=width+1,label+': '+width+'px overflow '+scrollWidth)
}
try{
  const page=await browser.newPage()
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto(base+'/publish/requirements')
  await page.getByRole('button',{name:'填入示例需求',exact:true}).click()
  for(const width of [1440,1024,390]){
    await page.setViewportSize({width,height:1000})
    for(const [name,route] of routes){
      await page.goto(base+route)
      await ready(page,name,width)
      await page.screenshot({path:path.join(output,name+'-'+width+'.png'),fullPage:true})
    }
  }
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:1000})
    for(const category of ['商品主图','模特换装','短视频','详情页','营销文案']){
      await page.goto(base+'/publish/template')
      await page.locator('.template-card').filter({hasText:category}).click()
      await page.getByRole('button',{name:'下一步，填写需求',exact:true}).click()
      await ready(page,category,width)
      await page.screenshot({path:path.join(output,'需求表单-'+category+'-'+width+'.png'),fullPage:true})
    }
  }
  await page.setViewportSize({width:1440,height:1000})
  for(const route of ['/messages?chat=official','/messages?chat=support']){
    await page.goto(base+route)
    await ready(page,route,1440)
    assert.equal(await page.locator('.message-context').count(),0)
  }
  assert.deepEqual(errors,[])
  console.log('Visual QA passed: 20 pages × 3 widths, 5 template forms × 2 widths, and system / support conversations.')
}finally{await browser.close()}
