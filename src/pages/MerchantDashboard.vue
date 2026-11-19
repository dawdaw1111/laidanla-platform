<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, ArrowUpRight, ChevronRight, Clock3, CircleCheck, Layers, Users, Wallet, Gavel, Image, Search, ClipboardList, ArrowRight, ShieldCheck } from 'lucide-vue-next'
import StatusBadge from '../components/StatusBadge.vue'
import { state, money } from '../lib/store'
import { requireRole, confirm, notify } from '../lib/actions'

const router=useRouter(), range=ref('30'), hovered=ref(-1), taskFilter=ref('全部'), search=ref('')
const count=status=>state.tasks.filter(task=>task.status===status).length
const stats=computed(()=>[
  {label:'进行中任务',value:count('进行中'),unit:'项',hint:'已接单，正在创作交付',icon:Layers,path:'/merchant/tasks?status=进行中'},
  {label:'待验收作品',value:count('待验收'),unit:'份',hint:'确认作品后即可完成结算',icon:CircleCheck,path:'/merchant/tasks?status=待验收',attention:true},
  {label:'累计支出',value:money(state.merchantFlows.filter(flow=>flow.type==='分账').reduce((sum,flow)=>sum+flow.cents,0)),currency:true,hint:'已完成任务的结算金额',icon:Wallet,path:'/merchant/finance'},
  {label:'合作创作者',value:new Set(state.orders.map(order=>order.creator)).size,unit:'位',hint:'参与过任务交付的创作者',icon:Users,path:'/merchant/bids'}
])
const todos=computed(()=>[
  {title:'作品待验收',description:'查看交付作品，确认本次合作',n:count('待验收'),icon:Image,path:'/merchant/tasks?status=待验收',tone:'amber'},
  {title:'待选中标',description:'比较投标方案，选择合适的创作者',n:state.tasks.filter(task=>task.mode==='比稿'&&task.status==='招募中').length,icon:Gavel,path:'/merchant/bids',tone:'blue'},
  {title:'审核中',description:'审核结果将通过站内消息通知',n:count('审核中'),icon:ShieldCheck,path:'/merchant/tasks?status=审核中',tone:'slate'}
])
const todoCount=computed(()=>todos.value.reduce((sum,todo)=>sum+todo.n,0))
const trend=[{label:'10/21',value:150},{label:'10/24',value:570},{label:'10/27',value:280},{label:'10/30',value:460},{label:'11/02',value:990},{label:'11/05',value:520},{label:'11/08',value:470},{label:'11/11',value:790},{label:'11/14',value:320},{label:'11/19',value:550}]
const chartData=computed(()=>range.value==='30'?trend:trend.slice(-7).map((item,index)=>({...item,label:'11/'+(13+index)})))
const activeBar=computed(()=>chartData.value[hovered.value])
const taskTabs=['全部','进行中','待验收']
const tasks=computed(()=>state.tasks.filter(task=>(taskFilter.value==='全部'||task.status===taskFilter.value)&&(!search.value.trim()||task.title.includes(search.value.trim()))).slice(0,4))
const pendingExtensions=computed(()=>state.orders.filter(order=>order.extension?.status==='待处理'))
async function extension(order,agree){
  if(!requireRole(router,'merchant'))return
  if(await confirm((agree?'同意':'拒绝')+'这份演示延期申请？','处理延期申请')){
    order.extension.status=agree?'已同意':'已拒绝'
    if(agree)order.hours+=order.extension.hours
    notify('延期申请状态已更新')
  }
}
function openTask(task){
  const order=state.orders.find(order=>order.taskId===task.id&&order.status==='待验收')
  router.push(task.status==='待验收'&&order?'/merchant/review/'+order.id:'/tasks/'+task.id)
}
</script>

<template>
  <div class="polished-dashboard">
    <div class="dashboard-crumb"><span>工作空间</span><ChevronRight :size="12"/><span>概览</span></div>
    <div class="dashboard-heading">
      <div><h1>商家工作台<span class="welcome-dot"/></h1><p>欢迎回来，青禾美妆。跟进任务进展，及时处理作品与结算。</p></div>
      <div class="dashboard-heading-actions"><el-button @click="router.push('/merchant/tasks')"><ClipboardList :size="15"/>查看任务</el-button><el-button type="primary" @click="router.push('/publish/template')"><Plus :size="16"/>发布新任务</el-button></div>
    </div>

    <div class="dashboard-stats">
      <a v-for="stat in stats" :key="stat.label" :href="stat.path" class="dashboard-stat" @click.prevent="router.push(stat.path)">
        <div class="stat-top"><span>{{stat.label}}</span><component :is="stat.icon" :size="17"/></div>
        <div class="stat-figure" :class="{attention:stat.attention}"><small v-if="stat.currency" class="currency">¥</small><strong>{{stat.value}}</strong><small v-if="stat.unit">{{stat.unit}}</small></div>
        <div class="stat-bottom"><span>{{stat.hint}}</span><ArrowUpRight :size="13"/></div>
      </a>
    </div>

    <div class="dashboard-content-grid">
      <section class="dashboard-panel spend-panel">
        <div class="dashboard-panel-heading"><div><h2>内容支出趋势</h2><p>内容创作与交付的支出概览</p></div><el-radio-group v-model="range" size="small" aria-label="支出趋势周期" @change="hovered=-1"><el-radio-button value="7">近 7 天</el-radio-button><el-radio-button value="30">近 30 天</el-radio-button></el-radio-group></div>
        <div class="chart-meta"><span><i/>内容支出</span><span>示例走势 · 元</span></div>
        <div class="spend-chart" @mouseleave="hovered=-1">
          <svg viewBox="0 0 600 192" preserveAspectRatio="none" role="img" :aria-label="range==='30'?'近30天示例支出柱状图':'近7天示例支出柱状图'">
            <defs><linearGradient id="spend-bar" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3661fa"/><stop offset="1" stop-color="#6c8cff"/></linearGradient></defs>
            <g v-for="(label,index) in ['1,200','900','600','300','0']" :key="label"><line x1="40" x2="592" :y1="12+index*38" :y2="12+index*38" stroke="#eff2f7" :stroke-dasharray="index===4?'0':'3 4'"/><text x="0" :y="16+index*38" fill="#8b96a8" font-size="9">{{label}}</text></g>
            <g v-for="(bar,index) in chartData" :key="bar.label" @mouseenter="hovered=index" @focus="hovered=index" @blur="hovered=-1" tabindex="0" :aria-label="bar.label+'，示例支出'+bar.value+'元'">
              <rect :x="44+index*(540/chartData.length)" y="8" :width="540/chartData.length" height="158" fill="transparent"/>
              <rect :x="44+index*(540/chartData.length)+(540/chartData.length-23)/2" :y="164-bar.value/1200*152" width="23" :height="bar.value/1200*152" rx="3" :fill="hovered===index?'#1645ed':'url(#spend-bar)'"/>
              <text :x="44+index*(540/chartData.length)+270/chartData.length" y="187" text-anchor="middle" fill="#969faf" font-size="8">{{bar.label}}</text>
            </g>
          </svg>
          <div v-if="activeBar" class="chart-tooltip" :style="{left:(9+(hovered+.5)*88/chartData.length)+'%'}"><small>{{activeBar.label}}</small><strong>¥ {{money(activeBar.value*100)}}</strong></div>
        </div>
      </section>

      <section class="dashboard-panel todo-panel">
        <div class="dashboard-panel-heading"><div><h2>待办事项 <span class="todo-count">{{todoCount}}</span></h2><p>及时回应，让合作更顺畅</p></div><Clock3 :size="17" class="muted-icon"/></div>
        <div class="todo-items"><button v-for="todo in todos" :key="todo.title" @click="router.push(todo.path)"><span class="todo-icon" :class="todo.tone"><component :is="todo.icon" :size="17"/></span><span class="todo-copy"><strong>{{todo.title}}</strong><small>{{todo.description}}</small></span><span class="todo-number" :class="todo.tone">{{todo.n}}</span><ChevronRight :size="14" class="todo-chevron"/></button></div>
        <p class="todo-footnote"><ShieldCheck :size="12"/>交付后 72 小时自动验收，请及时确认</p>
      </section>
    </div>

    <section v-if="pendingExtensions.length" class="dashboard-panel extension-panel"><div class="dashboard-panel-heading"><h2>待处理的延期申请</h2><span>{{pendingExtensions.length}} 项</span></div><div v-for="order in pendingExtensions" :key="order.id" class="extension-request"><div><strong>{{order.title}}</strong><p>申请延期 {{order.extension.hours}} 小时 · {{order.extension.reason}}</p></div><div class="inline-actions"><el-button @click="extension(order,false)">拒绝</el-button><el-button type="primary" @click="extension(order,true)">同意延期</el-button></div></div></section>

    <section class="dashboard-panel recent-panel">
      <div class="dashboard-panel-heading"><div><h2>最近任务</h2><p>跟进每一份需求的最新进展</p></div><RouterLink to="/merchant/tasks" class="all-tasks-link">全部任务<ArrowUpRight :size="14"/></RouterLink></div>
      <div class="recent-toolbar"><div class="recent-tabs" role="tablist" aria-label="最近任务状态"><button v-for="tab in taskTabs" :key="tab" role="tab" :aria-selected="taskFilter===tab" :class="{selected:taskFilter===tab}" @click="taskFilter=tab">{{tab}}<span>{{tab==='全部'?state.tasks.length:count(tab)}}</span></button></div><el-input v-model="search" placeholder="搜索任务名称" aria-label="搜索最近任务" clearable><template #prefix><Search :size="14"/></template></el-input></div>
      <el-table :data="tasks" class="recent-table" row-key="id">
        <el-table-column label="任务名称" min-width="270"><template #default="{row}"><div class="recent-task"><img :src="row.image" alt=""/><div><strong>{{row.title}}</strong><span>{{row.category}}<i/>{{row.mode}}</span></div></div></template></el-table-column>
        <el-table-column label="任务赏金" min-width="110"><template #default="{row}"><span class="recent-amount">¥{{money(row.cents)}}</span></template></el-table-column>
        <el-table-column label="任务状态" min-width="96"><template #default="{row}"><StatusBadge :status="row.status"/></template></el-table-column>
        <el-table-column label="更新时间" min-width="130"><template #default="{row}"><span class="recent-time">{{row.updated.slice(5,16)}}</span></template></el-table-column>
        <el-table-column label="操作" width="95" align="right"><template #default="{row}"><el-button link :type="row.status==='待验收'?'primary':'default'" @click="openTask(row)">{{row.status==='待验收'?'去验收':'查看详情'}}<ChevronRight :size="12"/></el-button></template></el-table-column>
        <template #empty><el-empty :description="search?'没有找到相关任务':'暂时没有这个状态的任务'" :image-size="55"><el-button v-if="search" link type="primary" @click="search=''">清除搜索条件</el-button></el-empty></template>
      </el-table>
      <div class="recent-footer"><span>显示最近更新的 {{tasks.length}} 项任务</span><RouterLink to="/merchant/tasks">进入任务管理<ArrowRight :size="13"/></RouterLink></div>
    </section>
  </div>
</template>

<style scoped>
.polished-dashboard{max-width:1380px;margin:auto}
.dashboard-crumb{display:flex;align-items:center;gap:9px;color:#8d99ab;font-size:12px;margin-bottom:17px}
.dashboard-crumb>span:last-child{color:#7c879a}
.dashboard-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:26px}
.dashboard-heading h1{font-size:26px;line-height:1.4;font-weight:600;letter-spacing:-.65px;display:flex;align-items:center;gap:13px}
.welcome-dot{height:6px;width:6px;background:#4f76ee;border-radius:50%}
.dashboard-heading p{font-size:13px;color:#929baa;margin:9px 0 0}
.dashboard-heading-actions{display:flex;gap:10px}
.dashboard-heading-actions .el-button{min-height:35px;font-size:13px;padding:8px 13px;border-color:#e0e5ed;background:#fff}
.dashboard-heading-actions .el-button--primary{background:#1645ed;border-color:#1645ed}
.dashboard-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:23px}
.dashboard-stat{border:1px solid #e7eaf0;background:#fff;border-radius:9px;padding:20px 21px 16px;min-width:0;transition:border-color .18s,box-shadow .18s}
.dashboard-stat:hover{border-color:#ccd6ee;box-shadow:0 5px 16px #294da706}
.stat-top{display:flex;justify-content:space-between;align-items:center;color:#808b9c;font-size:13px}
.stat-top>svg{color:#a0acc0;stroke-width:1.6}
.stat-figure{display:flex;align-items:baseline;gap:8px;margin-top:16px;line-height:1;color:#252f41}
.stat-figure strong{font-size:32px;font-weight:500;letter-spacing:-.9px;font-variant-numeric:tabular-nums}
.stat-figure small{font-size:12px;color:#b0b8c5}
.stat-figure .currency{font-size:20px;color:#536078;margin-right:-3px}
.stat-figure.attention strong{color:#2350e4}
.stat-bottom{margin-top:17px;display:flex;align-items:center;justify-content:space-between;gap:5px;font-size:11px;color:#7b879a}
.stat-bottom>svg{color:#b0b9c8}
.dashboard-content-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:20px;margin-bottom:24px}
.dashboard-panel{background:#fff;border:1px solid #e7eaf0;border-radius:9px;min-width:0;overflow:hidden}
.dashboard-panel-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:22px 23px 0}
.dashboard-panel-heading h2{font-size:15px;font-weight:600;margin:0;color:#3d485b;display:flex;align-items:center;gap:8px}
.dashboard-panel-heading p{font-size:12px;color:#8a95a5;margin:7px 0 0}
.dashboard-panel-heading :deep(.el-radio-button__inner){padding:7px 10px;font-size:12px;border-color:#e6eaf1;border-radius:0;background:#fff;color:#939cac;box-shadow:none!important}
.dashboard-panel-heading :deep(.el-radio-button.is-active .el-radio-button__inner){background:#f0f4ff;color:#3457cc;border-color:#dce5fc}
.dashboard-panel-heading :deep(.el-radio-button:first-child .el-radio-button__inner){border-radius:5px 0 0 5px}
.dashboard-panel-heading :deep(.el-radio-button:last-child .el-radio-button__inner){border-radius:0 5px 5px 0}
.chart-meta{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#8c97a9;margin:22px 24px 11px 26px}
.chart-meta>span:first-child{display:flex;align-items:center;gap:7px;color:#8c97ab}
.chart-meta i{width:6px;height:6px;border-radius:2px;background:#4270f7}
.spend-chart{position:relative;margin:0 22px 20px 24px;height:178px}
.spend-chart>svg{display:block;height:100%;width:100%;overflow:visible;font-family:Geist,sans-serif}
.spend-chart g[tabindex]{outline:none}
.spend-chart g[tabindex]:focus rect:nth-child(2){fill:#1645ed;stroke:#9bb1fb;stroke-width:2}
.chart-tooltip{position:absolute;top:10px;transform:translateX(-50%);pointer-events:none;background:#fff;border:1px solid #e7ebf3;padding:9px 12px;border-radius:7px;box-shadow:0 4px 20px #14275812;display:grid;gap:4px;white-space:nowrap}
.chart-tooltip small{font-size:11px;color:#9aa3b4}
.chart-tooltip strong{font-size:14px;font-weight:500;color:#2843a0}
.muted-icon{color:#b4bdcd;stroke-width:1.5}
.todo-count{font-size:12px;color:#7285b6;font-weight:400;padding:1px 6px;background:#f1f4fa;border-radius:4px}
.todo-items{padding:6px 23px 0}
.todo-items>button{display:flex;align-items:center;gap:12px;width:100%;padding:13px 0;text-align:left;border-bottom:1px solid #f0f2f6;transition:opacity .15s}
.todo-items>button:last-child{border:0}
.todo-items>button:hover .todo-copy strong{color:#1645ed}
.todo-icon{height:34px;width:34px;display:grid;place-items:center;border-radius:8px;flex-shrink:0}
.todo-icon.amber{background:#fff7ec;color:#c89b5f}
.todo-icon.blue{background:#f0f4ff;color:#6a88d4}
.todo-icon.slate{background:#f3f5f9;color:#a0adc0}
.todo-copy{display:flex;flex-direction:column;min-width:0}
.todo-copy strong{font-size:14px;font-weight:500;color:#536075;transition:color .15s}
.todo-copy small{font-size:11px;color:#8792a5;margin-top:5px}
.todo-number{margin-left:auto;font-size:17px;font-weight:500}
.todo-number.amber{color:#c78e48}.todo-number.blue{color:#4b6ed5}.todo-number.slate{color:#8b9ab2}
.todo-chevron{color:#c5cbd6;margin-left:3px}
.todo-panel .todo-footnote{font-size:11px;color:#8a96a8;display:flex;align-items:center;gap:6px;padding:0 23px;margin:9px 0 16px}
.recent-panel .dashboard-panel-heading{padding-bottom:20px}
.all-tasks-link{display:flex;align-items:center;gap:7px;color:#8a98af;font-size:12px}
.all-tasks-link:hover{color:#1645ed}
.recent-toolbar{margin:0 23px 13px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid #f0f2f7;padding-bottom:13px}
.recent-tabs{display:flex;gap:23px;align-items:center}
.recent-tabs>button{font-size:13px;color:#7b879b;display:flex;align-items:center;gap:7px}
.recent-tabs>button.selected{color:#254ad0;font-weight:500}
.recent-tabs>button>span{font-size:11px;background:#f3f5f9;border-radius:3px;padding:0 5px;line-height:17px;color:#9ba7ba}
.recent-tabs>button.selected>span{color:#6480c8;background:#edf2fe}
.recent-toolbar>.el-input{max-width:180px}
.recent-toolbar :deep(.el-input__wrapper){min-height:29px;background:#fafbfc;box-shadow:0 0 0 1px #edf0f5 inset}
.recent-toolbar :deep(.el-input__inner){font-size:12px;height:29px}
.recent-toolbar :deep(.el-input__prefix){color:#aeb8c8}
.recent-table{width:calc(100% - 46px);margin:0 23px;--el-table-header-bg-color:#f8f9fc;--el-table-border-color:#f0f2f6;--el-table-row-hover-bg-color:#fafbfe}
.recent-table :deep(th.el-table__cell){background:#f8f9fc}
.recent-table :deep(th .cell){font-size:12px!important;font-weight:400!important;color:#7b879b;padding:9px 12px!important}
.recent-table :deep(td .cell){padding:13px 12px!important;font-size:13px!important}
.recent-task{display:flex;align-items:center;gap:12px}
.recent-task>img{width:50px;height:40px;object-fit:cover;border-radius:5px;border:1px solid #f0eeeb;flex-shrink:0}
.recent-task>div{min-width:0}
.recent-task strong{display:block;font-size:13px;font-weight:500;color:#536075;line-height:1.6}
.recent-task>div>span{display:flex;align-items:center;gap:7px;font-size:11px;color:#8a95a6;margin-top:4px}
.recent-task i{height:2px;width:2px;background:#b5bdcb;border-radius:50%}
.recent-amount{font-size:14px;font-weight:500;color:#65738a;font-variant-numeric:tabular-nums}
.recent-time{font-size:12px;color:#7c899d;font-variant-numeric:tabular-nums}
.recent-table :deep(.status-badge){font-size:11px;font-weight:400;border-radius:4px;line-height:1.4;padding:4px 7px;background:#f0f4ff;color:#6b86ce;gap:5px}
.recent-table :deep(.status-badge:before){content:'';width:3px;height:3px;background:currentColor;border-radius:50%}
.recent-table :deep(.status-badge[data-status='待验收']){background:#fff6e9;color:#c69a5f}
.recent-table :deep(.status-badge[data-status='已完成']){background:#eef8f2;color:#7cab91}
.recent-table :deep(.el-button){font-size:12px;min-height:20px;padding:0;color:#9ba8bd;font-weight:400}
.recent-table :deep(.el-button--primary){color:#5278e5}
.recent-table :deep(.el-button>span){gap:4px}
.recent-table :deep(.el-button svg){width:11px;height:11px}
.recent-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 24px 18px;color:#8a97a8;font-size:11px}
.recent-footer>a{display:flex;align-items:center;gap:7px;color:#8b9bb6}
.recent-footer>a:hover{color:#1645ed}
.extension-panel{margin-bottom:24px}
.extension-request{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:20px 23px}
.extension-request strong{font-size:14px;font-weight:500}
.extension-request p{font-size:12px;color:#929dae;margin:5px 0 0}
@media(min-width:1700px){.dashboard-stats{gap:20px}.dashboard-stat{padding:24px}.spend-chart{height:210px}.todo-items>button{padding:20px 0}.dashboard-heading h1{font-size:29px}.dashboard-heading p{font-size:14px}}
@media(max-width:1200px){.dashboard-stats{gap:12px}.dashboard-stat{padding:17px}.stat-figure strong{font-size:28px}.stat-bottom{font-size:11px}.dashboard-content-grid{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:15px}.dashboard-panel-heading{padding:20px 18px 0}.dashboard-panel-heading h2{font-size:14px}.dashboard-panel-heading p{font-size:11px}.todo-items{padding-left:17px;padding-right:17px}.todo-copy small{font-size:11px}.todo-items>button{gap:9px}.todo-icon{width:29px;height:29px}.recent-toolbar{margin-left:18px;margin-right:18px}.recent-table{width:calc(100% - 36px);margin:0 18px}.recent-tabs{gap:15px}.dashboard-heading h1{font-size:24px}.dashboard-heading p{font-size:12px}}
@media(max-width:1000px){.dashboard-content-grid{grid-template-columns:1fr}.todo-items{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.todo-items>button{flex-wrap:wrap;position:relative;border:0;gap:9px}.todo-copy{width:100%;order:3}.todo-copy small{font-size:11px}.todo-number{font-size:21px}.todo-chevron{display:none}.todo-panel .todo-footnote{margin-top:1px}.dashboard-heading-actions .el-button:first-child{display:none}.stat-figure strong{font-size:25px}.stat-bottom>svg{display:none}.dashboard-stat{padding:16px 13px}.stat-bottom{font-size:11px}.dashboard-heading p{max-width:290px;line-height:1.8}}
@media(max-width:760px){.dashboard-crumb{font-size:11px;margin-bottom:13px}.dashboard-heading{align-items:flex-start;gap:12px;margin-bottom:21px}.dashboard-heading h1{font-size:23px;gap:8px}.dashboard-heading p{font-size:11px;max-width:200px;line-height:1.8;margin-top:7px}.dashboard-heading-actions .el-button{font-size:12px;padding:8px 10px;min-height:33px}.dashboard-heading-actions .el-button svg{width:12px}.dashboard-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;margin-bottom:18px}.dashboard-stat{padding:16px}.stat-top{font-size:12px}.stat-top>svg{width:15px}.stat-figure{margin-top:13px}.stat-figure strong{font-size:29px}.stat-bottom{font-size:11px;margin-top:13px}.dashboard-content-grid{gap:17px;margin-bottom:18px}.dashboard-panel-heading{padding:18px 17px 0}.dashboard-panel-heading h2{font-size:15px}.dashboard-panel-heading p{font-size:11px}.dashboard-panel-heading :deep(.el-radio-button__inner){padding:6px 7px;font-size:11px}.chart-meta{margin:20px 18px 10px;font-size:11px}.spend-chart{margin:0 14px 16px 18px;height:165px}.todo-items{gap:10px}.todo-items>button{padding:15px 0}.todo-copy strong{font-size:12px}.todo-copy small{font-size:11px;line-height:1.6}.todo-icon{width:27px;height:27px}.todo-number{font-size:18px}.todo-panel .todo-footnote{font-size:11px;padding:0 17px}.recent-panel .dashboard-panel-heading{padding-bottom:17px}.all-tasks-link{font-size:11px}.recent-toolbar{flex-wrap:wrap;gap:13px;margin:0 17px 12px}.recent-tabs{gap:22px;width:100%}.recent-tabs>button{font-size:12px}.recent-toolbar>.el-input{max-width:none;width:100%}.recent-table{width:calc(100% - 24px);margin:0 12px}.recent-footer{padding:14px 17px;font-size:11px}.extension-request{flex-wrap:wrap;padding:17px}.extension-request .el-button{font-size:12px}}
</style>
