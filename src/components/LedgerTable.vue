<script setup>
import { ref,computed,watch } from 'vue'
import { money } from '../lib/store'
import StatusBadge from './StatusBadge.vue'
const props=defineProps({rows:Array,merchant:Boolean})
const type=ref('全部'),dates=ref([]),page=ref(1),keyword=ref('')
const types=computed(()=>['全部',...new Set(props.rows.map(r=>r.type))])
const filtered=computed(()=>props.rows.filter(r=>(type.value==='全部'||r.type===type.value)&&r.title.includes(keyword.value)&&(!dates.value?.length||(r.at.slice(0,10)>=dates.value[0]&&r.at.slice(0,10)<=dates.value[1]))))
watch([type,dates,keyword],()=>page.value=1)
defineExpose({filtered})
</script>
<template><div><div class="table-filter"><el-select v-model="type" aria-label="流水类型"><el-option v-for="t in types" :key="t" :value="t" :label="t==='全部'?'全部类型':t"/></el-select><el-date-picker v-model="dates" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"/><el-input v-if="merchant" v-model="keyword" placeholder="搜索关联任务" aria-label="关联任务" clearable/></div><el-table :data="filtered.slice((page-1)*10,page*10)"><el-table-column label="时间" prop="at" width="145"/><el-table-column label="类型" prop="type" width="95"/><el-table-column label="关联任务" prop="title" min-width="170"/><el-table-column label="金额" width="110"><template #default="{row}"><strong :class="row.cents>0&&!merchant?'positive-amount':merchant?'price-text':''">{{!merchant&&row.cents>0?'+':''}}¥{{money(row.cents)}}</strong></template></el-table-column><el-table-column v-if="merchant" label="演示流水号" prop="ref" min-width="140"/><el-table-column label="状态" width="105"><template #default="{row}"><StatusBadge :status="row.status"/></template></el-table-column><template #empty><el-empty :image-size="65" description="当前筛选下没有资金流水"/></template></el-table><div class="table-footer"><span class="muted small">共 {{filtered.length}} 条示例流水</span><el-pagination v-model:current-page="page" :total="filtered.length" :page-size="10" layout="prev,pager,next" background hide-on-single-page/></div></div></template>
<style scoped>.positive-amount{color:#268a38}</style>
