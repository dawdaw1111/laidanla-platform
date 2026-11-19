<script setup>
import { onBeforeUnmount } from 'vue'
import { UploadCloud, FileText, X } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
const props=defineProps({modelValue:{type:Array,default:()=>[]},limit:{type:Number,default:20},maxMb:{type:Number,default:20},videoMb:{type:Number,default:500},imagesOnly:Boolean,label:{type:String,default:'添加素材'},video:{type:Boolean,default:true}})
const emit=defineEmits(['update:modelValue'])
const urls=new Set()
function add(file) {
  if(props.modelValue.length>=props.limit){ElMessage.warning(`最多上传 ${props.limit} 个文件`);return}
  const image=/^image\/(jpeg|png|webp)$/.test(file.raw.type),video=props.video&&/^video\/(mp4|webm|quicktime)$/.test(file.raw.type),doc=/\.(zip|rar|7z|pdf|docx?|pptx?|xlsx?|txt)$/i.test(file.name)
  if(props.imagesOnly?!image:!(image||video||doc)){ElMessage.error('文件格式不支持，请选择图片、视频或文档压缩包');return}
  const max=video?props.videoMb:props.maxMb
  if(file.size>max*1024*1024){ElMessage.error(`单个文件不能超过 ${max} MB`);return}
  const url=image?URL.createObjectURL(file.raw):'';if(url)urls.add(url)
  emit('update:modelValue',[...props.modelValue,{uid:file.uid,name:file.name,size:file.size,image:url,type:image?'image':video?'video':'document',local:true}])
}
function remove(uid){const item=props.modelValue.find(f=>f.uid===uid);if(urls.has(item?.image)){URL.revokeObjectURL(item.image);urls.delete(item.image)};emit('update:modelValue',props.modelValue.filter(f=>f.uid!==uid))}
// Object URLs last only for this browser session. Only names and metadata are persisted.
onBeforeUnmount(()=>{ /* Parent state owns previews until the browser session closes. */ })
</script>
<template><div class="file-upload"><div class="upload-preview-grid"><div v-for="file in modelValue" :key="file.uid" class="upload-preview"><img v-if="file.image" :src="file.image" :alt="file.name" @error="$event.target.style.display='none'"/><FileText v-else :size="30"/><button type="button" :aria-label="`移除${file.name}`" @click="remove(file.uid)"><X :size="13"/></button><span :title="file.name">{{file.name}}</span></div><el-upload drag :auto-upload="false" :show-file-list="false" :multiple="limit>1" :accept="imagesOnly?'image/jpeg,image/png,image/webp':'.jpg,.jpeg,.png,.webp,.mp4,.mov,.webm,.zip,.rar,.7z,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'" :on-change="add"><UploadCloud :size="26"/><strong>{{label}}</strong><small>拖拽或点击上传</small></el-upload></div><p class="field-help">最多 {{limit}} 个文件 · 图片{{imagesOnly?'':' / 文档'}} ≤ {{maxMb}} MB{{!imagesOnly&&video?` · 视频 ≤ ${videoMb} MB`:''}}。演示仅保留文件信息，重新打开需重新选择本地文件。</p></div></template>
