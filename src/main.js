import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { ElConfigProvider, ElButton, ElInput, ElInputNumber, ElSelect, ElOption, ElForm, ElFormItem, ElCheckbox, ElCheckboxGroup, ElRadioGroup, ElRadioButton, ElRadio, ElSwitch, ElUpload, ElSteps, ElStep, ElTabs, ElTabPane, ElTable, ElTableColumn, ElPagination, ElDatePicker, ElDialog, ElEmpty, ElRate, ElImage, ElDropdown, ElDropdownMenu, ElDropdownItem, ElCollapse, ElCollapseItem, ElTimeline, ElTimelineItem } from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import './app-ui.css'
import './refinement.css'
import './refinement-pages.css'
import './refinement-details.css'
const app=createApp(App)
for(const component of [ElConfigProvider,ElButton,ElInput,ElInputNumber,ElSelect,ElOption,ElForm,ElFormItem,ElCheckbox,ElCheckboxGroup,ElRadioGroup,ElRadioButton,ElRadio,ElSwitch,ElUpload,ElSteps,ElStep,ElTabs,ElTabPane,ElTable,ElTableColumn,ElPagination,ElDatePicker,ElDialog,ElEmpty,ElRate,ElImage,ElDropdown,ElDropdownMenu,ElDropdownItem,ElCollapse,ElCollapseItem,ElTimeline,ElTimelineItem]) app.component(component.name,component)
app.use(router).mount('#app')
