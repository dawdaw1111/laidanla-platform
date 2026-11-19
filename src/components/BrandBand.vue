<script setup>import { ShieldCheck } from 'lucide-vue-next';defineProps({text:{type:String,default:'一份清晰的需求，一次满意的交付。'}})</script>
<template><div class="brand-band"><img src="/assets/task-square/chrome-banner.webp" alt="" /><ShieldCheck :size="24" /><span>{{text}}</span></div></template>
