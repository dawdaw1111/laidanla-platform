<script setup>
import { ArrowUpRight, Bell, ChevronDown } from 'lucide-vue-next'
import { state } from '../lib/store'
defineProps({ activePage: { type: String, default: '' } })
defineEmits(['navigate', 'open-modal'])
</script>
<template>
  <header class="header refined-header">
    <a class="brand" href="/" aria-label="来单啦首页" @click.prevent="$emit('navigate','/')">
      <svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true"><path d="M29 2c-1 15 2 19 17 23-16-1-21 4-25 21C22 30 18 25 2 21 18 22 24 17 29 2Z" fill="currentColor"/><path d="m34 7 2 8 8 3-8 1-3 8-1-8-8-3 8-1Z" fill="currentColor" opacity=".6"/></svg><span>来单啦</span>
    </a>
    <nav class="main-nav" aria-label="主导航">
      <a class="nav-link" :class="{active:activePage==='home'}" href="/" :aria-current="activePage==='home'?'page':undefined" @click.prevent="$emit('navigate','/')">首页</a>
      <a class="nav-link" :class="{active:activePage==='tasks'}" href="/tasks" :aria-current="activePage==='tasks'?'page':undefined" @click.prevent="$emit('navigate','/tasks')">任务广场</a>
      <a class="nav-link" :class="{active:activePage==='merchant'}" href="/merchant" :aria-current="activePage==='merchant'?'page':undefined" @click.prevent="$emit('navigate','/merchant')">商家工作台</a>
    </nav>
    <div class="account-nav">
      <template v-if="state.session.loggedIn">
        <button class="header-notice" aria-label="消息中心" @click="$emit('navigate','/messages')"><Bell :size="18"/></button>
        <el-dropdown trigger="click" @command="$emit('navigate',$event)">
          <button class="header-account"><span class="header-avatar">{{state.session.role==='merchant'?'禾':state.session.nickname.slice(0,1)}}</span><span>{{state.session.role==='merchant'?'青禾美妆':state.session.nickname}}</span><ChevronDown :size="13"/></button>
          <template #dropdown><el-dropdown-menu>
            <el-dropdown-item command="/profile">个人中心 / 身份切换</el-dropdown-item>
            <el-dropdown-item command="/creator/orders">我的订单</el-dropdown-item>
            <el-dropdown-item command="/creator/bids">我的投标</el-dropdown-item>
            <el-dropdown-item command="/creator/wallet">我的钱包</el-dropdown-item>
            <el-dropdown-item command="/messages">消息中心</el-dropdown-item>
            <el-dropdown-item command="/verification">认证中心</el-dropdown-item>
            <el-dropdown-item divided @click="state.session.loggedIn=false;$emit('navigate','/')">退出演示身份</el-dropdown-item>
          </el-dropdown-menu></template>
        </el-dropdown>
      </template>
      <button v-else class="login-link" @click="$emit('open-modal','login')">登录 / 注册</button>
      <button class="nav-publish" @click="$emit('open-modal','publish')">发布需求 <ArrowUpRight :size="15"/></button>
    </div>
  </header>
</template>
