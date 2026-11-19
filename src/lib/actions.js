import { ElMessage, ElMessageBox } from 'element-plus'
import { state } from './store'

export const confirm = async (message, title='请确认操作') => {
  try { await ElMessageBox.confirm(message,title,{confirmButtonText:'确认',cancelButtonText:'取消',type:'warning',closeOnClickModal:false}); return true } catch { return false }
}
export function requireRole(router, role, certified=false) {
  if (!state.session.loggedIn) { ElMessage.info('请先选择演示身份'); router.push({path:'/login',query:{redirect:router.currentRoute.value.fullPath,role}}); return false }
  if (state.session.role!==role) { ElMessage.info(`请在个人中心切换为${role==='merchant'?'商家':'创作者'}身份`); router.push('/profile'); return false }
  const kind=role==='merchant'?'business':'personal'
  if(certified && state.auth[kind]!=='演示已认证'){ ElMessage.info(`请先完成${role==='merchant'?'企业':'实名'}认证演示`);router.push({path:'/verification',query:{tab:kind,redirect:router.currentRoute.value.fullPath}});return false }
  return true
}
export const notify = (message) => ElMessage.success(message)
