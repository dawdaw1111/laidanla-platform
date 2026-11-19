<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowUpRight, ArrowRight, ArrowDown, Search, LayoutGrid, Image, Shirt, SquarePlay, Layers, RectangleEllipsis, ShieldCheck, X } from 'lucide-vue-next'
import MarketplaceCard from '../components/MarketplaceCard.vue'
import { squareTasks } from '../data/squareTasks'
import { state } from '../lib/store'
const router=useRouter()
const categories = [
  { name: '全部任务', icon: LayoutGrid }, { name: '商品主图', icon: Image },
  { name: '模特换装', icon: Shirt }, { name: '短视频', icon: SquarePlay },
  { name: '详情页', icon: Layers }, { name: '营销文案', icon: RectangleEllipsis },
]
const tasks=computed(()=>[...state.tasks.filter(t=>!squareTasks.some(s=>s.id===t.id)),...squareTasks.slice(0,6).map(t=>({...t,...state.tasks.find(s=>s.id===t.id),date:t.publishedOrder}))])

const query=ref(''), submittedQuery=ref(''),selectedCategory=ref('全部任务'),sort=ref('综合推荐'),expanded=ref(false)
const filteredTasks=computed(()=>{
 const list=tasks.value.filter(t=>(selectedCategory.value==='全部任务'||t.category===selectedCategory.value)&&`${t.title}${t.category}${t.description}`.includes(submittedQuery.value.trim()))
 if(sort.value==='赏金最高')list.sort((a,b)=>b.price-a.price)
 if(sort.value==='最新发布')list.sort((a,b)=>(b.publishedOrder||b.date)-(a.publishedOrder||a.date))
 if(sort.value==='即将截止')list.sort((a,b)=>a.remaining-b.remaining)
 return list
})
const visibleTasks=computed(()=>expanded.value?filteredTasks.value:filteredTasks.value.slice(0,3))
function scrollToTasks(){document.getElementById('tasks')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
function searchTasks(){submittedQuery.value=query.value;expanded.value=true}
function hotSearch(value){query.value=value;searchTasks()}
function openModal(type,task){router.push(type==='task'?`/tasks/${task.id}`:type==='publish'?'/publish/template':'/login')}
</script>
<template>
  <main id="page-content">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-art" aria-hidden="true"><img src="/assets/design-reference.png" alt="" fetchpriority="high" /></div>
      <div class="hero-copy">
        <p class="eyebrow">AIGC 创意任务撮合平台</p>
        <h1 id="hero-title">让灵感，<br class="home-title-break"/>成为生意。</h1>
        <p class="hero-description">连接商家与 AIGC 创作者，让每一份需求找到合适的人。</p>
        <div class="hero-actions"><button class="button button-white" @click="openModal('publish')">发布需求 <ArrowUpRight /></button><a class="button button-outline" href="#tasks" @click.prevent="scrollToTasks">寻找任务 <ArrowRight /></a></div>
        <p class="trust-line">赏金托管 <span>·</span> 平台内交付 <span>·</span> 验收后结算</p>
      </div>
    </section>

    <section id="tasks" class="marketplace" aria-labelledby="tasks-title">
      <div class="search-row">
        <form class="search-form" role="search" @submit.prevent="searchTasks"><Search aria-hidden="true" /><label class="sr-only" for="task-search">搜索任务</label><input id="task-search" v-model="query" type="search" placeholder="搜索任务名称、类目关键词" autocomplete="off" /><button type="submit">搜索任务</button></form>
        <div class="hot-search"><span>热门：</span><button @click="hotSearch('商品主图')">商品主图</button><span>/</span><button @click="hotSearch('短视频')">短视频</button><span>/</span><button @click="hotSearch('模特换装')">模特换装</button></div>
      </div>

      <nav class="category-nav" aria-label="任务分类">
        <button v-for="category in categories" :key="category.name" :class="['category', { selected: selectedCategory === category.name }]" :aria-pressed="selectedCategory === category.name" @click="selectedCategory = category.name; expanded = true"><component :is="category.icon" aria-hidden="true" /><span>{{ category.name }}</span></button>
      </nav>

      <div class="section-heading"><div class="heading-copy"><h2 id="tasks-title">最新任务</h2><p>找到适合你的下一份创作</p></div><div class="sort-tabs" aria-label="任务排序"><button v-for="option in ['综合推荐', '最新发布', '赏金最高', '即将截止']" :key="option" :class="{ selected: sort === option }" :aria-pressed="sort === option" @click="sort = option">{{ option }}</button></div></div>
      <p v-if="submittedQuery" class="search-summary" role="status">“{{ submittedQuery }}” 的搜索结果 · {{ filteredTasks.length }} 个任务 <button @click="query = ''; submittedQuery = ''">清除搜索 <X :size="14" /></button></p>

      <div class="task-grid" aria-live="polite">
        <MarketplaceCard v-for="task in visibleTasks" :key="task.id" :task="task" eager @open="openModal('task',$event)" />
      </div>
      <div v-if="!visibleTasks.length" class="empty-state"><Search :size="36" /><h3>暂时没有匹配的任务</h3><p>试试其他关键词，或浏览全部任务。</p><button class="button button-blue" @click="selectedCategory = '全部任务'; query = ''; submittedQuery = ''">浏览全部任务 <ArrowRight /></button></div>
      <button v-if="!expanded && filteredTasks.length > 3" class="load-more" @click="expanded = true">查看更多任务 <ArrowDown /></button>
      <p v-else-if="visibleTasks.length" class="list-end">已展示 {{ filteredTasks.length }} 个任务</p>
    </section>
  </main>
</template>
