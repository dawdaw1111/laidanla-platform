<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import SiteHeader from './components/SiteHeader.vue'
import WorkspaceShell from './components/WorkspaceShell.vue'
import { persistence } from './lib/store'
const route=useRoute(),router=useRouter()
const skipTarget = computed(() => route.path === '/tasks' ? 'square-grid' : 'page-content')
function skipToContent() {
  const target = document.getElementById(skipTarget.value)
  if (!target) return
  if (!target.hasAttribute('tabindex')) target.tabIndex = -1
  target.focus({ preventScroll: true })
  target.scrollIntoView()
}
const refinementClass=computed(()=>{
  const path=route.path
  if(path==='/login'||path==='/merchant')return ''
  const key=path==='/'?'home':path==='/tasks'?'square':path.startsWith('/publish')?'publish':path.endsWith('/bid')?'task-bid':path.startsWith('/tasks/')?'task-detail':path.startsWith('/merchant/review/')?'review':path==='/merchant/tasks'?'merchant-tasks':path==='/merchant/bids'?'bid-management':path==='/merchant/finance'?'finance':path==='/creator/orders'?'orders':path.startsWith('/creator/orders/')?'order-detail':path==='/creator/wallet'?'wallet':path==='/creator/bids'?'my-bids':path==='/messages'?'messages':path==='/profile'?'profile':path==='/verification'?'verification':'empty'
  return ['refined-page','view-'+key,...(['home','square'].includes(key)?[]:['app-ui'])]
})
function go(path){router.push(path)}
function action(type){router.push(({login:'/login',publish:'/publish/template',workspace:'/merchant',messages:'/messages'})[type]||'/profile')}
function openTask(task){router.push(`/tasks/${task.id}`)}
</script>
<template>
  <el-config-provider :locale="zhCn">
    <a class="skip-link" :href="'#' + skipTarget" @click.prevent="skipToContent">跳到页面内容</a>
    <SiteHeader :active-page="route.meta.nav" @navigate="go" @open-modal="action"/>
    <WorkspaceShell v-if="route.meta.shell" :kind="route.meta.shell"><RouterView :key="route.path" :class="refinementClass" /></WorkspaceShell>
    <RouterView v-else :key="route.path" :class="refinementClass" @open-task="openTask" />
    <footer v-if="!['/','/tasks'].includes(route.path)" class="demo-footer">来单啦 · 体验环境 <span>页面数据仅用于演示，不产生真实交易。</span><strong v-if="persistence.failed">浏览器存储不可用，本次更改无法保存。</strong></footer>
  </el-config-provider>
</template>
