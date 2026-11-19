<script setup>
import { ref,computed } from 'vue'
import { useRouter } from 'vue-router'
import { Gavel } from 'lucide-vue-next'
import PageTitle from '../components/PageTitle.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { state,money,imageOf } from '../lib/store'
const router=useRouter(),tab=ref('全部'),rows=computed(()=>state.bids.filter(b=>tab.value==='全部'||b.status===tab.value))
</script>
<template><div><PageTitle title="我的投标" description="跟进每一份方案，等待下一次合作。"><el-button type="primary" @click="router.push('/tasks')">寻找新的任务</el-button></PageTitle><el-tabs v-model="tab"><el-tab-pane v-for="s in ['全部','待选中标','已中标','未中标']" :key="s" :name="s" :label="s"/></el-tabs><section class="panel"><el-table v-if="rows.length" :data="rows"><el-table-column label="投标任务" min-width="270"><template #default="{row}"><div class="table-task"><img :src="imageOf(row.art)" alt=""/><strong>{{row.title}}</strong></div></template></el-table-column><el-table-column label="报价" width="120"><template #default="{row}"><strong class="price-text">¥{{money(row.cents)}}</strong></template></el-table-column><el-table-column label="交付工期" width="100"><template #default="{row}">{{row.days}} 天</template></el-table-column><el-table-column label="状态" width="120"><template #default="{row}"><StatusBadge :status="row.status"/></template></el-table-column><el-table-column label="提交时间" prop="at" min-width="150"/><el-table-column label="操作" width="100"><template #default="{row}"><el-button type="primary" link @click="router.push(`/tasks/${row.taskId}`)">查看任务</el-button></template></el-table-column></el-table><div v-else class="empty-hint"><Gavel :size="45"/><h2>这里还没有投标记录</h2><p class="muted">选一份适合的比稿任务，提交你的创作方案。</p><el-button type="primary" @click="router.push('/tasks/square-8/bid')">看看比稿任务</el-button></div></section></div></template>
