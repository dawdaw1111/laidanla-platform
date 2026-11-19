<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { House, ClipboardList, SquarePlus, Gavel, Wallet, MessageCircle, UserRound, ShieldCheck, ChevronRight, Store, LifeBuoy } from 'lucide-vue-next'
import { state } from '../lib/store'
defineProps({kind:String})
const route=useRoute()
const merchant=[['工作台','/merchant',House],['任务管理','/merchant/tasks',ClipboardList],['发布任务','/publish/template',SquarePlus],['投标管理','/merchant/bids',Gavel],['财务管理','/merchant/finance',Wallet],['消息中心','/messages?role=merchant',MessageCircle]]
const creator=[['我的订单','/creator/orders',ClipboardList],['我的投标','/creator/bids',Gavel],['消息中心','/messages',MessageCircle],['钱包','/creator/wallet',Wallet],['个人中心','/profile',UserRound],['身份认证','/verification',ShieldCheck]]
const active=computed(()=>route.path.startsWith('/publish')?'/publish/template':route.path.startsWith('/merchant/review')?'/merchant/tasks':route.path.startsWith('/creator/orders/')?'/creator/orders':route.path)
</script>
<template>
  <div :class="['workspace','app-ui','refined-workspace',kind]">
    <aside class="workspace-sidebar">
      <div class="workspace-identity"><span class="workspace-identity-icon"><Store v-if="kind==='merchant'" :size="19"/><UserRound v-else :size="19"/></span><div><strong>{{kind==='merchant'?'商家中心':'创作者中心'}}</strong><small>{{kind==='merchant'?'管理你的创意合作':'专注每一份好创作'}}</small></div></div>
      <p class="sidebar-section-label">工作空间</p>
      <nav aria-label="工作台导航">
        <RouterLink v-for="item in kind==='merchant'?merchant:creator" :key="item[1]" :to="item[1]" :class="{selected:active===item[1]}" :aria-current="active===item[1]?'page':undefined"><component :is="item[2]" :size="18"/><span>{{item[0]}}</span><span v-if="kind==='merchant'&&item[0]==='任务管理'&&state.tasks.some(t=>t.status==='待验收')" class="sidebar-count">{{state.tasks.filter(t=>t.status==='待验收').length}}</span></RouterLink>
      </nav>
      <div class="sidebar-bottom">
        <RouterLink class="sidebar-help" :to="kind==='merchant'?'/messages?chat=support&role=merchant':'/messages?chat=support'"><LifeBuoy :size="17"/><span>帮助与支持</span><ChevronRight :size="14"/></RouterLink>
        <RouterLink class="sidebar-profile" to="/profile"><span class="workspace-user-mark">{{kind==='merchant'?'禾':state.session.nickname.slice(0,1)}}</span><span><strong>{{kind==='merchant'?'青禾美妆':state.session.nickname}}</strong><small>账号与身份</small></span><ChevronRight :size="14"/></RouterLink>
      </div>
    </aside>
    <main id="page-content" class="workspace-main"><slot/></main>
  </div>
</template>
