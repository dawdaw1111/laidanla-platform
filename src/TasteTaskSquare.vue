<script setup>
import { assetUrl } from './lib/assets.js'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight, Bookmark, Check, ChevronDown, Clock3, Grid2X2, Image, Layers, LayoutGrid, List, RectangleEllipsis, RotateCcw, Search, ShieldCheck, Shirt, SlidersHorizontal, SquarePlay, X } from 'lucide-vue-next'
import { squareTasks } from './data/squareTasks'
import './taste-task-square.css'

defineEmits(['open-task'])
const categoryOptions = [
  { name: '全部任务', icon: LayoutGrid }, { name: '商品主图', icon: Image },
  { name: '模特换装', icon: Shirt }, { name: '短视频', icon: SquarePlay },
  { name: '详情页', icon: Layers }, { name: '营销文案', icon: RectangleEllipsis },
]
const category = ref('全部任务'), mode = ref('全部'), minimum = ref(''), maximum = ref('')
const query = ref(''), keyword = ref(''), sort = ref('综合推荐'), page = ref(1)
const savedOnly = ref(false), view = ref('grid'), mobileFilters = ref(false), notice = ref('')
const saved = ref(readSaved())
let noticeTimer
const pageSize = 6
function readSaved() {
  try {
    const value = JSON.parse(localStorage.getItem('lingchuang-saved-tasks') || '[]')
    return Array.isArray(value) ? value.filter(id => squareTasks.some(task => task.id === id)) : []
  } catch { return [] }
}
onMounted(() => {
  // Use Taste Skill's unmodified micro-interaction layer only on this preview.
  const css = document.createElement('link')
  css.rel = 'stylesheet'; css.href = assetUrl('taste-kit/motion.css'); css.dataset.tasteMotion = ''
  document.head.append(css)
  document.documentElement.dataset.type = 'software'
  document.documentElement.dataset.radius = 'soft'
  for (const name of ['page-type', 'site-kind']) {
    const meta = document.createElement('meta')
    meta.name = name; meta.content = 'software'; meta.dataset.tasteMeta = ''
    document.head.append(meta)
  }
})
onBeforeUnmount(() => {
  clearTimeout(noticeTimer)
  document.querySelector('[data-taste-motion]')?.remove()
  document.querySelectorAll('[data-taste-meta]').forEach(meta => meta.remove())
  delete document.documentElement.dataset.type
  delete document.documentElement.dataset.radius
})
const filtered = computed(() => {
  const list = squareTasks.filter(task =>
    (category.value === '全部任务' || task.category === category.value) &&
    (mode.value === '全部' || task.mode === mode.value) &&
    (!minimum.value || task.price >= Number(minimum.value)) &&
    (!maximum.value || task.price <= Number(maximum.value)) &&
    (!savedOnly.value || saved.value.includes(task.id)) &&
    `${task.title} ${task.category}`.toLocaleLowerCase().includes(keyword.value.toLocaleLowerCase()),
  )
  if (sort.value === '赏金最高') list.sort((a,b) => b.price - a.price)
  if (sort.value === '最新发布') list.sort((a,b) => b.publishedOrder - a.publishedOrder)
  if (sort.value === '即将截止') list.sort((a,b) => a.remaining - b.remaining)
  return list
})
const pageCount = computed(() => Math.ceil(filtered.value.length / pageSize))
const visible = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const hasFilters = computed(() => category.value !== '全部任务' || mode.value !== '全部' || minimum.value || maximum.value || keyword.value)
const activeChips = computed(() => [
  category.value !== '全部任务' && { key:'category', text:category.value },
  mode.value !== '全部' && { key:'mode', text:mode.value },
  (minimum.value || maximum.value) && { key:'budget', text:`¥${minimum.value || '0'} — ${maximum.value ? `¥${maximum.value}` : '不限'}` },
  keyword.value && { key:'keyword', text:`“${keyword.value}”` },
].filter(Boolean))
watch([category, mode, minimum, maximum, keyword, sort, savedOnly], () => { page.value = 1 })
watch(pageCount, count => { page.value = Math.max(1, Math.min(page.value, count)) })
function submitSearch(value = query.value) { query.value = value; keyword.value = value.trim(); page.value = 1 }
function categoryCount(name) { return name === '全部任务' ? squareTasks.length : squareTasks.filter(t => t.category === name).length }
function reset() { category.value = '全部任务'; mode.value = '全部'; minimum.value = ''; maximum.value = ''; query.value = ''; keyword.value = ''; page.value = 1 }
function removeChip(key) {
  if (key === 'category') category.value = '全部任务'
  if (key === 'mode') mode.value = '全部'
  if (key === 'budget') { minimum.value = ''; maximum.value = '' }
  if (key === 'keyword') { keyword.value = ''; query.value = '' }
}
function updateBudget(changed) {
  if (minimum.value && maximum.value && Number(minimum.value) > Number(maximum.value)) {
    if (changed === 'minimum') maximum.value = minimum.value
    else minimum.value = maximum.value
  }
}
function toggleSave(task) {
  const exists = saved.value.includes(task.id)
  saved.value = exists ? saved.value.filter(id => id !== task.id) : [...saved.value, task.id]
  try { localStorage.setItem('lingchuang-saved-tasks', JSON.stringify(saved.value)); notice.value = exists ? '已取消收藏' : '已收藏，可在“已收藏”中查看' }
  catch { notice.value = '收藏已更新，当前浏览器无法持久保存' }
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { notice.value = '' }, 2500)
}
function goPage(number) {
  if (number < 1 || number > pageCount.value) return
  page.value = number
  document.querySelector('#taste-results')?.scrollIntoView({ block:'start', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
function remaining(hours) { return `${Math.floor(hours / 24)}天${hours % 24}小时` }
</script>

<template>
  <main class="taste-tasks" aria-labelledby="taste-title">
    <div class="tt-wrap wrap">
      <section class="tt-intro" aria-labelledby="taste-title" data-enter>
        <div class="tt-intro-copy"><p class="tt-kicker">AIGC 创意合作</p><div class="tt-title-row"><h1 id="taste-title">任务广场</h1><p>找到下一份创作。</p></div><p class="tt-lead">从商品主图到品牌短片，找到适合你的需求，让好创意有回报。</p></div>
        <div class="tt-intro-aside"><div class="tt-chrome" aria-hidden="true"><img src="/assets/task-square/chrome-banner.webp" loading="lazy" alt="" width="518" height="58" /></div><p><ShieldCheck aria-hidden="true" />赏金托管 <span>·</span> 平台内交付 <span>·</span> 验收后结算</p></div>
      </section>

      <div class="tt-search-row">
        <form class="tt-search" role="search" @submit.prevent="submitSearch()"><Search aria-hidden="true" /><label for="taste-search" class="tt-search-label">任务搜索</label><input id="taste-search" v-model="query" type="search" autocomplete="off" placeholder="搜索任务名称、类目关键词" /><button class="btn btn--primary" type="submit">搜索任务 <ArrowRight aria-hidden="true" /></button></form>
        <button :class="['tt-saved', { selected:savedOnly }]" :aria-pressed="savedOnly" @click="savedOnly = !savedOnly"><Bookmark aria-hidden="true" :fill="savedOnly ? 'currentColor' : 'none'" />已收藏<span>{{ saved.length }}</span></button>
      </div>

      <div class="tt-body">
        <aside :class="['tt-sidebar', { 'is-open':mobileFilters }]" aria-label="筛选任务">
          <div class="tt-filter-heading"><h2>筛选任务</h2><button class="tt-reset" aria-label="重置全部筛选" @click="reset"><RotateCcw aria-hidden="true" />重置</button></div>
          <div class="tt-filter-block"><h3>任务类别</h3><nav class="tt-category-list" aria-label="任务类别"><button v-for="item in categoryOptions" :key="item.name" :class="{selected:category === item.name}" :aria-pressed="category === item.name" @click="category = item.name"><component :is="item.icon" aria-hidden="true" /><span>{{ item.name }}</span><span class="tt-category-count">{{ categoryCount(item.name) }}</span></button></nav></div>
          <fieldset class="tt-filter-block"><legend>接单模式</legend><div class="tt-mode"><button v-for="item in ['全部','一口价','比稿']" :key="item" :class="{selected:mode === item}" :aria-pressed="mode === item" @click="mode = item">{{ item }}</button></div></fieldset>
          <div class="tt-filter-block"><h3>赏金范围</h3><div class="tt-budget"><label><span>最低赏金</span><div><select v-model="minimum" @change="updateBudget('minimum')"><option value="">不限</option><option v-for="n in [300,500,800,1000,1500,2000]" :key="n" :value="String(n)">¥{{ n.toLocaleString() }}</option></select><ChevronDown aria-hidden="true" /></div></label><span>—</span><label><span>最高赏金</span><div><select v-model="maximum" @change="updateBudget('maximum')"><option value="">不限</option><option v-for="n in [300,500,800,1000,1500,2000]" :key="n" :value="String(n)">¥{{ n.toLocaleString() }}</option></select><ChevronDown aria-hidden="true" /></div></label></div></div>
          <div class="tt-sidebar-note"><ShieldCheck aria-hidden="true" /><strong>每一份合作，都有保障。</strong><p>需求、交付和验收，<br />在平台内完成。</p></div>
        </aside>

        <section id="taste-results" class="tt-results" aria-labelledby="taste-results-title">
          <div class="tt-results-heading"><div><h2 id="taste-results-title">{{ savedOnly ? '已收藏的任务' : '为你推荐' }}</h2><span role="status" aria-live="polite">{{ filtered.length }} 个{{ savedOnly ? '收藏' : '公开' }}任务</span></div><button class="tt-mobile-filter" :aria-expanded="mobileFilters" @click="mobileFilters = !mobileFilters"><SlidersHorizontal aria-hidden="true" />筛选</button><div class="tt-sort" aria-label="任务排序"><button v-for="item in ['综合推荐','赏金最高','最新发布','即将截止']" :key="item" :class="{selected:sort === item}" :aria-pressed="sort === item" @click="sort = item">{{ item }}</button></div><div class="tt-view" aria-label="列表显示方式"><button :class="{selected:view === 'grid'}" aria-label="卡片视图" :aria-pressed="view === 'grid'" @click="view = 'grid'"><Grid2X2 aria-hidden="true" /></button><button :class="{selected:view === 'list'}" aria-label="列表视图" :aria-pressed="view === 'list'" @click="view = 'list'"><List aria-hidden="true" /></button></div></div>

          <div v-if="activeChips.length" class="tt-active-filters"><button v-for="chip in activeChips" :key="chip.key" :aria-label="`取消${chip.text}筛选`" @click="removeChip(chip.key)">{{ chip.text }}<X aria-hidden="true" /></button><button class="tt-clear-all" @click="reset">清除全部</button></div>

          <div :class="['tt-grid', {'tt-list':view === 'list'}]">
            <article v-for="(task, taskIndex) in visible" :key="task.id" class="card tt-card">
              <div class="tt-card-visual"><button class="tt-photo m-zoom" :aria-label="`查看${task.title}`" @click="$emit('open-task',task)"><img :src="task.image" :alt="`${task.category}风格参考图`" width="463" height="138" :loading="page === 1 && taskIndex === 0 ? 'eager' : 'lazy'" /></button><button :class="['tt-bookmark',{selected:saved.includes(task.id)}]" :aria-label="`${saved.includes(task.id) ? '取消收藏' : '收藏'}${task.title}`" :aria-pressed="saved.includes(task.id)" @click="toggleSave(task)"><Bookmark aria-hidden="true" :fill="saved.includes(task.id) ? 'currentColor' : 'none'" /></button></div>
              <div class="tt-card-content"><div class="tt-card-labels"><span>{{ task.category }}</span><span class="tt-mode-label">{{ task.mode }}</span><span class="tt-places">{{ task.mode === '比稿' ? `${task.bids} 人投标` : `${task.capacity-task.filled} 个名额可接` }}</span></div><h3><button @click="$emit('open-task',task)">{{ task.title }}</button></h3><div class="tt-card-offer"><p><span>¥</span>{{ task.price.toLocaleString('en-US') }}<small>任务赏金</small></p><span><Clock3 aria-hidden="true" />{{ task.days }}天交付</span></div><div class="tt-card-details"><span><ShieldCheck aria-hidden="true" />认证商家</span><span>免费修改 {{ task.revisions }} 轮</span></div><div class="tt-card-footer"><span>招募剩余 <strong>{{ remaining(task.remaining) }}</strong></span><button @click="$emit('open-task',task)">查看任务 <ArrowRight aria-hidden="true" /></button></div></div>
            </article>
          </div>

          <div v-if="!filtered.length" class="tt-empty"><Bookmark v-if="savedOnly && !saved.length" aria-hidden="true" /><Search v-else aria-hidden="true" /><h3>{{ savedOnly && !saved.length ? '还没有收藏的任务' : '暂时没有匹配的任务' }}</h3><p>{{ savedOnly && !saved.length ? '遇到感兴趣的需求，点击卡片右上角的收藏图标。' : '试试其他关键词，或调整筛选条件。' }}</p><button class="btn btn--primary" @click="reset(); savedOnly = false">浏览全部任务 <ArrowRight aria-hidden="true" /></button></div>

          <div v-if="filtered.length" class="tt-bottom"><p>显示 {{ (page-1)*pageSize+1 }}–{{ Math.min(page*pageSize,filtered.length) }} 项，共 {{ filtered.length }} 项</p><nav v-if="pageCount > 1" class="tt-pagination" aria-label="任务分页"><button :disabled="page === 1" aria-label="上一页" @click="goPage(page-1)"><ArrowLeft aria-hidden="true" /></button><button v-for="n in pageCount" :key="n" :class="{selected:page === n}" :aria-label="`第 ${n} 页`" :aria-current="page === n ? 'page' : undefined" @click="goPage(n)">{{ n }}</button><button :disabled="page === pageCount" aria-label="下一页" @click="goPage(page+1)"><ArrowRight aria-hidden="true" /></button></nav></div>
        </section>
      </div>
      <div class="tt-footnote"><span>灵创集市 · 连接商家与 AIGC 创作者</span><a href="/tasks">查看原版任务广场 <ArrowRight aria-hidden="true" /></a></div>
    </div>
    <p v-if="notice" class="tt-notice" role="status"><Check aria-hidden="true" />{{ notice }}</p>
  </main>
</template>
