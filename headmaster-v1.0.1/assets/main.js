import{g as Y,a as ee,b as te,o as ne,c as re}from"./storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const l of a)if(l.type==="childList")for(const o of l.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(a){const l={};return a.integrity&&(l.integrity=a.integrity),a.referrerPolicy&&(l.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?l.credentials="include":a.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(a){if(a.ep)return;a.ep=!0;const l=n(a);fetch(a.href,l)}})();const ae=`
  <header class="app-header">
    <h1>Headmaster</h1>
    <p class="tagline">Independent header rules — every match applies.</p>
  </header>

  <main>
    <p
      id="sync-status"
      class="sync-status"
      role="status"
      aria-live="polite"
      hidden
    ></p>

    <div class="toolbar">
      <button type="button" id="export-btn">Export</button>
      <button type="button" id="import-btn">Import</button>
      <input type="file" id="import-file" accept="application/json,.json" hidden />
    </div>

    <div id="rules-header" class="rules-header" hidden>
      <span id="tab-status" class="tab-status"></span>
      <label class="master-toggle" title="Enable or disable all rules">
        <input type="checkbox" id="master-toggle" />
        <span id="master-label">All enabled</span>
      </label>
    </div>

    <section id="rule-list" class="rule-list" aria-label="Header rules"></section>

    <section class="editor">
      <h2 id="editor-title">Add rule</h2>
      <form id="rule-form" autocomplete="off">
        <label>
          <span>Label <em>(optional)</em></span>
          <input type="text" name="label" placeholder="Dev env header" />
        </label>

        <label>
          <span>Header name</span>
          <input type="text" name="headerName" placeholder="X-Env" required />
        </label>

        <label>
          <span>Operation</span>
          <select name="operation">
            <option value="set">Set</option>
            <option value="append">Append</option>
            <option value="remove">Remove</option>
          </select>
        </label>

        <label id="value-field">
          <span>Value</span>
          <input type="text" name="headerValue" placeholder="dev" />
        </label>

        <label>
          <span>URL filter</span>
          <input
            type="text"
            name="urlFilter"
            placeholder="||dev.example.com"
            required
          />
          <small class="hint">
            Match pattern. e.g. <code>||dev.example.com</code> (a host and its
            subdomains), <code>*/api/*</code> (path contains),
            <code>|https://</code> (URL start). See "URL filter help" below.
          </small>
        </label>

        <p id="form-error" class="error" role="alert" hidden></p>

        <div class="form-actions">
          <button type="submit" id="save-btn">Add rule</button>
          <button type="button" id="cancel-btn" hidden>Cancel</button>
        </div>
      </form>
    </section>
  </main>

  <footer class="app-footer">
    <span id="version"></span>
    <span class="app-footer__links">
      <button type="button" id="open-full-view" class="linklike open-full-view">
        Open full view ⤢
      </button>
      <a href="/help/help.html" target="_blank" rel="noopener"
        >URL filter help</a
      >
    </span>
  </footer>
`,le="*://*/*",ie=/^[a-z0-9.-]+$/i;function oe(e){return e?e==="localhost"?!0:ie.test(e)&&e.includes(".")&&!e.startsWith(".")&&!e.endsWith("."):!1}function se(e){let t=e.trim();if(!t)return null;let n=!1;if(t.startsWith("||")?(n=!0,t=t.slice(2)):t.startsWith("|")&&(t=t.slice(1)),t=t.replace(/^(\*|https?|wss?):\/\//i,""),t.startsWith("*."))n=!0,t=t.slice(2);else if(t.startsWith("*"))return null;const r=t.split(/[/*?#:^|]/,1)[0]??"";return oe(r)?n?[`*://${r}/*`,`*://*.${r}/*`]:[`*://${r}/*`]:null}function O(e){return se(e)??[le]}function ce(e){return chrome.permissions.request({origins:O(e)})}async function P(e){try{return await chrome.permissions.contains({origins:O(e)})}catch{return!1}}const de=/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;function W(e){return e?de.test(e)?null:"Header name may only contain letters, digits, and ! # $ % & ' * + - . ^ _ ` | ~":"Header name is required."}function z(e){return/[\x00-\x1F\x7F]/.test(e)?"Header value cannot contain control characters (e.g. newlines).":null}function j(e){return e?/\s/.test(e)?"URL filter cannot contain spaces.":/[^\x20-\x7E]/.test(e)?"URL filter must be printable ASCII — use punycode for international domains.":null:"URL filter is required."}const J=1,H=1e3;function ue(e){return JSON.stringify({version:J,rules:e},null,2)}function X(e){return typeof e=="object"&&e!==null}function me(e){let t;try{t=JSON.parse(e)}catch{throw new Error("File is not valid JSON.")}if(!X(t)||!Array.isArray(t.rules))throw new Error("Unrecognized file format (missing a rules array).");if(t.version!==J)throw new Error(`Unsupported file version: ${String(t.version)}.`);if(t.rules.length>H)throw new Error(`Too many rules (${t.rules.length}); the limit is ${H}.`);return t.rules.map(pe)}function pe(e,t){const n=`Rule ${t+1}`;if(!X(e))throw new Error(`${n} is not an object.`);const r=e.operation==="set"||e.operation==="append"||e.operation==="remove"?e.operation:null;if(!r)throw new Error(`${n} has an invalid operation.`);const a=typeof e.headerName=="string"?e.headerName:"",l=W(a);if(l)throw new Error(`${n}: ${l}`);const o=typeof e.urlFilter=="string"?e.urlFilter:"",u=j(o);if(u)throw new Error(`${n}: ${u}`);let d="";if(r!=="remove"){if(d=typeof e.headerValue=="string"?e.headerValue:"",!d)throw new Error(`${n} is missing a value.`);const s=z(d);if(s)throw new Error(`${n}: ${s}`)}return{id:crypto.randomUUID(),enabled:e.enabled===!0,label:typeof e.label=="string"?e.label:"",headerName:a,headerValue:d,operation:r,urlFilter:o}}function fe(e,t){let n=e;if(!n||!t)return!1;let r=!1,a=!1,l=!1;n.startsWith("||")?(r=!0,n=n.slice(2)):n.startsWith("|")&&(a=!0,n=n.slice(1)),n.endsWith("|")&&(l=!0,n=n.slice(0,-1));let o="";for(const s of n)s==="*"?o+=".*":s==="^"?o+="(?:[^A-Za-z0-9_.%-]|$)":o+=he(s);const u=r?"^[a-z][a-z0-9+.\\-]*://(?:[^/?#]*\\.)?":a?"^":"",d=l?"$":"";try{return new RegExp(u+o+d,"i").test(t)}catch{return!1}}function he(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}let B,p,V,k,I,Z,F,L,M,T,g,G,y,K,q,S,C,E,i=[],w=null,R="";const U=[];function Q(e){return JSON.stringify(e.map(t=>[t.id,t.enabled,t.label,t.headerName,t.headerValue,t.operation,t.urlFilter]))}async function h(e){i=e,U.push(Q(e)),await re(i),await $()}async function $(){ge();const e=i;if(e.length===0){B.replaceChildren(be());return}const t=await Promise.all(e.map(r=>r.enabled?P(r.urlFilter):Promise.resolve(!0))),n=e.map((r,a)=>ye(r,t[a]));B.replaceChildren(...n)}function be(){const e=document.createElement("div");e.className="empty";const t=document.createElement("p");t.className="empty__title",t.textContent="No rules yet.",e.append(t);const n=document.createElement("p");n.className="empty__hint",n.textContent="A rule sends (or removes) a header on URLs that match a pattern — for example, send X-Env: dev to ||dev.example.com.",e.append(n);const r=document.createElement("button");return r.type="button",r.className="empty__example",r.textContent="Fill in this example",r.addEventListener("click",ve),e.append(r),e}function ve(){f("label","Dev env header"),f("headerName","X-Env"),f("headerValue","dev"),f("urlFilter","||dev.example.com"),E.value="set",x(),b(),C.focus()}function Ee(){if(!R){S.textContent="";return}const e=i.filter(t=>t.enabled&&fe(t.urlFilter,R)).length;S.textContent=e>0?`${e} active on this page`:"None active on this page"}function ge(){if(G.hidden=i.length===0,i.length===0)return;Ee();const e=i.length,t=i.filter(r=>r.enabled).length,n=t===e;y.checked=n,y.indeterminate=t>0&&!n,K.textContent=n?"All enabled":t===0?"All disabled":`${t} of ${e} enabled`}function ye(e,t){const n=document.createElement("div");n.className="rule"+(e.enabled?"":" rule--disabled");const r=document.createElement("input");r.type="checkbox",r.checked=e.enabled,r.title=e.enabled?"Enabled":"Disabled",r.setAttribute("aria-label",`Rule ${e.label||e.headerName}`),r.addEventListener("change",()=>{we(e,r)});const a=document.createElement("div");if(a.className="rule__body",e.label){const c=document.createElement("div");c.className="rule__label",c.textContent=e.label,a.append(c)}const l=document.createElement("div");l.className="rule__header",l.textContent=e.operation==="remove"?`remove ${e.headerName}`:e.operation==="append"?`${e.headerName} += ${e.headerValue}`:`${e.headerName}: ${e.headerValue}`,l.title=l.textContent,a.append(l);const o=document.createElement("div");if(o.className="rule__url",o.textContent=e.urlFilter,o.title=e.urlFilter,a.append(o),e.enabled&&!t){const c=document.createElement("button");c.type="button",c.className="rule__warn",c.textContent="⚠ Needs site access — click to grant",c.addEventListener("click",()=>{Le(e.urlFilter)}),a.append(c)}const u=document.createElement("div");u.className="rule__actions";const d=document.createElement("button");d.type="button",d.textContent="Edit",d.addEventListener("click",()=>Ie(e));const s=document.createElement("button");s.type="button",s.textContent="Duplicate",s.addEventListener("click",()=>xe(e));const v=document.createElement("button");return v.type="button",v.className="danger",v.textContent="Delete",v.addEventListener("click",()=>{w===e.id&&A(),h(i.filter(c=>c.id!==e.id))}),u.append(d,s,v),n.append(r,a,u),n}async function we(e,t){if(t.checked&&!await _(e.urlFilter)){t.checked=!1,m("Site access was denied — rule left disabled.");return}b(),await h(i.map(n=>n.id===e.id?{...n,enabled:t.checked}:n))}async function _(e){try{return await ce(e)}catch{return!1}}function xe(e){const t={...e,id:crypto.randomUUID(),label:e.label?`${e.label} (copy)`:""},n=i.findIndex(a=>a.id===e.id),r=[...i];r.splice(n+1,0,t),h(r)}async function Ne(){if(!y.checked){await h(i.map(n=>({...n,enabled:!1})));return}const e=new Set;for(const n of i)for(const r of O(n.urlFilter))e.add(r);if(e.size>0)try{await chrome.permissions.request({origins:[...e]})}catch{}const t=await Promise.all(i.map(n=>P(n.urlFilter)));await h(i.map((n,r)=>({...n,enabled:t[r]})))}async function Le(e){await _(e)?(b(),await $()):m("Site access was denied.")}function Ie(e){w=e.id,f("label",e.label),f("headerName",e.headerName),f("headerValue",e.headerValue),f("urlFilter",e.urlFilter),E.value=e.operation,x(),V.textContent="Edit rule",k.textContent="Save changes",I.hidden=!1,b(),p.scrollIntoView({behavior:"smooth",block:"nearest"}),C.focus()}function A(){w=null,p.reset(),x(),V.textContent="Add rule",k.textContent="Add rule",I.hidden=!0,b()}function f(e,t){p.elements.namedItem(e).value=t}function N(e){return p.elements.namedItem(e).value.trim()}function x(){Z.hidden=E.value==="remove"}function m(e){F.textContent=e,F.hidden=!1}function b(){F.hidden=!0}function D(e){e?(L.textContent=`Couldn't apply rules: ${e}`,L.hidden=!1):L.hidden=!0}function Fe(){if(i.length===0)return m("No rules to export.");b();const e=new Blob([ue(i)],{type:"application/json"}),t=URL.createObjectURL(e),n=document.createElement("a");n.href=t,n.download="headmaster-rules.json",n.click(),setTimeout(()=>URL.revokeObjectURL(t),0)}async function Re(e){let t;try{t=me(await e.text())}catch(n){return m(n instanceof Error?n.message:"Import failed.")}if(t.length===0)return m("That file contained no rules.");b(),await h([...i,...t])}async function $e(){const e=E.value,t=N("headerName"),n=N("headerValue"),r=N("urlFilter"),a=W(t);if(a)return m(a);const l=j(r);if(l)return m(l);if(e!=="remove"){if(!n)return m(`Value is required when you ${e} a header.`);const s=z(n);if(s)return m(s)}const o={label:N("label"),headerName:t,headerValue:e==="remove"?"":n,operation:e,urlFilter:r};if(w){const s=w;if(i.find(c=>c.id===s)?.enabled&&!await _(r))return m("Site access was denied — change not saved.");await h(i.map(c=>c.id===s?{...c,...o}:c)),A();return}const u=await _(r),d={id:crypto.randomUUID(),enabled:u,...o};await h([...i,d]),A(),C.focus(),u||m("Added as disabled — site access was denied.")}async function _e(){const e=document.getElementById("app-root");if(!e)throw new Error("Missing #app-root");if(e.innerHTML=ae,B=document.getElementById("rule-list"),p=document.getElementById("rule-form"),V=document.getElementById("editor-title"),k=document.getElementById("save-btn"),I=document.getElementById("cancel-btn"),Z=document.getElementById("value-field"),F=document.getElementById("form-error"),L=document.getElementById("sync-status"),M=document.getElementById("export-btn"),T=document.getElementById("import-btn"),g=document.getElementById("import-file"),G=document.getElementById("rules-header"),y=document.getElementById("master-toggle"),K=document.getElementById("master-label"),q=document.getElementById("version"),S=document.getElementById("tab-status"),C=p.elements.namedItem("headerName"),E=p.elements.namedItem("operation"),E.addEventListener("change",x),I.addEventListener("click",A),y.addEventListener("change",()=>void Ne()),M.addEventListener("click",Fe),T.addEventListener("click",()=>g.click()),g.addEventListener("change",()=>{const n=g.files?.[0];n&&Re(n),g.value=""}),p.addEventListener("submit",n=>{n.preventDefault(),$e()}),document.getElementById("open-full-view").addEventListener("click",()=>chrome.runtime.openOptionsPage()),q.textContent=`v${chrome.runtime.getManifest().version}`,document.body.classList.contains("app--popup"))try{const[n]=await chrome.tabs.query({active:!0,currentWindow:!0});R=n?.url??""}catch{R=""}i=await Y(),x(),D(await ee()),te(D),ne(n=>{const r=Q(n),a=U.indexOf(r);if(a!==-1){U.splice(a,1);return}i=n,$()}),await $()}_e();
