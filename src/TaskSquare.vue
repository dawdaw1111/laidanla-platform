<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight, ChevronDown, Clock3, Image, Layers, LayoutGrid, RectangleEllipsis, RefreshCw, Search, ShieldCheck, Shirt, SquarePlay, X } from 'lucide-vue-next'
import { squareTasks } from './data/squareTasks'
import { state } from './lib/store'
import './task-square.css'
import MarketplaceCard from './components/MarketplaceCard.vue'

defineEmits(['open-task'])
const categories = [
  { name: '全部', icon: LayoutGrid }, { name: '商品主图', icon: Image },
  { name: '模特换装', icon: Shirt }, { name: '短视频', icon: SquarePlay },
  { name: '详情页', icon: Layers }, { name: '营销文案', icon: RectangleEllipsis },
]
const query = ref(''), search = ref(''), category = ref('全部'), mode = ref('全部')
const minimum = ref(''), maximum = ref(''), sort = ref('综合'), page = ref(1)
const pageSize = 6
const historyOpen = ref(false)
const history = ref(readHistory())
const resultsStatus = ref('')
const grid = ref(null)
const searchInput = ref(null)
let blurTimer
onBeforeUnmount(() => clearTimeout(blurTimer))
function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem('laidanla-refined-search-history') || '[]')
    return Array.isArray(saved) ? saved.filter(v => typeof v === 'string').slice(0, 10) : []
  } catch { return [] }
}
const historySuggestions = computed(() => history.value.filter(item => item.includes(query.value.trim())))
const filtered = computed(() => {
  const keyword = search.value.trim().toLocaleLowerCase()
  const allTasks = [...state.tasks.filter(t => !squareTasks.some(s => s.id === t.id)), ...squareTasks.map(t => ({ ...t, ...state.tasks.find(s => s.id === t.id) }))]
  const list = allTasks.filter(task =>
    (category.value === '全部' || task.category === category.value) &&
    (mode.value === '全部' || task.mode === mode.value) &&
    (!minimum.value || task.price >= Number(minimum.value)) &&
    (!maximum.value || task.price <= Number(maximum.value)) &&
    `${task.title} ${task.category}`.toLocaleLowerCase().includes(keyword),
  )
  if (sort.value === '赏金最高') list.sort((a, b) => b.price - a.price)
  if (sort.value === '最新发布') list.sort((a, b) => b.publishedOrder - a.publishedOrder)
  if (sort.value === '即将截止') list.sort((a, b) => a.remaining - b.remaining)
  return list
})
const pageCount = computed(() => Math.ceil(filtered.value.length / pageSize))
const visible = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const activeFilters = computed(() => search.value || category.value !== '全部' || mode.value !== '全部' || minimum.value || maximum.value)
watch([search, category, mode, minimum, maximum, sort], () => {
  page.value = 1
  resultsStatus.value = `找到 ${filtered.value.length} 个任务`
})
function submitSearch(value = query.value) {
  clearTimeout(blurTimer)
  query.value = value.trim()
  search.value = query.value
  page.value = 1
  historyOpen.value = false
  if (search.value) {
    history.value = [search.value, ...history.value.filter(item => item !== search.value)].slice(0, 10)
    try { localStorage.setItem('laidanla-refined-search-history', JSON.stringify(history.value)) } catch { /* Search remains available without browser storage. */ }
  }
  resultsStatus.value = `找到 ${filtered.value.length} 个任务`
}
function hideHistory() { blurTimer = setTimeout(() => { historyOpen.value = false }, 150) }
function cancelHistoryBlur() { clearTimeout(blurTimer) }
function clearHistory() {
  history.value = []
  try { localStorage.removeItem('laidanla-refined-search-history') } catch { /* Storage is optional. */ }
}
function setMinimum() {
  if (maximum.value && Number(minimum.value) > Number(maximum.value)) maximum.value = minimum.value
}
function setMaximum() {
  if (minimum.value && maximum.value && Number(maximum.value) < Number(minimum.value)) minimum.value = maximum.value
}
function resetFilters() {
  query.value = ''; search.value = ''; category.value = '全部'; mode.value = '全部'
  minimum.value = ''; maximum.value = ''; sort.value = '综合'; page.value = 1
}
async function goToPage(value) {
  if (value < 1 || value > pageCount.value || value === page.value) return
  page.value = value
  resultsStatus.value = `第 ${value} 页，共 ${pageCount.value} 页`
  await nextTick()
  grid.value?.focus({ preventScroll: true })
  const top = grid.value?.getBoundingClientRect().top ?? 0
  if (top < 0) grid.value.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
}
function remainingText(hours) { return `${Math.floor(hours / 24)}天${hours % 24}小时` }
</script>

<template>
  <main class="task-square" aria-labelledby="square-title">
    <section class="square-banner">
      <img src="/assets/task-square/chrome-banner.webp" alt="" aria-hidden="true" />
      <h1 id="square-title">任务广场</h1><span class="square-banner-slash">/</span><p>找到适合你的下一份创作</p>
    </section>

    <div class="square-search-wrap" @focusin="cancelHistoryBlur" @focusout="hideHistory">
      <form class="square-search" role="search" @submit.prevent="submitSearch()">
        <Search aria-hidden="true" />
        <label class="sr-only" for="square-search">搜索任务名称或类目关键词</label>
        <input id="square-search" ref="searchInput" v-model="query" type="search" placeholder="搜索任务名称、类目关键词" autocomplete="off" @focus="historyOpen = true" @keydown.esc="historyOpen = false" />
        <button type="submit">搜索任务</button>
      </form>
      <div v-if="historyOpen && historySuggestions.length" class="square-search-history" @keydown.esc="historyOpen = false; searchInput?.focus()">
        <div><span>搜索历史</span><button type="button" @mousedown.prevent @click="clearHistory">清空</button></div>
        <button v-for="item in historySuggestions" :key="item" type="button" @mousedown.prevent @click="submitSearch(item)"><Clock3 aria-hidden="true" />{{ item }}<ArrowRight aria-hidden="true" /></button>
      </div>
    </div>

    <nav class="square-categories" aria-label="任务分类">
      <button v-for="item in categories" :key="item.name" :class="{ 'is-selected': category === item.name }" :aria-pressed="category === item.name" @click="category = item.name"><component :is="item.icon" aria-hidden="true" /><span>{{ item.name }}</span></button>
    </nav>

    <section class="square-filters" aria-label="筛选与排序">
      <fieldset class="square-mode"><legend class="sr-only">接单模式</legend><span aria-hidden="true">接单模式：</span><button v-for="item in ['全部', '一口价', '比稿']" :key="item" :class="['square-pill', { 'is-selected': mode === item }]" :aria-pressed="mode === item" @click="mode = item">{{ item }}</button></fieldset>
      <div class="square-price"><span>赏金范围：</span><label class="square-select"><span class="sr-only">最低赏金</span><select v-model="minimum" @change="setMinimum"><option value="">不限</option><option v-for="value in [300, 500, 800, 1000, 1500, 2000]" :key="value" :value="String(value)">¥{{ value.toLocaleString() }}</option></select><ChevronDown aria-hidden="true" /></label><span class="square-range-dash">–</span><label class="square-select"><span class="sr-only">最高赏金</span><select v-model="maximum" @change="setMaximum"><option value="">不限</option><option v-for="value in [300, 500, 800, 1000, 1500, 2000]" :key="value" :value="String(value)">¥{{ value.toLocaleString() }}</option></select><ChevronDown aria-hidden="true" /></label></div>
      <fieldset class="square-sorts"><legend class="sr-only">任务排序</legend><span aria-hidden="true">排序：</span><button v-for="item in ['综合', '赏金最高', '最新发布', '即将截止']" :key="item" :class="{ 'is-selected': sort === item }" :aria-pressed="sort === item" @click="sort = item">{{ item }}</button></fieldset>
    </section>

    <div v-if="activeFilters" class="square-result-summary"><span>找到 <strong>{{ filtered.length }}</strong> 个任务<span v-if="search"> · “{{ search }}”</span></span><button @click="resetFilters">重置筛选 <X aria-hidden="true" /></button></div>
    <p class="sr-only" role="status" aria-live="polite">{{ resultsStatus }}</p>

    <div class="square-list-heading"><h2>为你推荐</h2><span>共 {{filtered.length}} 个任务</span><span class="square-list-note">好创意，从一份合适的需求开始</span></div>
    <section id="square-grid" ref="grid" class="square-grid" aria-label="任务列表" tabindex="-1">
      <MarketplaceCard v-for="task in visible" :key="task.id" class="square-card" :task="task" :eager="page===1" @open="$emit('open-task',$event)" />
    </section>

    <div v-if="!filtered.length" class="square-empty"><Search aria-hidden="true" /><h2>暂时没有匹配的任务</h2><p>试试其他关键词，或调整接单模式和赏金范围。</p><button @click="resetFilters">浏览全部任务 <ArrowRight aria-hidden="true" /></button></div>

    <nav v-if="pageCount > 1" class="square-pagination" aria-label="任务分页">
      <button v-if="page > 1" class="square-page-direction" @click="goToPage(page - 1)"><ArrowLeft aria-hidden="true" />上一页</button>
      <button v-for="value in pageCount" :key="value" :class="{ 'is-selected': page === value }" :aria-label="`第 ${value} 页`" :aria-current="page === value ? 'page' : undefined" @click="goToPage(value)">{{ value }}</button>
      <button class="square-page-direction" :disabled="page === pageCount" @click="goToPage(page + 1)">下一页 <ArrowRight aria-hidden="true" /></button>
    </nav>
  </main>
</template>
