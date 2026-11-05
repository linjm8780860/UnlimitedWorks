import{P as n}from"./pluginCreator-rHwM-9vp.js";import{SourcePluginAdapter as s}from"./sourcePluginAdapter-B__9Umoe.js";import{e as a}from"./index-DCG6pvV7.js";import{SourcePluginStore as p}from"./sourcePluginStore-DZ-EUHTy.js";import{sourceHostPermissions as c}from"./sourceHostCatalog-C-7VChCs.js";import"./pluginSourceCompiler-BQHx4PR4.js";import"./isolatedPluginExecutor-CZ85aTe1.js";import"./lucide-MLwtlaUE.js";import"./react-vendor-BYTcDeTJ.js";import"./marked-C_DcXP89.js";async function y(r){const e=(await a().listInstalled()).find(o=>o.manifest.id===r);if(!e||e.manifest.source!=="generated")throw new Error("未找到可编辑的源码插件");const t=await new p().get(e.artifactHash);if(!t)throw new Error("插件源码产物缺失，无法编辑");return{draftId:`edit-${crypto.randomUUID()}`,manifest:structuredClone(t.manifest),createdAt:Date.now(),files:{"manifest.json":JSON.stringify(t.manifest,null,2),"host.ts":t.source}}}let i;function f(){return i||(i=new n(new s,void 0,void 0,{apiVersion:"uw-plugin-api.v1",hostCapabilities:["tools","commands","settings","promptSections"],clientSlots:[],settingsNamespaces:["plugin.*"],permissionCatalog:c()})),i}function C(){const r=Math.random().toString(36).slice(2,8),e=`text_helper_${r}`,t=f().scaffold({id:`user.text-helper-${r}`,name:"文本处理助手",purpose:"将输入文字转为大写，可继续编辑为自己的文本处理工具。",capabilities:{tools:[e]},permissions:[]});return t.manifest.scope="app",t.files["manifest.json"]=JSON.stringify(t.manifest,null,2),t.files["host.ts"]=`// describe 声明能力；handler 指向本文件导出的函数。
export function describe() {
  return { tools: [{
    name: ${JSON.stringify(e)},
    description: "将输入文字转为大写",
    inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
    handler: "transform"
  }] };
}

export function transform(input: { text: string }): string {
  return input.text.toUpperCase();
}
`,t}export{C as createSourcePluginDraft,f as getSourcePluginCreator,y as loadSourcePluginDraft};
