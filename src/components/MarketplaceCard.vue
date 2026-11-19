<script setup>
import { computed } from 'vue'
import { ArrowUpRight, Clock3, ShieldCheck, RefreshCw } from 'lucide-vue-next'
const props=defineProps({task:{type:Object,required:true},eager:Boolean})
defineEmits(['open'])
const photo=computed(()=>props.task.image||'/assets/task-square/'+(props.task.art==='beauty'?'skincare':props.task.art)+'.webp')
const participation=computed(()=>props.task.mode==='比稿'?(props.task.bids||0)+' 人已投标':Math.max(0,(props.task.capacity||1)-(props.task.filled||0))+' 个剩余名额')
</script>
<template>
  <article class="market-task-card">
    <button class="market-card-photo" :aria-label="'查看'+task.title" @click="$emit('open',task)"><img :src="photo" :alt="task.category+'创意参考'" :loading="eager?'eager':'lazy'" width="463" height="180"/><span class="market-photo-link"><ArrowUpRight :size="17"/></span></button>
    <div class="market-card-content">
      <div class="market-card-tags"><span>{{task.category}}</span><i/><span>{{task.mode}}</span><span v-if="task.status&&task.status!=='招募中'" class="market-closed">{{task.status}}</span></div>
      <h3><button :title="task.title" @click="$emit('open',task)">{{task.title}}</button></h3>
      <div class="market-card-amount"><strong><small>¥</small>{{task.price.toLocaleString('en-US')}}</strong><span>任务赏金</span><span class="market-participation">{{participation}}</span></div>
      <div class="market-card-spec"><span><Clock3 :size="12"/>{{task.days}} 天交付</span><span><RefreshCw :size="12"/>免费修改 {{task.revisions}} 轮</span></div>
      <div class="market-card-bottom"><span><ShieldCheck :size="13"/>认证商家</span><button @click="$emit('open',task)">查看任务<ArrowUpRight :size="13"/></button></div>
    </div>
  </article>
</template>
<style scoped>
.market-task-card{min-width:0;border:1px solid #e5e9f0;border-radius:10px;background:#fff;padding:0;overflow:hidden;transition:border-color .18s,box-shadow .18s;box-shadow:0 3px 8px #253e6d02}
.market-task-card:hover{border-color:#c5d2ee;box-shadow:0 7px 20px #243c7007}
.market-card-photo{width:100%;height:174px;display:block;overflow:hidden;position:relative;background:#eff2f6;border:0;border-radius:0;text-align:left}
.market-card-photo>img{width:100%;height:100%;display:block;object-fit:cover;object-position:left;transition:transform .35s}
.market-task-card:hover .market-card-photo>img{transform:scale(1.025)}
.market-photo-link{position:absolute;right:12px;top:12px;background:#ffffffdf;width:27px;height:27px;display:grid;place-items:center;border:1px solid #ffffff9c;border-radius:50%;color:#78869c;opacity:0;transition:opacity .18s}
.market-task-card:hover .market-photo-link,.market-task-card:focus-within .market-photo-link{opacity:1}
.market-card-content{padding:18px 20px 0}
.market-card-tags{display:flex;align-items:center;gap:8px;font-size:10px;color:#9ba5b5;margin-bottom:9px;min-height:16px}
.market-card-tags>span:first-child{color:#7487b4}
.market-card-tags>i{width:2px;height:2px;border-radius:50%;background:#b0bac9}
.market-card-tags>.market-closed{margin-left:auto;background:#f3f5f8;color:#8d98aa;border-radius:4px;padding:1px 6px}
.market-card-content h3{font-size:14px;font-weight:500;line-height:1.65;color:#3b485c;margin:0 0 12px;letter-spacing:0}
.market-card-content h3>button{text-align:left;width:100%;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:23px}
.market-card-content h3>button:hover{color:#1645ed}
.market-card-amount{display:flex;align-items:baseline;gap:7px;margin-bottom:14px}
.market-card-amount strong{color:#34425a;font-size:26px;font-weight:500;line-height:1.1;font-variant-numeric:tabular-nums;letter-spacing:-.5px}
.market-card-amount strong small{font-size:14px;margin-right:4px;font-weight:400;color:#78889f}
.market-card-amount>span{font-size:10px;color:#a8b1bf}
.market-card-amount>.market-participation{margin-left:auto;font-size:10px;color:#8b99af}
.market-card-spec{display:flex;align-items:center;gap:18px;color:#8b97aa;font-size:11px;margin-bottom:17px}
.market-card-spec>span,.market-card-bottom>span,.market-card-bottom>button{display:flex;align-items:center;gap:5px}
.market-card-spec svg{color:#a7b2c3}
.market-card-bottom{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f0f2f6;padding:13px 0;color:#93a4b8;font-size:10px}
.market-card-bottom>button{color:#6c86b8;font-size:11px}
.market-card-bottom>button:hover{color:#1645ed}
@media(max-width:1100px){.market-card-photo{height:150px}.market-card-content{padding:16px 15px 0}.market-card-content h3{font-size:13px}.market-card-amount strong{font-size:24px}.market-card-amount>.market-participation{font-size:9px}.market-card-spec{gap:11px;font-size:10px}}
@media(max-width:650px){.market-card-photo{height:172px}.market-card-content{padding:18px 18px 0}.market-card-content h3{font-size:14px}.market-card-amount strong{font-size:28px}.market-card-spec{font-size:11px;gap:18px}.market-card-tags{font-size:11px}.market-card-amount>.market-participation{font-size:11px}.market-card-bottom{font-size:11px}.market-card-bottom>button{font-size:12px}.market-photo-link{opacity:1}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}.market-task-card:hover .market-card-photo>img{transform:none}}
</style>
