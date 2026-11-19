import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const root='../来单啦-精修版验收'
await fs.mkdir(root,{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true})
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message))
 for(const width of [1440,1024,390]){
  await page.setViewportSize({width,height:1000})
  for(const [route,name] of [['/login','登录页'],['/merchant','商家工作台']]){
   await page.goto('http://127.0.0.1:5174'+route);await page.locator('main').first().waitFor();await page.evaluate(()=>document.fonts.ready);assert(await page.evaluate(()=>document.fonts.check('400 14px Geist')),'Geist font did not load')
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0))
   assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=width,name+' horizontal overflow')
   await page.screenshot({path:root+'/'+name+'-'+width+'.png',fullPage:true})
  }
 }
 assert.deepEqual(errors,[]);console.log('Two refined pages render correctly at 1440 / 1024 / 390px, with no runtime errors.')
}finally{await browser.close()}
