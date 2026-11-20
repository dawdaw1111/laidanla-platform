import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
const home=()=>import('./pages/HomePage.vue')
const publish=()=>import('./pages/PublishPage.vue')
const history = import.meta.env.MODE === 'pages'
  ? createWebHashHistory(import.meta.env.BASE_URL)
  : createWebHistory(import.meta.env.BASE_URL)
export const router=createRouter({history,scrollBehavior(to,from,saved){return saved||(to.path===from.path?false:{top:0})},routes:[
  {path:'/',component:home,meta:{title:'让灵感，成为生意。',nav:'home'}},
  {path:'/tasks',component:()=>import('./TaskSquare.vue'),meta:{title:'任务广场',nav:'tasks'}},
  {path:'/tasks/taste',redirect:'/tasks'},
  {path:'/tasks/:id',component:()=>import('./pages/TaskDetail.vue'),meta:{title:'任务详情',nav:'tasks'}},
  {path:'/tasks/:id/bid',component:()=>import('./pages/BidPage.vue'),meta:{title:'提交投标',nav:'tasks'}},
  {path:'/login',component:()=>import('./pages/LoginPage.vue'),meta:{title:'登录与身份选择'}},
  {path:'/publish',redirect:'/publish/template'},
  ...['template','requirements','payment'].map((step,i)=>({path:`/publish/${step}`,component:publish,meta:{title:['选择模板','填写需求','托管赏金'][i],nav:'merchant',shell:'merchant',step:i}})),
  {path:'/merchant',component:()=>import('./pages/MerchantDashboard.vue'),meta:{title:'商家工作台',nav:'merchant',shell:'merchant'}},
  {path:'/merchant/tasks',component:()=>import('./pages/MerchantTasks.vue'),meta:{title:'任务管理',nav:'merchant',shell:'merchant'}},
  {path:'/merchant/bids',component:()=>import('./pages/BidManagement.vue'),meta:{title:'投标管理',nav:'merchant',shell:'merchant'}},
  {path:'/merchant/review/:id',component:()=>import('./pages/ReviewPage.vue'),meta:{title:'作品验收',nav:'merchant',shell:'merchant'}},
  {path:'/merchant/finance',component:()=>import('./pages/FinancePage.vue'),meta:{title:'财务管理',nav:'merchant',shell:'merchant'}},
  {path:'/creator/orders',component:()=>import('./pages/CreatorOrders.vue'),meta:{title:'我的订单',shell:'creator'}},
  {path:'/creator/bids',component:()=>import('./pages/MyBids.vue'),meta:{title:'我的投标',shell:'creator'}},
  {path:'/creator/orders/:id',component:()=>import('./pages/OrderDetail.vue'),meta:{title:'订单详情与交付',shell:'creator'}},
  {path:'/creator/wallet',component:()=>import('./pages/WalletPage.vue'),meta:{title:'我的钱包',shell:'creator'}},
  {path:'/messages',component:()=>import('./pages/MessagesPage.vue'),meta:{title:'消息中心'}},
  {path:'/profile',component:()=>import('./pages/ProfilePage.vue'),meta:{title:'个人中心'}},
  {path:'/verification',component:()=>import('./pages/VerificationPage.vue'),meta:{title:'认证中心',shell:'creator'}},
  {path:'/:pathMatch(.*)*',component:()=>import('./pages/NotFound.vue'),meta:{title:'页面未找到'}},
]})
router.afterEach(to=>{document.title=`${to.meta.title} · 来单啦`})
