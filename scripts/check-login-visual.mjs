import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
const browser=await chromium.launch({channel:'chrome',headless:true})
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message))
 for(const width of [1440,1024,390]){
  await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:5174/login');await page.evaluate(()=>document.fonts.ready)
  await page.locator('.login-fluid img').evaluate(img=>img.decode())
  assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=width)
  await page.screenshot({path:`../来单啦-精修版验收/登录修正-${width}.png`,fullPage:true})
 }
 await page.getByText('我已阅读并同意',{exact:true}).click();await page.getByRole('button',{name:/体验演示身份，无需填写手机号/}).click();await page.waitForURL('**/creator/orders')
 assert.deepEqual(errors,[]);console.log('登录页三个宽度渲染与演示登录通过')
}finally{await browser.close()}
