(function installCloudSearchUI(global) {
  "use strict";
  const labels = {
    zh: { placeholder:"搜索文件、日期、类型或描述",search:"搜索",clear:"清除搜索",loading:"正在搜索…",failed:"搜索暂时不可用",understood:"理解结果",empty:"未找到文件",emptyHint:"请尝试其他文件名、日期或文件类型。",results:"项结果",private:"我的云资料",public:"公共资料",device:"此设备",multiple:"多条件匹配",fileNameExact:"文件名匹配",fileNamePrefix:"文件名匹配",fileNameContains:"文件名匹配",fileNameTokens:"文件名匹配",fileNameFuzzy:"文件名模糊匹配",fileType:"文件类型匹配",mimeType:"文件类型匹配",folderPath:"路径匹配",createdAt:"日期匹配",modifiedAt:"日期匹配",uploadedAt:"日期匹配",size:"大小匹配" },
    jp: { placeholder:"ファイル・日付・種類・説明を検索",search:"検索",clear:"検索をクリア",loading:"検索中…",failed:"現在検索を利用できません",understood:"検索条件",empty:"ファイルが見つかりません",emptyHint:"別の名前、日付、種類をお試しください。",results:"件",private:"マイクラウド",public:"パブリック",device:"このデバイス",multiple:"複数条件に一致",fileNameExact:"ファイル名一致",fileNamePrefix:"ファイル名一致",fileNameContains:"ファイル名一致",fileNameTokens:"ファイル名一致",fileNameFuzzy:"ファイル名の類似一致",fileType:"ファイル種類一致",mimeType:"ファイル種類一致",folderPath:"パス一致",createdAt:"日付一致",modifiedAt:"日付一致",uploadedAt:"日付一致",size:"サイズ一致" },
    en: { placeholder:"Search files, dates, types, or descriptions",search:"Search",clear:"Clear search",loading:"Searching…",failed:"Search is temporarily unavailable",understood:"Filtered by",empty:"No files found",emptyHint:"Try another name, date, or file type.",results:"results",private:"My cloud files",public:"Public files",device:"This device",multiple:"Multiple conditions",fileNameExact:"File name match",fileNamePrefix:"File name match",fileNameContains:"File name match",fileNameTokens:"File name match",fileNameFuzzy:"Fuzzy file name match",fileType:"File type match",mimeType:"File type match",folderPath:"Path match",createdAt:"Date match",modifiedAt:"Date match",uploadedAt:"Date match",size:"Size match" }
  };
  // 解析器只给结构化条件，界面文案在这里按语言组装（顺序 zh / jp / en）。
  const CATEGORY_LABELS={markdown:["Markdown / MD","Markdown / MD","Markdown / MD"],spreadsheet:["Excel","Excel","Excel"],word:["Word","Word","Word"],document:["文档","ドキュメント","Documents"],presentation:["PowerPoint","PowerPoint","PowerPoint"],pdf:["PDF","PDF","PDF"],image:["图片","画像","Images"],video:["视频","動画","Videos"],archive:["压缩文件","アーカイブ","Archives"],mixed:["多种类型","複数種類","Mixed types"]};
  // 用户已经写出来的词 = 回声，标签就不必再重复一遍（输入「所有md文件」不必再显示 Markdown / MD）。
  const CATEGORY_TOKENS={markdown:["md","markdown"],spreadsheet:["excel","spreadsheet","xlsx","xls","csv"],word:["word","docx","doc"],document:["document","documents","文档","文書","docx","doc","odt","rtf","pdf","md","txt"],presentation:["powerpoint","pptx","ppt","演示","演示文稿","プレゼン","スライド"],pdf:["pdf"],image:["image","images","picture","pictures","图片","图像","照片","画像","写真","png","jpg","jpeg","gif","webp","svg"],video:["video","videos","视频","影片","動画","mp4","webm","mov","m4v"],archive:["archive","archives","zip","压缩包","压缩文件","アーカイブ"],mixed:[]};
  // 键必须与解析器产出的 kind 对齐（dateCreated / dateModified / dateUploaded → created / modified / uploaded）。
  const DATE_VERBS={created:["创建","作成","created"],modified:["修改","変更","modified"],uploaded:["保存","保存","saved"]};
  const VALUE_PREFIXES={nameContains:["名称包含","名前に含む","Name contains"],path:["位置","場所","Location"]};
  const UNSUPPORTED_LABELS={openedAt:["最近打开（暂无元数据）","最近開いた項目は未対応（メタデータがありません）","Recently opened files cannot be filtered yet"]};

  function language(){if(global.WebWindowsCloudI18n)return global.WebWindowsCloudI18n.language();const value=String(global.WebWindowsI18n?.getLanguage?.()||global.localStorage?.getItem("lang")||document.body.dataset.language||"zh").toLowerCase();if(value==="jp"||value.startsWith("ja"))return"jp";if(value.startsWith("en"))return"en";return"zh"}
  function t(key){return labels[language()][key]||labels.zh[key]||key}
  function formatDate(value){if(!value)return"";const date=new Date(typeof value==="number"?value:String(value));return Number.isNaN(date.getTime())?"":date.toLocaleDateString()}
  function formatSize(value){const size=Number(value)||0;if(size<1024)return size+" B";if(size<1048576)return(size/1024).toFixed(1)+" KB";return(size/1048576).toFixed(1)+" MB"}
  function localized(table,key){const row=table?.[key];if(!row)return"";const value=language();return row[value==="jp"?1:value==="en"?2:0]||""}
  function mentioned(query,tokens){const value=String(query||"").toLowerCase();return (tokens||[]).some(token=>value.includes(String(token).toLowerCase()))}
  function formatRange(from,to){const start=formatDate(from);if(!start)return"";const endDate=to?new Date(new Date(to).getTime()-1):null;const end=endDate?formatDate(endDate):"";return end&&end!==start?`${start} ~ ${end}`:start}
  // 把解析器的结构化条件翻成一句话；返回空串表示这条只是把用户输入复述一遍，不显示。
  function understandingText(entry,query){
    if(!entry||typeof entry!=="object")return"";
    if(entry.kind==="fileCategory"){const label=localized(CATEGORY_LABELS,entry.category);return label&&!mentioned(query,CATEGORY_TOKENS[entry.category])?label:""}
    if(entry.kind==="extensions"){const list=String(entry.value||"").split(",").map(item=>item.trim().toUpperCase()).filter(Boolean);if(!list.length)return"";return list.every(item=>mentioned(query,[item]))?"":list.join(" / ")}
    if(entry.kind==="dateCreated"||entry.kind==="dateModified"||entry.kind==="dateUploaded"){const verb=localized(DATE_VERBS,entry.kind.slice(4).toLowerCase());const range=formatRange(entry.from,entry.to);return verb&&range?`${verb} ${range}`:""}
    if(entry.kind==="nameContains"||entry.kind==="path"){const prefix=localized(VALUE_PREFIXES,entry.kind);return prefix&&entry.value?`${prefix} ${entry.value}`:""}
    if(entry.kind==="unsupported")return localized(UNSUPPORTED_LABELS,entry.value);
    return"";
  }
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
    // 搜索词就在正上方的输入框里，结果区再抄一遍只是重复；这里只留结果数。
    const head=document.createElement("header");head.className="file-search-state";
    const summary=document.createElement("span");summary.className="file-search-count";summary.textContent=`${payload.total} ${t("results")}`;head.appendChild(summary);view.appendChild(head);
    const understood=[...(payload.criteria?.understanding||[])].map(entry=>understandingText(entry,query)).filter(Boolean);
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
    let serial=0,controller=null,lastPayload=null,lastQuery="";
    function restore(){serial+=1;controller?.abort();controller=null;input.value="";clear.hidden=true;view.hidden=true;view.replaceChildren();directory.hidden=false}
    async function searchNow(){const query=input.value.trim();if(!query){restore();return}const request=++serial;controller?.abort();controller=new AbortController();clear.hidden=false;directory.hidden=true;view.hidden=false;view.replaceChildren(Object.assign(document.createElement("div"),{className:"file-search-loading",textContent:t("loading")}));try{const payload=await global.WebWindows.files.search(query,{signal:controller.signal,allowAI:true});if(request===serial){lastPayload=payload;lastQuery=query;render(view,payload,query)}}catch(error){if(error?.name!=="AbortError"&&request===serial)view.textContent=t("failed")}}
    function applyLanguage(){input.placeholder=t("placeholder");input.setAttribute("aria-label",t("placeholder"));clear.title=t("clear");clear.setAttribute("aria-label",t("clear"));submit.textContent=t("search");if(lastPayload&&!view.hidden)render(view,lastPayload,lastQuery)}
    // 只有按下「搜索」或回车才出结果。输入过程不联网、不调桌讯，只能做本地字面匹配，
    // 边打边出结果会让用户看到与按钮结果不一致的一套列表，所以输入时保持目录原样。
    form.addEventListener("submit",event=>{event.preventDefault();searchNow()});clear.addEventListener("click",()=>{restore();input.focus()});
    global.addEventListener("storage",event=>{if(event.key==="lang")applyLanguage()});
    global.addEventListener("message",event=>{if(event.data?.type==="change-language")applyLanguage()});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})(window);
