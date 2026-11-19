import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
const browser=await chromium.launch({channel:'chrome',headless:true})
try{
 const page=await browser.newPage({viewport:{width:390,height:1000}})
 await page.goto('http://127.0.0.1:5174/');await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0))
 assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=390)
 await page.screenshot({path:'../来单啦-精修版验收/响应式页面/00-首页-390.png',fullPage:true})
 await page.goto('http://127.0.0.1:5174/login');await page.getByText('我已阅读并同意',{exact:true}).click();await page.getByRole('button',{name:/体验演示身份/}).click();await page.waitForURL('**/creator/orders')
 await page.evaluate(()=>{const key='laidanla-refined-demo-v1';const data=JSON.parse(localStorage.getItem(key));data.session.nickname='测试很长昵称测试很长昵称测试很长昵称测试';localStorage.setItem(key,JSON.stringify(data))})
 await page.reload();await page.locator('.header-account').waitFor();assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=390)
 console.log('Mobile hero line break and signed-in header with a long nickname pass.')
}finally{await browser.close()}
