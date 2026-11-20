import { test,expect } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
const appRoute = route => process.env.PAGES_TEST === '1' ? './#' + route : route
const shotDir=path.resolve('../来单啦-精修版验收')
async function login(page,role='creator'){
 await page.goto(appRoute(`/login?role=${role}`))
 await page.getByText('我已阅读并同意',{exact:true}).click()
 await page.getByRole('button',{name:/体验演示身份，无需填写手机号/}).click()
 await expect(page).not.toHaveURL(/\/login/)
}
async function certify(page,kind='personal'){
 await page.goto(appRoute(`/verification?tab=${kind}`))
 await page.getByRole('button',{name:'填入演示信息'}).click()
 await page.getByText('我确认正在使用虚构演示资料，不提交真实身份信息。',{exact:true}).click()
 await page.getByRole('button',{name:'提交认证（演示）',exact:true}).click()
 await page.getByRole('button',{name:'体验认证通过状态'}).click()
 await page.getByRole('button',{name:'确认',exact:true}).click()
 await expect(page.getByRole('heading',{name:'演示认证已通过'})).toBeVisible()
}
async function saved(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('laidanla-refined-demo-v1')))}

test('全部页面：桌面渲染、刷新、图片与控制台检查，并保存实际截图',async({page})=>{
 test.setTimeout(240000)
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await fs.mkdir(shotDir,{recursive:true})
 await page.goto(appRoute('/publish/requirements'));await page.getByRole('button',{name:'填入示例需求'}).click()
 const pages=[['00-首页','/'],['01-任务广场','/tasks'],['02-任务详情','/tasks/square-1'],['03-登录与身份选择','/login'],['04-发布任务-选择模板','/publish/template'],['05-发布任务-填写需求','/publish/requirements'],['06-发布任务-托管赏金','/publish/payment'],['07-商家工作台','/merchant'],['08-商家任务管理','/merchant/tasks'],['09-投标管理','/merchant/bids'],['10-作品验收','/merchant/review/OD20261118002'],['11-创作者订单','/creator/orders'],['12-订单详情与交付','/creator/orders/OD20261118001'],['13-创作者钱包','/creator/wallet'],['14-商家财务管理','/merchant/finance'],['15-消息中心','/messages'],['16-个人中心','/profile'],['17-身份认证','/verification?tab=business'],['18-提交投标','/tasks/square-8/bid'],['19-我的投标','/creator/bids']]
 for(const [name,url] of pages){
  await page.goto(appRoute(url));await page.locator('main').first().waitFor();await page.evaluate(()=>document.fonts.ready)
  await expect(page.locator('body')).not.toContainText('Failed to resolve component')
  await expect(page).toHaveTitle(/来单啦/)
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete))
  const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.naturalWidth).map(i=>i.src))
  expect(broken,`${name} 破损图片`).toEqual([])
  expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${name} 横向溢出`).toBeLessThanOrEqual(1441)
  await page.screenshot({path:path.join(shotDir,`${name}.png`),fullPage:true})
 }
 expect(errors).toEqual([])
 await fs.writeFile(path.join(shotDir,'pages.json'),JSON.stringify(pages,null,2))
})

test('窄屏与中屏：全部新增页面无整页横向溢出',async({page})=>{
 test.setTimeout(180000)
 const routes=['/tasks/square-1','/login','/publish/template','/publish/requirements','/publish/payment','/merchant','/merchant/tasks','/merchant/bids','/merchant/review/OD20261118002','/creator/orders','/creator/orders/OD20261118001','/creator/wallet','/merchant/finance','/messages','/profile','/verification','/tasks/square-8/bid','/creator/bids']
 for(const width of [1024,390]){await page.setViewportSize({width,height:900});for(const url of routes){await page.goto(appRoute(url));await page.locator('main').first().waitFor();await page.waitForTimeout(100);expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${width}px ${url}`).toBeLessThanOrEqual(width+1)}}
 await page.goto(appRoute('/merchant'));await page.screenshot({path:path.join(shotDir,'mobile-商家工作台.png'),fullPage:true})
})

test('商家：发布表单校验、草稿恢复、模拟托管与上架',async({page})=>{
 await login(page,'merchant');await certify(page,'business')
 await page.goto(appRoute('/publish/requirements'))
 await page.getByRole('button',{name:/下一步，托管赏金/}).click()
 await expect(page.getByText('任务标题须为 5–50 字')).toBeVisible()
 await page.getByRole('button',{name:'填入示例需求'}).click()
 await page.getByRole('button',{name:'保存草稿',exact:true}).click()
 await page.reload();await expect(page.getByRole('textbox',{name:'任务标题'})).toHaveValue(/护肤新品/)
 await page.getByRole('button',{name:/下一步，托管赏金/}).click();await expect(page).toHaveURL(/publish\/payment/)
 await page.getByRole('button',{name:/模拟支付，体验后续流程/}).click()
 await page.getByRole('button',{name:'确认',exact:true}).click()
 await expect(page.getByRole('heading',{name:'模拟托管完成，任务正在审核'})).toBeVisible()
 const data=await saved(page);expect(data.tasks[0].status).toBe('审核中');expect(data.tasks[0].cents).toBe(60000)
 await page.getByRole('button',{name:/查看我的任务/}).click()
 await page.getByRole('tab',{name:/审核中/}).click()
 await page.getByRole('button',{name:'模拟审核通过'}).first().click();await page.getByRole('button',{name:'确认',exact:true}).click()
 expect((await saved(page)).tasks[0].status).toBe('招募中')
 await page.goto(appRoute('/tasks'));await expect(page.locator('.square-card').first()).toContainText('护肤新品')
})

test('创作者交付 → 商家驳回 → 重新交付 → 验收结算，金额不重复入账',async({page})=>{
 await login(page)
 await page.goto(appRoute('/creator/orders/OD20261118001'))
 const submit=page.getByRole('button',{name:'提交作品（演示）',exact:true});await expect(submit).toBeDisabled()
 await page.getByRole('button',{name:'使用示例作品'}).click();await page.getByText('我承诺作品为 AI 辅助生成并经人工精修，无侵权内容，同意平台标识规范。',{exact:true}).click();await submit.click();await page.getByRole('button',{name:'确认',exact:true}).click()
 expect((await saved(page)).orders.find(o=>o.id==='OD20261118001').status).toBe('待验收')
 await page.goto(appRoute('/profile'));await page.getByRole('button',{name:'切换为商家'}).click();await page.getByRole('button',{name:'确认',exact:true}).click()
 await page.goto(appRoute('/merchant/review/OD20261118001'));await page.getByRole('button',{name:'驳回并说明原因'}).click()
 await page.getByRole('button',{name:'确认驳回'}).click();await expect(page.getByText('驳回原因须至少 10 字')).toBeVisible()
 await page.getByPlaceholder('请具体说明修改位置与期望效果，至少 10 字').fill('请进一步提高背景明度，并且保留包装文字细节。')
 await page.getByRole('button',{name:'确认驳回'}).click()
 let o=(await saved(page)).orders.find(o=>o.id==='OD20261118001');expect(o.status).toBe('待交付');expect(o.remainingRevisions).toBe(0);expect(o.version).toBe(3)
 await page.goto(appRoute('/profile'));await page.getByRole('button',{name:'切换为创作者'}).click();await page.getByRole('button',{name:'确认',exact:true}).click()
 await page.goto(appRoute('/creator/orders/OD20261118001'));await page.getByRole('button',{name:'使用示例作品'}).click();await page.getByText('我承诺作品为 AI 辅助生成并经人工精修，无侵权内容，同意平台标识规范。',{exact:true}).click();await page.getByRole('button',{name:'提交作品（演示）',exact:true}).click();await page.getByRole('button',{name:'确认',exact:true}).click()
 await page.goto(appRoute('/profile'));await page.getByRole('button',{name:'切换为商家'}).click();await page.getByRole('button',{name:'确认',exact:true}).click()
 await page.goto(appRoute('/merchant/review/OD20261118001'));await page.getByRole('button',{name:'验收通过',exact:true}).click();await expect(page.getByText(/创作者所得 ¥510.00/)).toBeVisible();await page.getByRole('button',{name:'确认',exact:true}).click()
 let data=await saved(page);expect(data.balance).toBe(289000);expect(data.orders.find(o=>o.id==='OD20261118001').status).toBe('已完成');await expect(page.getByRole('button',{name:'验收通过',exact:true})).toBeDisabled()
 await page.reload();expect((await saved(page)).balance).toBe(289000)
})

test('创作者：报价校验、单次投标、收益计算与记录',async({page})=>{
 await login(page);await certify(page)
 await page.goto(appRoute('/tasks/square-8/bid'));await page.getByRole('button',{name:'提交投标',exact:true}).click();await expect(page.getByText('请填写 20–500 字方案说明')).toBeVisible()
 await page.getByRole('textbox',{name:'方案说明'}).fill('我会先统一模特与自然光线，再匹配服装细节，保证材质与版型准确，并按时完成交付。')
 await page.getByRole('button',{name:'提交投标',exact:true}).click();await expect(page).toHaveURL(/creator\/bids/)
 expect((await saved(page)).bids.length).toBe(1)
 await page.goto(appRoute('/tasks/square-8/bid'));await expect(page.getByRole('button',{name:'你已提交投标'})).toBeDisabled()
})

test('钱包：实名、绑卡、最低金额、余额扣减及每日一次限制',async({page})=>{
 await login(page);await certify(page)
 await page.goto(appRoute('/creator/wallet'));await page.getByRole('button',{name:'绑定',exact:true}).click();await page.getByRole('button',{name:'使用这张演示卡'}).click()
 const amount=page.locator('.el-input-number input');await amount.fill('50');await amount.blur();await page.getByRole('button',{name:'确认提现（演示）'}).click();await expect(page.getByText('提现金额须不低于 ¥100 且不超过可提现余额')).toBeVisible()
 await amount.fill('1000');await amount.blur();await page.getByRole('button',{name:'确认提现（演示）'}).click();await page.getByRole('button',{name:'确认',exact:true}).click()
 const data=await saved(page);expect(data.balance).toBe(138000);expect(data.withdrawals).toHaveLength(1);expect(data.frozen).toBe(151000)
 await expect(page.getByRole('button',{name:'今日已申请提现'})).toBeDisabled()
})

test('消息：会话切换、消息保留、敏感联系方式拦截及搜索空态',async({page})=>{
 await login(page);await page.goto(appRoute('/messages'))
 const input=page.getByRole('textbox',{name:'消息内容'});await input.fill('收到，我会在今天完成光影调整。');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.locator('.chat-scroll')).toContainText('收到，我会在今天完成光影调整。')
 await input.fill('请加微私下联系');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.locator('.chat-scroll')).toContainText('消息已屏蔽')
 await page.reload();await expect(page.locator('.chat-scroll')).toContainText('收到，我会在今天完成光影调整。')
 await page.getByRole('textbox',{name:'搜索会话'}).fill('不存在的会话');await expect(page.getByText('没有找到会话')).toBeVisible()
 await page.goto(appRoute('/messages?role=merchant&chat=creator'));await page.getByRole('button',{name:'查看订单',exact:true}).first().click();await expect(page).toHaveURL(/merchant\/review\/OD20261118001$/)
})

test('上传：实际图片预览、删除与格式拒绝',async({page})=>{
 await page.goto(appRoute('/publish/requirements'))
 await page.locator('input[type=file]').setInputFiles(path.resolve('public/assets/pages/delivery-1.webp'))
 await expect(page.locator('.upload-preview')).toHaveCount(1)
 await expect(page.locator('.upload-preview img')).toBeVisible()
 await page.getByRole('button',{name:/移除delivery-1.webp/}).click();await expect(page.locator('.upload-preview')).toHaveCount(0)
 await page.locator('input[type=file]').setInputFiles({name:'not-allowed.exe',mimeType:'application/octet-stream',buffer:Buffer.from('test')})
 await expect(page.getByText('文件格式不支持，请选择图片、视频或文档压缩包')).toBeVisible();await expect(page.locator('.upload-preview')).toHaveCount(0)
})

test('路由：任务广场原版、首页通用导航、未知任务与旧 Taste 链接',async({page})=>{
 await page.goto(appRoute('/'));const home=await page.locator('.header').evaluate(e=>({height:getComputedStyle(e).height,font:getComputedStyle(e.querySelector('.nav-link')).fontSize,text:e.textContent.replace(/\s/g,'')}))
 await page.getByRole('link',{name:'任务广场',exact:true}).click();await expect(page.locator('.square-card')).toHaveCount(6)
 const square=await page.locator('.header').evaluate(e=>({height:getComputedStyle(e).height,font:getComputedStyle(e.querySelector('.nav-link')).fontSize,text:e.textContent.replace(/\s/g,'')}));expect(square).toEqual(home)
 await page.goto(appRoute('/tasks/taste'));await expect(page).toHaveURL(/\/tasks$/)
 const taskSquareUrl = page.url()
 await page.getByRole('link', { name: '跳到页面内容' }).focus()
 await page.keyboard.press('Enter')
 await expect(page.locator('#square-grid')).toBeFocused()
 await expect(page).toHaveURL(taskSquareUrl)
 await page.goto(appRoute('/tasks/no-such-task'));await expect(page.getByText('这份任务不存在或已下架')).toBeVisible()
 await page.goto(appRoute('/unknown-page'));await expect(page.getByText('这个页面暂时找不到了')).toBeVisible()
})

test('延期申请跨身份处理，双方可分别评价已完成订单',async({page})=>{
 await login(page)
 await page.goto(appRoute('/creator/orders/OD20261118001'))
 await expect(page.getByRole('heading', { name: '订单详情', exact: true })).toBeVisible()
 await page.getByRole('button',{name:'申请延期',exact:true}).click()
 await page.getByPlaceholder('请说明原因，至少 10 字').fill('需要补充产品细节与统一场景光影，申请延期一天。')
 await page.getByRole('button',{name:'确认提交（演示）'}).click()
 await expect(page.getByRole('button',{name:'已申请延期'})).toBeDisabled()
 await page.goto(appRoute('/profile'));await page.getByRole('button',{name:'切换为商家'}).click();await page.getByRole('button',{name:'确认',exact:true}).click()
 await page.getByRole('button',{name:'同意延期'}).click();await page.getByRole('button',{name:'确认',exact:true}).click()
 const o=(await saved(page)).orders.find(o=>o.id==='OD20261118001');expect(o.hours).toBe(56);expect(o.extension.status).toBe('已同意')
 await page.goto(appRoute('/merchant/review/OD20261118004'));await page.getByRole('button',{name:'评价',exact:true}).click()
 await page.getByPlaceholder('写下这次合作的真实感受，15–500 字').fill('交付内容完整清晰，沟通及时，整体效果符合约定的需求。')
 await page.getByRole('button',{name:'确认提交（演示）'}).click();await expect(page.getByRole('button',{name:'已评价'})).toBeDisabled()
 await page.goto(appRoute('/profile'));await page.getByRole('button',{name:'切换为创作者'}).click();await page.getByRole('button',{name:'确认',exact:true}).click()
 await page.goto(appRoute('/creator/orders/OD20261118004'))
 await expect(page.getByRole('heading', { name: '订单详情', exact: true })).toBeVisible()
 await page.getByRole('button',{name:'评价',exact:true}).click()
 await page.getByPlaceholder('写下这次合作的真实感受，15–500 字').fill('需求清晰明确，反馈具体及时，这次合作过程顺利，感谢信任。')
 await page.getByRole('button',{name:'确认提交（演示）'}).click();expect((await saved(page)).reviews.map(r=>r.role)).toEqual(['merchant','creator'])
})

test('商家选定中标人后创建订单，刷新后不可重复选人',async({page})=>{
 await login(page,'merchant');await certify(page,'business')
 await page.goto(appRoute('/merchant/bids'));await page.getByRole('button',{name:'选 TA 中标',exact:true}).first().click()
 await page.getByRole('button',{name:'确认',exact:true}).click();await expect(page).toHaveURL(/merchant\/tasks/)
 const data=await saved(page);expect(data.orders).toHaveLength(5);expect(data.orders[0].creator).toBe('林间设计');expect(data.orders[0].cents).toBe(90000);expect(data.tasks.find(t=>t.id==='square-8').status).toBe('进行中')
 await page.goto(appRoute('/merchant/bids'));await expect(page.getByRole('button',{name:'选 TA 中标',exact:true}).first()).toBeDisabled()
})

test('精修工作台：周期切换、任务状态筛选、搜索空态及验收入口',async({page})=>{
 await page.goto(appRoute('/merchant'))
 await page.getByText('近 7 天',{exact:true}).click();await expect(page.getByRole('img',{name:'近7天示例支出柱状图'})).toBeVisible()
 await page.locator('.spend-chart g[tabindex]').first().hover();await expect(page.locator('.chart-tooltip')).toContainText('¥')
 await page.locator('.recent-tabs').getByRole('tab',{name:/待验收/}).click();await expect(page.locator('.recent-table .el-table__row')).toHaveCount(1)
 await page.getByRole('textbox',{name:'搜索最近任务'}).fill('并不存在的任务');await expect(page.getByText('没有找到相关任务',{exact:true})).toBeVisible()
 await page.getByRole('button',{name:'清除搜索条件'}).click();await expect(page.locator('.recent-table .el-table__row')).toHaveCount(1)
 await page.getByRole('button',{name:'去验收',exact:true}).click();await expect(page).toHaveURL(/merchant\/review\//)
})

test('精修发现页：任务卡片、首页搜索、广场筛选分页与详情跳转',async({page})=>{
 await page.goto(appRoute('/'));await page.getByRole('searchbox',{name:'搜索任务',exact:true}).fill('咖啡');await page.getByRole('button',{name:'搜索任务',exact:true}).click()
 await expect(page.locator('.market-task-card')).toHaveCount(1);await expect(page.locator('.market-task-card')).toContainText('咖啡新品')
 await page.locator('.market-card-bottom').getByRole('button',{name:'查看任务',exact:true}).click();await expect(page).toHaveURL(/tasks\/square-3$/)
 await page.goto(appRoute('/tasks'));await page.getByRole('button',{name:'第 2 页',exact:true}).click();await expect(page.locator('.square-card')).toHaveCount(6)
 await page.getByRole('button',{name:'模特换装',exact:true}).click();await expect(page.locator('.square-card')).toHaveCount(3)
 await page.getByRole('searchbox',{name:'搜索任务名称或类目关键词'}).fill('不存在的任务');await page.getByRole('button',{name:'搜索任务',exact:true}).click();await expect(page.getByRole('heading',{name:'暂时没有匹配的任务'})).toBeVisible()
 await page.getByRole('button',{name:'浏览全部任务',exact:true}).click();await expect(page.locator('.square-card')).toHaveCount(6)
})

test('交付文档：非图片文件提交后与刷新后均保留可见记录',async({page})=>{
 await login(page)
 await page.goto(appRoute('/creator/orders/OD20261118001'))
 await page.locator('input[type=file]').setInputFiles({name:'交付说明.txt',mimeType:'text/plain',buffer:Buffer.from('示例交付说明')})
 await page.getByText('我承诺作品为 AI 辅助生成并经人工精修，无侵权内容，同意平台标识规范。',{exact:true}).click()
 await page.getByRole('button',{name:'提交作品（演示）',exact:true}).click();await page.getByRole('button',{name:'确认',exact:true}).click()
 await expect(page.locator('.delivery-document-list')).toContainText('交付说明.txt')
 await page.reload();await expect(page.locator('.delivery-document-list')).toContainText('交付说明.txt')
})

test('个人资料：精修弹窗保存资料并在刷新后保留',async({page})=>{
 await login(page);await page.goto(appRoute('/profile'));await page.getByRole('button',{name:'编辑资料',exact:true}).click()
 const dialog=page.getByRole('dialog',{name:'编辑个人资料'});await dialog.getByRole('textbox',{name:'昵称',exact:true}).fill('青岚创作');await dialog.getByRole('button',{name:'保存资料',exact:true}).click()
 await expect(page.getByRole('heading',{name:'青岚创作',exact:true})).toBeVisible();await page.reload();await expect(page.getByRole('heading',{name:'青岚创作',exact:true})).toBeVisible()
})
