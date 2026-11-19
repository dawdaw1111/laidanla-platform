import {chromium} from '@playwright/test'
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1024,height:1000}})
await page.goto('http://127.0.0.1:5174/tasks');await page.locator('.square-card').first().waitFor();await page.evaluate(()=>document.fonts.ready)
console.log(JSON.stringify(await page.locator('body *').evaluateAll(elements=>elements.map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,cls:e.className,right:Math.round(r.right),width:Math.round(r.width),scroll:e.scrollWidth}}).filter(x=>x.right>1025||x.width>1025).slice(0,15))))
await browser.close()
