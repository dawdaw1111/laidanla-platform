import { chromium } from 'playwright'
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:1000}})
p.on('pageerror',e=>console.log('PAGEERROR',e.message))
await p.goto('http://127.0.0.1:5174/login');await p.getByText('我已阅读并同意',{exact:true}).click({timeout:5000});console.log('checkbox',await p.getByRole('checkbox').isChecked());console.log('button',await p.getByRole('button',{name:/体验演示身份/}).isEnabled());await p.getByRole('button',{name:/体验演示身份/}).click({timeout:5000});await p.waitForTimeout(1500);console.log('url',p.url());console.log('state',await p.evaluate(()=>localStorage.getItem('laidanla-refined-demo-v1')));await b.close()
