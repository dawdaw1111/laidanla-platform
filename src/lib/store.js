import { reactive, watch } from 'vue'
import { squareTasks } from '../data/squareTasks'

export const money = (cents) => (Number(cents || 0) / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const imageOf = (art = 'skincare') => `/assets/task-square/${art}.webp`
export const stamp = () => new Date().toLocaleString('sv-SE').slice(0, 16)
export const uid = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 6)}`
export const income = (cents) => Math.round(cents * 85 / 100)
export const templates = [
  { name: '商品主图', art: 'skincare', price: '¥30–150 / 张', description: '突出商品质感与卖点，让好产品被看见。', unit: '张', count: 5, low: 30, high: 150 },
  { name: '模特换装', art: 'fashion', price: '¥50–200 / 张', description: '准确呈现服装版型、材质与穿搭场景。', unit: '张', count: 8, low: 50, high: 200 },
  { name: '短视频', art: 'coffee', price: '¥200–800 / 条', description: '从脚本到画面，为商品讲一个好故事。', unit: '条', count: 1, low: 200, high: 800 },
  { name: '详情页', art: 'powder', price: '¥400–1200 / 套', description: '理清产品信息，制作完整的电商详情页。', unit: '套', count: 1, low: 400, high: 1200 },
  { name: '营销文案', art: null, price: '¥60–300 / 篇', description: '写出自然、有重点、适合平台的品牌内容。', unit: '篇', count: 3, low: 60, high: 300 },
  { name: '直播脚本', art: null, price: '灰度开放', description: '编排开场、讲解、互动与转化节奏。', unit: '场', count: 1, disabled: true },
]
const seededOrders = [
  ['OD20261118001', 0, '待交付', 32], ['OD20261118002', 2, '待验收', 48],
  ['OD20261118003', 1, '待交付', 8], ['OD20261118004', 3, '已完成', 0],
].map(([id, index, status, hours], i) => ({ id, taskId: squareTasks[index].id, title: squareTasks[index].title, art: squareTasks[index].art, category: squareTasks[index].category, mode: squareTasks[index].mode, cents: squareTasks[index].price * 100, days: 3, revisions: 2, remainingRevisions: i === 0 ? 1 : 2, status, hours, version: i === 0 ? 2 : 1, creator: '林间设计', merchant: '青禾美妆', created: '2026-11-18 10:24', extended: false, reminded: false, files: [], versions: i === 0 ? [{ version: 1, note: '首版作品已提交', result: '已驳回', reason: '背景偏暗，请提高明度，保留产品细节。', at: '2026-11-17 18:05', files: [] }] : [] }))
const defaults = () => ({
  version: 1, session: { loggedIn: false, role: 'creator', nickname: '林间设计', bio: '电商视觉与 AIGC 内容创作者' },
  auth: { personal: '未认证', business: '未认证' }, bankBound: false,
  orders: seededOrders,
  tasks: squareTasks.slice(0, 12).map((task, i) => ({ ...task, cents: task.price * 100, status: ['进行中','进行中','待验收','已完成','招募中','纠纷中','已退款','招募中','待支付','审核中','草稿','招募中'][i], updated: `2026-11-${String(18 - i).padStart(2, '0')} 14:28` })),
  bids: [], bookmarks: [], balance: 238000, frozen: 51000, earned: 826000, merchantBalance: 360000,
  withdrawals: [], flows: [
    { id:'F1',at:'2026-11-18 14:36',type:'分账入账',title:'护肤新品主图设计 · 5张',cents:51000,status:'已完成' },
    { id:'F2',at:'2026-11-16 11:20',type:'提现',title:'—',cents:-100000,status:'已完成' },
    { id:'F3',at:'2026-11-15 18:09',type:'冻结',title:'秋冬女装模特换装图 · 8张',cents:-30000,status:'处理中' },
    { id:'F4',at:'2026-11-14 16:42',type:'解冻',title:'咖啡新品推广短视频 · 15秒',cents:30000,status:'已完成' },
  ],
  merchantFlows: squareTasks.slice(0,7).map((t,i)=>({id:`MF${i}`,at:`2026-11-${18-i} 14:26`,type:i===3?'分账':i===6?'退款':'托管冻结',title:t.title,cents:t.price*100,status:i===3||i===6?'已完成':'处理中',ref:`DEMO****${4821+i*173}`})),
  chats: { merchant: [{ mine:false,text:'请把背景调整得更明亮一些，谢谢。',at:'09:42' },{ mine:true,text:'收到，我会保留产品细节并调整光影。',at:'09:46' },{ mine:true,image:'/assets/pages/delivery-1.webp',text:'主图光影调整参考',at:'09:56' }], creator:[{mine:false,text:'您好，我已查看需求，想确认主图的背景风格。',at:'昨天 17:20'}], support:[{mine:false,text:'你好，这里是来单啦演示客服会话。你可以在这里记录问题，当前不会发送给真人客服。',at:'10:24'}], official:[{mine:false,text:'欢迎来到来单啦。当前为界面演示，任务、认证与资金均为示例。',at:'10:24'}] },
  portfolio: ['skincare','fashion','coffee','extra1','extra2','extra3'].map((art,i)=>({id:`P${i}`,title:['护肤新品主图设计','秋冬女装海报视觉','咖啡新品推广视觉','香水产品主图精修','口红新品详情图','精华液产品视觉图'][i],image:i<3?imageOf(art):`/assets/pages/portfolio-${i-2}.webp`,tool:'即梦 / 人工精修',hours:2})),
  draft: { category:'商品主图', title:'', link:'', description:'', requirements:'', count:5, size:'800 × 800', customSize:'', customWords:500, format:'JPG / PNG', tags:['场景图','精修'], bounty:600, days:3, revisions:2, mode:'一口价', slots:1, certifiedOnly:false, allowExtension:true, sourceFile:false, style:['亚洲'], scene:['纯色'], authorization:'', duration:'15s', videoTypes:['商品切片'], script:true, subtitles:true, pages:6, copy:true, platform:'小红书', words:'300', multiTitles:true, files:[] },
  disputes: [], reviews: [], lastSaved: '',
})
let initial = defaults()
try {
  const saved = JSON.parse(localStorage.getItem('laidanla-refined-demo-v1') || 'null')
  if (saved?.version === 1 && Array.isArray(saved.orders) && Array.isArray(saved.tasks)) {
    initial = { ...initial, ...saved, session:{...initial.session,...saved.session}, auth:{...initial.auth,...saved.auth}, draft:{...initial.draft,...saved.draft} }
  }
} catch { /* A clean demo also works when storage is unavailable. */ }
export const state = reactive(initial)
export const persistence = reactive({ failed:false })
watch(state, () => {
  try { localStorage.setItem('laidanla-refined-demo-v1', JSON.stringify(state, (key,value)=>key==='image'&&typeof value==='string'&&value.startsWith('blob:')?'':value)); persistence.failed = false } catch { persistence.failed = true }
}, { deep:true })
export function taskById(id) { return state.tasks.find(t=>t.id===id) || squareTasks.find(t=>t.id===id) }
export function orderById(id) { return state.orders.find(o=>o.id===id) }
export function setOrderStatus(order, status) {
  order.status = status
  const task = state.tasks.find(t=>t.id===order.taskId)
  if (task) { task.status = ({'待交付':'进行中','待验收':'待验收','已完成':'已完成','纠纷中':'纠纷中'})[status] || status; task.updated = stamp() }
}
export function settle(order) {
  if (order.status !== '待验收') return false
  setOrderStatus(order,'已完成')
  const amount=income(order.cents); state.balance += amount; state.earned += amount
  state.flows.unshift({id:uid('F'),at:stamp(),type:'分账入账',title:order.title,cents:amount,status:'已完成'})
  state.merchantFlows.unshift({id:uid('MF'),at:stamp(),type:'分账',title:order.title,cents:order.cents,status:'已完成',ref:uid('DEMO')})
  state.chats.official.push({mine:false,text:`演示订单“${order.title}”已验收通过，创作者所得 ¥${money(amount)} 已计入示例余额。`,at:stamp()})
  return true
}
export function addOrder(task, cents=task.price*100, creator='林间设计') {
  const order={id:uid('OD'),taskId:task.id,title:task.title,art:task.art||'skincare',category:task.category,mode:task.mode,cents,days:task.days,revisions:task.revisions,remainingRevisions:task.revisions,status:'待交付',hours:task.days*24,version:1,creator,merchant:'青禾美妆',created:stamp(),extended:false,reminded:false,files:[],versions:[]}
  state.orders.unshift(order)
  const owned=state.tasks.find(t=>t.id===task.id); if(owned){ owned.status='进行中'; owned.updated=stamp() }
  state.chats.official.push({mine:false,text:`演示接单成功：“${task.title}”，请在 ${task.days} 天内交付。`,at:stamp()})
  return order
}
export function saveDraft() { state.lastSaved=stamp() }
export function exportCsv(rows, name='来单啦-账单.csv') {
  // Quote fields and neutralise spreadsheet formula prefixes in user-supplied titles.
  const clean=v=>`"${String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')}"`
  const csv='\uFEFF'+[['时间','类型','关联任务','金额（元）','状态'],...rows.map(r=>[r.at,r.type,r.title,(r.cents/100).toFixed(2),r.status])].map(r=>r.map(clean).join(',')).join('\r\n')
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
