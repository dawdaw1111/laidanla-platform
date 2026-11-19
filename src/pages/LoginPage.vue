<script setup>
import { ref,onBeforeUnmount } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { Store,PenLine,ArrowLeft,Info,Smartphone,ShieldCheck } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { state } from '../lib/store'
const route=useRoute(),router=useRouter(),tab=ref('phone'),role=ref(route.query.role==='merchant'?'merchant':'creator'),phone=ref(''),code=ref(''),agreed=ref(false),count=ref(0),policy=ref('');let timer
function send(){if(!/^1\d{10}$/.test(phone.value)){ElMessage.warning('请输入有效的 11 位手机号');return}code.value='123456';count.value=60;timer=setInterval(()=>{if(--count.value<=0)clearInterval(timer)},1000);ElMessage.info('未发送短信。演示验证码已填入：123456')}
function enter(demo=false){if(!agreed.value)return;if(!demo&&(!/^1\d{10}$/.test(phone.value)||code.value!=='123456')){ElMessage.error('请使用演示验证码 123456，或点击体验演示身份');return}state.session.loggedIn=true;state.session.role=role.value;ElMessage.success('已进入演示身份');const redirect=typeof route.query.redirect==='string'&&route.query.redirect.startsWith('/')&&!route.query.redirect.startsWith('//')?route.query.redirect:role.value==='merchant'?'/merchant':'/creator/orders';router.push(redirect)}
onBeforeUnmount(()=>clearInterval(timer))
</script>
<template>
  <main id="page-content" class="app-ui login-page polished-login">
    <div class="login-layout">
      <section class="login-art">
        <div class="login-fluid" aria-hidden="true"><img src="/assets/pages/login-brand-reference.png" alt="" fetchpriority="high"/></div>
        <RouterLink to="/" class="login-back"><ArrowLeft :size="16"/>返回首页</RouterLink>
        <div class="login-brand-copy">
          <span class="brand-eyebrow"><i/>AIGC 创意任务平台</span>
          <h1>让灵感，<br/>成为生意。</h1>
          <p>每一份好创意，都值得被看见。<br/>连接商家与创作者，让合作从这里开始。</p>
        </div>
        <div class="login-art-footer"><ShieldCheck :size="15"/><span>平台托管</span><i/><span>在线协作</span><i/><span>验收结算</span></div>
      </section>

      <section class="login-form">
        <div class="login-form-inner">
          <div class="login-heading"><span class="login-greeting">你好，欢迎回来</span><h2>登录来单啦</h2><p>新的灵感与合作，正在这里发生。</p></div>
          <el-tabs v-model="tab" stretch><el-tab-pane label="手机号登录" name="phone"/><el-tab-pane label="微信登录" name="wechat"/></el-tabs>
          <form @submit.prevent="enter(false)">
            <div v-if="tab==='phone'" class="login-fields">
              <div class="login-field"><label for="login-phone">手机号</label><el-input id="login-phone" v-model="phone" placeholder="请输入手机号" aria-label="手机号" maxlength="11" inputmode="tel" autocomplete="tel"><template #prefix><Smartphone :size="17"/></template></el-input></div>
              <div class="login-field"><label for="login-code">验证码</label><el-input id="login-code" v-model="code" placeholder="请输入演示验证码" aria-label="验证码" maxlength="6" inputmode="numeric" autocomplete="one-time-code"><template #prefix><ShieldCheck :size="17"/></template><template #append><el-button :disabled="count>0" @click="send">{{count?count+'s 后重试':'获取验证码'}}</el-button></template></el-input></div>
            </div>
            <div v-else class="wechat-demo"><ShieldCheck :size="30"/><h3>微信登录即将开放</h3><p>可使用手机号或下方演示账号体验。</p></div>
            <div class="role-heading"><h3>选择你的身份</h3><span>同一账号可切换</span></div>
            <div class="role-cards">
              <button type="button" :class="{selected:role==='merchant'}" @click="role='merchant'" :aria-pressed="role==='merchant'"><Store :size="21"/><span><strong>我是商家</strong><small>发布需求，寻找创意</small></span><i><svg v-if="role==='merchant'" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 6 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></i></button>
              <button type="button" :class="{selected:role==='creator'}" @click="role='creator'" :aria-pressed="role==='creator'"><PenLine :size="21"/><span><strong>我是创作者</strong><small>发挥所长，承接任务</small></span><i><svg v-if="role==='creator'" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 6 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></i></button>
            </div>
            <div class="login-consent"><el-checkbox v-model="agreed">我已阅读并同意</el-checkbox><button type="button" @click="policy='用户协议'">《用户协议》</button><span>和</span><button type="button" @click="policy='隐私政策'">《隐私政策》</button></div>
            <el-button v-if="tab==='phone'" class="full-button sign-in" type="primary" native-type="submit" :disabled="!agreed">登录并继续 <span aria-hidden="true">→</span></el-button>
            <el-button class="full-button demo-enter" :type="tab==='wechat'?'primary':'default'" :disabled="!agreed" aria-label="体验演示身份，无需填写手机号" @click="enter(true)">使用演示账号体验 <span aria-hidden="true">↗</span></el-button>
          </form>
          <p class="login-caption"><Info :size="13"/>体验环境，无需真实手机号，不会发送短信。</p>
        </div>
      </section>
    </div>
    <el-dialog :model-value="!!policy" :title="policy+' · 演示说明'" width="520px" @close="policy=''" class="app-ui"><p>当前页面用于体验来单啦的前端功能，不开通真实账号、不产生支付和交易。示例数据保存在当前浏览器，可通过浏览器清除站点数据移除。</p><p>正式用户协议和隐私政策将在服务上线前提供；此处为演示说明。</p><template #footer><el-button type="primary" @click="policy=''">我知道了</el-button></template></el-dialog>
  </main>
</template>

<style scoped>
.polished-login{max-width:1320px;margin:auto;padding:48px 48px 36px;min-height:calc(100vh - 113px);display:flex;align-items:center}
.login-layout{width:100%;min-height:726px;display:grid;grid-template-columns:45% 55%;border:1px solid #e2e6ed;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 12px 50px #24366006}
.login-art{background:linear-gradient(110deg,#0028d0,#002ddd);position:relative;overflow:hidden;color:#fff}
.login-fluid{position:absolute;left:0;right:0;bottom:-3px;aspect-ratio:701 / 811;overflow:hidden;pointer-events:none;mask-image:url(/assets/pages/login-fluid-mask.svg);mask-size:100% 100%;mask-repeat:no-repeat}
.login-fluid>img{position:absolute;left:-7.417975%;top:-16.399507%;width:223.680457%;height:123.674476%;max-width:none}
.login-back{position:relative;z-index:1;display:inline-flex;align-items:center;gap:9px;margin:29px 36px;font-size:14px;color:#e1e8ff;transition:color .15s}
.login-back:hover{color:#fff}
.login-brand-copy{position:relative;z-index:1;padding:46px 40px 0}
.brand-eyebrow{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:400;letter-spacing:1.1px;color:#b6c8ff}
.brand-eyebrow>i{height:5px;width:5px;background:#b8d3ff;border-radius:50%}
.polished-login h1{font-size:54px;font-weight:600;line-height:1.42;letter-spacing:-1.8px;margin:24px 0 22px;color:#fff}
.login-brand-copy p{font-size:14px;line-height:1.95;font-weight:400;color:#c9d6ff;letter-spacing:.3px}
.login-art-footer{position:relative;z-index:1;margin:34px 40px 0;border-top:1px solid #ffffff30;padding-top:16px;display:flex;align-items:center;gap:11px;color:#fff;font-size:12px;text-shadow:0 1px 6px #0026be}
.login-art-footer i{width:2px;height:2px;border-radius:50%;background:#ffffff8a}
.login-form{padding:38px 56px;display:flex;justify-content:center;align-items:center}
.login-form-inner{width:100%;max-width:400px}
.login-greeting{font-size:13px;color:#969dac}
.login-heading h2{font-size:28px;letter-spacing:-.8px;font-weight:600;margin:7px 0 8px;line-height:1.4}
.login-heading p{font-size:14px;color:#8a92a0;margin:0 0 25px}
.login-form :deep(.el-tabs__header){margin-bottom:25px}
.login-form :deep(.el-tabs__item){height:43px;font-size:15px;font-weight:500;color:#8992a1}
.login-form :deep(.el-tabs__item.is-active){color:#1645ed}
.login-form :deep(.el-tabs__nav-wrap:after){background:#edf0f5}
.login-fields{display:grid;gap:18px}
.login-field>label{display:block;font-size:14px;font-weight:500;color:#667182;margin-bottom:8px}
.login-field :deep(.el-input__wrapper){height:44px;padding:0 13px;border-radius:6px}
.login-field :deep(.el-input__inner){font-size:14px}
.login-field :deep(.el-input__prefix){margin-right:9px;color:#9aa4b5}
.login-field :deep(.el-input-group__append){background:#fff;padding:0 15px;box-shadow:0 0 0 1px #e0e4ec inset;border-radius:0 6px 6px 0}
.login-field :deep(.el-input-group__append .el-button){font-size:13px;color:#234cda;font-weight:500;padding:0 15px;min-height:42px}
.login-field :deep(.el-input-group__append .el-button.is-disabled){color:#9ca4b5}
.role-heading{display:flex;align-items:center;justify-content:space-between;margin:25px 0 11px}
.role-heading h3{font-size:14px;font-weight:500;margin:0}
.role-heading>span{font-size:12px;color:#8d99ab}
.role-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.role-cards>button{display:flex;text-align:left;align-items:center;gap:11px;border:1px solid #e0e5ee;border-radius:7px;padding:18px 14px;color:#7c889c;position:relative;min-width:0;transition:border-color .16s,background .16s}
.role-cards>button:hover{border-color:#9eafe2}
.role-cards>button>span{min-width:0}.role-cards strong{display:block;font-size:15px;font-weight:500;color:#4d586b;white-space:nowrap}
.role-cards small{display:block;font-size:11px;color:#9aa3b2;margin-top:6px;white-space:nowrap}
.role-cards i{position:absolute;right:9px;top:9px;width:12px;height:12px;border:1px solid #d5dce8;border-radius:50%;display:grid;place-items:center}
.role-cards i svg{width:11px;height:11px}
.role-cards .selected{border-color:#6482f4;background:#f7f9ff;color:#1946e6}
.role-cards .selected strong{color:#2346bd}
.role-cards .selected i{border-color:#1645ed;background:#1645ed;color:#fff}
.login-consent{font-size:12px;margin:23px 0 20px;display:flex;align-items:center;flex-wrap:wrap;gap:0;color:#9199a7}
.login-consent :deep(.el-checkbox){margin:0 4px 0 0}
.login-consent :deep(.el-checkbox__label){font-size:12px;font-weight:400;color:#929aa8;padding-left:6px}
.login-consent :deep(.el-checkbox__inner){width:12px;height:12px;border-radius:3px}
.login-consent :deep(.el-checkbox__inner:after){left:3px;top:0}
.login-consent button{color:#526da8;font-size:12px}
.login-consent button:hover{color:#1645ed}
.polished-login .sign-in{height:43px;border-radius:6px;font-size:14px;letter-spacing:.2px}
.sign-in :deep(>span){width:100%;justify-content:center;position:relative}
.sign-in :deep(>span>span){position:absolute;right:0;font-size:17px;font-weight:400}
.polished-login .sign-in.is-disabled{background:#d9e3ff;border-color:#d9e3ff;color:#fff}
.polished-login .demo-enter{height:40px;border:1px solid #edf0f5;background:#fff;color:#748097;margin-top:11px;font-size:13px}
.polished-login .demo-enter:hover:not(.is-disabled){background:#f8faff;color:#1645ed;border-color:#d7e0fa}
.polished-login .demo-enter.is-disabled{color:#b9c0ce}
.demo-enter :deep(>span){gap:8px}
.polished-login .login-caption{display:flex;justify-content:center;align-items:center;gap:6px;color:#8792a5;margin:19px 0 0;font-size:11px}
.wechat-demo{min-height:153px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f7f9fd;border-radius:7px;color:#8f9db3;gap:8px}
.wechat-demo h3{font-size:15px;font-weight:500;margin:0}
.wechat-demo p{font-size:12px;margin:0;color:#9ba5b4}
@media(min-width:1700px){.polished-login{padding-top:70px;padding-bottom:70px}}
@media(max-width:1100px){.polished-login{padding:35px 34px}.login-form{padding:40px 35px}.login-layout{grid-template-columns:43% 57%;min-height:700px}.login-brand-copy{padding:45px 30px 0}.polished-login h1{font-size:46px}.login-art-footer{left:26px;right:26px;gap:7px;font-size:11px}.role-cards>button{padding:17px 10px;gap:8px}.role-cards small{font-size:11px}}
@media(max-width:760px){.polished-login{padding:23px 18px}.login-layout{display:block;min-height:0;border-radius:12px}.login-art{height:252px}.login-back{margin:20px 25px;font-size:13px}.login-brand-copy{padding:9px 25px 0}.brand-eyebrow{font-size:11px}.polished-login h1{font-size:34px;line-height:1.35;letter-spacing:-1px;margin:13px 0 12px}.polished-login h1 br{display:none}.login-brand-copy p{font-size:12px}.login-art-footer{display:none}.login-fluid{left:auto;right:-40px;width:75%;bottom:-90px;opacity:.5;mask-image:url(/assets/pages/login-fluid-mask.svg),linear-gradient(100deg,transparent,#000);mask-composite:intersect}.login-form{padding:29px 25px 32px}.login-heading h2{font-size:25px}.login-heading p{font-size:13px}.role-cards>button{padding:18px 10px}.role-cards small{font-size:11px}.login-consent{font-size:11px}.polished-login .login-caption{font-size:11px}}
</style>
