(function installCloudSearchUI(global) {
  "use strict";
  const DEBOUNCE_MS = 350;
  const labels = {
    zh: { placeholder:"搜索文件、日期、类型或描述",search:"搜索",clear:"清除搜索",loading:"正在搜索…",heading:"搜索结果：",understood:"理解结果",empty:"未找到文件",emptyHint:"请尝试其他文件名、日期或文件类型。",results:"项结果",private:"我的云资料",public:"公共资料",device:"此设备",multiple:"多条件匹配",fileNameExact:"文件名匹配",fileNamePrefix:"文件名匹配",fileNameContains:"文件名匹配",fileNameTokens:"文件名匹配",fileNameFuzzy:"文件名模糊匹配",fileType:"文件类型匹配",mimeType:"文件类型匹配",folderPath:"路径匹配",createdAt:"日期匹配",modifiedAt:"日期匹配",uploadedAt:"日期匹配",size:"大小匹配" },
    jp: { placeholder:"ファイル・日付・種類・説明を検索",search:"検索",clear:"検索をクリア",loading:"検索中…",heading:"検索結果：",understood:"検索条件",empty:"ファイルが見つかりません",emptyHint:"別の名前、日付、種類をお試しください。",results:"件",private:"マイクラウド",public:"パブリック",device:"このデバイス",multiple:"複数条件に一致",fileNameExact:"ファイル名一致",fileNamePrefix:"ファイル名一致",fileNameContains:"ファイル名一致",fileNameTokens:"ファイル名一致",fileNameFuzzy:"ファイル名の類似一致",fileType:"ファイル種類一致",mimeType:"ファイル種類一致",folderPath:"パス一致",createdAt:"日付一致",modifiedAt:"日付一致",uploadedAt:"日付一致",size:"サイズ一致" },
    en: { placeholder:"Search files, dates, types, or descriptions",search:"Search",clear:"Clear search",loading:"Searching…",heading:"Search results: ",understood:"Understood as",empty:"No files found",emptyHint:"Try another name, date, or file type.",results:"results",private:"My cloud files",public:"Public files",device:"This device",multiple:"Multiple conditions",fileNameExact:"File name match",fileNamePrefix:"File name match",fileNameContains:"File name match",fileNameTokens:"File name match",fileNameFuzzy:"Fuzzy file name match",fileType:"File type match",mimeType:"File type match",folderPath:"Path match",createdAt:"Date match",modifiedAt:"Date match",uploadedAt:"Date match",size:"Size match" }
  };
  function language(){const value=String(document.body.dataset.language||global.localStorage?.getItem("lang")||"zh").toLowerCase();if(value==="jp"||value.startsWith("ja"))return"jp";if(value.startsWith("en"))return"en";return"zh"}
  function t(key){return labels[language()][key]||labels.zh[key]||key}
  function formatDate(value){if(!value)return"";const date=new Date(typeof value==="number"?value:String(value));return Number.isNaN(date.getTime())?"":date.toLocaleDateString()}
  function formatSize(value){const size=Number(value)||0;if(size<1024)return size+" B";if(size<1048576)return(size/1024).toFixed(1)+" KB";return(size/1048576).toFixed(1)+" MB"}
  function iconFor(result){const extension=String(result.extension||result.name?.split(".").pop()||"").toLowerCase();if(["png","jpg","jpeg","gif","webp"].includes(extension))return"assets/image.svg";if(extension==="pdf")return"assets/pdf.svg";if(["xlsx","xls","csv"].includes(extension))return"assets/sheet.svg";if(["docx","doc"].includes(extension))return"assets/word.svg";if(["pptx","ppt"].includes(extension))return"assets/presentation.svg";if(extension==="json")return"assets/json.svg";if(extension==="md")return"assets/markdown.svg";if(extension==="zip")return"assets/archive.svg";return"assets/file.svg"}
  function reasonsFor(reasons){const values=[...new Set((reasons||[]).map(t))];return values.length>1?[t("multiple"),...values]:values}
  async function openResult(result){
    if(result.source==="device"){
      const device=global.WebWindows?.device||(()=>{try{return global.parent?.WebWindows?.device}catch(_){return null}})();
      const match=String(result.path).match(/^device:\/\/([^/]+)\/(.*)$/);if(!device?.storage||!match)return;
      const opened=await device.storage.openFile(decodeURIComponent(match[1]),match[2].split("/").filter(Boolean).map(decodeURIComponent));
      const url=URL.createObjectURL(new Blob([opened.data],{type:result.mimeType}));result=Object.assign({},result,{url,readUrl:url});
    }
    const scope=result.scope||result.source;
    const resource={protocol:"webwindows-cloud-resource",version:"1.1",nodeId:result.nodeId,scope,path:result.path,name:result.name,mimeType:result.mimeType,size:result.size,readUrl:result.readUrl,url:result.readUrl,editorDataUrl:result.editorDataUrl,saveEndpoint:result.saveEndpoint,permissions:{read:true,download:true,edit:scope==="private"}};
    if(global.parent&&global.parent!==global&&typeof global.parent.openResource==="function")return global.parent.openResource(resource);
    if(typeof global.openResource==="function")return global.openResource(resource);
    if(result.readUrl)global.open(result.readUrl,"_blank","noopener");
  }
  function render(view,payload,query){
    view.replaceChildren();
    const head=document.createElement("header");head.className="file-search-state";
    const title=document.createElement("h2");title.append(document.createTextNode(t("heading")));
    const queryLabel=document.createElement("input");queryLabel.className="file-search-query";queryLabel.type="text";queryLabel.readOnly=true;queryLabel.tabIndex=-1;queryLabel.value=query;queryLabel.size=Math.min(60,Math.max(1,[...query].length));title.appendChild(queryLabel);
    const summary=document.createElement("span");summary.textContent=`${payload.total} ${t("results")}`;head.append(title,summary);view.appendChild(head);
    const understood=[...(payload.criteria?.understanding||[])];
    if(understood.length){const row=document.createElement("div");row.className="file-search-understanding";const label=document.createElement("strong");label.textContent=`${t("understood")}：`;row.appendChild(label);understood.forEach(value=>{const tag=document.createElement("span");tag.textContent=value;row.appendChild(tag)});view.appendChild(row)}
    const ordered=[...(payload.results||[])].sort((a,b)=>Number(b.relevanceScore||0)-Number(a.relevanceScore||0));
    if(!ordered.length){const empty=document.createElement("div");empty.className="empty-state file-search-empty";empty.innerHTML='<img src="assets/file.svg" alt=""><h2></h2><p></p>';empty.querySelector("h2").textContent=t("empty");empty.querySelector("p").textContent=t("emptyHint");view.appendChild(empty);return}
    ordered.forEach(result=>{
      const button=document.createElement("button");button.type="button";button.className="file-item file-search-result";button.dataset.score=String(result.relevanceScore||0);
      const icon=document.createElement("img");icon.src=iconFor(result);icon.alt="";
      const name=document.createElement("span");name.className="file-name";name.textContent=result.displayName||result.name;
      const path=document.createElement("span");path.className="file-meta file-search-path";path.textContent=`${t(result.source)} · ${result.folderPath||"/"}`;
      const metadata=document.createElement("span");metadata.className="file-meta";metadata.textContent=[result.extension?.toUpperCase(),formatSize(result.size),formatDate(result.modifiedAt)].filter(Boolean).join(" · ");
      const reasons=document.createElement("span");reasons.className="file-search-reasons";reasonsFor(result.matchReasons).forEach(reason=>{const badge=document.createElement("em");badge.textContent=reason;reasons.appendChild(badge)});
      button.append(icon,name,path,metadata,reasons);button.addEventListener("click",()=>openResult(result).catch(console.warn));view.appendChild(button);
    });
  }
  function initialize(){
    if(document.body.dataset.mode==="picker"||!global.WebWindows?.files?.search)return;
    const directory=document.querySelector("[data-directory-content]")||document.querySelector(".file-list")||document.querySelector(".files");
    const host=document.querySelector("[data-search-host]")||document.querySelector(".toolbar-right")||document.querySelector(".actions");if(!directory||!host)return;
    const form=document.createElement("form");form.className="file-search-box";form.setAttribute("role","search");
    const input=document.createElement("input");input.type="search";input.placeholder=t("placeholder");input.setAttribute("aria-label",t("placeholder"));
    const clear=document.createElement("button");clear.type="button";clear.className="file-search-clear";clear.textContent="×";clear.title=t("clear");clear.setAttribute("aria-label",t("clear"));clear.hidden=true;
    const submit=document.createElement("button");submit.type="submit";submit.className="file-search-submit";submit.textContent=t("search");form.append(input,clear,submit);host.prepend(form);
    const view=document.createElement("section");view.className=`file-list file-search-view ${[...directory.classList].find(value=>["large","small","detail"].includes(value))||"large"}`;view.hidden=true;view.setAttribute("aria-live","polite");directory.insertAdjacentElement("afterend",view);
    let timer=0,serial=0,controller=null;
    function restore(){clearTimeout(timer);serial+=1;controller?.abort();controller=null;input.value="";clear.hidden=true;view.hidden=true;view.replaceChildren();directory.hidden=false}
    async function searchNow(allowAI){const query=input.value.trim();if(!query){restore();return}const request=++serial;controller?.abort();controller=new AbortController();clear.hidden=false;directory.hidden=true;view.hidden=false;view.innerHTML=`<div class="file-search-loading">${t("loading")}</div>`;try{const payload=await global.WebWindows.files.search(query,{signal:controller.signal,allowAI:allowAI===true});if(request===serial)render(view,payload,query)}catch(error){if(error?.name!=="AbortError"&&request===serial)view.textContent=error.message}}
    function schedule(){clearTimeout(timer);if(!input.value.trim()){restore();return}timer=global.setTimeout(()=>searchNow(false),DEBOUNCE_MS)}
    form.addEventListener("submit",event=>{event.preventDefault();clearTimeout(timer);searchNow(true)});input.addEventListener("input",schedule);clear.addEventListener("click",()=>{restore();input.focus()});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})(window);
