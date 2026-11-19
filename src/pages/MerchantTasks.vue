<script setup>
import { computed,ref,watch } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { Plus,Search } from 'lucide-vue-next'
import PageTitle from '../components/PageTitle.vue'
import TaskTable from '../components/TaskTable.vue'
import { state,templates,stamp,uid } from '../lib/store'
import { confirm,notify,requireRole } from '../lib/actions'
const route=useRoute(),router=useRouter(),status=ref(String(route.query.status||'全部')),category=ref('全部类目'),dates=ref([]),keyword=ref(''),search=ref(''),page=ref(1)
const statuses=['全部','草稿','待支付','审核中','招募中','进行中','待验收','已完成','纠纷中','已退款']
const filtered=computed(()=>state.tasks.filter(t=>(status.value==='全部'||t.status===status.value)&&(category.value==='全部类目'||t.category===category.value)&&(!dates.value?.length||(t.updated.slice(0,10)>=dates.value[0]&&t.updated.slice(0,10)<=dates.value[1]))&&t.title.includes(search.value)))
watch([status,category,dates,search],()=>page.value=1)
function reset(){category.value='全部类目';dates.value=[];keyword.value='';search.value='';status.value='全部'}
async function audit(row){if(!requireRole(router,'merchant'))return;if(await confirm('将这份演示任务从“审核中”切换为“招募中”，不会触发真实审核服务。','模拟审核')){row.status='招募中';row.updated=stamp();notify('演示任务已上架')}}
async function pay(row){if(!requireRole(router,'merchant',true))return;if(await confirm('仅模拟支付，不会扣款。确认后进入审核中。','演示支付')){row.status='审核中';row.updated=stamp();state.merchantFlows.unshift({id:uid('MF'),at:stamp(),type:'托管冻结',title:row.title,cents:row.cents,status:'演示托管',ref:uid('DEMO')});notify('任务已进入审核中')}}
function copy(row){Object.assign(state.draft,{category:row.category,title:row.title,description:row.description||'',bounty:row.price,days:row.days,revisions:row.revisions,mode:row.mode,files:[]});router.push('/publish/requirements')}
function dispute(row){const d=state.disputes.find(d=>d.taskId===row.id);confirm(d?`状态：处理中。原因：${d.reason}。当前为演示工单，未提交平台。`:'这是设计稿中的示例纠纷，平台处理中。当前没有真实仲裁结果。','仲裁进度')}
</script>
<template><div><PageTitle title="任务管理" description="管理已发布的需求，查看招募、创作与验收进度"><el-button type="primary" @click="router.push('/publish/template')"><Plus/>发布新任务</el-button></PageTitle><div class="task-counts"><button v-for="s in ['招募中','进行中','待验收']" :key="s" class="stat-card" @click="status=s"><span>{{s}}</span><strong>{{state.tasks.filter(t=>t.status===s).length}}</strong><span>→</span></button></div><el-tabs v-model="status"><el-tab-pane v-for="s in statuses" :key="s" :name="s" :label="`${s} (${s==='全部'?state.tasks.length:state.tasks.filter(t=>t.status===s).length})`"/></el-tabs><section class="panel"><div class="table-filter"><el-select v-model="category" aria-label="任务类目"><el-option value="全部类目"/><el-option v-for="t in templates.filter(t=>!t.disabled)" :key="t.name" :value="t.name"/></el-select><el-date-picker v-model="dates" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"/><el-input v-model="keyword" placeholder="搜索任务标题" aria-label="任务标题" clearable @keyup.enter="search=keyword"><template #prefix><Search :size="17"/></template></el-input><el-button type="primary" @click="search=keyword">查询</el-button><el-button @click="reset">重置</el-button></div><TaskTable :rows="filtered.slice((page-1)*20,page*20)" @copy="copy" @audit="audit" @pay="pay" @dispute="dispute"/><div class="table-footer"><span class="muted small">共 {{filtered.length}} 个任务 · 每页 20 条</span><el-pagination v-model:current-page="page" :total="filtered.length" :page-size="20" layout="prev, pager, next" background hide-on-single-page/></div></section></div></template>
<style scoped>.task-counts{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:16px}.task-counts .stat-card{align-items:center;justify-content:space-between;text-align:left}.task-counts strong{font-size:28px;color:#002bd7}@media(max-width:650px){.task-counts{gap:8px}.task-counts .stat-card{flex-direction:column;gap:2px;font-size:12px}.task-counts .stat-card>span:last-child{display:none}}</style>
