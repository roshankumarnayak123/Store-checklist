import{initializeApp as e}from"https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";import{get as t,getDatabase as n,increment as r,onValue as i,push as a,ref as o,remove as s,serverTimestamp as c,set as l,update as u}from"https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";import{deleteObject as d,getDownloadURL as f,getStorage as p,ref as m,uploadBytesResumable as h}from"https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";import{sha256 as g}from"https://cdn.jsdelivr.net/npm/js-sha256@0.11.0/+esm";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var _={apiKey:`AIzaSyARRGKgQ_R_RFi40KXnhdmt6VZrVHVHgc0`,authDomain:`store-issue-register.firebaseapp.com`,databaseURL:`https://store-issue-register-default-rtdb.asia-southeast1.firebasedatabase.app`,projectId:`store-issue-register`,storageBucket:`store-issue-register.firebasestorage.app`,messagingSenderId:`184487310656`,appId:`1:184487310656:web:58be210595a80dfdbdf6a5`},v=e=>document.querySelector(e),y=e=>Array.from(document.querySelectorAll(e)),b=e=>(e??``).toString().replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),x=()=>{let e=new Date;return e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),e.toISOString().slice(0,10)};function S(e=12){try{typeof navigator<`u`&&navigator.vibrate&&navigator.vibrate(e)}catch{}}async function ee(e){if(typeof crypto<`u`&&crypto.subtle){let t=new TextEncoder().encode(e),n=await crypto.subtle.digest(`SHA-256`,t);return Array.from(new Uint8Array(n)).map(e=>e.toString(16).padStart(2,`0`)).join(``)}return g(e)}function te(e){let t=0;return e?(e.length>5&&(t+=1),e.length>8&&(t+=1),/[A-Z]/.test(e)&&(t+=1),/[0-9]/.test(e)&&(t+=1),/[^A-Za-z0-9]/.test(e)&&(t+=1),t<2?{score:t,text:`Weak`,color:`var(--bad)`}:t<4?{score:t,text:`Fair`,color:`var(--warn)`}:{score:t,text:`Strong`,color:`var(--good)`}):{score:0,text:``,color:`transparent`}}var ne={dashboard:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,"admin-dashboard":`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`,register:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,"issue-new":`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,"tools-dashboard":`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,"add-tool":`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,"users-admin":`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,"settings-admin":`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,profile:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`};typeof document<`u`&&(document.addEventListener(`invalid`,e=>{if(!e.target||!e.target.setAttribute)return;e.target.setAttribute(`aria-invalid`,`true`);let t=e.target.nextElementSibling;(!t||!t.classList.contains(`error-text`))&&(t=document.createElement(`span`),t.className=`error-text`,t.id=(e.target.id||`input-`+Math.random().toString(36).substr(2,9))+`-error`,e.target.parentNode.insertBefore(t,e.target.nextSibling),e.target.setAttribute(`aria-describedby`,t.id)),t.textContent=e.target.validationMessage},!0),document.addEventListener(`input`,e=>{if(!(!e.target||!e.target.hasAttribute)&&e.target.hasAttribute(`aria-invalid`)){if(e.target.checkValidity&&e.target.checkValidity()){e.target.removeAttribute(`aria-invalid`);let t=e.target.getAttribute(`aria-describedby`);if(t){let e=document.getElementById(t);e&&e.remove()}e.target.removeAttribute(`aria-describedby`)}else{let t=e.target.getAttribute(`aria-describedby`);if(t){let n=document.getElementById(t);n&&e.target.validationMessage&&(n.textContent=e.target.validationMessage)}}}})),window.__cmmModuleReady=!0,window.dispatchEvent(new CustomEvent(`cmm-module-ready`));var C=null,w=[],T=[],E=[],re=null,ie=null,ae=null,oe=null,D=null;window.currentView=D,window.currentUser=C;var se=null,ce=null;function le(e){let t=v(`#appDialog`);if(!t||t.classList.contains(`hidden`))return;t.classList.add(`hidden`),document.body.classList.remove(`modal-open`);let n=se;se=null,ce&&typeof ce.focus==`function`&&ce.focus(),n&&n(e)}function ue(e,t={}){let{title:n=`Notice`,type:r=`info`,confirmText:i=`OK`,cancelText:a=`Cancel`,showCancel:o=!1}=t,s=v(`#appDialog`),c=s.querySelector(`.app-dialog`);return ce=document.activeElement,c.dataset.type=r,v(`#appDialogTitle`).textContent=n,v(`#appDialogMessage`).textContent=String(e??``),v(`#appDialogIcon`).textContent=r===`danger`?`!`:r===`success`?`✓`:r===`confirm`?`?`:`i`,v(`#appDialogConfirm`).textContent=i,v(`#appDialogCancel`).textContent=a,v(`#appDialogCancel`).classList.toggle(`hidden`,!o),document.body.classList.add(`modal-open`),s.classList.remove(`hidden`),S(r===`danger`?[30,40,30]:20),setTimeout(()=>v(`#appDialogConfirm`).focus(),0),new Promise(e=>{se=e})}function O(e,t={}){return ue(e,{title:t.title||`Notice`,type:t.type||`info`,confirmText:`OK`})}function k(e,t={}){return ue(e,{title:t.title||`Please confirm`,type:t.type||`confirm`,confirmText:t.confirmText||`Confirm`,cancelText:t.cancelText||`Cancel`,showCancel:!0})}window.appConfirm=k,window.appAlert=O,v(`#appDialogConfirm`)?.addEventListener(`click`,e=>{e.stopPropagation(),le(!0)}),v(`#appDialogCancel`)?.addEventListener(`click`,e=>{e.stopPropagation(),le(!1)}),v(`#appDialog`)?.addEventListener(`click`,e=>{e.target.id===`appDialog`&&le(!1)}),window.addEventListener(`keydown`,e=>{if(e.key===`Escape`){let t=v(`#appDialog`);t&&!t.classList.contains(`hidden`)&&(e.preventDefault(),le(!1))}});function de(){return/iphone|ipad|ipod/i.test(navigator.userAgent)||navigator.platform===`MacIntel`&&navigator.maxTouchPoints>1}function fe(){v(`#iosInstallDialog`)?.classList.remove(`hidden`)}function pe(){v(`#iosInstallDialog`)?.classList.add(`hidden`)}v(`#iosInstallCloseBtn`)?.addEventListener(`click`,pe),v(`#iosInstallGotItBtn`)?.addEventListener(`click`,pe),v(`#iosInstallDialog`)?.addEventListener(`click`,e=>{e.target.id===`iosInstallDialog`&&pe()}),window.alert=e=>{O(e)};var me=0,he=!1;function A(e=null,t=`determinate`){let n=v(`#cloudSyncProgress`),r=v(`#cloudSyncProgressFill`);if(!(!n||!r)){if(n.classList.remove(`is-indeterminate`,`is-failed`),e===null){n.classList.remove(`is-visible`),r.style.width=`0%`,me=0;return}me=Math.max(0,Math.min(100,Number(e)||0)),n.classList.add(`is-visible`),t===`indeterminate`&&n.classList.add(`is-indeterminate`),t===`failed`&&n.classList.add(`is-failed`),r.style.width=me+`%`}}function ge(e=`Cloud Sync failed`){he=!0;let t=v(`#cloudSyncRetryBtn`),n=v(`#appSyncLabel`),r=v(`#appSyncDot`);t&&t.classList.remove(`hidden`),n&&(n.textContent=e),r&&(r.className=`cloud-sync-visual is-offline`),A(100,`failed`)}function _e(){let e=v(`#cloudSyncRetryBtn`);e&&e.classList.add(`hidden`),he=!1}async function ve(){let e=v(`#cloudSyncRetryBtn`);e&&(e.textContent=`Retrying…`),_e(),j(!0,`Retrying Cloud Sync…`);try{if(Ot(),!U)throw Error(`Cloud service is not initialized`);w=X(await t(o(U,`issues`))).sort((e,t)=>(t.issueDate||``).localeCompare(e.issueDate||``)),it=!0;let e=await t(o(U,`tools`)).catch(()=>null);if(e&&(T=X(e).sort((e,t)=>(e.toolName||``).localeCompare(t.toolName||``)),at=!0),C?.roles?.includes(`admin`)){let e=await t(o(U,`toolDeletionRequests`)).catch(()=>null);E=e?X(e):[]}G=!0,ht=new Date,C&&on(),jt(!0),an.has(D)||Q(),A(100),setTimeout(()=>A(null),550)}catch(e){G=!1,jt(!1),ge(`Cloud Sync failed — click to retry`),console.error(`Cloud Sync retry failed:`,e)}finally{e&&(e.textContent=`Retry`)}}async function ye(){let e=v(`#cloudSyncRefreshBtn`);if(!e?.classList.contains(`is-refreshing`)){e?.classList.add(`is-refreshing`),j(!0,`Refreshing from cloud…`);try{if(U||Ot(),!U)throw Error(`Cloud service is not initialized`);if(w=X(await t(o(U,`issues`))).sort((e,t)=>(t.issueDate||``).localeCompare(e.issueDate||``)),it=!0,T=X(await t(o(U,`tools`))).sort((e,t)=>(e.toolName||``).localeCompare(t.toolName||``)),at=!0,C?.roles?.includes(`admin`)){let e=await t(o(U,`toolDeletionRequests`)).catch(()=>null);E=e?X(e):[]}G=!0,ht=new Date,jt(!0),an.has(D)||Q(),A(100),v(`#appSyncLabel`)&&(v(`#appSyncLabel`).textContent=`Cloud Sync refreshed`),setTimeout(()=>{A(null),v(`#appSyncLabel`)&&(v(`#appSyncLabel`).textContent=`Cloud Sync`)},900)}catch(e){G=!1,jt(!1),ge(`Refresh failed — click to retry`),console.error(`Cloud database refresh failed:`,e)}finally{e?.classList.remove(`is-refreshing`)}}}v(`#cloudSyncRefreshBtn`).addEventListener(`click`,()=>he?ve():ye());var be=78,xe=126,Se=0,Ce=0,we=!1,Te=!1;function Ee(e=0){let t=v(`#pullRefreshIndicator`);t&&setTimeout(()=>{t.classList.remove(`is-visible`,`is-ready`,`is-refreshing`),t.style.transform=``;let e=t.querySelector(`.pull-refresh-icon`);e&&(e.style.transform=``);let n=v(`#pullRefreshText`);n&&(n.textContent=`Pull to refresh`),Ce=0},e)}var De=0,Oe=4e3;document.addEventListener(`touchstart`,e=>{let t=(e.target instanceof Element?e.target:null)?.closest(`input, textarea, select, button, a, label, [contenteditable="true"], [role="button"]`),n=an!==void 0&&an.has(D),r=Date.now()-De<Oe,i=document.body.classList.contains(`cloud-sync-suspended`);t||n||r||i||Te||e.touches.length!==1||window.scrollY>0||v(`#appScreen`)?.classList.contains(`hidden`)||(Se=e.touches[0].clientY,Ce=0,we=!0)},{passive:!0}),document.addEventListener(`touchmove`,e=>{if(!we||e.touches.length!==1)return;let t=e.touches[0].clientY-Se;if(t<=0||window.scrollY>0){we=!1,Ee();return}Ce=Math.min(xe,t*.58);let n=v(`#pullRefreshIndicator`);if(!n)return;n.classList.add(`is-visible`),n.classList.toggle(`is-ready`,Ce>=be),n.style.transform=`translate(-50%, ${Math.min(18,Ce/5)}px) scale(1)`;let r=n.querySelector(`.pull-refresh-icon`);r&&(r.style.transform=`rotate(${Math.min(300,Ce*3.2)}deg)`);let i=v(`#pullRefreshText`);i&&(i.textContent=Ce>=be?`Release to refresh`:`Pull to refresh`),Ce>12&&e.preventDefault()},{passive:!1}),document.addEventListener(`touchend`,async()=>{if(!we)return;if(we=!1,Ce<be){Ee();return}Te=!0,De=Date.now();let e=v(`#pullRefreshIndicator`),t=v(`#pullRefreshText`);e?.classList.remove(`is-ready`),e?.classList.add(`is-visible`,`is-refreshing`),t&&(t.textContent=`Refreshing from cloud…`),await ye(),t&&(t.textContent=G?`Refresh complete`:`Refresh failed`),Ee(700),Te=!1},{passive:!0}),document.addEventListener(`touchcancel`,()=>{we=!1,Ee()},{passive:!0});function j(e,t=null){let n=v(`#appSyncDot`),r=v(`#appSyncLabel`);!n||!r||(n.classList.toggle(`is-syncing`,e),n.classList.toggle(`is-online`,!e&&G),n.classList.toggle(`is-offline`,!e&&!G),e?(_e(),r.textContent=t||`Cloud Syncing…`,A(35,`indeterminate`)):G?(r.textContent=`Cloud Sync`,A(100),setTimeout(()=>A(null),500)):(r.textContent=`Cloud Sync Offline`,A(null)))}var ke=null;async function Ae(e,t,n){if(!W)throw Error(`Storage not initialized`);let r=m(W,e),i=h(r,t);return ke=i,new Promise((e,t)=>{let r=!1,a=null,o=-1,s=()=>{a&&=(clearTimeout(a),null)},c=()=>{s(),ke===i&&(ke=null)},l=()=>{s(),a=setTimeout(()=>{if(!r){r=!0;try{i.cancel()}catch{}c(),ge(`Cloud Sync upload failed`),t(Error(`Upload stalled with no progress for 30 seconds. Check your connection, or ask an admin.`))}},3e4)};l(),i.on(`state_changed`,e=>{e.bytesTransferred>o&&(o=e.bytesTransferred,l());let t=e.bytesTransferred/e.totalBytes*100,r=Math.round(t);n&&(n.innerHTML=`<span class="spinner"></span> Uploading... ${r}%`),j(!0,`Cloud Sync ${r}%`),A(r)},e=>{r||(r=!0,c(),console.error(`Upload error:`,e),ge(e&&e.code===`storage/canceled`?`Cloud Sync canceled`:`Cloud Sync upload failed`),t(e&&e.code===`storage/canceled`?Error(`Upload canceled.`):e))},async()=>{if(!r){r=!0,c();try{e(await f(i.snapshot.ref))}catch(e){t(e)}}})})}async function je(e=[]){!W||!e.length||await Promise.allSettled(e.filter(Boolean).map(e=>d(m(W,e))))}async function Me(e,t,n,r){let i=[],a=[];try{for(let o=0;o<n.length;o++){let s=(n[o].name.split(`.`).pop()||`jpg`).slice(0,8),c=`${e}/${t}_${Date.now()}_${o+1}.${s}`;r&&(r.innerHTML=`<span class="spinner"></span> Uploading photo ${o+1} of ${n.length}...`);let l=await Ae(c,n[o],r);i.push(l),a.push(c)}return{urls:i,paths:a}}catch(e){throw await je(a),e}}var Ne=5,M=[];function Pe(e){return(Array.isArray(e)?e:[e]).filter(Boolean)}function Fe(e,t){let n=Pe(e);if(!n.length)return`<span class="muted">—</span>`;let r=n.slice(0,3),i=n.length-r.length,a=`gallery_`+Math.random().toString(36).slice(2,10);return window.__photoGalleries=window.__photoGalleries||{},window.__photoGalleries[a]={urls:n,label:t},`<div class="photo-thumb-strip">${r.map((e,n)=>`<a href="${b(e)}" target="_blank" rel="noopener" title="Open ${b(t)} ${n+1}"><img src="${b(e)}" alt="${b(t)} ${n+1}" /></a>`).join(``)}${i>0?`<button type="button" class="photo-more" data-photo-gallery="${a}" title="View all ${n.length} photos" aria-label="View ${i} more ${b(t)} photos">+${i}</button>`:``}</div>`}function Ie(){let e=M[et];e&&(v(`#photoGalleryMain`).src=e,v(`#photoGalleryMain`).alt=`Photo ${et+1} of ${M.length}`,v(`#photoGalleryCounter`).textContent=`${et+1} of ${M.length}`,v(`#photoGalleryPrev`).disabled=M.length<2,v(`#photoGalleryNext`).disabled=M.length<2,y(`#photoGalleryGrid .photo-gallery-item`).forEach((e,t)=>e.classList.toggle(`is-active`,t===et)))}function Le(e,t=0){let n=window.__photoGalleries?.[e];n&&(M=n.urls,et=Math.max(0,Math.min(t,M.length-1)),v(`#photoGalleryTitle`).textContent=`${n.label}s (${n.urls.length})`,v(`#photoGalleryGrid`).innerHTML=n.urls.map((e,t)=>`<button type="button" class="photo-gallery-item" data-gallery-index="${t}" title="View photo ${t+1}"><img src="${b(e)}" alt="${b(n.label)} ${t+1}" loading="lazy" /></button>`).join(``),v(`#photoGalleryDialog`).classList.remove(`hidden`),y(`[data-gallery-index]`).forEach(e=>e.addEventListener(`click`,()=>{et=Number(e.dataset.galleryIndex),Ie()})),Ie(),v(`#photoGalleryCloseBtn`).focus())}function Re(){v(`#photoGalleryDialog`).classList.add(`hidden`),v(`#photoGalleryGrid`).innerHTML=``,M=[]}function ze(e,t=0){let n=Math.max(0,Ne-t);return n===0?(O(`Maximum ${Ne} photos are already attached to this entry.`,{title:`Photo Limit Reached`,type:`danger`}),[]):(e.length>n&&O(`Only ${n} more photo${n===1?``:`s`} can be added. Maximum ${Ne} photos are allowed per entry.`,{title:`Photo Limit`,type:`danger`}),e.slice(0,n))}function Be(e,t){let n=v(t);n&&(n.innerHTML=``,e.forEach((r,i)=>{let a=document.createElement(`div`);a.className=`photo-preview-item`;let o=document.createElement(`img`);o.alt=`Selected photo ${i+1}`,o.style.cssText=`width:110px;height:90px;object-fit:cover;border-radius:12px;display:block;`;let s=new FileReader;s.onload=()=>o.src=s.result,s.readAsDataURL(r);let c=document.createElement(`button`);c.type=`button`,c.className=`photo-preview-remove`,c.setAttribute(`aria-label`,`Remove photo ${i+1}`),c.title=`Remove photo`,c.textContent=`×`,c.addEventListener(`click`,r=>{r.preventDefault(),r.stopPropagation();let i=Array.from(n.children).indexOf(a);i!==-1&&e.splice(i,1),Be(e,t)}),a.appendChild(o),a.appendChild(c),n.appendChild(a)}),n.parentElement.style.display=e.length?`block`:`none`)}function Ve(e,t=12){let n=new Set,r=[];for(let i of w){let a=String(i?.[e]||``).trim(),o=a.toLowerCase();if(a&&!n.has(o)&&(n.add(o),r.push(a)),r.length>=t)break}return r}function He(e,t){return`<datalist id="${e}">${t.map(e=>`<option value="${b(e)}"></option>`).join(``)}</datalist>`}async function Ue(e,t,n){let r=e.files?.[0];if(!r)return;if(!r.type.startsWith(`image/`)){O(`Please take an image only.`,{title:`Invalid File`,type:`danger`}),e.value=``;return}let i=t===`edit-issue`?w.find(e=>e.id===ot):t===`edit-return`?w.find(e=>e.id===ct):t===`return`?w.find(e=>e.id===st):null;if((t===`edit-issue`?Pe(i?.photoUrls||i?.photoUrl).length:0)+(t===`issue`?lt.length:t===`return`?B.length:t===`edit-issue`?ut.length:V.length)>=Ne){e.value=``,await O(`Maximum ${Ne} photos are allowed per entry.`,{title:`Photo Limit Reached`,type:`danger`});return}let a=await We(r);t===`issue`&&lt.push(a),t===`return`&&B.push(a),t===`edit-issue`&&ut.push(a),t===`edit-return`&&V.push(a),Be(t===`issue`?lt:t===`return`?B:t===`edit-issue`?ut:V,n),e.value=``}async function We(e,t=1600,n=.82){try{let r;if(r=window.createImageBitmap?await createImageBitmap(e):await new Promise(t=>{let n=new FileReader;n.onload=e=>{let n=new Image;n.onload=()=>t(n),n.onerror=()=>t(null),n.src=e.target.result},n.onerror=()=>t(null),n.readAsDataURL(e)}),!r)return e;let i=r.width,a=r.height;(i>t||a>t)&&(i>a?(a=Math.round(a*t/i),i=t):(i=Math.round(i*t/a),a=t));let o=document.createElement(`canvas`);o.width=i,o.height=a;let s=o.getContext(`2d`,{alpha:!1});return s.fillStyle=`#ffffff`,s.fillRect(0,0,i,a),s.drawImage(r,0,0,i,a),new Promise(t=>{o.toBlob(n=>{t(n?new File([n],e.name.replace(/\.[^/.]+$/,``)+`.jpg`,{type:`image/jpeg`,lastModified:Date.now()}):e)},`image/jpeg`,n)})}catch(t){return console.warn(`Image compression failed, falling back to original`,t),e}}var N={q:``,status:`all`,month:`all`,year:`all`,vendor:`all`,area:`all`,supervisor:`all`,issuedBy:`all`,dateFrom:``,dateTo:``,page:1},Ge=`all`,Ke=``,qe=``,Je=!1,Ye=!1,Xe=new Set,Ze=null,Qe=!1,$e=null,P=!1,et=0,tt=`cmm_register_preferences`,nt=null,rt=10,it=!1,at=!1,F=``,ot=null,I=``,st=null,L=``,ct=null,R=``,z=``,lt=[],B=[],V=[],ut=[],dt=null,H=``;function ft(e){[`authScreen`,`appScreen`].forEach(t=>{let n=v(`#`+t);if(!n)return;let r=t===e;n.classList.toggle(`hidden`,!r),r?n.style.removeProperty(`display`):n.style.display=`none`}),window.scrollTo(0,0)}var pt=Object.values(_).some(e=>e.startsWith(`YOUR_`)),mt,U,W,ht=null,gt=!1,_t=!1,G=!1,vt=null,yt=!1,bt=null,xt=`admin`,St=`921443c5e72aac9f10321d52f095edd5ed04ab8deeca8cd0eb425ad46c135c14`,K=`mechtools_session`,Ct=`cmm_sms_theme`;function wt(){try{let e=localStorage.getItem(Ct);if(e===`dark`||e===`light`)return e}catch{}return window.matchMedia&&window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`}function Tt(e,t=!1){let n=e===`dark`?`dark`:`light`;document.documentElement.dataset.theme=n;let r=n===`dark`;if([`themeToggle`,`authThemeToggle`].forEach(e=>{let t=v(`#`+e);t&&(t.setAttribute(`aria-checked`,String(r)),t.setAttribute(`aria-label`,r?`Switch to light theme`:`Switch to dark theme`),t.title=r?`Switch to light theme`:`Switch to dark theme`)}),t)try{localStorage.setItem(Ct,n)}catch{}}function Et(){Tt(document.documentElement.dataset.theme===`dark`?`light`:`dark`,!0)}Tt(wt()),v(`#themeToggle`)?.addEventListener(`click`,Et),v(`#authThemeToggle`)?.addEventListener(`click`,Et);function Dt(){Yt(),Ot(),jt(typeof navigator<`u`?navigator.onLine!==!1:!0);let e=Bt();e?(C=e,tn(),ft(`appScreen`),Y(Gt(C),!1,!0)):ft(`authScreen`)}function Ot(){if(!pt&&!(mt&&U)){try{mt=e(_),U=n(mt);try{W=p(mt)}catch{W=null}}catch(e){console.error(`Firebase init error:`,e);return}i(o(U,`.info/connected`),e=>{let t=e.val()===!0;G=t,t&&(ht=new Date,gt||(gt=!0,C&&on())),jt(t),D===`settings-admin`&&Q()},e=>{console.error(`Connectivity listener error:`,e),G=!1,jt(!1)})}}var kt=null,At=null;function jt(e){At=e===!0,!kt&&(kt=setTimeout(()=>{kt=null;let e=At;window.dispatchEvent(new CustomEvent(`cloud-sync-state`,{detail:{connected:e}}));let t=v(`#loginSyncDot`),n=v(`#loginSyncLabel`);t&&n&&(t.className=`sync-dot `+(e?`sync-dot-good`:`sync-dot-bad`),n.textContent=e?`Cloud Sync ready — login enabled`:`Cloud Sync offline — login disabled`);let r=v(`#authError`);r&&(e||r.textContent.includes(`Loading is delayed`)||r.textContent.includes(`taking longer`))&&(r.textContent=``,r.classList.add(`hidden`));let i=v(`#loginBtn`),a=v(`#reqSubmitBtn`);i&&(i.disabled=!e),a&&(a.disabled=!e);let o=v(`#appSyncDot`),s=v(`#appSyncLabel`);o&&s&&(o.className=`cloud-sync-visual `+(e?`is-online`:`is-offline`),s.textContent=e?`Cloud Sync`:`Cloud Sync Offline`,e?(_e(),A(null)):ge(`Cloud Sync Offline`))},600))}function Mt(e){let t=String(e.getDate()).padStart(2,`0`),n=String(e.getMonth()+1).padStart(2,`0`),r=e.getHours(),i=r>=12?`pm`:`am`;return r%=12,r===0&&(r=12),{date:`${t}/${n}`,time:`${String(r).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}:${String(e.getSeconds()).padStart(2,`0`)}`,meridiem:i}}function Nt(){if(!v(`#clockDate`))return;vt&&clearInterval(vt);let e=()=>{let e=v(`#clockDate`),t=v(`#clockTime`),n=v(`#clockMeridiem`);if(!e||!t||!n){clearInterval(vt),_t=!1;return}let r=Mt(new Date);e.textContent=r.date,t.textContent=r.time,n.textContent=r.meridiem};e(),vt=setInterval(e,1e3)}var Pt=900,Ft=Date.now(),It=!1;function Lt(){Ft=Date.now(),It=!1}function Rt(){if(!v(`#timerText`))return;bt&&clearInterval(bt),Ft=Date.now(),It=!1,[`click`,`keydown`,`touchstart`,`scroll`].forEach(e=>document.addEventListener(e,Lt,{passive:!0}));let e=()=>{let e=v(`#timerText`);if(!e||!C){clearInterval(bt),yt=!1;return}let t=Math.max(0,Pt-Math.floor((Date.now()-Ft)/1e3));e.textContent=`${String(Math.floor(t/60)).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`,v(`#sessionTimer`)?.classList.toggle(`is-critical`,t<=60),t<=60&&t>0&&!It&&(It=!0,k(P?`You have unsaved changes and have been inactive for a while. Stay signed in to keep working?`:`You've been inactive for a while. Stay signed in?`,{title:`Session Expiring Soon`,confirmText:`Stay Signed In`,cancelText:`Sign Out Now`}).then(e=>{e?Lt():v(`#logoutBtn`)?.click()})),t<=0&&(clearInterval(bt),yt=!1,$(`You were signed out after 15 minutes of inactivity.`,{title:`Session Expired`,type:`info`}),v(`#logoutBtn`)?.click())};e(),bt=setInterval(e,1e3)}function zt(e){try{localStorage.setItem(K,JSON.stringify(e)),sessionStorage.removeItem(K)}catch(e){console.warn(`Could not persist the login session:`,e)}}function Bt(){try{let e=localStorage.getItem(K);if(e||(e=sessionStorage.getItem(K),e&&(localStorage.setItem(K,e),sessionStorage.removeItem(K))),!e)return null;let t=JSON.parse(e);return!t||typeof t.username!=`string`?null:(t.roles=Array.isArray(t.roles)?t.roles:t.role?[t.role]:[`storekeeper`],t.roles.includes(`storekeeper`)&&(t.roles[t.roles.indexOf(`storekeeper`)]=`user`),t.roles.some(e=>[`admin`,`user`,`viewer`,`tools_admin`,`tools_viewer`].includes(e))?t:(localStorage.removeItem(K),sessionStorage.removeItem(K),null))}catch(e){console.warn(`Stored session was corrupted and has been cleared:`,e);try{localStorage.removeItem(K)}catch{}try{sessionStorage.removeItem(K)}catch{}return null}}function Vt(){try{localStorage.removeItem(K)}catch{}try{sessionStorage.removeItem(K)}catch{}}function Ht(e){if(!e)return[];if(e.includes(`admin`))return[[`admin-dashboard`,`Dashboard`],[`register`,`Issue/Return`],[`tools-dashboard`,`Tools List`],[`users-admin`,`Users`],[`settings-admin`,`Settings`]];let t=[];return(e.includes(`tools_admin`)||e.includes(`tools_viewer`))&&t.push([`tools-dashboard`,`Tools Master List`]),(e.includes(`user`)||e.includes(`storekeeper`)||e.includes(`viewer`))&&t.push([`dashboard`,`Dashboard`],[`register`,`Register`]),t.push([`profile`,`My Profile`]),t}var Ut=`cmm_sms_home_view`;function Wt(e){let t=`dashboard`,n=e?.roles||[];if(n.includes(`admin`)?t=`admin-dashboard`:n.includes(`user`)||n.includes(`storekeeper`)||n.includes(`viewer`)?t=`dashboard`:(n.includes(`tools_admin`)||n.includes(`tools_viewer`))&&(t=`tools-dashboard`),!e)return t;try{let r=JSON.parse(localStorage.getItem(Ut)||`{}`)[e.username];return Ht(n).some(([e])=>e===r)?r:t}catch{return t}}function Gt(e){if(!e)return`dashboard`;let t=(window.location.hash||``).replace(`#`,``).trim(),n=Ht(e.roles).map(([e])=>e),r=e.roles.includes(`admin`)||e.roles.includes(`storekeeper`)||e.roles.includes(`user`),i=e.roles.includes(`admin`)||e.roles.includes(`tools_admin`)||e.roles.includes(`tools_viewer`);return(t===`issue-new`||t===`return-record`)&&r||(t===`add-tool`||t===`tools-dashboard`)&&i||t&&(n.includes(t)||t===`profile`)?t:Wt(e)}function Kt(e,t){if(e)try{let n=JSON.parse(localStorage.getItem(Ut)||`{}`);n[e.username]=t,localStorage.setItem(Ut,JSON.stringify(n))}catch{}}function qt(){return Ht(C.roles).map(([e,t])=>`<option value="${e}"${Wt(C)===e?` selected`:``}>${b(t)}</option>`).join(``)}function Jt(){v(`#homeViewSelect`)?.addEventListener(`change`,e=>{Kt(C,e.target.value),$(`You'll land here next time you sign in.`,{title:`Startup Page Updated`})})}function Yt(){v(`#authError`).classList.add(`hidden`),v(`#authInfo`).classList.add(`hidden`)}function q(e){v(`#authInfo`).classList.add(`hidden`),v(`#authError`).textContent=String(e||``),v(`#authError`).classList.remove(`hidden`)}function Xt(e){v(`#authError`).classList.add(`hidden`),v(`#authInfo`).textContent=String(e||``),v(`#authInfo`).classList.remove(`hidden`)}function J(e,t){let n=v(`#`+e);n&&(n.textContent=t,n.classList.remove(`hidden`),typeof n.scrollIntoView==`function`&&n.scrollIntoView({behavior:`smooth`,block:`nearest`}))}function Zt(e){let t=v(`#`+e);t&&t.classList.add(`hidden`)}var Qt={count:0,lockedUntil:0};v(`#loginForm`).addEventListener(`submit`,async e=>{if(e.preventDefault(),Yt(),U||Ot(),Date.now()<Qt.lockedUntil){q(`Too many failed attempts. Try again in ${Math.ceil((Qt.lockedUntil-Date.now())/1e3)} seconds.`);return}let n=v(`#loginUsername`).value.trim(),r=v(`#loginPassword`).value,i=v(`#loginBtn`);i.disabled=!0,i.innerHTML=`<span class="spinner"></span> Logging in…`;try{let e=await ee(r);if(n.toLowerCase()===xt.toLowerCase()&&e===St){Qt={count:0,lockedUntil:0},G=!0,jt(!0),C={username:xt,fullName:`Administrator`,roles:[`admin`],profilePhotoUrl:null},window.currentUser=C,document.body.dataset.role=C.roles.join(`,`),zt(C),tn(),on(),ft(`appScreen`),Y(Gt(C),!0,!0);return}if(!U)throw Error(`Database is not initialized. Please check network.`);let i=null,a=n,s=await t(o(U,`users/`+n));if(s.exists())i=s.val(),a=n;else{let e=await t(o(U,`users`));if(e.exists()){let t=e.val()||{},r=Object.keys(t).find(e=>e.toLowerCase()===n.toLowerCase());r&&(i=t[r],a=r)}}if(G=!0,jt(!0),!i){Qt.count++,Qt.count>=5?(Qt.lockedUntil=Date.now()+3e4,q(`Too many failed attempts. Login locked for 30 seconds.`)):q(`Incorrect username or password.`);return}let c=i.password===e,u=String(i.password).trim()===String(r).trim();if(!c&&!u){Qt.count++,Qt.count>=5?(Qt.lockedUntil=Date.now()+3e4,q(`Too many failed attempts. Login locked for 30 seconds.`)):q(`Incorrect username or password.`);return}if(Qt={count:0,lockedUntil:0},u&&!c)try{await l(o(U,`users/`+a+`/password`),e)}catch{console.warn(`Could not auto-migrate password to hash.`)}C={username:a,fullName:i.fullName||a,roles:Array.isArray(i.roles)?i.roles:i.role?[i.role]:[`storekeeper`],profilePhotoUrl:i.profilePhotoUrl||null},window.currentUser=C,document.body.dataset.role=C.roles.join(`,`),zt(C),tn(),on(),ft(`appScreen`),Y(Gt(C),!0,!0)}catch(e){console.error(`Login error:`,e),q(`Unable to log in: failed to sync with cloud. (`+(e.message||`unknown error`)+`)`)}finally{i.disabled=!1,i.textContent=`Log In`}}),v(`#logoutBtn`).addEventListener(`click`,()=>{re&&=(re(),null),ie&&=(ie(),null),ae&&=(ae(),null),oe&&=(oe(),null),Tr&&=(Tr(),null),vt&&(clearInterval(vt),_t=!1),bt&&(clearInterval(bt),yt=!1),window.toolsSearchQuery=``,window.toolsStatusFilter=`all`,window.toolsCategoryFilter=`all`,C=null,D=null,window.currentUser=null,window.currentView=null,Vt(),ft(`authScreen`)}),v(`#showRequestForm`).addEventListener(`click`,()=>{Yt(),v(`#loginForm`).classList.add(`hidden`),v(`#requestForm`).classList.remove(`hidden`),v(`#showRequestForm`).classList.add(`hidden`),v(`#showLoginForm`).classList.remove(`hidden`)}),v(`#showLoginForm`).addEventListener(`click`,()=>{Yt(),v(`#requestForm`).classList.add(`hidden`),v(`#loginForm`).classList.remove(`hidden`),v(`#showLoginForm`).classList.add(`hidden`),v(`#showRequestForm`).classList.remove(`hidden`)}),v(`#requestForm`).addEventListener(`submit`,async e=>{if(e.preventDefault(),Yt(),!G){q(`Cloud sync is not connected.`);return}let n=v(`#reqFullName`).value.trim(),r=v(`#reqUsername`).value.trim(),i=v(`#reqPassword`).value,a=v(`#reqSubmitBtn`);if(r.toLowerCase()===xt){q(`"${xt}" is reserved and can't be requested as a username.`);return}if(/[.#$\[\]\/\s'"]/.test(r)){q(`Username can't contain spaces, quotes, or the characters . # $ [ ] /`);return}a.disabled=!0,a.innerHTML=`<span class="spinner"></span> Submitting…`,j(!0);try{if((await t(o(U,`users/`+r))).exists()){q(`That username is already taken.`);return}if((await t(o(U,`accessRequests/`+r))).exists()){q(`A request for that username is already pending approval.`);return}let e=await ee(i);await l(o(U,`accessRequests/`+r),{fullName:n,password:e,requestedAt:c()}),v(`#requestForm`).classList.add(`hidden`),v(`#showLoginForm`).classList.add(`hidden`),v(`#showRequestForm`).classList.remove(`hidden`),Xt(`Request submitted. An Admin needs to approve it before you can log in — check back soon.`),v(`#requestForm`).reset()}catch{q(`Unable to submit request: failed to sync with cloud.`)}finally{j(!1),a.disabled=!1,a.textContent=`Submit Request`}}),document.addEventListener(`click`,e=>{let t=e.target.closest(`[data-password-target]`);if(!t)return;let n=document.getElementById(t.dataset.passwordTarget);if(!n)return;let r=n.type===`text`;n.type=r?`password`:`text`,t.textContent=r?`Show`:`Hide`,t.setAttribute(`aria-pressed`,String(!r)),t.setAttribute(`aria-label`,r?`Show password`:`Hide password`)}),document.addEventListener(`input`,e=>{if(e.target.id===`reqPassword`){let t=te(e.target.value),n=v(`#reqPasswordStrength`);n&&(n.textContent=t.text,n.style.color=t.color)}else if(e.target.id===`p_newPassword`){let t=te(e.target.value),n=v(`#p_newPasswordStrength`);n&&(n.textContent=t.text,n.style.color=t.color)}});function $t(){let e=v(`#mobileFab`);if(!e)return;let t=C?.roles||[],n=t.includes(`storekeeper`)||t.includes(`user`)||t.includes(`admin`),r=t.includes(`tools_admin`)||t.includes(`admin`);if(!(n||r)||[`issue-new`,`add-tool`,`return-record`,`edit-issue`,`edit-return`,`profile`,`settings-admin`,`users-admin`].includes(D)){e.style.display=`none`;return}e.style.removeProperty(`display`),D===`tools-dashboard`||r&&!n?(e.dataset.nav=`add-tool`,e.setAttribute(`aria-label`,`Add New Tool`),e.setAttribute(`title`,`Add New Tool`)):(e.dataset.nav=`issue-new`,e.setAttribute(`aria-label`,`Issue Material`),e.setAttribute(`title`,`Issue Material`))}function en(e=[]){let t=v(`#mobileBottomNav`);if(!t)return;let n=[],r=e.includes(`admin`),i=e.includes(`storekeeper`)||e.includes(`user`),a=e.includes(`viewer`),o=e.includes(`tools_admin`),s=e.includes(`tools_viewer`),c=r||o||s;r?n.push([`admin-dashboard`,`Dashboard`],[`register`,`Register`],[`tools-dashboard`,`Tools`],[`users-admin`,`Users`],[`settings-admin`,`Settings`]):i||a?(n.push([`dashboard`,`Dashboard`],[`register`,`Register`]),c&&n.push([`tools-dashboard`,`Tools`]),n.push([`profile`,`Profile`])):o||s?n.push([`tools-dashboard`,`Tools`],[`profile`,`Profile`]):n.push([`profile`,`Profile`]),t.innerHTML=n.map(([e,t])=>{let n=ne[e]||ne.dashboard;return`<button type="button" class="mobile-nav-item${D===e?` active`:``}" data-view="${e}" aria-label="${t}">
      <span class="mobile-nav-icon">${n}</span>
      <span class="mobile-nav-label">${t}</span>
    </button>`}).join(``),t.querySelectorAll(`.mobile-nav-item`).forEach(e=>{e.addEventListener(`click`,()=>{S(14),Y(e.dataset.view)})}),$t()}function tn(){let e=[`admin`,`storekeeper`,`user`,`tools_admin`,`tools_viewer`,`viewer`].find(e=>C.roles.includes(e))||C.roles[0]||`viewer`;document.body.dataset.role=e,document.body.dataset.roles=C.roles.join(` `),v(`#whoName`).textContent=C.fullName||C.username,v(`#whoRole`).textContent=C.roles.join(`, `),v(`#whoRole`).className=`who-role role-`+C.roles[0],C.profilePhotoUrl?(v(`#topbarAvatar`).src=C.profilePhotoUrl,v(`#topbarAvatar`).classList.remove(`hidden`)):v(`#topbarAvatar`).classList.add(`hidden`),jt(G),_t||=(Nt(),!0),yt||=(Rt(),!0);let t=v(`#navLinks`);t.innerHTML=Ht(C.roles).map(([e,t])=>`<button class="navlink" data-view="${e}">${t}</button>`).join(``),t.querySelectorAll(`.navlink`).forEach(e=>{e.addEventListener(`click`,()=>Y(e.dataset.view))}),en(C.roles),C.roles.includes(`admin`)&&(ae&&=(ae(),null),ae=i(o(U,`accessRequests`),e=>{Sr(e.exists()?Object.keys(e.val()).length:0)},e=>console.error(`access requests listener error`,e)))}function nn(){let e=window.innerWidth<=768,t=window.matchMedia&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,n=()=>{Q(),window.scrollTo(0,0)};if(!e&&!t&&typeof document.startViewTransition==`function`)try{document.startViewTransition(n);return}catch{}n()}async function Y(e,t=!0,n=!1){if(!(!n&&e===D)){if(P){if(!await k(`You have unsaved changes. Leave this page and discard them?`,{title:`Unsaved Changes`,confirmText:`Leave Page`,cancelText:`Stay`}))return;P=!1}if(D===`register`&&e!==`register`&&(Ze?.disconnect(),Ze=null),lt=[],B=[],V=[],ut=[],dt=null,F=``,I=``,L=``,R=``,z=``,D=e,t&&window.location.hash!==`#`+e)try{history.pushState({view:e},``,`#`+e)}catch{}y(`.navlink`).forEach(t=>t.classList.toggle(`active`,t.dataset.view===e)),y(`.mobile-nav-item`).forEach(t=>t.classList.toggle(`active`,t.dataset.view===e)),$t(),nn()}}window.addEventListener(`popstate`,e=>{if(!C)return;let t=e.state&&e.state.view||(window.location.hash?window.location.hash.replace(`#`,``).trim():Wt(C));t&&t!==D&&Y(t,!1)});function X(e){let t=e.val();return t?Object.keys(t).map(e=>({id:e,...t[e]})):[]}async function Z(e,t,n={}){if(!U||!C)return!1;try{return await l(a(o(U,`auditLog`)),{action:e,issueId:t||null,details:n,actorUsername:C.username,actorName:C.fullName||C.username,actorRole:C.roles.join(`,`),createdAt:c()}),!0}catch(e){return console.warn(`Audit log was not saved; primary activity remains valid:`,e),!1}}function rn(e,t=`save this activity`){let n=String(e?.code||``).toLowerCase(),r=String(e?.message||``);return n.includes(`permission`)||r.toLowerCase().includes(`permission_denied`)||r.toLowerCase().includes(`permission denied`)?`Firebase permission denied. The application is not allowed to ${t}. Firebase rules must permit the issue fields and returnHistory path in the same atomic update. No partial record was saved.`:n.includes(`network`)||r.toLowerCase().includes(`network`)?`Network connection failed while trying to ${t}. Check the internet connection and retry.`:`Could not ${t}: ${r||`unknown error`}`}var an=new Set([`issue-new`,`return-record`,`edit-issue`,`edit-return`,`profile`,`users-admin`,`add-tool`,`edit-tool`]);function on(){re&&=(re(),null),ie&&=(ie(),null),oe&&=(oe(),null),U&&(re=i(o(U,`issues`),e=>{w=X(e).sort((e,t)=>(t.issueDate||``).localeCompare(e.issueDate||``)),it=!0,hn(),mn(),an.has(D)||Q()},e=>{console.error(`Issues sync listener error:`,e),typeof $==`function`&&$(`Material register failed to sync from the cloud: `+(e.message||e.code||`permission error`),{title:`Cloud Sync Error`,type:`error`,duration:6e3})}),ie=i(o(U,`tools`),e=>{T=X(e).sort((e,t)=>(e.toolName||``).localeCompare(t.toolName||``)),at=!0,an.has(D)||Q()},e=>{console.error(`Tools sync listener error:`,e),typeof $==`function`&&$(`Tool register failed to sync from the cloud: `+(e.message||e.code||`permission error`),{title:`Cloud Sync Error`,type:`error`,duration:6e3})}),C?.roles?.includes(`admin`)&&(oe=i(o(U,`toolDeletionRequests`),e=>{E=X(e),an.has(D)||Q()},e=>{console.error(`Tool deletion requests sync listener error:`,e),E=[]})))}function sn(e){let t=e.qtyReturned||0;return t>=e.qtyIssued?`Returned`:t>0?`Partially Returned`:`Issued`}function cn(){return w.map(e=>{let t=e.materialName||`(unnamed)`;return{...e,materialName:t,status:sn(e)}})}function ln(e=7){let t=Date.now(),n=864e5,r=e*n,i=[];for(let a=0;a<w.length;a++){let o=w[a],s=Number(o.qtyIssued)||0,c=Number(o.qtyReturned)||0;if(c>=s)continue;let l=0;if(o.issueDate){let e=String(o.issueDate).split(`-`);if(e.length===3){let t=parseInt(e[0],10),n=parseInt(e[1],10)-1,r=parseInt(e[2],10);!isNaN(t)&&!isNaN(n)&&!isNaN(r)&&(l=new Date(t,n,r).getTime())}}if(!l&&o.createdAt&&(l=Number(o.createdAt)||0),!l)continue;let u=t-l;if(u>=r){let t=Math.max(1,Math.floor(u/n)),r=Math.max(0,t-e);i.push({...o,materialName:o.materialName||`(unnamed)`,status:sn(o),daysAgo:t,daysOverdue:r,qtyRemaining:Math.max(0,s-c)})}}return i.sort((e,t)=>t.daysAgo-e.daysAgo)}function un(){if(!(`Notification`in window))return`Not Supported`;let e=Notification.permission;return e===`granted`?`Active & Allowed`:e===`denied`?`Blocked / Denied`:`Not Enabled (Tap to enable)`}function dn(){if(!(`Notification`in window))return`var(--text-muted)`;let e=Notification.permission;return e===`granted`?`var(--good, #10b981)`:e===`denied`?`var(--bad, #ef4444)`:`var(--warn-dark, #b45309)`}async function fn(){if(!(`Notification`in window))return await O(`This browser or device does not support Web Notifications.`,{title:`Not Supported`,type:`warn`}),!1;try{let e=await Notification.requestPermission();if(e===`granted`)return $(`Device notifications enabled. You will receive alerts for overdue items.`,{title:`Notifications Allowed`,type:`success`}),mn(!0),Q(),!0;if(e===`denied`)return await O(`Notification permission is blocked. You can enable notifications in your browser or mobile site settings.`,{title:`Permission Denied`,type:`warn`}),Q(),!1}catch(e){console.warn(`Notification permission error:`,e)}return!1}function pn(e,t={}){let n={icon:`./icon-192.png`,badge:`./icon.svg`,vibrate:[200,100,200],...t};if(`serviceWorker`in navigator&&`Notification`in window&&Notification.permission===`granted`)navigator.serviceWorker.ready.then(t=>{if(t&&typeof t.showNotification==`function`)return t.showNotification(e,n);try{new Notification(e,n)}catch{}}).catch(()=>{try{new Notification(e,n)}catch{}});else if(`Notification`in window&&Notification.permission===`granted`)try{new Notification(e,n)}catch{}}async function mn(e=!1){if(!(`Notification`in window)||Notification.permission!==`granted`)return;let t=ln(7);if(t.length===0){e&&pn(`Store Follow-up: All Up to Date`,{body:`No issued tools or materials are overdue past 7 days right now!`,tag:`cmm-overdue-clean`});return}let n=Number(localStorage.getItem(`cmm_last_overdue_notify_time`)||0),r=Date.now();if(!e&&r-n<432e5)return;let i=t[0],a=t.length-1;pn(`⚠️ ${t.length} Overdue Store ${t.length===1?`Item`:`Items`} (>7 Days)`,{body:`${i.materialName} (${i.supervisorName?`Issued to ${i.supervisorName} `:``}${i.daysAgo}d ago)${a>0?` and ${a} other items pending return.`:` is pending return. Tap to review.`}`,tag:`cmm-overdue-followup`,data:{action:`open-overdue`,url:`./#overdue`}}),localStorage.setItem(`cmm_last_overdue_notify_time`,String(r))}function hn(){let e=ln(7),t=v(`#topbarOverdueBtn`),n=v(`#topbarOverdueCount`);navigator.setAppBadge&&(e.length>0?navigator.setAppBadge(e.length).catch(()=>{}):navigator.clearAppBadge().catch(()=>{})),!(!t||!n)&&(e.length>0?(t.classList.remove(`hidden`),n.textContent=e.length>99?`99+`:e.length):t.classList.add(`hidden`))}function gn(){let e=ln(7);return e.length?`
    <div class="overdue-alert-banner">
      <div class="overdue-alert-icon">⚠️</div>
      <div class="overdue-alert-content">
        <strong>${e.length} ${e.length===1?`Item`:`Items`} Overdue for Return (> 7 Days)</strong>
        <p>Issued items have not been returned for more than a week. Follow up with supervisors to confirm return status.</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm overdue-banner-action" id="overdueBannerFollowUpBtn">
        Follow Up Now (${e.length}) →
      </button>
    </div>
  `:``}function _n(e){if(!e)return`—`;let t=String(e).split(`-`);if(t.length!==3)return e;let n=[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`],r=parseInt(t[1],10)-1,i=parseInt(t[2],10);return r>=0&&r<12&&!isNaN(i)?`${i} ${n[r]} ${t[0]}`:e}function vn(){let e=ln(7),t=v(`#overdueFollowUpList`),n=v(`#overdueModalSubtitle`),r=v(`#overdueCountBadge`);r&&(r.textContent=`${e.length} Overdue`),n&&(n.textContent=`${e.length} ${e.length===1?`item`:`items`} issued over 7 days ago pending return.`),t&&(t.innerHTML=e.length===0?`
        <div class="overdue-empty-state">
          <div class="overdue-empty-icon">✅</div>
          <strong class="overdue-empty-title">All issued items are up to date!</strong>
          <p class="overdue-empty-text">No materials or tools are currently pending return past the 7-day threshold.</p>
        </div>
      `:e.map(e=>`
        <div class="overdue-card-item">
          <div class="overdue-card-top">
            <div class="overdue-card-name-group">
              <div class="overdue-item-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div class="overdue-card-title-wrap">
                <strong class="overdue-card-title">${b(e.materialName)}</strong>
                ${e.id?`<span class="overdue-card-code">#${b(e.id.slice(-6).toUpperCase())}</span>`:``}
              </div>
            </div>
            <div class="overdue-badge-pill">
              <span class="overdue-badge-dot"></span>
              <span class="overdue-badge-text">${e.daysAgo}d ago (${e.daysOverdue}d overdue)</span>
            </div>
          </div>

          <div class="overdue-meta-chips">
            <div class="overdue-chip">
              <span class="overdue-chip-label">Pending:</span>
              <strong class="overdue-chip-value">${e.qtyRemaining} <span class="overdue-chip-total">/ ${e.qtyIssued}</span></strong>
            </div>
            <div class="overdue-chip">
              <span class="overdue-chip-label">Area:</span>
              <strong class="overdue-chip-value">${b(e.area||`—`)}</strong>
            </div>
            <div class="overdue-chip">
              <span class="overdue-chip-label">Issued:</span>
              <strong class="overdue-chip-value">${_n(e.issueDate)}</strong>
            </div>
          </div>

          <div class="overdue-contact-card">
            <div class="overdue-supervisor-info">
              <div class="overdue-avatar">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="overdue-supervisor-text">
                <span class="overdue-supervisor-name">${b(e.supervisorName||`Unassigned`)}</span>
                ${e.vendor?`<span class="overdue-supervisor-vendor">(${b(e.vendor)})</span>`:``}
              </div>
            </div>
            <div class="overdue-contact-action">
              ${e.supervisorContact?`
                ${(()=>{let t=String(e.supervisorContact||``).replace(/[^0-9]/g,``);if(!t)return``;let n=t.length===10?`91`+t:t,r=`Hello ${e.supervisorName||`Sir/Madam`},\n\nThis is a reminder from CMM SMS Store regarding the following overdue item:\n📦 Material: ${e.materialName}\n🔢 Pending Qty: ${e.qtyRemaining} / ${e.qtyIssued}\n📅 Issued Date: ${_n(e.issueDate)} (${e.daysAgo} days ago)\n📍 Area: ${e.area||`N/A`}\n\nPlease arrange for its return to the store at the earliest.\nThank you!`;return`
                    <a href="${`https://wa.me/${n}?text=${encodeURIComponent(r)}`}" target="_blank" rel="noopener noreferrer" class="overdue-wa-pill-btn" title="Send WhatsApp Reminder to ${b(e.supervisorName)} (${b(e.supervisorContact)})">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.21 8.21 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  `})()}
                <a href="tel:${b(e.supervisorContact)}" class="overdue-call-pill-btn" title="Call ${b(e.supervisorName)} (${b(e.supervisorContact)})">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>Call</span>
                </a>
              `:`
                <span class="overdue-no-phone">No phone</span>
              `}
            </div>
          </div>

          <div class="overdue-card-btns">
            <button type="button" class="btn btn-ghost btn-sm overdue-action-view" data-overdue-view-issue="${e.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>View Details</span>
            </button>
            ${C&&(C.roles.includes(`admin`)||C.roles.includes(`storekeeper`)||C.roles.includes(`user`))?`
              <button type="button" class="btn btn-dark btn-sm overdue-action-return" data-overdue-record-return="${e.id}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 14 4 9 9 4"/>
                  <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
                </svg>
                <span>Record Return</span>
              </button>
            `:``}
          </div>
        </div>
      `).join(``)),y(`[data-overdue-view-issue]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.overdueViewIssue;yn(),N.q=``,N.status=`all`;let n=(typeof cn==`function`?cn():w).findIndex(e=>e.id===t);n===-1?N.page=1:N.page=Math.floor(n/rt)+1,Xe.add(t),En(),D===`register`?Q():Y(`register`),setTimeout(()=>{let e=document.querySelector(`tr[data-register-id="${CSS.escape(t)}"]`);e&&(e.classList.add(`mobile-expanded`),e.scrollIntoView({behavior:`smooth`,block:`center`}),e.style.animation=`highlightRow 2.2s ease`)},250)})}),y(`[data-overdue-record-return]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.overdueRecordReturn;yn(),st=t,L=``,Y(`return-record`)})}),v(`#overdueFollowUpDialog`)?.classList.remove(`hidden`),document.body.classList.add(`modal-open`)}function yn(){v(`#overdueFollowUpDialog`)?.classList.add(`hidden`),document.body.classList.remove(`modal-open`)}function Q(){if(!C)return;let e=v(`#appMain`),t=[`profile`];C.roles.includes(`admin`)&&t.push(`admin-dashboard`,`users-admin`,`settings-admin`,`edit-return`,`register`,`tools-dashboard`,`add-tool`,`edit-tool`,`dashboard`),(C.roles.includes(`user`)||C.roles.includes(`storekeeper`)||C.roles.includes(`viewer`))&&(t.push(`dashboard`,`register`),(!C.roles.includes(`viewer`)||C.roles.includes(`storekeeper`))&&t.push(`issue-new`,`return-record`,`edit-issue`,`edit-return`)),C.roles.includes(`tools_admin`)?t.push(`tools-dashboard`,`add-tool`,`edit-tool`):C.roles.includes(`tools_viewer`)&&t.push(`tools-dashboard`),t.includes(D)||(D=Wt(C)),window.currentView=D,window.currentUser=C;let n=({dashboard:Sn,profile:Cn,"admin-dashboard":wn,register:In,"issue-new":Ln,"users-admin":Vn,"settings-admin":Yn,"return-record":zn,"edit-return":Bn,"edit-issue":Rn,"tools-dashboard":Dr,"add-tool":Or,"edit-tool":kr}[D]||(C.roles.includes(`admin`)?wn:Sn))();typeof n==`string`&&(e.innerHTML=n),Zn(D),hn()}function bn(){let e=0,t=0,n=w.length;for(let r=0;r<n;r++)(w[r].qtyReturned||0)>=(w[r].qtyIssued||0)?t++:e++;return{total:n,pending:e,returned:t}}function xn(e){return it?String(e):`<span class="spinner" aria-label="Loading"></span>`}function Sn(){let e=bn(),t=C.roles.includes(`admin`)||C.roles.includes(`storekeeper`)||C.roles.includes(`user`),n=C.roles.includes(`admin`)||C.roles.includes(`tools_admin`),r=C.roles.includes(`admin`)||C.roles.includes(`tools_admin`)||C.roles.includes(`tools_viewer`);return`
    <div class="page-head">
      <div>
        <span class="eyebrow">Store Overview</span>
        <h1>Dashboard</h1>
        <div class="page-sub">Live status of the material issue &amp; return register.</div>
      </div>
    </div>
    ${gn()}
    <div class="kpi-grid">
      <button type="button" class="kpi kpi-button" data-kpi-status="all" aria-label="Show all ${e.total} register entries"><div class="kpi-label">Total Entries</div><div class="kpi-value">${xn(e.total)}</div><span class="kpi-open-hint">View records →</span></button>
      <button type="button" class="kpi warn kpi-button" data-kpi-status="pending" aria-label="Show ${e.pending} pending return entries"><div class="kpi-label">Pending Return</div><div class="kpi-value">${xn(e.pending)}</div><span class="kpi-open-hint">View records →</span></button>
      <button type="button" class="kpi good kpi-button" data-kpi-status="returned" aria-label="Show ${e.returned} returned entries"><div class="kpi-label">Returned</div><div class="kpi-value">${xn(e.returned)}</div><span class="kpi-open-hint">View records →</span></button>
    </div>
    <div class="panel panel-pad">
      <h2 style="margin-top:0;">Quick actions</h2>
      <div class="actions-row">
        ${t?`<button class="btn btn-dark" data-nav="issue-new">Log a New Issue</button>`:``}
        <button class="btn btn-ghost" data-nav="register">View Full Register</button>
        ${n?`<button class="btn btn-dark" data-nav="add-tool">Enter New Tool Details</button>`:r?`<button class="btn btn-ghost" data-nav="tools-dashboard">Tools Master List</button>`:``}
      </div>
    </div>`}function Cn(){return`
    <div class="page-head">
      <div>
        <span class="eyebrow">Account</span>
        <h1>My Profile</h1>
        <div class="page-sub">Manage your storekeeper account details.</div>
      </div>
    </div>
    <div class="panel panel-pad" style="max-width:600px;">
      <form id="profileForm">
        <div class="form-grid">
          <div class="field full" style="display:flex; flex-direction:column; align-items:center; gap:16px;">
            <img id="p_avatarPreview" src="${C.profilePhotoUrl||`data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NiZDVlMSI+PHBhdGggZD0iTTEyIDJDMi40OCAyIDIgMi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMyMS41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTQuMmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMiAwIDUuOTcgMS4wOSA2IDMuMDgtMS4yOSAxLjk0LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4=`}" class="avatar" style="width:80px; height:80px; border-width:3px;" />
            <div>
              <input type="file" id="p_photo" accept="image/*" style="display:none;" />
              <button type="button" class="btn btn-ghost btn-sm" id="profileChoosePhotoBtn">Choose Profile Photo</button>
            </div>
          </div>
          <div class="field">
            <label>Username</label>
            <input type="text" value="${b(C.username)}" disabled />
          </div>
          <div class="field">
            <label>Full Name</label>
            <input type="text" value="${b(C.fullName)}" disabled />
          </div>
        </div>
        <p style="margin:12px 0 0; font-size:12.5px; color:var(--text-muted);">Username and full name are set by an Admin. You can update your password and profile photo here.</p>
        <div class="actions-row" style="margin-top:32px;">
          <button type="submit" class="btn btn-primary" id="profileSubmitBtn">Save Profile Photo</button>
        </div>
      </form>
    </div>

    <div class="panel panel-pad" style="max-width:600px; margin-top:24px;">
      <h2 style="margin-top:0;">Mobile &amp; Overdue Notifications</h2>
      <p style="margin:0 0 14px; font-size:13.5px; color:var(--text-muted);">
        Receive push and device alerts for tools and materials issued more than 7 days ago that remain unreturned.
      </p>
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px; padding:12px 14px; background:var(--surface-sunken, #f1f5f9); border-radius:var(--radius-md, 8px);">
        <div>
          <span style="font-size:12px; font-weight:600; color:var(--text-muted); display:block;">Device Notification Status</span>
          <strong style="font-size:14px; color:${dn()};">${un()}</strong>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn btn-primary btn-sm" id="enableNotificationsBtn">
            ${`Notification`in window&&Notification.permission===`granted`?`Re-check Permission`:`Enable Notifications`}
          </button>
          ${`Notification`in window&&Notification.permission===`granted`?`
            <button type="button" class="btn btn-ghost btn-sm" id="testNotificationBtn">Send Test Alert</button>
          `:``}
        </div>
      </div>
    </div>

    <div class="panel panel-pad" style="max-width:600px; margin-top:24px;">
      <h2 style="margin-top:0;">App Preferences</h2>
      <div class="field" style="max-width:320px;">
        <label for="homeViewSelect">Default landing page</label>
        <select id="homeViewSelect">${qt()}</select>
      </div>
      <p style="margin:10px 0 0; font-size:12.5px; color:var(--text-muted);">Choose which page opens automatically when you log in.</p>
    </div>

    <div class="panel panel-pad" style="max-width:600px; margin-top:24px;">
      <h2 style="margin-top:0;">Install App (PWA)</h2>
      <p style="margin:0 0 14px; font-size:13.5px; color:var(--text-muted);">
        Install CMM SMS Store on your mobile or desktop device for fast, full-screen standalone access and quick action shortcuts.
      </p>
      <div id="profilePwaStatusArea">
        <button type="button" class="btn btn-primary" id="profilePwaInstallBtn" style="display:inline-flex; align-items:center; gap:8px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Install App to Home Screen
        </button>
      </div>
    </div>

    <div class="panel panel-pad" style="max-width:600px; margin-top:24px;">
      <h2 style="margin-top:0;">Change Password</h2>
      <div class="alert alert-error${H?``:` hidden`}" id="profilePasswordAlert" role="alert">${b(H)}</div>
      <form id="profilePasswordForm">
        <div class="form-grid">
          <div class="field full">
            <label for="p_currentPassword">Current Password</label>
            <div class="password-field-wrap">
              <input type="password" id="p_currentPassword" required autocomplete="current-password" />
              <button type="button" class="password-toggle-btn" data-password-target="p_currentPassword" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
          </div>
          <div class="field full">
            <label for="p_newPassword">New Password</label>
            <div class="password-field-wrap">
              <input type="password" id="p_newPassword" required minlength="4" autocomplete="new-password" />
              <button type="button" class="password-toggle-btn" data-password-target="p_newPassword" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
            <div class="password-strength" id="p_newPasswordStrength" style="margin-top:6px; font-size:12px; font-weight:600;"></div>
          </div>
          <div class="field full">
            <label for="p_confirmPassword">Confirm New Password</label>
            <div class="password-field-wrap">
              <input type="password" id="p_confirmPassword" required minlength="4" autocomplete="new-password" />
              <button type="button" class="password-toggle-btn" data-password-target="p_confirmPassword" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
          </div>
        </div>
        <div class="actions-row" style="margin-top:32px;">
          <button type="submit" class="btn btn-primary" id="profilePasswordSubmitBtn">Update Password</button>
        </div>
      </form>
    </div>
  `}function wn(){let e=bn(),t=E.length,n=t>0?`<div class="overdue-banner" style="background:var(--bad-light); border:1px solid var(--bad); color:var(--bad-dark); padding:12px 16px; border-radius:12px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between;">
      <div style="display:flex; align-items:center; gap:12px;">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div>
          <strong style="display:block; font-size:15px; margin-bottom:2px;">Tool Deletion Requests Pending</strong>
          <span style="font-size:13px; opacity:0.9;">There ${t===1?`is`:`are`} ${t} tool deletion request${t===1?``:`s`} awaiting admin approval.</span>
        </div>
      </div>
      <button class="btn btn-dark btn-sm" data-nav="tools-dashboard">Review</button>
    </div>`:``;return`
    <div class="page-head">
      <div>
        <span class="eyebrow">Administrator</span>
        <h1>Admin Dashboard</h1>
        <div class="page-sub">Store-wide overview and management tools.</div>
      </div>
    </div>
    ${gn()}
    ${n}
    <div class="kpi-grid">
      <button type="button" class="kpi kpi-button" data-kpi-status="all" aria-label="Show all ${e.total} register entries"><div class="kpi-label">Total Entries</div><div class="kpi-value">${xn(e.total)}</div><span class="kpi-open-hint">View records →</span></button>
      <button type="button" class="kpi warn kpi-button" data-kpi-status="pending" aria-label="Show ${e.pending} pending return entries"><div class="kpi-label">Pending Return</div><div class="kpi-value">${xn(e.pending)}</div><span class="kpi-open-hint">View records →</span></button>
      <button type="button" class="kpi good kpi-button" data-kpi-status="returned" aria-label="Show ${e.returned} returned entries"><div class="kpi-label">Returned</div><div class="kpi-value">${xn(e.returned)}</div><span class="kpi-open-hint">View records →</span></button>
    </div>
    <div class="actions-row">
      <button class="btn btn-dark" data-nav="register">Manage Full Register</button>
      <button class="btn btn-ghost" data-nav="users-admin">Manage Users</button>
      <button class="btn btn-ghost" data-nav="settings-admin">Settings</button>
    </div>`}function Tn(e){return!e||typeof e!=`number`?`Syncing...`:new Date(e).toLocaleString(void 0,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})}function En(){try{localStorage.setItem(tt,JSON.stringify({filters:N,expanded:Ye,more:Qe,filtersOpen:Je}))}catch{}}function Dn(){try{let e=JSON.parse(localStorage.getItem(tt)||`null`);e?.filters&&(N={...N,...e.filters,page:1}),typeof e?.expanded==`boolean`&&(Ye=e.expanded),typeof e?.more==`boolean`&&(Qe=e.more),typeof e?.filtersOpen==`boolean`&&(Je=e.filtersOpen)}catch{}}function On(){try{localStorage.removeItem(tt)}catch{}Nn(),Ye=!1,Qe=!1,Je=!1,Xe.clear()}function $(e,{title:t=`Done`,type:n=`success`,duration:r=3500,actionText:i=``,onAction:a=null}={}){let o=v(`#toastRegion`);if(!o)return;let s={success:`<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`,danger:`<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,error:`<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,warning:`<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,warn:`<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,info:`<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`},c=n===`danger`||n===`error`?`danger`:n===`warning`||n===`warn`?`warning`:n===`info`?`info`:`success`,l=document.createElement(`section`);l.className=`toast`,l.dataset.type=c,l.setAttribute(`role`,c===`danger`?`alert`:`status`),l.style.setProperty(`--toast-duration`,`${r}ms`),l.innerHTML=`<span class="toast-icon" aria-hidden="true">${s[c]||s.success}</span><div class="toast-copy"><strong>${b(t)}</strong><p>${b(e)}</p>${i?`<div class="toast-actions"><button type="button" class="toast-action">${b(i)}</button></div>`:``}</div><button type="button" class="toast-close" aria-label="Dismiss notification"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button><span class="toast-progress" aria-hidden="true"><span class="toast-progress-fill"></span></span>`;let u=null,d=r,f=0,p=!1,m=!1,h=!1,g=!1,_=()=>{!l.isConnected||l.classList.contains(`is-leaving`)||(clearTimeout(u),l.classList.add(`is-leaving`),setTimeout(()=>l.remove(),220))},y=()=>{p||!l.isConnected||(clearTimeout(u),f=Date.now(),u=setTimeout(_,d))},x=()=>{p||(p=!0,clearTimeout(u),d=Math.max(250,d-(Date.now()-f)),l.classList.add(`is-paused`))},S=()=>{m||h||g||(p=!1,l.classList.remove(`is-paused`),y())};l.querySelector(`.toast-close`).addEventListener(`click`,_),l.querySelector(`.toast-action`)?.addEventListener(`click`,()=>{try{a?.()}finally{_()}}),l.addEventListener(`mouseenter`,()=>{m=!0,x()}),l.addEventListener(`mouseleave`,()=>{m=!1,S()}),l.addEventListener(`focusin`,()=>{h=!0,x()}),l.addEventListener(`focusout`,e=>{l.contains(e.relatedTarget)||(h=!1,S())});let ee=0,te=0;l.addEventListener(`touchstart`,e=>{!e.touches||!e.touches[0]||(g=!0,ee=e.touches[0].clientX,te=e.touches[0].clientY,x())},{passive:!0}),l.addEventListener(`touchend`,e=>{if(g=!1,!e.changedTouches||!e.changedTouches[0]){S();return}let t=e.changedTouches[0].clientX,n=e.changedTouches[0].clientY;Math.abs(t-ee)>60||te-n>40?_():S()},{passive:!0}),l.addEventListener(`touchcancel`,()=>{g=!1,S()},{passive:!0});try{navigator.vibrate&&navigator.vibrate(c===`danger`?[20,30,20]:15)}catch{}o.appendChild(l);let ne=Array.from(o.querySelectorAll(`.toast:not(.is-leaving)`));if(ne.length>3)for(let e=0;e<ne.length-3;e++){let t=ne[e];t&&t!==l&&(t.classList.add(`is-leaving`),setTimeout(()=>t.remove(),220))}y()}window.showToast=$;function kn(e=!0){P=e,document.querySelector(`.page-head h1`)?.classList.toggle(`has-unsaved`,e)}function An(e){return Xe.has(String(e))?!Ye:Ye}function jn(){let e=v(`#registerViewToolbar`),t=document.querySelector(`.topbar`);if(!e||!t)return;let n=()=>document.documentElement.style.setProperty(`--register-sticky-top`,`${Math.ceil(t.getBoundingClientRect().height)+6}px`);n(),Ze?.disconnect(),`ResizeObserver`in window&&(Ze=new ResizeObserver(n),Ze.observe(t))}function Mn(){let e=[];return N.q&&e.push([`q`,`Search: ${N.q}`]),N.status!==`all`&&e.push([`status`,`Status: ${N.status}`]),N.year!==`all`&&e.push([`year`,`Year: ${N.year}`]),N.month!==`all`&&e.push([`month`,`Month: ${N.month}`]),N.vendor!==`all`&&e.push([`vendor`,`Vendor: ${N.vendor}`]),N.area!==`all`&&e.push([`area`,`Area: ${N.area}`]),N.supervisor!==`all`&&e.push([`supervisor`,`Supervisor: ${N.supervisor}`]),N.issuedBy!==`all`&&e.push([`issuedBy`,`Issued by: ${N.issuedBy}`]),N.dateFrom&&e.push([`dateFrom`,`From: ${N.dateFrom}`]),N.dateTo&&e.push([`dateTo`,`To: ${N.dateTo}`]),e}function Nn(){N={q:``,status:`all`,month:`all`,year:`all`,vendor:`all`,area:`all`,supervisor:`all`,issuedBy:`all`,dateFrom:``,dateTo:``,page:1},Xe.clear()}function Pn(e){return Array.from(new Set(w.map(t=>String(t?.[e]||``).trim()).filter(Boolean))).sort((e,t)=>e.localeCompare(t))}function Fn(e){return cn().filter(t=>{if(e.q){let n=e.q.toLowerCase();if(![t.materialName,t.vendor,t.area,t.supervisorName,t.empCode,t.issueDate,t.returnDate,t.status].join(` `).toLowerCase().includes(n))return!1}return!(e.status!==`all`&&(e.status===`pending`?t.status===`Returned`:t.status.replace(/\s/g,``).toLowerCase()!==e.status)||e.year!==`all`&&(!t.issueDate||!t.issueDate.startsWith(e.year))||e.month!==`all`&&(!t.issueDate||t.issueDate.split(`-`)[1]!==e.month)||e.vendor!==`all`&&String(t.vendor||``)!==e.vendor||e.area!==`all`&&String(t.area||``)!==e.area||e.supervisor!==`all`&&String(t.supervisorName||``)!==e.supervisor||e.issuedBy!==`all`&&String(t.issuedByName||t.issuedBy||``)!==e.issuedBy||e.dateFrom&&(!t.issueDate||t.issueDate<e.dateFrom)||e.dateTo&&(!t.issueDate||t.issueDate>e.dateTo))}).length}function In(){let e=C.roles.includes(`admin`),t=cn(),n=t;if(N.q){let e=N.q.toLowerCase();n=n.filter(t=>[t.materialName,t.vendor,t.area,t.supervisorName,t.empCode,t.issueDate,t.returnDate,t.status].join(` `).toLowerCase().includes(e))}N.status!==`all`&&(n=n.filter(e=>N.status===`pending`?e.status!==`Returned`:e.status.replace(/\s/g,``).toLowerCase()===N.status)),N.year!==`all`&&(n=n.filter(e=>e.issueDate&&e.issueDate.startsWith(N.year))),N.month!==`all`&&(n=n.filter(e=>e.issueDate?e.issueDate.split(`-`)[1]===N.month:!1)),N.vendor!==`all`&&(n=n.filter(e=>String(e.vendor||``)===N.vendor)),N.area!==`all`&&(n=n.filter(e=>String(e.area||``)===N.area)),N.supervisor!==`all`&&(n=n.filter(e=>String(e.supervisorName||``)===N.supervisor)),N.issuedBy!==`all`&&(n=n.filter(e=>String(e.issuedByName||e.issuedBy||``)===N.issuedBy)),N.dateFrom&&(n=n.filter(e=>e.issueDate&&e.issueDate>=N.dateFrom)),N.dateTo&&(n=n.filter(e=>e.issueDate&&e.issueDate<=N.dateTo));let r=[!!N.q,N.status!==`all`,N.year!==`all`,N.month!==`all`,N.vendor!==`all`,N.area!==`all`,N.supervisor!==`all`,N.issuedBy!==`all`,!!N.dateFrom,!!N.dateTo].filter(Boolean).length,i=n.length,a=Math.max(1,Math.ceil(i/rt));N.page>a&&(N.page=a),N.page<1&&(N.page=1);let o=(N.page-1)*rt,s=n.slice(o,o+rt),c=Array.from(new Set([String(new Date().getFullYear()),...w.map(e=>e.issueDate?e.issueDate.slice(0,4):null).filter(Boolean)])).sort((e,t)=>t.localeCompare(e)),l=Pn(`vendor`),u=Pn(`area`),d=Pn(`supervisorName`),f=Array.from(new Set(w.map(e=>String(e.issuedByName||e.issuedBy||``).trim()).filter(Boolean))).sort((e,t)=>e.localeCompare(t)),p=0,m=0,h=0,g=0;for(let e=0;e<t.length;e++){let n=t[e].status;n===`Returned`?m++:(p++,n===`Issued`?h++:n===`Partially Returned`&&g++)}return`
    <div class="page-head">
      <div>
        <span class="eyebrow">Records</span>
        <h1>${e?`Full Register`:`Issue &amp; Return Register`}</h1>
        <div class="page-sub">${e?`Every record. Admins can remove entries here.`:`All material movements logged by the store.`}</div>
        <div class="register-summary-meta"><span><strong>${i}</strong> shown</span><span>${w.length} total</span><span>${p} pending</span><span>${m} returned</span></div>
      </div>
    </div>

    <div class="status-filter-chips" aria-label="Quick status filters">
      ${[[`all`,`All`,w.length],[`pending`,`Pending`,p],[`issued`,`Issued`,h],[`partiallyreturned`,`Partial`,g],[`returned`,`Returned`,m]].map(([e,t,n])=>`<button type="button" class="status-filter-chip ${N.status===e?`is-active`:``}" data-status-chip="${e}">${t} · ${n}</button>`).join(``)}
    </div>
    <button type="button" class="btn btn-ghost filter-toggle" id="filterToggleBtn" aria-expanded="${Je?`true`:`false`}" aria-controls="regFilterBar">
      <span>Filters${r?`<span class="count-badge">${r}</span>`:``}</span>
      <span aria-hidden="true">${Je?`▲`:`▼`}</span>
    </button>

    <div class="filter-bar register-toolbar${Je?` open`:``}" id="regFilterBar">
      <div style="display: flex; gap: 10px; width: 100%; align-items: center; flex-wrap: wrap;">
        <input type="text" id="regSearch" placeholder="Search material, vendor, area, supervisor…" value="${b(N.q)}" aria-label="Search register" style="flex: 1; min-width: 200px;" />
        <button type="button" class="btn btn-ghost btn-sm more-filters-toggle" id="moreFiltersToggle">More Filters${Mn().filter(([e])=>[`vendor`,`area`,`supervisor`,`issuedBy`,`year`,`month`,`status`].includes(e)).length?` · ${Mn().filter(([e])=>[`vendor`,`area`,`supervisor`,`issuedBy`,`year`,`month`,`status`].includes(e)).length}`:``}</button>
        <button type="button" class="btn btn-ghost btn-sm clear-filter-btn" id="clearRegisterFilters" ${r?``:`disabled`}>Clear Filters</button>
        <button type="button" class="btn btn-ghost btn-sm" id="resetRegisterView">Reset View</button>
      </div>
      <div class="register-advanced-filters ${Qe?``:`is-collapsed`}">
        <div class="register-filter-field"><label for="regStatus">Status</label><select id="regStatus" aria-label="Filter by status">
          <option value="all" ${N.status===`all`?`selected`:``}>All statuses</option>
          <option value="pending" ${N.status===`pending`?`selected`:``}>Pending Return</option>
          <option value="issued" ${N.status===`issued`?`selected`:``}>Issued</option>
          <option value="partiallyreturned" ${N.status===`partiallyreturned`?`selected`:``}>Partially Returned</option>
          <option value="returned" ${N.status===`returned`?`selected`:``}>Returned</option>
        </select></div>
        <div class="register-filter-field"><label for="regYear">Year</label><select id="regYear" aria-label="Filter by year">
          <option value="all" ${N.year===`all`?`selected`:``}>All Years</option>
          ${c.map(e=>`<option value="${e}" ${N.year===e?`selected`:``}>${e}</option>`).join(``)}
        </select></div>
        <div class="register-filter-field"><label for="regMonth">Month</label><select id="regMonth" aria-label="Filter by month">
          <option value="all" ${N.month===`all`?`selected`:``}>All Months</option>
          <option value="01" ${N.month===`01`?`selected`:``}>Jan</option>
          <option value="02" ${N.month===`02`?`selected`:``}>Feb</option>
          <option value="03" ${N.month===`03`?`selected`:``}>Mar</option>
          <option value="04" ${N.month===`04`?`selected`:``}>Apr</option>
          <option value="05" ${N.month===`05`?`selected`:``}>May</option>
          <option value="06" ${N.month===`06`?`selected`:``}>Jun</option>
          <option value="07" ${N.month===`07`?`selected`:``}>Jul</option>
          <option value="08" ${N.month===`08`?`selected`:``}>Aug</option>
          <option value="09" ${N.month===`09`?`selected`:``}>Sep</option>
          <option value="10" ${N.month===`10`?`selected`:``}>Oct</option>
          <option value="11" ${N.month===`11`?`selected`:``}>Nov</option>
          <option value="12" ${N.month===`12`?`selected`:``}>Dec</option>
        </select></div>
        <div class="register-filter-field"><label for="regVendor">Vendor</label><select id="regVendor"><option value="all">All vendors</option>${l.map(e=>`<option value="${b(e)}" ${N.vendor===e?`selected`:``}>${b(e)}</option>`).join(``)}</select></div>
        <div class="register-filter-field"><label for="regArea">Area</label><select id="regArea"><option value="all">All areas</option>${u.map(e=>`<option value="${b(e)}" ${N.area===e?`selected`:``}>${b(e)}</option>`).join(``)}</select></div>
        <div class="register-filter-field"><label for="regSupervisor">Supervisor</label><select id="regSupervisor"><option value="all">All supervisors</option>${d.map(e=>`<option value="${b(e)}" ${N.supervisor===e?`selected`:``}>${b(e)}</option>`).join(``)}</select></div>
        <div class="register-filter-field"><label for="regIssuedBy">Issued By</label><select id="regIssuedBy"><option value="all">All issuers</option>${f.map(e=>`<option value="${b(e)}" ${N.issuedBy===e?`selected`:``}>${b(e)}</option>`).join(``)}</select></div>
        <div class="register-filter-field"><label for="regDateFrom">Issue Date From</label><input type="date" id="regDateFrom" value="${b(N.dateFrom)}" max="${b(N.dateTo||x())}" /></div>
        <div class="register-filter-field"><label for="regDateTo">Issue Date To</label><input type="date" id="regDateTo" value="${b(N.dateTo)}" min="${b(N.dateFrom)}" max="${x()}" /></div>
        <div class="register-filter-actions" style="grid-column: 1 / -1;"><button type="button" class="btn btn-primary btn-sm apply-filter-btn" id="applyRegisterFilters" style="display: inline-flex;">Apply Filters</button></div>
      </div>
    </div>
    ${r?`<div class="filter-chips">${Mn().map(([e,t])=>`<span class="filter-chip">${b(t)}<button type="button" data-clear-filter="${e}" aria-label="Remove ${b(t)}">×</button></span>`).join(``)}</div>`:``}

    <div class="register-view-toolbar" id="registerViewToolbar">
      <button type="button" class="register-view-toggle" id="registerViewToggle" aria-pressed="${Ye}" title="Switch Register view">
        <span class="register-view-option ${Ye?``:`is-active`}"><span class="register-view-option-icon">☰</span>Compact</span>
        <span class="register-view-option ${Ye?`is-active`:``}"><span class="register-view-option-icon">▦</span>Expanded</span>
      </button>
    </div>
    <div class="panel">
      <div class="table-wrap">
        ${n.length===0?it?`<div class="empty-state"><div class="display">${r?`No matching records`:`No register records yet`}</div><p>${r?`No records match the selected filters.`:`No material movements have been recorded.`}</p>${r||!C.roles.includes(`viewer`)||C.roles.includes(`storekeeper`)?`<button type="button" class="btn btn-ghost register-empty-action" ${r?`id="emptyClearFilters"`:`data-nav="issue-new"`}>${r?`Clear Filters`:`Log New Issue`}</button>`:``}</div>`:`<div class="skeleton-register" aria-label="Loading records"><div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div></div>`:`
        <table class="reg">
          <thead>
            <tr>
              <th scope="col">Material</th><th scope="col">Qty Issued</th><th scope="col">Vendor</th><th scope="col">Area</th>
              <th scope="col">Issue Date</th><th scope="col">Issued At</th><th scope="col">Supervisor</th><th scope="col">Issued By</th>
              <th scope="col">Return Date</th><th scope="col">Returned At</th><th scope="col">Received By</th><th scope="col">Qty Returned</th><th scope="col">Qty Remaining</th><th scope="col">Condition</th><th scope="col">Return Photo</th><th scope="col">Issue Photo</th><th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            ${s.map(t=>{let n=t.qtyReturned||0,r=t.qtyIssued-n;return`
              <tr data-register-id="${t.id}" class="status-${t.status===`Returned`?`returned`:t.status===`Partially Returned`?`partial`:`issued`} ${An(t.id)?`mobile-expanded`:``}">
                <td class="mobile-register-summary" colspan="18">
                  <div class="mobile-register-item">
                    <span class="mobile-register-summary-label">Issued Item</span>
                    <strong>${b(t.materialName)}</strong>
                  </div>
                  <div class="mobile-register-person">
                    <span class="mobile-register-summary-label">Issued To</span>
                    <strong>${b(t.supervisorName)||`—`}</strong>
                  </div>
                  <div class="desktop-register-extra">
                    <span class="mobile-register-summary-label">Quantity</span>
                    <strong>${t.qtyIssued}</strong>
                  </div>
                  <div class="desktop-register-extra desktop-register-date">
                    <span class="mobile-register-summary-label">Issue Date</span>
                    <strong>${b(t.issueDate)||`—`}</strong>
                  </div>
                  <button type="button" class="mobile-register-view" data-mobile-register-view aria-expanded="${An(t.id)}" aria-label="${An(t.id)?`Hide full register details`:`View full details for ${b(t.materialName)}`}" title="${An(t.id)?`Hide details`:`View full details`}">
                    <span class="view-icon" aria-hidden="true">👁</span><span class="collapse-icon" aria-hidden="true">×</span><span class="view-spinner" aria-hidden="true"></span>
                  </button>
                </td>
                <td data-label="Material">${b(t.materialName)}</td>
                <td class="qty" data-label="Qty Issued">${t.qtyIssued}</td>
                <td class="register-section-title issue" aria-hidden="true">Issue Details</td>
                <td data-label="Vendor">${b(t.vendor)||`—`}</td>
                <td data-label="Area">${b(t.area)||`—`}</td>
                <td class="mono" data-label="Issue Date">${b(t.issueDate)}</td>
                <td class="mono" data-label="Issued At">${Tn(t.createdAt)}</td>
                <td data-label="Supervisor">${b(t.supervisorName)||`—`}${t.supervisorContact?`<br/><span class="muted" style="font-size:11px;">${b(t.supervisorContact)}</span>`:``}</td>
                <td data-label="Issued By">${b(t.issuedByName)||`—`}${t.empCode?`<br/><span class="muted" style="font-size:11px;">${b(t.empCode)}</span>`:``}</td>
                <td class="register-section-title return" aria-hidden="true">Return Details</td>
                <td class="mono" data-label="Return Date">${b(t.returnDate)||`—`}</td>
                <td class="mono" data-label="Returned At">${t.returnedAt?Tn(t.returnedAt):`—`}</td>
                <td data-label="Received By">${b(t.receivedByName)||`—`}</td>
                <td class="qty" data-label="Qty Returned">${n}</td>
                <td class="qty ${r>0&&t.status!==`Returned`?`qty-pending`:``}" data-label="Qty Remaining">${r>0?r:`—`}</td>
                <td data-label="Condition">${b(t.conditionOnReturn)||`—`}</td>
                <td class="register-section-title media" aria-hidden="true">Photos & Actions</td>
                <td data-label="Return Photo">${Fe(t.returnPhotoUrls||t.returnPhotoUrl,`Return photo`)}</td>
                <td data-label="Issue Photo">${Fe(t.photoUrls||t.photoUrl,`Issue photo`)}</td>
                <td data-label="Status">
                  ${t.status===`Returned`?`<span class="badge good">Returned</span>`:t.status===`Partially Returned`?`<span class="badge" style="background:#dbeafe;color:#1d4ed8">Partially Returned</span>`:`<span class="badge warn">Issued</span>`}
                </td>
                <td data-label="Action" class="register-actions">
                  ${(!C.roles.includes(`viewer`)||C.roles.includes(`storekeeper`)||C.roles.includes(`admin`))&&t.status!==`Returned`?`<button class="btn btn-dark btn-sm" data-return="${t.id}">Record Return</button>`:``}
                  
                  ${(!C.roles.includes(`viewer`)||C.roles.includes(`storekeeper`)||C.roles.includes(`admin`))&&t.status!==`Returned`?`<button class="btn btn-ghost btn-sm" data-edit-issue="${t.id}">Edit Issue</button>`:``}
                  
                  ${e&&t.status===`Returned`?`<button class="btn btn-ghost btn-sm" data-edit-return="${t.id}">Edit Return</button>`:``}
                  ${t.returnHistory&&Object.keys(t.returnHistory).length?`<button class="btn btn-ghost btn-sm return-history-btn" data-return-history="${t.id}">Return History · ${Object.keys(t.returnHistory).length}</button>`:``}
                  ${e?`<button class="btn btn-danger btn-sm" data-delete-issue="${t.id}"><span aria-hidden="true">🗑</span><span>Delete</span></button>`:``}
                </td>
              </tr>`}).join(``)}
          </tbody>
        </table>
        <div class="reg-pagination">
          <button type="button" class="btn btn-ghost btn-sm" id="regPagePrev" ${N.page<=1?`disabled`:``} aria-label="Previous page">← Prev</button>
          <span class="reg-page-info" role="status" aria-live="polite">Page ${N.page} of ${a} · ${i} record${i===1?``:`s`}</span>
          <button type="button" class="btn btn-ghost btn-sm" id="regPageNext" ${N.page>=a?`disabled`:``} aria-label="Next page">Next →</button>
        </div>
        `}
      </div>
    </div>`}function Ln(){return`
    <div class="page-head">
      <div>
        <span class="eyebrow">Log Movement</span>
        <h1>Issue Material</h1>
        <div class="page-sub">Record material being handed out from the store.</div>
      </div>
    </div>
    <div class="alert alert-error${F?``:` hidden`}" id="issueFormAlert" role="alert">${b(F)}</div>
    <div class="panel panel-pad" style="max-width:760px;">
      <form id="issueForm">
        <div class="form-grid">
          <div class="field">
            <label for="f_material">Material</label>
            <input type="text" id="f_material" list="qf_materials" placeholder="Enter material name..." required />
          </div>
          <div class="field">
            <label for="f_qty">Quantity Issued</label>
            <input type="number" inputmode="numeric" pattern="[0-9]*" min="1" id="f_qty" required />
          </div>
          <div class="field">
            <label for="f_vendor">Vendor</label>
            <input type="text" id="f_vendor" list="qf_vendors" autocomplete="off" required />
          </div>
          <div class="field">
            <label for="f_area">Area</label>
            <input type="text" id="f_area" list="qf_areas" autocomplete="off" required />
          </div>
          <div class="field">
            <label for="f_supervisorName">Supervisor Name</label>
            <input type="text" id="f_supervisorName" list="qf_supervisors" autocomplete="off" required />
          </div>
          <div class="field">
            <label for="f_supervisorContact">Supervisor Contact Number</label>
            <input type="tel" id="f_supervisorContact" list="qf_contacts" inputmode="numeric" autocomplete="tel" pattern="[0-9]{10}" maxlength="10" minlength="10" title="Please enter exactly 10 digits" required />
          </div>
          <div class="field">
            <label for="f_empCode">Employee Code / Dept.</label>
            <input type="text" id="f_empCode" list="qf_empcodes" autocomplete="off" />
          </div>
          <div class="field">
            <label for="f_photo">Photos of Material (optional)</label>
            <div class="camera-upload-row"><button type="button" class="btn btn-ghost btn-sm" id="f_choosePhotoBtn">Choose Photos</button><button type="button" class="btn btn-dark btn-sm" id="f_cameraBtn">Take Picture</button></div><div class="photo-limit-note">Maximum 5 photos per issue entry.</div><input type="file" id="f_photo" class="camera-input" accept="image/*" multiple /><input type="file" id="f_camera" class="camera-input" accept="image/*" capture="environment" />
          </div>
          <div class="field full" id="f_photoPreviewWrap" style="display:none;">
            <div id="f_photoPreview" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
            <button type="button" class="btn btn-ghost btn-sm" id="f_photoClear" style="margin-top:12px; width:fit-content;">Remove Photo</button>
          </div>
          <div class="field full">
            <label for="f_remarks">Remarks / Details</label>
            <textarea id="f_remarks" placeholder="Any extra details about this issue — condition, purpose, job reference, etc."></textarea>
          </div>          ${He(`qf_materials`,Ve(`materialName`))}
          ${He(`qf_vendors`,Ve(`vendor`))}
          ${He(`qf_areas`,Ve(`area`))}
          ${He(`qf_supervisors`,Ve(`supervisorName`))}
          ${He(`qf_contacts`,Ve(`supervisorContact`))}
          ${He(`qf_empcodes`,Ve(`empCode`))}
        </div>
        <div class="actions-row">
          <button type="submit" class="btn btn-primary" id="issueSubmitBtn">Save Issue Record</button>
          <button type="button" class="btn btn-ghost" data-nav="register">Cancel</button>
        </div>
      </form>
    </div>`}function Rn(){let e=w.find(e=>e.id===ot);return e?`
    <div class="page-head">
      <div>
        <span class="eyebrow">Edit Movement</span>
        <h1>Edit Issue Details</h1>
        <div class="page-sub">Update the original material issue record.</div>
      </div>
    </div>
    <div class="alert alert-error${I?``:` hidden`}" id="editIssueFormAlert" role="alert">${b(I)}</div>
    <div class="panel panel-pad" style="max-width:760px;">
      <form id="editIssueForm">
        <div class="form-grid">
          <div class="field">
            <label for="ei_material">Material</label>
            <input type="text" id="ei_material" value="${b(e.materialName)}" required />
          </div>
          <div class="field">
            <label for="ei_qty">Quantity Issued</label>
            <input type="number" inputmode="numeric" pattern="[0-9]*" min="${e.qtyReturned||1}" id="ei_qty" value="${e.qtyIssued}" required />
          </div>
          <div class="field">
            <label for="ei_vendor">Vendor</label>
            <input type="text" id="ei_vendor" value="${b(e.vendor||``)}" required />
          </div>
          <div class="field">
            <label for="ei_area">Area</label>
            <input type="text" id="ei_area" value="${b(e.area||``)}" required />
          </div>
          <div class="field">
            <label>Issue Date</label>
            <input type="date" value="${b(e.issueDate)}" disabled />
          </div>
          <div class="field">
            <label for="ei_supervisorName">Supervisor Name</label>
            <input type="text" id="ei_supervisorName" value="${b(e.supervisorName||``)}" required />
          </div>
          <div class="field">
            <label for="ei_supervisorContact">Supervisor Contact Number</label>
            <input type="tel" id="ei_supervisorContact" value="${b(e.supervisorContact||``)}" pattern="[0-9]{10}" maxlength="10" minlength="10" title="Please enter exactly 10 digits" required />
          </div>
          <div class="field">
            <label for="ei_empCode">Employee Code / Dept.</label>
            <input type="text" id="ei_empCode" value="${b(e.empCode||``)}" />
          </div>
          <div class="field full">
            <label>Current Issue Photos</label>
            ${Fe(e.photoUrls||e.photoUrl,`Issue photo`)}
          </div>
          <div class="field">
            <label for="ei_photo">Add Issue Photos (optional)</label>
            <div class="camera-upload-row"><button type="button" class="btn btn-ghost btn-sm" id="ei_choosePhotoBtn">Choose Photos</button><button type="button" class="btn btn-dark btn-sm" id="ei_cameraBtn">Take Picture</button></div><div class="photo-limit-note">Maximum 5 photos total for this issue entry.</div><input type="file" id="ei_photo" class="camera-input" accept="image/*" multiple /><input type="file" id="ei_camera" class="camera-input" accept="image/*" capture="environment" />
          </div>
          <div class="field full" id="ei_photoPreviewWrap" style="display:none;">
            <div id="ei_photoPreview" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
            <button type="button" class="btn btn-ghost btn-sm" id="ei_photoClear" style="margin-top:12px; width:fit-content;">Remove Photo</button>
          </div>
          <div class="field full">
            <label for="ei_remarks">Remarks / Details</label>
            <textarea id="ei_remarks">${b(e.remarks||``)}</textarea>
          </div>
        </div>
        <div class="actions-row">
          <button type="submit" class="btn btn-primary" id="editIssueSubmitBtn">Save Changes</button>
          <button type="button" class="btn btn-ghost" data-nav="register">Cancel</button>
        </div>
      </form>
    </div>`:`<div class="empty-state"><div class="display">Record not found</div></div>`}function zn(){let e=w.find(e=>e.id===st);if(!e)return`<div class="empty-state"><div class="display">Record not found</div></div>`;let t=e.materialName||`(unnamed)`,n=e.qtyReturned||0,r=e.qtyIssued-n;return`
    <div class="page-head">
      <div>
        <span class="eyebrow">Log Movement</span>
        <h1>Record a Return</h1>
        <div class="page-sub">${b(t)} — ${b(e.area)||`area not recorded`}, issued ${b(e.issueDate)}</div>
      </div>
    </div>
    <div class="alert alert-error${L?``:` hidden`}" id="returnFormAlert" role="alert">${b(L)}</div>
    <div class="panel panel-pad" style="max-width:760px;">
      <form id="returnForm">
        <div class="form-grid">
          <div class="field">
            <label>Qty Issued</label>
            <input type="text" value="${e.qtyIssued}" disabled />
          </div>
          <div class="field">
            <label>Qty Already Returned</label>
            <input type="text" value="${n}" disabled />
          </div>
          <div class="field">
            <label for="r_qty">Qty Returning Now (max ${r})</label>
            <input type="number" inputmode="numeric" pattern="[0-9]*" min="1" max="${r}" id="r_qty" value="${r}" required />
          </div>
          <div class="field">
            <label for="r_date">Return Date</label>
            <input type="date" id="r_date" value="${x()}" required />
          </div>
          <div class="field">
            <label for="r_condition">Condition on Return</label>
            <select id="r_condition">
              <option>Good</option><option>Worn</option><option>Needs Repair</option><option>Damaged</option><option>Lost</option>
            </select>
          </div>
          <div class="field">
            <label for="r_photo">Photos on Return (optional)</label>
            <div class="camera-upload-row"><button type="button" class="btn btn-ghost btn-sm" id="r_choosePhotoBtn">Choose Photos</button><button type="button" class="btn btn-dark btn-sm" id="r_cameraBtn">Take Picture</button></div><div class="photo-limit-note">Maximum 5 photos per return entry.</div><input type="file" id="r_photo" class="camera-input" accept="image/*" multiple /><input type="file" id="r_camera" class="camera-input" accept="image/*" capture="environment" />
          </div>
          <div class="field full" id="r_photoPreviewWrap" style="display:none;">
            <div id="r_photoPreview" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
            <button type="button" class="btn btn-ghost btn-sm" id="r_photoClear" style="margin-top:12px; width:fit-content;">Remove Photo</button>
          </div>
          <div class="field full">
            <label for="r_remarks">Remarks</label>
            <textarea id="r_remarks">${b(e.remarks||``)}</textarea>
          </div>
        </div>
        <div class="actions-row">
          <button type="submit" class="btn btn-primary" id="returnSubmitBtn">Save Return</button>
          <button type="button" class="btn btn-ghost" data-nav="register">Cancel</button>
        </div>
      </form>
    </div>`}function Bn(){let e=w.find(e=>e.id===ct);return e?`
    <div class="page-head">
      <div>
        <span class="eyebrow">Admin — Edit Return</span>
        <h1>Edit Return Details</h1>
        <div class="page-sub">${b(e.materialName||`(unnamed)`)} — originally issued ${b(e.issueDate)}</div>
      </div>
    </div>
    <div class="alert alert-error${R?``:` hidden`}" id="editReturnFormAlert" role="alert">${b(R)}</div>
    <div class="alert alert-info">Only return-side details can be edited here — the original issue record is preserved.</div>
    <div class="panel panel-pad" style="max-width:760px;">
      <form id="editReturnForm">
        <div class="form-grid">
          <div class="field">
            <label>Qty Issued (read-only)</label>
            <input type="text" value="${e.qtyIssued}" disabled />
          </div>
          <div class="field">
            <label for="er_qty">Qty Returned</label>
            <input type="number" inputmode="numeric" pattern="[0-9]*" min="0" max="${e.qtyIssued}" id="er_qty" value="${e.qtyReturned||0}" required />
          </div>
          <div class="field">
            <label for="er_date">Return Date</label>
            <input type="date" id="er_date" value="${b(e.returnDate||x())}" required />
          </div>
          <div class="field">
            <label for="er_condition">Condition on Return</label>
            <select id="er_condition">
              ${[`Good`,`Worn`,`Needs Repair`,`Damaged`,`Lost`].map(t=>`<option ${e.conditionOnReturn===t?`selected`:``}>${t}</option>`).join(``)}
            </select>
          </div>
          <div class="field full">
            <label>Current Return Photos</label>
            ${Fe(e.returnPhotoUrls||e.returnPhotoUrl,`Return photo`)}
          </div>
          <div class="field">
            <label for="er_photo">Add Return Photos (optional)</label>
            <div class="camera-upload-row"><button type="button" class="btn btn-ghost btn-sm" id="er_choosePhotoBtn">Choose Photos</button><button type="button" class="btn btn-dark btn-sm" id="er_cameraBtn">Take Picture</button></div><div class="photo-limit-note">Maximum 5 new photos per edit.</div><input type="file" id="er_photo" class="camera-input" accept="image/*" multiple /><input type="file" id="er_camera" class="camera-input" accept="image/*" capture="environment" />
          </div>
          <div class="field full" id="er_photoPreviewWrap" style="display:none;">
            <div id="er_photoPreview" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
            <button type="button" class="btn btn-ghost btn-sm" id="er_photoClear" style="margin-top:12px; width:fit-content;">Remove Photo</button>
          </div>
          <div class="field full">
            <label for="er_remarks">Remarks</label>
            <textarea id="er_remarks">${b(e.remarks||``)}</textarea>
          </div>
        </div>
        <div class="actions-row">
          <button type="submit" class="btn btn-primary" id="editReturnSubmitBtn">Save Changes</button>
          <button type="button" class="btn btn-ghost" data-nav="register">Cancel</button>
        </div>
      </form>
    </div>`:`<div class="empty-state"><div class="display">Record not found</div></div>`}function Vn(){return`
    <div class="page-head">
      <div>
        <span class="eyebrow">Administrator</span>
        <h1>Users</h1>
        <div class="page-sub">Create and manage staff (storekeeper) accounts. Admin access uses a single fixed login and isn't managed here.</div>
      </div>
    </div>
    <div class="alert alert-error${z?``:` hidden`}" id="userFormAlert" role="alert">${b(z)}</div>

    <div id="requestsHolder" class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><h2>Pending Access Requests</h2></div>
      <div class="panel-pad">
        <div class="empty-state"><span class="spinner"></span><p style="margin-top:10px;">Loading requests…</p></div>
      </div>
    </div>

    <div id="usersTableHolder" class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><h2>Storekeeper Accounts</h2></div>
      <div class="table-wrap">
        <div class="empty-state"><span class="spinner"></span><p style="margin-top:10px;">Loading users…</p></div>
      </div>
    </div>
    <div class="panel panel-pad">
      <h2 style="margin-top:0;">Add New Storekeeper Account</h2>
      <form id="newUserForm">
        <div class="form-grid">
          <div class="field">
            <label for="nu_username">Username</label>
            <input type="text" id="nu_username" autocapitalize="none" required />
          </div>
          <div class="field">
            <label for="nu_fullname">Full Name</label>
            <input type="text" id="nu_fullname" required />
          </div>
          <div class="field">
            <label>Roles (Max 2)</label>
            <div class="custom-multi-select" style="position:relative; max-width: 250px;">
              <div class="multi-select-header" tabindex="0" style="border: 1px solid var(--border); padding: 8px 12px; border-radius: 4px; cursor: pointer; background: var(--surface); display:flex; justify-content:space-between; align-items:center;">
                <span class="ms-label">1 Role Selected</span>
                <span style="font-size:10px;">▼</span>
              </div>
              <div id="nu_role_group" class="role-checkbox-group multi-select-options hidden" style="position:absolute; top:100%; left:0; right:0; background:var(--input-bg, var(--surface)); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid var(--border); z-index:10; padding: 10px; border-radius: 4px; box-shadow: 0 8px 16px rgba(0,0,0,0.3); display:flex; flex-direction:column; gap:8px; margin-top:2px;">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0;"><input type="checkbox" value="storekeeper" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;" checked> Storekeeper</label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0;"><input type="checkbox" value="viewer" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;"> Viewer</label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0;"><input type="checkbox" value="tools_admin" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;"> Tools Admin</label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0;"><input type="checkbox" value="tools_viewer" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;"> Tools Viewer</label>
              </div>
            </div>
          </div>
          <div class="field full">
            <label for="nu_password">Password</label>
            <div class="password-field-wrap">
              <input type="password" id="nu_password" required minlength="4" />
              <button type="button" class="password-toggle-btn" data-password-target="nu_password" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
          </div>
        </div>
        <div class="actions-row"><button type="submit" class="btn btn-primary" id="newUserSubmitBtn">Create Account</button></div>
      </form>
    </div>`}var Hn={issued:`Issued`,partial:`Partially Returned`,returned:`Returned`};function Un(e,t,n=`all`){let r=Hn[n]||null;return cn().filter(n=>n.issueDate&&n.issueDate>=e&&n.issueDate<=t&&(!r||n.status===r)).sort((e,t)=>(e.issueDate||``).localeCompare(t.issueDate||``)).map((e,t)=>({"Sl No.":t+1,Material:e.materialName||``,"Quantity Issued":Number(e.qtyIssued)||0,Vendor:e.vendor||``,Area:e.area||``,"Issue Date":e.issueDate||``,"Issued At":e.createdAt?new Date(e.createdAt):``,Supervisor:e.supervisorName||``,"Supervisor Contact":e.supervisorContact||``,"Employee Code / Department":e.empCode||``,"Issued By":e.issuedByName||e.issuedBy||``,"Return Date":e.returnDate||``,"Returned At":e.returnedAt?new Date(e.returnedAt):``,"Received By":e.receivedByName||e.receivedBy||``,"Quantity Returned":Number(e.qtyReturned)||0,"Quantity Remaining":Math.max(0,(Number(e.qtyIssued)||0)-(Number(e.qtyReturned)||0)),"Condition on Return":e.conditionOnReturn||``,Status:e.status||sn(e),Remarks:e.remarks||``}))}function Wn(){let e=v(`#excelDateFrom`)?.value||``,t=v(`#excelDateTo`)?.value||``,n=v(`#excelExportSummary`),r=v(`#downloadRegisterExcelBtn`);if(!n||!r)return;let i=!e||!t||e>t||t>x(),a=i?0:Un(e,t,Ge).length,o=Ge===`all`?``:` (${Hn[Ge]} only)`;n.textContent=!e||!t?`Choose both dates to prepare the register download.`:e>t?`Start date cannot be after end date.`:t>x()?`End date cannot be in the future.`:`${a} record${a===1?``:`s`}${o} will be exported. Photos are excluded.`,r.disabled=i||a===0||!window.XLSX}function Gn(e){let t=new Date,n=e=>{let t=new Date(e);return t.setMinutes(t.getMinutes()-t.getTimezoneOffset()),t.toISOString().slice(0,10)},r,i=n(t);if(e===`this-month`)r=n(new Date(t.getFullYear(),t.getMonth(),1));else if(e===`last-month`)r=n(new Date(t.getFullYear(),t.getMonth()-1,1)),i=n(new Date(t.getFullYear(),t.getMonth(),0));else if(e===`30-days`){let e=new Date(t);e.setDate(e.getDate()-29),r=n(e)}else if(e===`this-year`)r=`${t.getFullYear()}-01-01`;else{let e=w.map(e=>e.issueDate).filter(Boolean).sort();r=e[0]||x(),i=e[e.length-1]||x()}return{from:r,to:i}}function Kn(){let e=v(`#excelReadiness`),t=v(`#retryExcelModuleBtn`);if(!e)return;let n=!!window.XLSX;e.classList.toggle(`is-ready`,n),e.querySelector(`span:last-child`).textContent=n?`Excel module ready`:`Excel module unavailable`,t?.classList.toggle(`hidden`,n),Wn()}async function qn(){if(!C?.roles.includes(`admin`)){await O(`Only the administrator can download the Excel register.`,{title:`Admin Access Required`,type:`danger`});return}let e=v(`#excelDateFrom`)?.value||``,t=v(`#excelDateTo`)?.value||``;if(!e||!t||e>t||t>x()){await O(`Select a valid issue-date range up to today.`,{title:`Invalid Date Range`,type:`danger`});return}let n=Ge,r=Hn[n]||``,i=Un(e,t,n);if(!i.length){await O(n===`all`?`No register records were found in the selected date range.`:`No register records with status "${r}" were found in the selected date range.`,{title:`Nothing to Export`,type:`info`});return}if(!window.XLSX){await O(`The Excel export library could not be loaded. Check the internet connection and try again.`,{title:`Excel Export Unavailable`,type:`danger`});return}let a=window.XLSX.utils.json_to_sheet(i,{cellDates:!0});a[`!autofilter`]={ref:a[`!ref`]},a[`!freeze`]={xSplit:0,ySplit:1},a[`!cols`]=[{wch:8},{wch:30},{wch:16},{wch:22},{wch:18},{wch:13},{wch:21},{wch:24},{wch:20},{wch:25},{wch:24},{wch:13},{wch:21},{wch:24},{wch:18},{wch:18},{wch:22},{wch:20},{wch:35}];let o=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(o,a,`Register`),o.Props={Title:`CMM SMS Register ${e} to ${t}${n===`all`?``:` - `+r}`,Subject:`Issue and Return Register`,Author:C.fullName||C.username,CreatedDate:new Date};let s=v(`#downloadRegisterExcelBtn`);s&&(s.disabled=!0,s.innerHTML=`<span class="spinner"></span> Preparing Excel…`);let c=`CMM_SMS_Register_${e}_to_${t}${n===`all`?``:`_${r.replace(/\s+/g,``)}`}.xlsx`;window.XLSX.writeFile(o,c,{compression:!0,cellDates:!0}),await Z(`register-exported`,null,{fromDate:e,toDate:t,statusFilter:n,recordCount:i.length,fileName:c}),$(`${i.length} records exported as ${c}`,{title:`Excel Downloaded`}),s&&(s.disabled=!1,s.textContent=`Download Excel Register`),await O(`${i.length} register record${i.length===1?``:`s`} exported successfully. Photos were excluded.`,{title:`Excel Download Ready`,type:`success`})}async function Jn(){if(!C?.roles.includes(`admin`)){await O(`Only administrators can download the Tools Master List in Excel.`,{title:`Admin Access Required`,type:`danger`});return}if(!window.XLSX){await O(`The Excel export module is not ready. Please verify your internet connection.`,{title:`Excel Unavailable`,type:`danger`});return}let e=v(`#toolsExcelCategory`)?.value||`all`,t=v(`#toolsExcelStatus`)?.value||`all`,n=T.filter(n=>!(e!==`all`&&(n.category||``).trim()!==e||t!==`all`&&(n.status||`Available`)!==t));if(!n.length){await O(`No tool records found matching the chosen filters.`,{title:`Nothing to Export`,type:`info`});return}let r=n.map((e,t)=>{let n=Array.isArray(e.statusHistory)&&e.statusHistory.length?e.statusHistory.map(e=>`${e.dateStr||(e.timestamp?new Date(e.timestamp).toLocaleString():``)}: [${e.status||``}] by ${e.changedBy||e.changedByUsername||``}${e.notes?` - `+e.notes:``}`).join(` | `):``;return{"Sl No.":t+1,"Tool ID":e.uniqueId||``,"Tool Name":e.toolName||``,Category:e.category||`General`,Quantity:Number(e.quantity)||0,"Location / Shelf":e.location||``,"Current Status":e.status||`Available`,Notes:e.notes||``,"Created By":e.createdBy||``,"Created Date":e.createdAt?new Date(e.createdAt):``,"Last Updated By":e.updatedBy||``,"Last Updated Date":e.updatedAt?new Date(e.updatedAt):``,"Latest Status Note":e.lastStatusNote||``,"Status History":n}}),i=window.XLSX.utils.json_to_sheet(r,{cellDates:!0});i[`!autofilter`]={ref:i[`!ref`]},i[`!freeze`]={xSplit:0,ySplit:1},i[`!cols`]=[{wch:8},{wch:26},{wch:32},{wch:18},{wch:10},{wch:18},{wch:18},{wch:30},{wch:18},{wch:20},{wch:18},{wch:20},{wch:25},{wch:50}];let a=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(a,i,`Tools Master`),a.Props={Title:`CMM SMS Tools Master List`,Subject:`Physical Tool Asset Master Register`,Author:C.fullName||C.username,CreatedDate:new Date};let o=v(`#downloadToolsExcelBtn`);o&&(o.disabled=!0,o.innerHTML=`<span class="spinner"></span> Preparing Excel…`);let s=`CMM_SMS_Tools_Master_${x()}.xlsx`;window.XLSX.writeFile(a,s,{compression:!0,cellDates:!0}),await Z(`tools-master-exported`,null,{categoryFilter:e,statusFilter:t,recordCount:r.length,fileName:s}),$(`${r.length} tools exported as ${s}`,{title:`Tools Excel Downloaded`}),o&&(o.disabled=!1,o.textContent=`Download Tools Excel (.xlsx)`),await O(`${r.length} tool record${r.length===1?``:`s`} exported successfully.`,{title:`Excel Download Ready`,type:`success`})}function Yn(){let e=_.databaseURL||`(not set)`,t=Array.from(new Set(T.map(e=>(e.category||``).trim()).filter(Boolean))).sort(),n=typeof window.getAdminErrorLogs==`function`?window.getAdminErrorLogs():[],r=typeof window.renderAdminErrorSummary==`function`?window.renderAdminErrorSummary():``,i=typeof window.renderAdminErrorLogs==`function`?window.renderAdminErrorLogs():`<div class="error-log-empty">No errors recorded.</div>`;return`
    <div class="page-head">
      <div>
        <span class="eyebrow">Administrator</span>
        <h1>Settings</h1>
        <div class="page-sub">Cloud sync status, database payload analytics, and data management.</div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="homeview" aria-expanded="true"><h2>Startup Page</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="homeview">
        <div class="page-sub" style="margin-bottom:14px;">Choose which page opens automatically when you log in or reopen the app.</div>
        <div class="field" style="max-width:320px;">
          <label for="homeViewSelect">Default landing page</label>
          <select id="homeViewSelect">${qt()}</select>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="errors" aria-expanded="true"><h2>Detailed Error Log <span id="adminErrorCount" class="error-log-chip">${n.length}</span></h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="errors">
        <div class="page-sub" style="margin-bottom:14px;">Browser, application, promise, network and Firebase errors recorded on this device. Logs are stored locally and limited to the latest 200 entries.</div>
        <div class="error-log-toolbar">
          <input id="errorLogSearch" class="input" type="search" placeholder="Search message, page, user or code" aria-label="Search error logs">
          <select id="errorLogLevel" class="input" aria-label="Filter error severity"><option value="all">All severities</option><option value="error">Errors</option><option value="warning">Warnings</option><option value="info">Information</option></select>
          <button class="btn btn-ghost btn-sm" id="refreshErrorLogBtn">Refresh</button>
          <button class="btn btn-ghost btn-sm" id="exportErrorLogBtn">Export JSON</button>
          <button class="btn btn-danger btn-sm" id="clearErrorLogBtn">Clear Log</button>
        </div>
        <div id="adminErrorLogSummary" class="error-log-summary">${r}</div>
        <div id="adminErrorLogList" class="error-log-list">${i}</div>
      </div>
    </div>
    <div class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="cloud" aria-expanded="true"><h2>Cloud Sync Status</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="cloud">
        <div class="sync-status-row">
          <span class="sync-dot ${G?`sync-dot-good`:`sync-dot-bad`}"></span>
          <span class="sync-status-label">${G?`Connected`:`Disconnected`}</span>
        </div>
        <div class="kv-grid">
          <div class="kv-row"><span class="kv-key">Last synced</span><span class="kv-val mono">${ht?ht.toLocaleString():`—`}</span></div>
          <div class="kv-row"><span class="kv-key">Database URL</span><span class="kv-val mono" style="word-break:break-all;">${b(e)}</span></div>
          <div class="kv-row"><span class="kv-key">Project ID</span><span class="kv-val mono">${b(_.projectId||`—`)}</span></div>
          <div class="kv-row"><span class="kv-key">Issue records cached</span><span class="kv-val mono">${w.length}</span></div>
          <div class="kv-row"><span class="kv-key">Tools cached</span><span class="kv-val mono">${T.length}</span></div>
          <div class="kv-row"><span class="kv-key">Pending tool deletion requests</span><span class="kv-val mono">${E.length}</span></div>
        </div>
        <div class="actions-row">
          <button class="btn btn-ghost btn-sm" id="refreshSyncStatusBtn">Refresh Status</button>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="audit" aria-expanded="false"><h2>System Audit Log</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body hidden" data-settings-body="audit">
        <div class="page-sub" style="margin-bottom:14px;">Review recent administrative and system actions. (Loads latest 100 entries on demand)</div>
        <div class="actions-row" style="margin-bottom:16px;">
          <button class="btn btn-dark btn-sm" id="loadAuditLogBtn">Load Audit Log</button>
        </div>
        <div id="auditLogContainer" style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-alt); padding: 8px;">
          <div style="padding: 12px; text-align: center; color: var(--text-light); font-size: 13px;">Click "Load Audit Log" to fetch records from the cloud.</div>
        </div>
      </div>
    </div>

    <!-- Download Register Excel (Issues Collection) -->
    <div class="panel excel-export-card" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="export" aria-expanded="true"><h2>Download Material Issue Register in Excel</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="export">
        <div class="excel-export-grid">
          <div class="excel-presets"><button type="button" class="btn btn-ghost btn-sm" data-excel-preset="this-month">This Month</button><button type="button" class="btn btn-ghost btn-sm" data-excel-preset="last-month">Last Month</button><button type="button" class="btn btn-ghost btn-sm" data-excel-preset="30-days">Last 30 Days</button><button type="button" class="btn btn-ghost btn-sm" data-excel-preset="this-year">This Year</button><button type="button" class="btn btn-ghost btn-sm" data-excel-preset="all">All Records</button></div>
          <p class="excel-export-note">Select an inclusive <strong>Issue Date</strong> range. The Excel workbook includes material issue details and return information, but deliberately excludes all issue/return photos, photo URLs and storage paths.</p>
          <div class="field"><label for="excelDateFrom">Issue Date From</label><input type="date" id="excelDateFrom" max="${qe||x()}" value="${Ke}" /></div>
          <div class="field"><label for="excelDateTo">Issue Date To</label><input type="date" id="excelDateTo" min="${Ke}" max="${x()}" value="${qe}" /></div>
          <div class="field excel-status-filter">
            <label id="excelStatusLabel">Status</label>
            <div class="status-filter-chips excel-status-chips" role="group" aria-labelledby="excelStatusLabel">
              <button type="button" class="status-filter-chip ${Ge===`all`?`is-active`:``}" data-excel-status="all">All</button>
              <button type="button" class="status-filter-chip ${Ge===`issued`?`is-active`:``}" data-excel-status="issued">Issued</button>
              <button type="button" class="status-filter-chip ${Ge===`partial`?`is-active`:``}" data-excel-status="partial">Partial</button>
              <button type="button" class="status-filter-chip ${Ge===`returned`?`is-active`:``}" data-excel-status="returned">Returned</button>
            </div>
          </div>
          <div class="excel-export-summary" id="excelExportSummary">Choose both dates to prepare the register download.</div><div id="excelReadiness" class="export-readiness"><span class="export-readiness-dot"></span><span>Checking Excel module…</span></div><button type="button" class="btn btn-ghost btn-sm hidden" id="retryExcelModuleBtn">Retry Excel Module</button>
          <button type="button" class="btn btn-primary" id="downloadRegisterExcelBtn">Download Excel Register</button>
        </div>
      </div>
    </div>

    <!-- Download Tools Master List Excel (Tools Collection) -->
    <div class="panel excel-export-card" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="tools-export" aria-expanded="true"><h2>Download Tools Master List in Excel</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="tools-export">
        <div class="excel-export-grid">
          <p class="excel-export-note">Export the complete <strong>Physical Tool Master Register</strong> to Excel (.xlsx). Includes tool IDs, categories, quantities, locations, current conditions, notes, creator timestamps, and formatted status update history log.</p>
          <div class="field">
            <label for="toolsExcelCategory">Category Filter</label>
            <select id="toolsExcelCategory">
              <option value="all">All Categories</option>
              ${t.map(e=>`<option value="${b(e)}">${b(e)}</option>`).join(``)}
            </select>
          </div>
          <div class="field">
            <label for="toolsExcelStatus">Status Filter</label>
            <select id="toolsExcelStatus">
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Maintenance">Under Maintenance</option>
              <option value="Damaged">Damage Declared</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div class="excel-export-summary" id="toolsExcelSummary">Total tools in master register: <strong>${T.length}</strong></div>
          <button type="button" class="btn btn-primary" id="downloadToolsExcelBtn">Download Tools Excel (.xlsx)</button>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="data" aria-expanded="true"><h2>Data Management</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="data">
        <p style="margin-top:0; margin-bottom:20px; color:var(--steel-600); font-size:14px;">
          Keep your database fast and free up cloud storage by permanently removing old, fully returned records.
        </p>
        <div class="actions-row">
          <button class="btn btn-danger" id="cleanupOldRecordsBtn">Delete Returned Records Older Than 6 Months</button>
        </div>
      </div>
    </div>
    <div class="panel danger-zone" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="danger" aria-expanded="false"><h2>Danger Zone</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body is-collapsed" data-settings-body="danger">
        <p class="danger-zone-note"><strong>Clear All Store Data</strong> permanently removes every issue/return record, linked issue and return photos, pending access requests, and audit history. Storekeeper user accounts and the administrator login are preserved.</p>
        <button type="button" class="btn btn-danger" id="clearAllStoreDataBtn">Clear All Store Data</button>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="storage" aria-expanded="true"><h2>Database Payload Estimate</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="storage" id="storageUsageHolder">
        <div class="empty-state"><span class="spinner"></span><p style="margin-top:10px;">Calculating…</p></div>
      </div>
    </div>`}function Xn(){let e=v(`#storageUsageHolder`);if(!e)return;let n=1048576,r=t(o(U,`users`)).catch(()=>null),i=t(o(U,`accessRequests`)).catch(()=>null),a=t(o(U,`toolDeletionRequests`)).catch(()=>null),s=t(o(U,`auditLog`)).catch(()=>null);Promise.all([r,i,a,s]).then(([t,r,i,a])=>{if(!document.contains(e))return;let o=new Blob([JSON.stringify(w)]).size/1024,s=new Blob([JSON.stringify(T)]).size/1024,c=t?.val()?new Blob([JSON.stringify(t.val())]).size/1024:0,l=(r?.val()?new Blob([JSON.stringify(r.val())]).size/1024:0)+(i?.val()?new Blob([JSON.stringify(i.val())]).size/1024:0),u=a?.val()?new Blob([JSON.stringify(a.val())]).size/1024:0,d=t?.val()?Object.keys(t.val()).length:0,f=r?.val()?Object.keys(r.val()).length:0,p=i?.val()?Object.keys(i.val()).length:0,m=a?.val()?Object.keys(a.val()).length:0,h=[{label:`Material Issue Register`,count:`${w.length} records`,kb:o,color:`#3b82f6`},{label:`Tool Master Catalog`,count:`${T.length} tools`,kb:s,color:`#f59e0b`},{label:`Staff User Accounts`,count:`${d} accounts`,kb:c,color:`#8b5cf6`},{label:`Pending Access & Tool Requests`,count:`${f+p} pending`,kb:l,color:`#ec4899`},{label:`Audit Trail Logs`,count:`${m} events`,kb:u,color:`#10b981`}],g=h.reduce((e,t)=>e+t.kb,0),_=Math.max(0,n-g),v=Math.min(100,g/n*100),y=e=>e>=1024?(e/1024).toFixed(2)+` MB`:e.toFixed(2)+` KB`;e.innerHTML=`
      <div class="storage-bar-wrap">
        <div class="storage-bar-track">
          <div class="storage-bar-fill" style="width:${Math.max(v,.08).toFixed(3)}%; background:${v>80?`linear-gradient(90deg,#ef4444,#f59e0b)`:`linear-gradient(90deg,#10b981,#f59e0b)`};"></div>
        </div>
        <div class="storage-bar-caption">
          <span><strong>${y(g)}</strong> total database payload</span>
          <span>${(g/n*100).toFixed(4)}% of 1 GB Realtime DB limit</span>
        </div>
      </div>
      <div class="storage-legend">
        ${h.map(e=>`
          <div class="storage-legend-row">
            <span class="storage-dot" style="background:${e.color};"></span>
            <span class="storage-legend-label"><strong>${b(e.label)}</strong> <span class="muted" style="font-size:11.5px; margin-left:4px;">(${e.count})</span></span>
            <span class="storage-legend-val mono">${y(e.kb)}</span>
          </div>`).join(``)}
        <div class="storage-legend-row storage-legend-free">
          <span class="storage-dot" style="background:var(--steel-100); border:1px solid var(--steel-300);"></span>
          <span class="storage-legend-label">Available Cloud Quota</span>
          <span class="storage-legend-val mono">${y(_)}</span>
        </div>
      </div>
      <div class="muted" style="font-size:12.5px; margin-top:16px;">
        Estimated Realtime Database JSON payloads calculated live from active memory caches and Firebase collections. Uploaded photos are stored and tracked in Firebase Cloud Storage.
      </div>`}).catch(t=>{document.contains(e)&&(e.innerHTML=`<div class="empty-state"><p style="color:var(--bad);">Storage estimate calculation error: ${b(t.message)}</p></div>`)})}function Zn(e){if((e===`dashboard`||e===`admin-dashboard`)&&v(`#overdueBannerFollowUpBtn`)?.addEventListener(`click`,()=>{vn()}),e===`register`&&(v(`#regSearch`)?.addEventListener(`input`,e=>{let t=e.target.value,n=e.target.selectionStart;clearTimeout(nt),nt=setTimeout(()=>{N.q=t,N.page=1,Q();let e=v(`#regSearch`);e&&(e.focus(),e.setSelectionRange(n,n))},300)}),$e={...N},[[`regStatus`,`status`],[`regYear`,`year`],[`regMonth`,`month`],[`regVendor`,`vendor`],[`regArea`,`area`],[`regSupervisor`,`supervisor`],[`regIssuedBy`,`issuedBy`],[`regDateFrom`,`dateFrom`],[`regDateTo`,`dateTo`]].forEach(([e,t])=>v(`#`+e)?.addEventListener(`change`,e=>{$e[t]=e.target.value,window.matchMedia(`(max-width:768px)`).matches||(N={...$e,page:1},En(),Q())})),v(`#moreFiltersToggle`)?.addEventListener(`click`,()=>{Qe=!Qe,En(),Q()}),v(`#applyRegisterFilters`)?.addEventListener(`click`,()=>{let e=Fn($e);N={...$e,page:1},En(),Q(),$(`${e} matching record${e===1?``:`s`}`,{title:`Filters Applied`,type:`info`})}),v(`#resetRegisterView`)?.addEventListener(`click`,()=>{On(),Q(),$(`Register preferences and filters reset.`,{title:`Register Reset`,type:`info`})}),y(`[data-status-chip]`).forEach(e=>e.addEventListener(`click`,()=>{N.status=e.dataset.statusChip,N.page=1,En(),Q()})),v(`#filterToggleBtn`)?.addEventListener(`click`,()=>{Je=!Je,Q()}),v(`#regPagePrev`)?.addEventListener(`click`,()=>{N.page>1&&(--N.page,Q())}),v(`#regPageNext`)?.addEventListener(`click`,()=>{N.page+=1,Q()}),jn(),v(`#clearRegisterFilters`)?.addEventListener(`click`,()=>{Nn(),En(),Q()}),v(`#emptyClearFilters`)?.addEventListener(`click`,()=>{Nn(),En(),Q()}),y(`[data-clear-filter]`).forEach(e=>e.addEventListener(`click`,()=>{let t=e.dataset.clearFilter;N[t]=t===`q`||t===`dateFrom`||t===`dateTo`?``:`all`,N.page=1,En(),Q()})),v(`#registerViewToggle`)?.addEventListener(`click`,e=>{let t=e.currentTarget;t.classList.contains(`is-switching`)||(t.classList.add(`is-switching`),window.setTimeout(()=>{Ye=!Ye,Xe.clear(),En(),Q()},180))}),y(`.mobile-register-summary`).forEach(e=>e.addEventListener(`click`,t=>{t.target.closest(`button,a`)||e.querySelector(`[data-mobile-register-view]`)?.click()})),y(`[data-mobile-register-view]`).forEach(e=>e.addEventListener(`click`,()=>{let t=e.closest(`tr`)||document.querySelector(`tr[data-register-id="${CSS.escape(e.dataset.registerId||``)}"]`);if(!t||e.classList.contains(`is-loading`))return;let n=!t.classList.contains(`mobile-expanded`);e.classList.add(`is-loading`),e.disabled=!0,e.setAttribute(`aria-busy`,`true`),window.setTimeout(()=>{let r=String(t.dataset.registerId||``);r&&(window.matchMedia(`(max-width:768px)`).matches&&n&&(Xe.clear(),y(`table.reg tr.mobile-expanded`).forEach(e=>{e!==t&&e.classList.remove(`mobile-expanded`)})),n===Ye?Xe.delete(r):Xe.add(r),En()),t.classList.toggle(`mobile-expanded`,n),e.classList.remove(`is-loading`),e.disabled=!1,e.removeAttribute(`aria-busy`),e.setAttribute(`aria-expanded`,String(n)),e.setAttribute(`aria-label`,n?`Hide full register details`:`View full register details`),e.title=n?`Hide details`:`View full details`,n&&window.setTimeout(()=>t.scrollIntoView({behavior:`smooth`,block:`nearest`}),180)},280)})),y(`[data-return-history]`).forEach(e=>e.addEventListener(`click`,async()=>{let t=w.find(t=>t.id===e.dataset.returnHistory),n=t?.returnHistory?(Array.isArray(t.returnHistory)?t.returnHistory.slice():Object.values(t.returnHistory)).sort((e,t)=>(t.createdAt||0)-(e.createdAt||0)):[];if(!n.length){await O(`No return history is available.`,{title:`Return History`,type:`info`});return}await O(n.map((e,t)=>{let n=[`${t+1}. ${e.createdAt?Tn(e.createdAt):e.returnDate||`No date`} — Qty ${e.qtyReturnedNow||0}`,`Condition: ${e.conditionOnReturn||`—`}`,`Received by: ${e.receivedByName||e.receivedBy||`—`}`,`Photos: ${Pe(e.returnPhotoUrls||e.returnPhotoUrl).length}`];return e.remarks&&n.push(`Remarks: ${e.remarks}`),n.join(`
`)}).join(`

`),{title:`Return History · ${n.length}`,type:`info`})})),y(`[data-return]`).forEach(e=>e.addEventListener(`click`,()=>{st=e.dataset.return,L=``,Y(`return-record`)})),y(`[data-delete-issue]`).forEach(e=>e.addEventListener(`click`,async()=>{await k(`Delete this register entry permanently? This action cannot be undone.`,{title:`Delete register entry`,type:`danger`,confirmText:`Delete`})&&or(e.dataset.deleteIssue)})),y(`[data-edit-return]`).forEach(e=>e.addEventListener(`click`,()=>{ct=e.dataset.editReturn,R=``,Y(`edit-return`)})),y(`[data-edit-issue]`).forEach(e=>e.addEventListener(`click`,()=>{ot=e.dataset.editIssue,I=``,Y(`edit-issue`)}))),e===`profile`){Jt(),v(`#p_photo`).addEventListener(`change`,async e=>{let t=e.target.files&&e.target.files[0];if(!t){dt=null;return}if(!t.type.startsWith(`image/`)){O(`Please choose an image file.`,{title:`Invalid File`,type:`danger`}),e.target.value=``;return}let n=new FileReader;n.onload=()=>{v(`#p_avatarPreview`).src=n.result},n.readAsDataURL(t),dt=await We(t,400,.8)}),v(`#profileChoosePhotoBtn`)?.addEventListener(`click`,()=>v(`#p_photo`)?.click()),v(`#profileForm`).addEventListener(`submit`,Qn),v(`#profilePasswordForm`).addEventListener(`submit`,$n),v(`#enableNotificationsBtn`)?.addEventListener(`click`,async()=>{await fn()}),v(`#testNotificationBtn`)?.addEventListener(`click`,()=>{pn(`Store Follow-up Test`,{body:`Overdue notifications are enabled and working properly on your device!`,tag:`cmm-test-alert`}),$(`Test notification sent to device.`,{title:`Test Alert Sent`})});let e=window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0,t=v(`#profilePwaStatusArea`);t&&(e?t.innerHTML=`<span class="tag tag-returned" style="padding:7px 14px; font-size:13px; display:inline-flex; align-items:center; gap:6px; font-weight:600;">✓ App is Installed & Running Standalone</span>`:v(`#profilePwaInstallBtn`)?.addEventListener(`click`,async()=>{de()?fe():typeof window.promptPwaInstall==`function`&&window.__deferredPwaPrompt?await window.promptPwaInstall()&&($(`Thank you for installing CMM SMS Store!`,{title:`App Installed`}),Q()):$(`To install: tap your browser menu (⋮ or Share) and choose "Install App" or "Add to Home screen".`,{title:`Install Instructions`})}))}if(e===`issue-new`&&(v(`#issueForm`).addEventListener(`submit`,nr),v(`#f_photo`).addEventListener(`change`,er),v(`#f_photoClear`).addEventListener(`click`,tr),v(`#f_supervisorName`).addEventListener(`change`,e=>{let t=w.find(t=>String(t.supervisorName||``).toLowerCase()===e.target.value.trim().toLowerCase());t?.supervisorContact&&!v(`#f_supervisorContact`).value&&(v(`#f_supervisorContact`).value=t.supervisorContact)}),v(`#f_supervisorContact`).addEventListener(`change`,e=>{let t=w.find(t=>String(t.supervisorContact||``)===e.target.value.trim());t?.supervisorName&&!v(`#f_supervisorName`).value&&(v(`#f_supervisorName`).value=t.supervisorName)}),v(`#f_choosePhotoBtn`).addEventListener(`click`,()=>v(`#f_photo`).click()),v(`#f_cameraBtn`).addEventListener(`click`,()=>v(`#f_camera`).click()),v(`#f_camera`).addEventListener(`change`,e=>Ue(e.target,`issue`,`#f_photoPreview`))),e===`return-record`&&(v(`#returnForm`).addEventListener(`submit`,ir),v(`#r_choosePhotoBtn`).addEventListener(`click`,()=>v(`#r_photo`).click()),v(`#r_cameraBtn`).addEventListener(`click`,()=>v(`#r_camera`).click()),v(`#r_camera`).addEventListener(`change`,e=>Ue(e.target,`return`,`#r_photoPreview`)),v(`#r_photo`).addEventListener(`change`,async e=>{let t=Array.from(e.target.files||[]);if(!t.length){B=[],v(`#r_photoPreviewWrap`).style.display=`none`,v(`#r_photoPreview`).innerHTML=``;return}if(t.some(e=>!e.type.startsWith(`image/`))){B=[],e.target.value=``,v(`#r_photoPreviewWrap`).style.display=`none`,v(`#r_photoPreview`).innerHTML=``,await O(`Please choose image files only.`,{title:`Invalid Photo`,type:`danger`});return}t=ze(t,0),B=await Promise.all(t.map(e=>We(e))),Be(B,`#r_photoPreview`)}),v(`#r_photoClear`).addEventListener(`click`,()=>{B=[];let e=v(`#r_photo`);e&&(e.value=``),v(`#r_photoPreviewWrap`).style.display=`none`,v(`#r_photoPreview`).innerHTML=``})),e===`edit-return`&&(v(`#editReturnForm`).addEventListener(`submit`,ar),v(`#er_choosePhotoBtn`).addEventListener(`click`,()=>v(`#er_photo`).click()),v(`#er_cameraBtn`).addEventListener(`click`,()=>v(`#er_camera`).click()),v(`#er_camera`).addEventListener(`change`,e=>Ue(e.target,`edit-return`,`#er_photoPreview`)),v(`#er_photo`).addEventListener(`change`,async e=>{let t=Array.from(e.target.files||[]);if(!t.length){V=[],v(`#er_photoPreviewWrap`).style.display=`none`,v(`#er_photoPreview`).innerHTML=``;return}if(t.some(e=>!e.type.startsWith(`image/`))){V=[],e.target.value=``,v(`#er_photoPreviewWrap`).style.display=`none`,v(`#er_photoPreview`).innerHTML=``,await O(`Please choose image files only.`,{title:`Invalid Photo`,type:`danger`});return}t=ze(t,0),V=await Promise.all(t.map(e=>We(e))),Be(V,`#er_photoPreview`)}),v(`#er_photoClear`).addEventListener(`click`,()=>{V=[],v(`#er_photo`).value=``,v(`#er_photoPreviewWrap`).style.display=`none`,v(`#er_photoPreview`).innerHTML=``})),e===`edit-issue`&&(v(`#editIssueForm`).addEventListener(`submit`,rr),v(`#ei_choosePhotoBtn`).addEventListener(`click`,()=>v(`#ei_photo`).click()),v(`#ei_cameraBtn`).addEventListener(`click`,()=>v(`#ei_camera`).click()),v(`#ei_camera`).addEventListener(`change`,e=>Ue(e.target,`edit-issue`,`#ei_photoPreview`)),v(`#ei_photo`).addEventListener(`change`,async e=>{let t=Array.from(e.target.files||[]);if(t.some(e=>!e.type.startsWith(`image/`))){O(`Please choose image files only.`,{title:`Invalid File`,type:`danger`}),e.target.value=``;return}let n=w.find(e=>e.id===ot);t=ze(t,Pe(n?.photoUrls||n?.photoUrl).length),ut=await Promise.all(t.map(e=>We(e))),Be(ut,`#ei_photoPreview`)}),v(`#ei_photoClear`).addEventListener(`click`,()=>{ut=[],v(`#ei_photo`).value=``,v(`#ei_photoPreviewWrap`).style.display=`none`,v(`#ei_photoPreview`).innerHTML=``})),e===`users-admin`&&(v(`#newUserForm`).addEventListener(`submit`,wr),yr(),Cr()),e===`settings-admin`){Jt(),Xn(),v(`#refreshSyncStatusBtn`)?.addEventListener(`click`,async()=>{j(!0,`Refreshing sync status...`);try{await ye(),Xn(),$(`Sync status and storage metrics refreshed.`,{title:`Cloud Sync Updated`})}catch(e){$(`Sync refresh error: `+e.message,{type:`danger`})}finally{j(!1)}}),v(`#loadAuditLogBtn`)?.addEventListener(`click`,async e=>{let n=e.target,r=v(`#auditLogContainer`);if(r){n.disabled=!0,n.textContent=`Loading...`;try{let e=await t(o(U,`auditLog`));if(e.exists()){let t=X(e).sort((e,t)=>(t.createdAt||0)-(e.createdAt||0)).slice(0,100);r.innerHTML=t.length===0?`<div style="padding: 12px; text-align: center; color: var(--text-light); font-size: 13px;">No audit logs found.</div>`:`<table class="data-table" style="font-size: 13px; width: 100%;"><thead><tr><th>Date</th><th>Action</th><th>Actor</th><th>Details</th></tr></thead><tbody>`+t.map(e=>`<tr>
                <td style="white-space: nowrap;">${e.createdAt?new Date(e.createdAt).toLocaleString():`N/A`}</td>
                <td><strong style="color: var(--primary);">${b(e.action)}</strong></td>
                <td>${b(e.actorName||e.actorUsername)}</td>
                <td><code style="background: none; padding: 0; color: var(--text-muted);">${b(JSON.stringify(e.details||{}))}</code></td>
              </tr>`).join(``)+`</tbody></table>`}else r.innerHTML=`<div style="padding: 12px; text-align: center; color: var(--text-light); font-size: 13px;">No audit logs found.</div>`}catch(e){r.innerHTML=`<div style="padding: 12px; text-align: center; color: var(--danger); font-size: 13px;">Failed to load logs: ${b(e.message)}</div>`}finally{n.disabled=!1,n.textContent=`Load Audit Log`}}}),v(`#cleanupOldRecordsBtn`)?.addEventListener(`click`,_r),v(`#clearAllStoreDataBtn`)?.addEventListener(`click`,hr),v(`#excelDateFrom`)?.addEventListener(`change`,()=>{let e=v(`#excelDateFrom`).value;Ke=e,v(`#excelDateTo`)&&(v(`#excelDateTo`).min=e),Wn()}),v(`#excelDateTo`)?.addEventListener(`change`,()=>{let e=v(`#excelDateTo`).value;qe=e,v(`#excelDateFrom`)&&(v(`#excelDateFrom`).max=e||x()),Wn()}),v(`#downloadRegisterExcelBtn`)?.addEventListener(`click`,qn),v(`#downloadToolsExcelBtn`)?.addEventListener(`click`,Jn);let e=()=>{let e=v(`#toolsExcelCategory`)?.value||`all`,t=v(`#toolsExcelStatus`)?.value||`all`,n=T.filter(n=>!(e!==`all`&&(n.category||``).trim()!==e||t!==`all`&&(n.status||`Available`)!==t)).length,r=v(`#toolsExcelSummary`);r&&(r.innerHTML=`Matching tools to export: <strong>${n}</strong> (out of ${T.length} total)`)};v(`#toolsExcelCategory`)?.addEventListener(`change`,e),v(`#toolsExcelStatus`)?.addEventListener(`change`,e),y(`[data-excel-preset]`).forEach(e=>e.addEventListener(`click`,()=>{let t=Gn(e.dataset.excelPreset);Ke=t.from,qe=t.to,v(`#excelDateFrom`).value=t.from,v(`#excelDateTo`).value=t.to,Wn()})),y(`[data-excel-status]`).forEach(e=>e.addEventListener(`click`,()=>{Ge=e.dataset.excelStatus,y(`[data-excel-status]`).forEach(e=>e.classList.toggle(`is-active`,e.dataset.excelStatus===Ge)),Wn()})),v(`#retryExcelModuleBtn`)?.addEventListener(`click`,()=>{let e=v(`#retryExcelModuleBtn`);e&&(e.disabled=!0,e.innerHTML=`<span class="spinner"></span> Retrying…`),document.querySelector(`script[data-excel-retry]`)?.remove();let t=document.createElement(`script`);t.src=`https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js`,t.dataset.excelRetry=`true`,t.onload=()=>{Kn(),$(`Excel module is ready.`,{title:`Export Restored`})},t.onerror=()=>{e&&(e.disabled=!1,e.textContent=`Retry Excel Module`),Kn(),$(`Excel module is still unavailable. Check the network and retry.`,{title:`Export Unavailable`,type:`danger`})},document.head.appendChild(t)}),y(`[data-settings-section]`).forEach(e=>e.addEventListener(`click`,()=>{let t=e.dataset.settingsSection,n=v(`[data-settings-body="${t}"]`),r=e.getAttribute(`aria-expanded`)===`true`;e.setAttribute(`aria-expanded`,String(!r)),n?.classList.toggle(`is-collapsed`,r)})),Kn(),Wn(),e()}if(e===`tools-dashboard`){let e=C.roles.includes(`admin`),t=e||C.roles.includes(`tools_admin`),n=v(`#appMain`),r=n.querySelector(`#toolsSearchInput`),i=n.querySelector(`#toolsSearchClear`),a=n.querySelector(`#toolsStatusFilter`),c=n.querySelector(`#toolsCategoryFilter`);if(r){let e;r.addEventListener(`input`,t=>{let n=t.target.selectionStart;clearTimeout(e),e=setTimeout(()=>{window.toolsSearchQuery=t.target.value,Q();let e=v(`#toolsSearchInput`);e&&(e.focus(),typeof n==`number`&&e.setSelectionRange(n,n))},180)})}i&&i.addEventListener(`click`,()=>{window.toolsSearchQuery=``,Q();let e=v(`#toolsSearchInput`);e&&e.focus()}),a&&a.addEventListener(`change`,e=>{window.toolsStatusFilter=e.target.value,Q()}),c&&c.addEventListener(`change`,e=>{window.toolsCategoryFilter=e.target.value,Q()}),n.querySelectorAll(`#toolsClearFiltersBtn, #toolsClearFiltersBtnMobile`).forEach(e=>{e.addEventListener(`click`,()=>{window.toolsSearchQuery=``,window.toolsStatusFilter=`all`,window.toolsCategoryFilter=`all`,Q()})}),n.querySelectorAll(`[data-update-status], [data-tool-history]`).forEach(e=>{e.addEventListener(`click`,()=>{S(10),sr(e.dataset.updateStatus||e.dataset.toolHistory)})}),n.querySelectorAll(`[data-request-delete-tool]`).forEach(e=>{e.addEventListener(`click`,()=>{S(12);let t=e.dataset.requestDeleteTool;lr(t)})}),e&&(n.querySelectorAll(`[data-approve-tool-deletion]`).forEach(e=>{e.addEventListener(`click`,()=>{S(14),pr(e.dataset.approveToolDeletion)})}),n.querySelectorAll(`[data-reject-tool-deletion]`).forEach(e=>{e.addEventListener(`click`,()=>{S(10),mr(e.dataset.rejectToolDeletion)})})),t&&n.querySelectorAll(`[data-edit-tool]`).forEach(e=>{e.addEventListener(`click`,()=>{S(10),window.currentEditToolId=e.dataset.editTool,Y(`edit-tool`)})}),e&&n.querySelectorAll(`[data-delete-tool]`).forEach(e=>{e.addEventListener(`click`,async()=>{S(18);let t=e.dataset.deleteTool,n=T.find(e=>e.id===t);if(await k(`Are you sure you want to permanently delete tool "${n?.toolName||t}" from the master register?`,{title:`Delete Tool`,type:`danger`,confirmText:`Delete`}))try{j(!0,`Deleting tool...`),await s(o(U,`tools/`+t)),await s(o(U,`toolDeletionRequests/`+t)).catch(()=>{}),await Z(`tool-deleted`,t,{toolName:n?.toolName,uniqueId:n?.uniqueId}),$(`Tool deleted successfully.`,{title:`Tool Deleted`})}catch(e){O(`Could not delete tool: `+e.message,{type:`danger`})}finally{j(!1)}})})}}async function Qn(e){if(e.preventDefault(),!dt){$(`No new photo selected.`,{title:`Photo Required`,type:`warning`});return}let t=v(`#profileSubmitBtn`);t.disabled=!0,t.innerHTML=`<span class="spinner"></span> Saving...`,j(!0,`Uploading profile photo...`);try{let e=(dt.name.split(`.`).pop()||`jpg`).slice(0,8),n=`profile-photos/${C.username}.${e}`,r=await Ae(n,dt,t);await u(o(U,`users/`+C.username),{profilePhotoUrl:r,profilePhotoPath:n}),C.profilePhotoUrl=r,zt(C),v(`#topbarAvatar`).src=r,v(`#topbarAvatar`).classList.remove(`hidden`),$(`Profile photo updated successfully.`,{title:`Profile Updated`}),dt=null,P=!1,Q()}catch(e){O(`Could not upload photo: `+(e.message||`unknown error`),{title:`Upload Failed`,type:`danger`})}finally{t&&(t.disabled=!1,t.textContent=`Save Profile Photo`),j(!1)}}async function $n(e){e.preventDefault(),H=``,Zt(`profilePasswordAlert`);let n=v(`#p_currentPassword`).value,r=v(`#p_newPassword`).value,i=v(`#p_confirmPassword`).value;if(!n||!r||!i){H=`Please fill in your current password and the new password twice.`,J(`profilePasswordAlert`,H);return}if(r.length<4){H=`New password must be at least 4 characters.`,J(`profilePasswordAlert`,H);return}if(r!==i){H=`New password and confirmation do not match.`,J(`profilePasswordAlert`,H);return}if(r===n){H=`New password must be different from your current password.`,J(`profilePasswordAlert`,H);return}let a=v(`#profilePasswordSubmitBtn`);a.disabled=!0,a.innerHTML=`<span class="spinner"></span> Updating...`,j(!0,`Updating password...`);try{let e=await ee(n),i=await ee(r),a=await t(o(U,`users/`+C.username));if(!a.exists()){H=`User record not found.`,J(`profilePasswordAlert`,H);return}let s=a.val(),c=s.password===e,u=String(s.password).trim()===String(n).trim();if(!c&&!u){H=`Current password is incorrect.`,J(`profilePasswordAlert`,H);return}await l(o(U,`users/`+C.username+`/password`),i),v(`#profilePasswordAlert`).className=`alert alert-info`,await Z(`profile-password-changed`,null,{}),v(`#profilePasswordForm`).reset(),$(`Your password has been updated.`,{title:`Password Updated`})}catch(e){H=rn(e,`update your password`),J(`profilePasswordAlert`,H)}finally{a.disabled=!1,a.textContent=`Update Password`,j(!1)}}async function er(e){let t=Array.from(e.target.files||[]);if(!t.length){tr();return}if(t.some(e=>!e.type.startsWith(`image/`))){O(`Please choose image files only.`,{title:`Invalid File`,type:`danger`}),e.target.value=``;return}t=ze(t,0),lt=await Promise.all(t.map(e=>We(e))),Be(lt,`#f_photoPreview`)}function tr(){lt=[];let e=v(`#f_photo`);e&&(e.value=``);let t=v(`#f_photoPreviewWrap`);t&&(t.style.display=`none`);let n=v(`#f_photoPreview`);n&&(n.innerHTML=``)}async function nr(e){e.preventDefault(),F=``,Zt(`issueFormAlert`);let t=v(`#f_material`).value.trim(),n=parseInt(v(`#f_qty`).value,10),r=v(`#f_vendor`).value.trim(),i=v(`#f_area`).value.trim(),s=x(),u=v(`#f_supervisorName`).value.trim(),d=v(`#f_supervisorContact`).value.trim(),f=v(`#f_empCode`).value.trim(),p=v(`#f_remarks`).value.trim();if(!t||!n||n<=0||!r||!i||!u||!d){F=`Please fill in material, quantity, vendor, area, supervisor name, and supervisor contact number.`,J(`issueFormAlert`,F);return}if(!/^\d{10}$/.test(d)){F=`Supervisor contact number must be exactly 10 digits.`,J(`issueFormAlert`,F);return}let m=lt.slice(0,Ne),h=v(`#issueSubmitBtn`);h.disabled=!0,h.innerHTML=`<span class="spinner"></span> Saving…`,j(!0,`Saving record...`);let g=[];try{let e=a(o(U,`issues`)),_=[],v=!1;if(m.length&&W)try{let t=await Me(`issue-photos`,e.key,m,h);_=t.urls,g=t.paths}catch(e){v=!0,console.warn(`Issue photo upload failed:`,e)}try{await l(e,{materialName:t,qtyIssued:n,vendor:r,area:i,empCode:f||null,issueDate:s,supervisorName:u,supervisorContact:d,returnDate:null,qtyReturned:0,conditionOnReturn:null,issuedBy:C.username,issuedByName:C.fullName,receivedBy:null,receivedByName:null,remarks:p||null,photoUrls:_,photoPaths:g,createdAt:c(),updatedAt:c()})}catch(e){throw await je(g),g=[],e}await Z(`issue-created`,e.key,{materialName:t,qtyIssued:n,vendor:r,area:i}),tr(),$(`Issue recorded for ${t} — quantity ${n}.${v?` The issue was saved, but one or more selected photos could not be uploaded.`:``}`,{title:`Issue Submitted`}),P=!1,Y(`register`)}catch(e){F=rn(e,`save the issue record`),J(`issueFormAlert`,F),await O(F,{title:`Issue Not Saved`,type:`danger`}),h.disabled=!1,h.textContent=`Save Issue Record`}finally{j(!1)}}async function rr(e){e.preventDefault(),I=``,Zt(`editIssueFormAlert`);let t=w.find(e=>e.id===ot);if(!t)return;let n=v(`#ei_material`).value.trim(),r=parseInt(v(`#ei_qty`).value,10),i=v(`#ei_vendor`).value.trim(),a=v(`#ei_area`).value.trim(),s=v(`#ei_supervisorName`).value.trim(),l=v(`#ei_supervisorContact`).value.trim(),d=v(`#ei_empCode`).value.trim(),f=v(`#ei_remarks`).value.trim();if(!n||isNaN(r)||r<(t.qtyReturned||0)||!i||!a||!s||!l){I=`Please fill all required fields. Quantity issued cannot be less than quantity already returned (${t.qtyReturned||0}).`,J(`editIssueFormAlert`,I);return}if(!/^\d{10}$/.test(l)){I=`Supervisor contact number must be exactly 10 digits.`,J(`editIssueFormAlert`,I);return}let p=v(`#editIssueSubmitBtn`);p&&(p.disabled=!0,p.innerHTML=`<span class="spinner"></span> Saving…`),j(!0,`Updating record...`);let m=[];try{let e={materialName:n,qtyIssued:r,vendor:i,area:a,supervisorName:s,supervisorContact:l,empCode:d||null,remarks:f||null,updatedAt:c()},h=ut.slice(0,Math.max(0,Ne-Pe(t.photoUrls||t.photoUrl).length)),g=``;if(h.length)try{if(!W)throw Error(`Cloud photo storage is unavailable.`);let n=await Me(`issue-photos`,t.id,h,p);e.photoUrls=[...t.photoUrls||(t.photoUrl?[t.photoUrl]:[]),...n.urls],e.photoPaths=[...t.photoPaths||(t.photoPath?[t.photoPath]:[]),...n.paths],m=n.paths}catch(e){g=` The changes were saved, but new photos could not be uploaded.`,console.warn(`Edit issue photo upload failed:`,e)}try{await u(o(U,`issues/`+t.id),e)}catch(e){throw await je(m),m=[],e}await Z(`issue-edited`,t.id,{materialName:n,qtyIssued:r,vendor:i,area:a}),ut=[],await O(`Issue record updated successfully for ${n}.${g}`,{title:`Issue Updated`,type:`success`}),P=!1,Y(`register`)}catch(e){I=rn(e,`update the issue record`),J(`editIssueFormAlert`,I),await O(I,{title:`Issue Update Failed`,type:`danger`}),p&&(p.disabled=!1,p.textContent=`Save Changes`)}finally{j(!1)}}async function ir(e){e.preventDefault(),L=``,Zt(`returnFormAlert`);let t=w.find(e=>e.id===st);if(!t)return;let n=t.qtyReturned||0,i=t.qtyIssued-n,s=parseInt(v(`#r_qty`).value,10),l=v(`#r_date`).value,d=v(`#r_condition`).value,f=v(`#r_remarks`).value.trim();if(!l||isNaN(s)||s<=0||s>i){L=`Please enter a valid return date and quantity (max ${i} remaining).`,J(`returnFormAlert`,L);return}if(l>x()||t.issueDate&&l<t.issueDate){L=`Return date must be between ${t.issueDate} and today.`,J(`returnFormAlert`,L);return}let p=document.querySelector(`#returnForm button[type="submit"]`);p&&(p.disabled=!0,p.innerHTML=`<span class="spinner"></span> Saving…`);let m=Pe(t.returnPhotoUrls||t.returnPhotoUrl),h=Pe(t.returnPhotoPaths||t.returnPhotoPath),g=B.slice(0,Ne);j(!0,`Recording return...`);let _=[];try{let e=[];if(g.length){if(!W)throw Error(`Cloud photo storage is unavailable. The return was not submitted; selected photos are still available to retry.`);let n=await Me(`return-photos`,t.id,g,p);if(e=n.urls,_=n.paths,e.length!==g.length)throw Error(`Not all selected return photos were uploaded. The return was not submitted.`)}let n=a(o(U,`issues/${t.id}/returnHistory`)).key,i=`issues/${t.id}`,v={[`${i}/returnDate`]:l,[`${i}/qtyReturned`]:r(s),[`${i}/conditionOnReturn`]:d,[`${i}/receivedBy`]:C.username,[`${i}/receivedByName`]:C.fullName,[`${i}/remarks`]:f||t.remarks||null,[`${i}/updatedAt`]:c(),[`${i}/returnedAt`]:c(),[`${i}/returnHistory/${n}`]:{qtyReturnedNow:s,returnDate:l,conditionOnReturn:d,receivedBy:C.username,receivedByName:C.fullName,remarks:f||null,returnPhotoUrls:e,returnPhotoPaths:_,photoCount:e.length,createdAt:c()}};e.length&&(v[`${i}/returnPhotoUrls`]=[...m,...e],v[`${i}/returnPhotoPaths`]=[...h,..._]);try{await u(o(U),v)}catch(e){throw await je(_),_=[],e}await Z(`return-recorded`,t.id,{qtyReturnedNow:s,returnDate:l,condition:d}),B=[];let y=e.length?` ${e.length} return photo${e.length===1?``:`s`} uploaded.`:``;$(`Return recorded for ${t.materialName} — quantity ${s}.${y}`,{title:`Return Submitted`}),P=!1,Y(`register`)}catch(e){L=rn(e,`save the return record`),J(`returnFormAlert`,L),await O(L,{title:`Return Not Saved`,type:`danger`}),p&&(p.disabled=!1,p.textContent=`Save Return`)}finally{j(!1)}}async function ar(e){e.preventDefault(),R=``,Zt(`editReturnFormAlert`);let t=w.find(e=>e.id===ct);if(!t)return;let n=parseInt(v(`#er_qty`).value,10),r=v(`#er_date`).value,i=v(`#er_condition`).value,a=v(`#er_remarks`).value.trim();if(!r||isNaN(n)||n<0||n>t.qtyIssued){R=`Please enter a valid return date and quantity (0–${t.qtyIssued}).`,J(`editReturnFormAlert`,R);return}if(n>0&&(r>x()||t.issueDate&&r<t.issueDate)){R=`Return date must be between ${t.issueDate} and today.`,J(`editReturnFormAlert`,R);return}let s=v(`#editReturnSubmitBtn`);s&&(s.disabled=!0,s.innerHTML=`<span class="spinner"></span> Saving…`),j(!0,`Updating return...`);let l=[];try{let e=t.returnPhotoPaths||(t.returnPhotoPath?[t.returnPhotoPath]:[]),f=n===0?{returnDate:null,qtyReturned:0,conditionOnReturn:null,receivedBy:null,receivedByName:null,returnedAt:null,returnPhotoUrls:null,returnPhotoPaths:null,returnPhotoUrl:null,returnPhotoPath:null,returnHistory:null,updatedAt:c()}:{returnDate:r,qtyReturned:n,conditionOnReturn:i,remarks:a||t.remarks||null,updatedAt:c()},p=V.slice(0,Ne),h=[];if(n>0&&p.length){if(!W)throw Error(`Cloud photo storage is unavailable. The return changes were not saved; selected photos are still available to retry.`);let n=await Me(`return-photos`,t.id,p,s);if(n.urls.length!==p.length)throw Error(`Not all selected return photos were uploaded. The return changes were not saved.`);h=n.urls,l=n.paths,f.returnPhotoUrls=[...Pe(t.returnPhotoUrls||t.returnPhotoUrl),...n.urls],f.returnPhotoPaths=[...e,...n.paths]}try{await u(o(U,`issues/`+t.id),f)}catch(e){throw await je(l),l=[],e}if(n===0&&W)for(let t of e)try{await d(m(W,t))}catch{}await Z(`return-edited`,t.id,{previousQtyReturned:t.qtyReturned||0,newQtyReturned:n,returnDate:n===0?null:r}),V=[];let g=h.length?` ${h.length} return photo${h.length===1?``:`s`} uploaded.`:``;await O(`Return record updated successfully for ${t.materialName}.${g}`,{title:`Return Updated`,type:`success`}),P=!1,Y(`register`)}catch(e){R=rn(e,`update the return record`),J(`editReturnFormAlert`,R),await O(R,{title:`Return Update Failed`,type:`danger`}),s&&(s.disabled=!1,s.textContent=`Save Changes`)}finally{j(!1)}}async function or(e){j(!0,`Deleting record...`);try{let t=w.find(t=>t.id===e);if(!t)return;if(await Z(`issue-deleted`,e,{materialName:t.materialName,qtyIssued:t.qtyIssued}),await s(o(U,`issues/`+e)),W&&t){for(let e of t.photoPaths||(t.photoPath?[t.photoPath]:[]))try{await d(m(W,e))}catch{}for(let e of t.returnPhotoPaths||(t.returnPhotoPath?[t.returnPhotoPath]:[]))try{await d(m(W,e))}catch{}}}catch(e){O(`Could not delete this record: `+(e.message||`unknown error`),{title:`Delete Failed`,type:`danger`})}finally{j(!1)}}document.addEventListener(`click`,e=>{let t=e.target.closest?.(`[data-photo-gallery]`);t&&(e.preventDefault(),Le(t.dataset.photoGallery))}),v(`#photoGalleryCloseBtn`)?.addEventListener(`click`,()=>{S(10),Re()}),v(`#photoGalleryPrev`)?.addEventListener(`click`,()=>{M.length&&(S(12),et=(et-1+M.length)%M.length,Ie())}),v(`#photoGalleryNext`)?.addEventListener(`click`,()=>{M.length&&(S(12),et=(et+1)%M.length,Ie())}),v(`#photoGalleryDialog`)?.addEventListener(`click`,e=>{e.target.id===`photoGalleryDialog`&&Re()}),document.addEventListener(`keydown`,e=>{v(`#photoGalleryDialog`)?.classList.contains(`hidden`)||(e.key===`Escape`&&Re(),e.key===`ArrowLeft`&&v(`#photoGalleryPrev`)?.click(),e.key===`ArrowRight`&&v(`#photoGalleryNext`)?.click())}),(function(){let e=0,t=0,n=document.querySelector(`.photo-gallery-stage`);n&&(n.addEventListener(`touchstart`,n=>{n.touches&&n.touches.length===1&&(e=n.touches[0].clientX,t=n.touches[0].clientY)},{passive:!0}),n.addEventListener(`touchend`,n=>{if(!e||!n.changedTouches||!n.changedTouches.length)return;let r=n.changedTouches[0].clientX-e,i=n.changedTouches[0].clientY-t;Math.abs(r)>Math.abs(i)&&Math.abs(r)>=40&&(S(12),r<0?v(`#photoGalleryNext`).click():v(`#photoGalleryPrev`).click()),e=0,t=0},{passive:!0}))})();function sr(e){let t=T.find(t=>t.id===e);if(!t)return;let n=v(`#statusModalToolId`);n&&(n.value=e);let r=v(`#toolStatusTitle`);r&&(r.textContent=`Status: ${t.toolName}`);let i=v(`#toolStatusSubtitle`);i&&(i.innerHTML=`ID: <span class="mono">${b(t.uniqueId||`—`)}</span> &bull; Location: ${b(t.location||`—`)} &bull; Qty: ${b(t.quantity??0)}`);let a=v(`#statusModalNewStatus`);a&&(a.value=t.status||`Available`);let o=v(`#statusModalNotes`);o&&(o.value=``);let s=v(`#toolStatusHistoryTimeline`);if(s){let e=Array.isArray(t.statusHistory)?[...t.statusHistory]:[];!e.length&&t.status&&e.push({status:t.status,previousStatus:null,changedBy:t.createdBy||`Initial System Record`,changedByUsername:t.createdBy||`system`,timestamp:t.createdAt||Date.now(),dateStr:t.createdAt?new Date(t.createdAt).toLocaleString():new Date().toLocaleString(),notes:t.notes||`Initial registration`}),e.sort((e,t)=>(t.timestamp||0)-(e.timestamp||0)),s.innerHTML=e.length?e.map(e=>{let t=`good`;return e.status===`Lost`||e.status===`Damaged`?t=`bad`:e.status===`In Maintenance`&&(t=`warn`),`
          <div class="tool-timeline-item">
            <span class="tool-timeline-dot"></span>
            <div class="tool-timeline-top">
              <span class="badge ${t}">${b(e.status||`Available`)}</span>
              <div class="tool-timeline-meta">
                <span>${b(e.changedBy||e.changedByUsername||`User`)}</span>
                &bull;
                <span class="mono">${b(e.dateStr||(e.timestamp?new Date(e.timestamp).toLocaleString():`—`))}</span>
              </div>
            </div>
            ${e.previousStatus&&e.previousStatus!==e.status?`<div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">Changed from: <em>${b(e.previousStatus)}</em></div>`:``}
            ${e.notes?`<div class="tool-timeline-note">${b(e.notes)}</div>`:``}
          </div>
        `}).join(``):`<div class="empty-state" style="padding:16px 0;"><p style="margin:0; font-size:12.5px; color:var(--text-muted);">No status updates recorded yet.</p></div>`}v(`#toolStatusDialog`)?.classList.remove(`hidden`),document.body.classList.add(`modal-open`)}function cr(){v(`#toolStatusDialog`)?.classList.add(`hidden`),document.body.classList.remove(`modal-open`)}function lr(e){let t=T.find(t=>t.id===e);if(!t)return;let n=v(`#deletionReqToolId`);n&&(n.value=e);let r=v(`#deletionReqToolInfo`);r&&(r.innerHTML=`
      <strong>${b(t.toolName)}</strong> <span class="mono">(${b(t.uniqueId||`—`)})</span><br/>
      <span style="color:var(--text-muted); font-size:12.5px;">Category: ${b(t.category||`General`)} &bull; Location: ${b(t.location||`—`)} &bull; Qty: ${b(t.quantity??0)} &bull; Status: ${b(t.status||`Available`)}</span>
    `);let i=v(`#deletionReqReason`);i&&(i.value=``),v(`#toolDeletionRequestDialog`)?.classList.remove(`hidden`),document.body.classList.add(`modal-open`)}function ur(){v(`#toolDeletionRequestDialog`)?.classList.add(`hidden`),document.body.classList.remove(`modal-open`)}async function dr(e){e.preventDefault();let t=v(`#statusModalToolId`)?.value,n=T.find(e=>e.id===t);if(!n){await O(`Tool record not found.`,{type:`danger`});return}let r=v(`#statusModalNewStatus`)?.value||`Available`,i=(v(`#statusModalNotes`)?.value||``).trim(),a=v(`#statusModalSaveBtn`);a&&(a.disabled=!0,a.textContent=`Saving...`);try{j(!0,`Updating tool status...`);let e=Date.now(),a=new Date().toLocaleString(),s={status:r,previousStatus:n.status||`Available`,changedBy:C.fullName||C.username,changedByUsername:C.username,timestamp:e,dateStr:a,notes:i},l=[...Array.isArray(n.statusHistory)?[...n.statusHistory]:n.status?[{status:n.status,previousStatus:null,changedBy:n.createdBy||`Initial System Record`,changedByUsername:n.createdBy||`system`,timestamp:n.createdAt||e,dateStr:n.createdAt?new Date(n.createdAt).toLocaleString():a,notes:n.notes||`Initial registration`}]:[],s];await u(o(U,`tools/`+t),{status:r,statusHistory:l,updatedAt:c(),updatedBy:C.username,lastStatusNote:i}),await Z(`tool-status-updated`,t,{toolName:n.toolName,uniqueId:n.uniqueId,fromStatus:n.status||`Available`,toStatus:r,notes:i}),$(`Tool status updated to "${r}"`,{title:`Status Updated`}),cr()}catch(e){await O(`Could not update tool status: `+e.message,{type:`danger`})}finally{a&&(a.disabled=!1,a.textContent=`Save Status Update`),j(!1)}}async function fr(e){e.preventDefault();let t=v(`#deletionReqToolId`)?.value,n=(v(`#deletionReqReason`)?.value||``).trim();if(!n){await O(`Please provide a reason for the deletion request.`,{type:`warn`});return}let r=T.find(e=>e.id===t);if(!r){await O(`Tool record not found.`,{type:`danger`});return}let i=v(`#deletionReqSubmitBtn`);i&&(i.disabled=!0,i.textContent=`Submitting...`);try{j(!0,`Submitting deletion request...`),await l(o(U,`toolDeletionRequests/`+t),{toolId:t,toolName:r.toolName,uniqueId:r.uniqueId||``,category:r.category||``,quantity:r.quantity??0,status:r.status||`Available`,reason:n,requestedBy:C.username,requestedByName:C.fullName||C.username,requestedAt:Date.now()}),await Z(`tool-deletion-requested`,t,{toolName:r.toolName,uniqueId:r.uniqueId,reason:n}),$(`Deletion request submitted to Administrator`,{title:`Request Sent`}),ur()}catch(e){await O(`Could not submit deletion request: `+e.message,{type:`danger`})}finally{i&&(i.disabled=!1,i.textContent=`Submit Deletion Request`),j(!1)}}async function pr(e){if(!C?.roles.includes(`admin`)){await O(`Only administrators can approve tool deletions.`,{type:`danger`});return}let t=E.find(t=>(t.id||t.toolId)===e),n=t?.toolId||e,r=t?.toolName||`this tool`;if(await k(`Permanently delete tool "${r}" per the deletion request? This will remove the tool from the Master Register.`,{title:`Approve & Delete Tool`,type:`danger`,confirmText:`Approve & Delete`}))try{j(!0,`Deleting tool...`),await s(o(U,`tools/`+n)),await s(o(U,`toolDeletionRequests/`+(t?.id||n))),await Z(`tool-deletion-approved`,n,{toolName:r,uniqueId:t?.uniqueId||``,reason:t?.reason||``,requestedBy:t?.requestedBy||``,approvedBy:C.username}),$(`Tool "${r}" deleted successfully.`,{title:`Tool Deleted`})}catch(e){await O(`Could not delete tool: `+e.message,{type:`danger`})}finally{j(!1)}}async function mr(e){if(!C?.roles.includes(`admin`)){await O(`Only administrators can reject deletion requests.`,{type:`danger`});return}let t=E.find(t=>(t.id||t.toolId)===e),n=t?.toolName||`tool`;if(await k(`Reject the deletion request for "${n}"? The tool will remain in the master register.`,{title:`Reject Deletion Request`,type:`warn`,confirmText:`Reject Request`}))try{j(!0,`Rejecting request...`),await s(o(U,`toolDeletionRequests/`+(t?.id||e))),await Z(`tool-deletion-rejected`,e,{toolName:n,requestedBy:t?.requestedBy||``,rejectedBy:C.username}),$(`Deletion request rejected.`,{title:`Request Rejected`})}catch(e){await O(`Could not reject request: `+e.message,{type:`danger`})}finally{j(!1)}}v(`#toolStatusCloseBtn`)?.addEventListener(`click`,cr),v(`#statusModalCancelBtn`)?.addEventListener(`click`,cr),v(`#toolStatusForm`)?.addEventListener(`submit`,dr),v(`#toolStatusDialog`)?.addEventListener(`click`,e=>{e.target.id===`toolStatusDialog`&&cr()}),v(`#toolDeletionRequestCloseBtn`)?.addEventListener(`click`,ur),v(`#deletionReqCancelBtn`)?.addEventListener(`click`,ur),v(`#toolDeletionRequestForm`)?.addEventListener(`submit`,fr),v(`#toolDeletionRequestDialog`)?.addEventListener(`click`,e=>{e.target.id===`toolDeletionRequestDialog`&&ur()}),v(`#topbarOverdueBtn`)?.addEventListener(`click`,vn),v(`#overdueFollowUpCloseBtn`)?.addEventListener(`click`,yn),v(`#overdueModalDoneBtn`)?.addEventListener(`click`,yn),v(`#overdueFollowUpDialog`)?.addEventListener(`click`,e=>{e.target.id===`overdueFollowUpDialog`&&yn()}),v(`#overdueViewAllRegisterBtn`)?.addEventListener(`click`,()=>{yn(),N.q=``,N.status=`Issued`,N.page=1,En(),Y(`register`)});function hr(){let e=v(`#clearDataPassword`),t=v(`#clearDataPasswordError`);e&&(e.value=``),t&&(t.textContent=``,t.classList.add(`hidden`)),v(`#clearDataDialog`)?.classList.remove(`hidden`),document.body.classList.add(`modal-open`),setTimeout(()=>e?.focus(),50)}function gr(){v(`#clearDataDialog`)?.classList.add(`hidden`),document.body.classList.remove(`modal-open`)}v(`#clearDataCancelBtn`)?.addEventListener(`click`,gr),v(`#clearDataDialog`)?.addEventListener(`click`,e=>{e.target.id===`clearDataDialog`&&gr()}),v(`#clearDataVerifyBtn`)?.addEventListener(`click`,async()=>{let e=v(`#clearDataPassword`)?.value||``,t=v(`#clearDataPasswordError`);if(e!==St){t&&(t.textContent=`Incorrect cleanup password. Verification failed.`,t.classList.remove(`hidden`));return}if(gr(),await k(`DANGER: Are you sure you want to permanently clear all Material Issue Register records, return logs, uploaded photos, pending access requests, and audit history?

Staff accounts and Tool Master Catalog records will NOT be deleted.`,{title:`Permanently Erase Store Records`,type:`danger`,confirmText:`Yes, Erase Everything`,cancelText:`Cancel`})){j(!0,`Clearing all store data...`);try{if(W)for(let e of w){for(let t of e.photoPaths||(e.photoPath?[e.photoPath]:[]))try{await d(m(W,t))}catch{}for(let t of e.returnPhotoPaths||(e.returnPhotoPath?[e.returnPhotoPath]:[]))try{await d(m(W,t))}catch{}}await s(o(U,`issues`)),await s(o(U,`accessRequests`)),await s(o(U,`auditLog`)),await Z(`store-data-cleared`,null,{clearedBy:C.username,timestamp:Date.now()}),w=[],$(`All material issue records and store data have been cleared.`,{title:`Store Data Cleared`}),Q()}catch(e){O(`Error clearing store data: `+e.message,{type:`danger`})}finally{j(!1)}}}),`serviceWorker`in navigator&&navigator.serviceWorker.addEventListener(`message`,e=>{e.data&&(e.data.action===`open-overdue`||e.data.filter===`overdue`||e.data.action===`open-register`)&&(e.data.action===`open-overdue`||e.data.filter===`overdue`?vn():Y(`register`))}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&(v(`#toolStatusDialog`)?.classList.contains(`hidden`)||cr(),v(`#toolDeletionRequestDialog`)?.classList.contains(`hidden`)||ur(),v(`#overdueFollowUpDialog`)?.classList.contains(`hidden`)||yn(),v(`#clearDataDialog`)?.classList.contains(`hidden`)||gr())});async function _r(){let e=new Date;e.setMonth(e.getMonth()-6);let t=w.filter(t=>{if(sn(t)!==`Returned`)return!1;let n=t.returnedAt?new Date(t.returnedAt):t.returnDate?new Date(t.returnDate+`T23:59:59`):null;return n&&!Number.isNaN(n.getTime())&&n<e});if(t.length===0){O(`Your database is already clean! No completed records older than 6 months were found.`,{title:`Database Clean`,type:`info`});return}if(!await k(`Are you sure you want to permanently delete ${t.length} old returned record(s)?\n\nThis will also delete their attached photos to free up storage space. This action cannot be undone.`,{title:`Delete old returned records`,type:`danger`,confirmText:`Delete records`}))return;j(!0,`Deleting ${t.length} records...`);let n=v(`#cleanupOldRecordsBtn`);n&&(n.disabled=!0,n.innerHTML=`<span class="spinner"></span> Deleting...`);let r=0,i=0;for(let e of t)try{if(await Z(`issue-cleanup-deleted`,e.id,{materialName:e.materialName,returnDate:e.returnDate||null}),await s(o(U,`issues/`+e.id)),W){for(let t of e.photoPaths||(e.photoPath?[e.photoPath]:[]))try{await d(m(W,t))}catch{}for(let t of e.returnPhotoPaths||(e.returnPhotoPath?[e.returnPhotoPath]:[]))try{await d(m(W,t))}catch{}}r++}catch(t){console.error(`Failed to delete issue`,e.id,t),i++}j(!1),O(`Cleanup complete.\n\nSuccessfully deleted: ${r} record(s).${i>0?`\nFailed to delete: ${i} record(s).`:``}`,{title:`Cleanup Complete`,type:i>0?`warning`:`success`}),Q()}function vr(e,n=1e4){return Promise.race([t(o(U,e)),new Promise((e,t)=>setTimeout(()=>t(Error(`The cloud request timed out. Check the Cloud Sync status and retry.`)),n))])}async function yr(){let e=v(`#requestsHolder`);if(!e)return;let t=e.querySelector(`.panel-pad`);j(!0,`Loading requests...`);try{let e=X(await vr(`accessRequests`));if(Sr(e.length),e.length===0){t.innerHTML=`<div class="empty-state" style="padding:40px 0;"><p>No pending requests right now.</p></div>`;return}t.innerHTML=e.map(e=>`
      <div class="request-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap;">
          <div>
            <div style="font-weight:700; font-size:15px; color:var(--text-strong);">${b(e.fullName)}</div>
            <div class="mono muted" style="font-size:12.5px; margin-top:4px;">Username: ${b(e.id)}</div>
          </div>
          <div style="display:flex; gap:12px;">
            <button class="btn btn-primary btn-sm" data-approve-request="${b(e.id)}">Approve</button>
            <button class="btn btn-danger btn-sm" data-reject-request="${b(e.id)}">Reject</button>
          </div>
        </div>
      </div>`).join(``),t.querySelectorAll(`[data-approve-request]`).forEach(e=>{e.addEventListener(`click`,()=>br(e.dataset.approveRequest))}),t.querySelectorAll(`[data-reject-request]`).forEach(e=>{e.addEventListener(`click`,()=>xr(e.dataset.rejectRequest))})}catch(e){t.innerHTML=`<div class="alert alert-error" role="alert">Could not load requests: ${b(e.message||`unknown error`)}</div><button type="button" class="btn btn-primary btn-sm" id="retryRequestsLoadBtn" style="margin-top:12px;">Retry loading requests</button>`,v(`#retryRequestsLoadBtn`)?.addEventListener(`click`,yr)}finally{j(!1)}}async function br(e){j(!0,`Approving user...`);try{let n=await t(o(U,`accessRequests/`+e));if(!n.exists()){yr();return}if((await t(o(U,`users/`+e))).exists()){O(`A user named "${e}" already exists. Reject this request or ask them to choose a different username.`,{title:`Username Taken`,type:`danger`});return}let{fullName:r,password:i}=n.val();await l(o(U,`users/`+e),{fullName:r,password:i,roles:[`user`],createdAt:c()}),await s(o(U,`accessRequests/`+e)),yr(),Cr()}catch(e){O(`Could not approve this request: `+(e.message||`unknown error`),{title:`Approval Failed`,type:`danger`})}finally{j(!1)}}async function xr(e){if(await k(`Reject the access request from "${e}"?`,{title:`Reject access request`,type:`danger`,confirmText:`Reject`})){j(!0,`Rejecting request...`);try{await s(o(U,`accessRequests/`+e)),yr()}catch(e){O(`Could not reject this request: `+(e.message||`unknown error`),{title:`Action Failed`,type:`danger`})}finally{j(!1)}}}function Sr(e){let t=t=>{let n=document.querySelector(t);if(!n)return;let r=n.querySelector(`.pending-count-dot`);if(r&&r.remove(),e>0){let t=document.createElement(`span`);t.className=`pending-count-dot`,t.textContent=e,n.appendChild(t)}};t(`.navlink[data-view="users-admin"]`),t(`.mobile-nav-item[data-view="users-admin"]`)}async function Cr(){let e=v(`#usersTableHolder`);if(e){j(!0,`Loading users...`);try{let t=X(await vr(`users`));e.innerHTML=`
      <div class="panel-head"><h2>Storekeeper Accounts</h2></div>
      <div class="table-wrap">
        ${t.length===0?`<div class="empty-state"><div class="display">No staff accounts yet</div><p>Add one using the form below.</p></div>`:`
        <table class="users-admin-table">
          <thead><tr><th>Username</th><th>Full Name</th><th>Role</th><th>Action</th></tr></thead>
          <tbody>
            ${t.map(e=>{let t=Array.isArray(e.roles)?e.roles:e.role?[e.role]:[`storekeeper`];return`
              <tr>
                <td class="mono" data-label="Username">${b(e.id)}</td>
                <td data-label="Full Name">${b(e.fullName)}</td>
                <td data-label="Role">
                  <div class="custom-multi-select" style="position:relative; width: 160px;">
                    <div class="multi-select-header" tabindex="0" style="border: 1px solid var(--border); padding: 6px 10px; border-radius: 4px; cursor: pointer; background: var(--surface); display:flex; justify-content:space-between; align-items:center;">
                      <span class="ms-label">${t.length} Role${t.length>1?`s`:``} Selected</span>
                      <span style="font-size:10px;">▼</span>
                    </div>
                    <div class="role-checkbox-group multi-select-options hidden" data-user-id="${b(e.id)}" style="position:absolute; top:100%; left:0; right:0; background:var(--input-bg, var(--surface)); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid var(--border); z-index:10; padding: 10px; border-radius: 4px; box-shadow: 0 8px 16px rgba(0,0,0,0.3); display:flex; flex-direction:column; gap:8px; margin-top:2px; text-align: left;">
                      <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0; white-space: nowrap;"><input type="checkbox" value="storekeeper" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;" ${t.includes(`storekeeper`)?`checked`:``}> Storekeeper</label>
                      <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0; white-space: nowrap;"><input type="checkbox" value="viewer" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;" ${t.includes(`viewer`)?`checked`:``}> Viewer</label>
                      <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0; white-space: nowrap;"><input type="checkbox" value="tools_admin" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;" ${t.includes(`tools_admin`)?`checked`:``}> Tools Admin</label>
                      <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0; white-space: nowrap;"><input type="checkbox" value="tools_viewer" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;" ${t.includes(`tools_viewer`)?`checked`:``}> Tools Viewer</label>
                    </div>
                  </div>
                </td>
                <td data-label="Action"><button class="btn btn-danger btn-sm" data-remove-user="${b(e.id)}"><span aria-hidden="true">🗑</span><span>Delete</span></button></td>
              </tr>`}).join(``)}
          </tbody>
        </table>`}
      </div>`,e.querySelectorAll(`.role-checkbox-group input[type="checkbox"]`).forEach(e=>{e.addEventListener(`change`,async e=>{let t=e.target.closest(`.role-checkbox-group`),n=t.dataset.userId,r=Array.from(t.querySelectorAll(`input:checked`));if(r.length>2){$(`A user can have a maximum of 2 roles.`,{title:`Role Limit`,type:`warning`}),e.target.checked=!1;return}if(r.length===0){$(`A user must have at least 1 role.`,{title:`Role Required`,type:`warning`}),e.target.checked=!0;return}let i=t.previousElementSibling?.querySelector(`.ms-label`);i&&(i.textContent=`${r.length} Role${r.length>1?`s`:``} Selected`);let a=r.map(e=>e.value);j(!0,`Updating roles...`);try{await u(o(U,`users/`+n),{roles:a})}catch(e){O(`Could not update role: `+(e.message||`unknown error`),{title:`Update Failed`,type:`danger`}),Cr()}finally{j(!1)}})}),e.querySelectorAll(`[data-remove-user]`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await k(`Delete the account "${e.dataset.removeUser}"? They will no longer be able to log in.`,{title:`Delete storekeeper account`,type:`danger`,confirmText:`Delete account`})){j(!0,`Deleting user...`);try{await s(o(U,`users/`+e.dataset.removeUser)),Cr()}catch(e){O(`Could not delete this account: `+(e.message||`unknown error`),{title:`Delete Failed`,type:`danger`})}finally{j(!1)}}})})}catch(t){e.innerHTML=`<div class="panel-head"><h2>Storekeeper Accounts</h2></div><div class="panel-pad"><div class="alert alert-error" role="alert">Could not load users: ${b(t.message||`unknown error`)}</div><button type="button" class="btn btn-primary btn-sm" id="retryUsersLoadBtn" style="margin-top:12px;">Retry loading users</button></div>`,v(`#retryUsersLoadBtn`)?.addEventListener(`click`,Cr)}finally{j(!1)}}}async function wr(e){e.preventDefault(),z=``,Zt(`userFormAlert`);let n=v(`#nu_username`).value.trim(),r=v(`#nu_fullname`).value.trim(),i=v(`#nu_password`).value,a=Array.from(document.querySelectorAll(`#nu_role_group input:checked`));if(a.length>2){z=`A user can have a maximum of 2 roles.`,J(`userFormAlert`,z);return}if(a.length===0){z=`Please select at least 1 role.`,J(`userFormAlert`,z);return}let s=a.map(e=>e.value);if(!n||!r||!i){z=`Please fill in username, full name, and password.`,J(`userFormAlert`,z);return}if(n.toLowerCase()===xt){z=`"${xt}" is reserved for the Admin login and can't be used here.`,J(`userFormAlert`,z);return}if(/[.#$\[\]\/\s'"]/.test(n)){z=`Username can't contain spaces, quotes, or the characters . # $ [ ] /`,J(`userFormAlert`,z);return}let u=v(`#newUserSubmitBtn`);u&&(u.disabled=!0,u.innerHTML=`<span class="spinner"></span> Creating…`),j(!0,`Creating account...`);try{if((await t(o(U,`users/`+n))).exists()){z=`That username already exists.`,J(`userFormAlert`,z);return}await l(o(U,`users/`+n),{fullName:r,password:i,roles:s,createdAt:c()}),Y(`users-admin`)}catch(e){z=`Could not create this account: `+(e.message||`unknown error`),J(`userFormAlert`,z),u&&u.isConnected&&(u.disabled=!1,u.textContent=`Create Account`)}finally{j(!1)}}window.cloudSyncBridge=Object.freeze({retry:()=>ve(),isConnected:()=>G===!0}),window.dispatchEvent(new CustomEvent(`cloud-sync-bridge-ready`,{detail:{connected:G===!0}}));var Tr=null;function Er(){let e=document.getElementById(`loginKpiGrid`);if(!e)return;let t=document.getElementById(`loginKpiTotal`),n=document.getElementById(`loginKpiPending`),r=document.getElementById(`loginKpiReturned`);if(!Tr)try{U!==void 0&&U&&(Tr=i(o(U,`issues`),i=>{if(!i.exists())return;let a=[];i.forEach(e=>{a.push(e.val())});let o=a.length,s=a.filter(e=>(typeof sn==`function`?sn(e):e.status)===`Returned`).length,c=o-s;t&&(t.innerHTML=o),n&&(n.innerHTML=c),r&&(r.innerHTML=s),e.style.display=`flex`,setTimeout(()=>{e.style.opacity=`1`},50)},e=>{console.error(`Login KPIs read error:`,e)}))}catch(e){console.warn(`Login KPIs setup failed:`,e)}}setTimeout(Er,1e3),document.addEventListener(`change`,e=>{if(e.target.closest(`#nu_role_group`)){let e=document.querySelectorAll(`#nu_role_group input:checked`),t=document.querySelector(`#nu_role_group`).previousElementSibling?.querySelector(`.ms-label`);t&&(t.textContent=`${e.length} Role${e.length===1?``:`s`} Selected`)}}),document.addEventListener(`click`,e=>{let t=e.target.closest(`.multi-select-header`);if(t){let e=t.nextElementSibling,n=e.classList.contains(`hidden`);document.querySelectorAll(`.multi-select-options`).forEach(e=>e.classList.add(`hidden`)),n&&e.classList.remove(`hidden`);return}e.target.closest(`.custom-multi-select`)||document.querySelectorAll(`.multi-select-options`).forEach(e=>e.classList.add(`hidden`));let n=e.target.closest(`[data-nav]`);if(n){if(ke!==void 0&&ke)try{ke.cancel()}catch{}Y(n.dataset.nav);return}let r=e.target.closest(`.kpi-button[data-kpi-status]`);if(r){N.status=r.dataset.kpiStatus||`all`,N.q=``,N.month=`all`,N.year=`all`,N.page=1,P=!1,Y(`register`);return}});function Dr(){v(`#appMain`);let e=C.roles.includes(`admin`),t=e||C.roles.includes(`tools_admin`);if(!at)return`
      <div class="panel">
        <div class="panel-head tools-panel-head">
          <div class="tools-head-title">
            <h2>Tools Master List</h2>
            <span class="tools-count-pill"><span class="spinner" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></span>Loading...</span>
          </div>
        </div>
        <div class="panel-pad">
          <div class="tools-skeleton" aria-label="Loading tools">
            <div class="tools-skeleton-row"></div>
            <div class="tools-skeleton-row"></div>
            <div class="tools-skeleton-row"></div>
          </div>
        </div>
      </div>
    `;let n=Array.from(new Set(T.map(e=>(e.category||``).trim()).filter(Boolean))).sort(),r=(window.toolsSearchQuery||``).toLowerCase().trim(),i=window.toolsStatusFilter||`all`,a=window.toolsCategoryFilter||`all`,o=!!(r||i!==`all`||a!==`all`),s=T.filter(e=>{if(i!==`all`&&(e.status||`Available`)!==i||a!==`all`&&(e.category||``).trim()!==a)return!1;if(r){let t=String(e.toolName||``).toLowerCase().includes(r),n=String(e.uniqueId||``).toLowerCase().includes(r),i=String(e.location||``).toLowerCase().includes(r),a=String(e.category||``).toLowerCase().includes(r),o=String(e.notes||``).toLowerCase().includes(r);if(!t&&!n&&!i&&!a&&!o)return!1}return!0}),c=e=>{let t=`good`;return e===`Lost`||e===`Damaged`?t=`bad`:e===`In Maintenance`&&(t=`warn`),`<span class="badge ${t}">${b(e||`Available`)}</span>`},l=`
    <div class="panel">
      <div class="panel-head tools-panel-head">
        <div class="tools-head-title">
          <h2>Tools Master List</h2>
          <span class="tools-count-pill">${s.length} ${s.length===1?`tool`:`tools`}</span>
        </div>
        <div class="tools-head-actions">
          ${t?`<button type="button" class="btn btn-primary" data-nav="add-tool"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px;vertical-align:-2px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add New Tool</button>`:``}
        </div>
      </div>
      <div class="panel-pad">
  `;return e&&E.length>0&&(l+=`
      <div class="pending-deletion-requests-card" style="margin-bottom:24px; background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.25); border-radius:var(--radius-lg); padding:16px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--danger)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <strong style="color:var(--danger); font-size:14px;">Pending Tool Deletion Requests</strong>
            <span class="badge warn" style="font-size:11px; font-weight:700;">${E.length} pending</span>
          </div>
          <span style="font-size:12px; color:var(--text-muted);">Users cannot delete tools directly. Review requests below:</span>
        </div>
        <div class="table-wrap" style="overflow-x:auto;">
          <table class="tools-master-table" style="font-size:12.5px; width:100%; background:var(--surface);">
            <thead>
              <tr>
                <th style="width:130px;">Tool ID</th>
                <th>Tool Name</th>
                <th>Requested By</th>
                <th>Reason for Deletion</th>
                <th style="width:130px;">Requested Date</th>
                <th style="width:160px; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${E.map(e=>`
                <tr>
                  <td class="tool-id-cell mono">${b(e.uniqueId||e.toolId||`—`)}</td>
                  <td><strong>${b(e.toolName||`—`)}</strong></td>
                  <td>${b(e.requestedByName||e.requestedBy||`User`)}</td>
                  <td style="max-width:240px; word-break:break-word;"><em>${b(e.reason||`No reason provided`)}</em></td>
                  <td class="mono" style="font-size:11.5px;">${e.requestedAt?new Date(e.requestedAt).toLocaleDateString():`—`}</td>
                  <td style="text-align:right; white-space:nowrap;">
                    <button type="button" class="btn btn-danger btn-sm" data-approve-tool-deletion="${b(e.id||e.toolId)}" title="Approve and permanently delete tool">Approve Delete</button>
                    <button type="button" class="btn btn-ghost btn-sm" data-reject-tool-deletion="${b(e.id||e.toolId)}" title="Reject deletion request" style="margin-left:4px;">Reject</button>
                  </td>
                </tr>
              `).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `),l+=`
        <div class="tools-filter-bar">
          <div class="tools-search-wrap">
            <svg class="tools-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="search" id="toolsSearchInput" class="tools-search-input" placeholder="Search tool by name, ID, location..." value="${b(window.toolsSearchQuery||``)}" autocomplete="off" />
            ${window.toolsSearchQuery?`<button type="button" id="toolsSearchClear" class="tools-search-clear" aria-label="Clear search">&times;</button>`:``}
          </div>
          <div class="tools-filters-row">
            <select id="toolsStatusFilter" class="input-select tools-filter-select">
              <option value="all"${i===`all`?` selected`:``}>All Statuses</option>
              <option value="Available"${i===`Available`?` selected`:``}>Available</option>
              <option value="In Maintenance"${i===`In Maintenance`?` selected`:``}>Under Maintenance</option>
              <option value="Damaged"${i===`Damaged`?` selected`:``}>Damage Declared</option>
              <option value="Lost"${i===`Lost`?` selected`:``}>Lost</option>
            </select>
            <select id="toolsCategoryFilter" class="input-select tools-filter-select">
              <option value="all"${a===`all`?` selected`:``}>All Categories</option>
              ${n.map(e=>`<option value="${b(e)}"${a===e?` selected`:``}>${b(e)}</option>`).join(``)}
            </select>
          </div>
        </div>

        <!-- Desktop Table View -->
        <div class="desktop-tools-table">
          <div class="tools-table-wrap">
            <table class="tools-master-table">
              <thead>
                <tr>
                  <th scope="col" style="width:140px;">Tool ID</th>
                  <th scope="col">Tool Name</th>
                  <th scope="col" style="width:130px;">Category</th>
                  <th scope="col" style="width:90px; text-align:center;">Quantity</th>
                  <th scope="col" style="width:120px;">Location</th>
                  <th scope="col" style="width:140px; text-align:center;">Status & History</th>
                  <th scope="col">Notes</th>
                  <th scope="col" style="width:180px; text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
  `,s.length===0?l+=`
      <tr>
        <td colspan="8" style="text-align:center; padding: 48px 16px;">
          <div class="empty-state" style="padding:0;">
            <div class="display" style="font-size:16px; margin-bottom:6px;">${T.length===0?`No tools recorded yet`:`No matching tools found`}</div>
            <p style="margin:0 0 16px; font-size:13.5px; color:var(--text-muted);">${T.length===0?`Start by logging your first tool into the master register.`:`Try adjusting or clearing your search and filter criteria.`}</p>
            ${o?`<button type="button" class="btn btn-ghost btn-sm" id="toolsClearFiltersBtn">Clear Filters</button>`:t?`<button type="button" class="btn btn-primary btn-sm" data-nav="add-tool">+ Add First Tool</button>`:``}
          </div>
        </td>
      </tr>
    `:s.forEach(n=>{let r=E.find(e=>(e.id||e.toolId)===n.id),i=Array.isArray(n.statusHistory)?n.statusHistory.length:0;l+=`
        <tr>
          <td class="tool-id-cell">${b(n.uniqueId||`—`)}</td>
          <td class="tool-name-cell">
            <strong>${b(n.toolName)}</strong>
            ${r?`<br/><span class="badge warn" style="font-size:10.5px; margin-top:3px; display:inline-block;" title="Deletion requested by `+b(r.requestedByName||r.requestedBy||`user`)+`">Deletion Pending</span>`:``}
          </td>
          <td><span class="tool-cat-badge">${b(n.category||`General`)}</span></td>
          <td style="text-align:center;"><span class="tool-qty-pill">${String(n.quantity??0)}</span></td>
          <td><span class="tool-loc-badge"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.6;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${b(n.location||`—`)}</span></td>
          <td style="text-align:center;">
            <button type="button" class="btn-clean" data-update-status="${b(n.id)}" title="Click to view history or update status" style="cursor:pointer; display:inline-flex; flex-direction:column; align-items:center; gap:3px;">
              ${c(n.status)}
              <span style="font-size:10.5px; color:var(--text-muted); text-decoration:underline;">${i>0?i+` logs`:`Update`}</span>
            </button>
          </td>
          <td class="tool-notes-cell" title="${b(n.notes||``)}">${b(n.notes||`—`)}</td>
          <td class="tool-actions-cell" style="text-align:right; white-space:nowrap;">
            <button type="button" class="btn btn-ghost btn-sm" data-update-status="${b(n.id)}" title="Update Status & View Timeline">Status</button>
            ${t?`<button type="button" class="btn btn-ghost btn-sm" data-edit-tool="${b(n.id)}" title="Edit Tool Details">Edit</button>`:``}
            ${e?`
              <button type="button" class="btn btn-danger btn-sm" data-delete-tool="${b(n.id)}" title="Permanently Delete Tool">Delete</button>
            `:r?`
              <span class="badge warn" style="font-size:10.5px; vertical-align:middle;" title="Deletion request submitted">Req Pending</span>
            `:`
              <button type="button" class="btn btn-ghost btn-sm" data-request-delete-tool="${b(n.id)}" title="Request Admin to delete this tool" style="color:var(--danger);">Request Delete</button>
            `}
          </td>
        </tr>
      `}),l+=`</tbody></table></div></div>`,l+=`<div class="mobile-tools-cards">`,s.length===0?l+=`
      <div class="empty-state" style="padding:40px 16px; text-align:center;">
        <div class="display" style="font-size:16px; margin-bottom:6px;">${T.length===0?`No tools recorded yet`:`No matching tools found`}</div>
        <p style="margin:0 0 16px; font-size:13px; color:var(--text-muted);">${T.length===0?`Start by logging your first tool into the master register.`:`Try adjusting or clearing your search and filter criteria.`}</p>
        ${o?`<button type="button" class="btn btn-ghost btn-sm" id="toolsClearFiltersBtnMobile">Clear Filters</button>`:t?`<button type="button" class="btn btn-primary btn-sm" data-nav="add-tool">+ Add First Tool</button>`:``}
      </div>
    `:s.forEach(n=>{let r=E.find(e=>(e.id||e.toolId)===n.id),i=Array.isArray(n.statusHistory)?n.statusHistory.length:0;l+=`
        <div class="tool-mobile-card anim-reveal is-visible">
          <div class="tool-card-top">
            <div class="tool-card-identity">
              <span class="tool-card-id">${b(n.uniqueId||`ID: —`)}</span>
              <h3 class="tool-card-name">${b(n.toolName)}</h3>
              ${r?`<span class="badge warn" style="font-size:10.5px; margin-top:2px;">Deletion Pending Review</span>`:``}
            </div>
            <div class="tool-card-status">
              <button type="button" class="btn-clean" data-update-status="${b(n.id)}" style="cursor:pointer;">
                ${c(n.status)}
              </button>
            </div>
          </div>
          <div class="tool-card-meta">
            ${n.category?`<span class="tool-meta-chip"><span class="meta-icon">🏷</span>${b(n.category)}</span>`:``}
            ${n.location?`<span class="tool-meta-chip"><span class="meta-icon">📍</span>${b(n.location)}</span>`:``}
            <span class="tool-meta-chip tool-qty-chip"><span class="meta-icon">📦</span>Qty: <strong>${b(n.quantity||`0`)}</strong></span>
            <span class="tool-meta-chip" data-tool-history="${b(n.id)}" style="cursor:pointer;"><span class="meta-icon">📜</span>${i>0?i+` logs`:`History`}</span>
          </div>
          ${n.notes?`<div class="tool-card-notes"><span class="notes-label">Notes:</span>${b(n.notes)}</div>`:``}
          <div class="tool-card-actions" style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn btn-ghost btn-sm tool-action-btn" data-update-status="${b(n.id)}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Status & History
            </button>
            ${t?`
              <button type="button" class="btn btn-ghost btn-sm tool-action-btn" data-edit-tool="${b(n.id)}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit
              </button>
            `:``}
            ${e?`
              <button type="button" class="btn btn-danger btn-sm tool-action-btn" data-delete-tool="${b(n.id)}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Delete
              </button>
            `:r?`
              <span class="badge warn" style="font-size:11px; padding:6px 10px;">Deletion Pending</span>
            `:`
              <button type="button" class="btn btn-ghost btn-sm tool-action-btn" data-request-delete-tool="${b(n.id)}" style="color:var(--danger);">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Request Delete
              </button>
            `}
          </div>
        </div>
      `}),l+=`</div></div></div>`,l}function Or(){return Ar(`Add New Tool`,{}),null}function kr(){let e=T.find(e=>e.id===window.currentEditToolId);return e?(Ar(`Edit Tool`,e),null):(Y(`tools-dashboard`),null)}function Ar(e,t){if(!C.roles.includes(`admin`)&&!C.roles.includes(`tools_admin`)){O(`You do not have permission to modify tools.`,{type:`danger`}),Y(`tools-dashboard`);return}let n=v(`#appMain`),r=!!t.id;n.innerHTML=`
    <div class="panel form-panel">
      <div class="panel-head">
        <h2>${e}</h2>
        <button type="button" class="btn btn-ghost" data-nav="tools-dashboard">Cancel</button>
      </div>
      <div class="panel-pad">
        <form id="toolForm">
          <div class="form-grid">
            ${r?`
            <div class="field full">
              <label>Tool ID</label>
              <input type="text" value="${b(t.uniqueId||``)}" disabled style="background:var(--surface); cursor:not-allowed;" />
            </div>`:``}
            <div class="field full">
              <label for="t_name">Tool Name *</label>
              <input type="text" id="t_name" value="${b(t.toolName||``)}" required />
            </div>
            <div class="field">
              <label for="t_category">Category</label>
              <input type="text" id="t_category" value="${b(t.category||``)}" />
            </div>
            <div class="field">
              <label for="t_qty">Quantity *</label>
              <input type="number" inputmode="numeric" pattern="[0-9]*" id="t_qty" min="0" value="${b(t.quantity!==void 0&&t.quantity!==null?t.quantity:`1`)}" required />
            </div>
            <div class="field">
              <label for="t_loc">Location / Shelf</label>
              <input type="text" id="t_loc" value="${b(t.location||``)}" />
            </div>
            <div class="field">
              <label for="t_status">Status</label>
              <select id="t_status">
                <option value="Available" ${t.status===`Available`?`selected`:``}>Available</option>
                <option value="In Maintenance" ${t.status===`In Maintenance`?`selected`:``}>In Maintenance</option>
                <option value="Damaged" ${t.status===`Damaged`?`selected`:``}>Damaged</option>
                <option value="Lost" ${t.status===`Lost`?`selected`:``}>Lost</option>
              </select>
            </div>
            <div class="field full">
              <label for="t_notes">Notes</label>
              <textarea id="t_notes" rows="3">${b(t.notes||``)}</textarea>
            </div>
          </div>
          <div class="actions-row" style="margin-top:20px;">
            <button type="submit" class="btn btn-primary btn-large" id="saveToolBtn">Save Tool</button>
          </div>
        </form>
      </div>
    </div>
  `,kn(!1),v(`#toolForm`)?.querySelectorAll(`input, select, textarea`).forEach(e=>{e.addEventListener(`input`,()=>kn(!0),{once:!1}),e.addEventListener(`change`,()=>kn(!0),{once:!1})}),v(`#toolForm`).addEventListener(`submit`,async e=>{e.preventDefault();let n=v(`#saveToolBtn`);n.disabled=!0,n.textContent=`Saving...`;let i=v(`#t_name`).value.trim(),s=Math.max(0,parseInt(v(`#t_qty`).value,10)||0),l={toolName:i,category:v(`#t_category`).value.trim(),quantity:s,location:v(`#t_loc`).value.trim(),status:v(`#t_status`).value,notes:v(`#t_notes`).value.trim(),updatedAt:c(),updatedBy:C.username};try{j(!0,`Saving tool...`);let e=Date.now(),n=new Date().toLocaleString();if(r)l.status!==t.status&&(l.statusHistory=[...Array.isArray(t.statusHistory)?[...t.statusHistory]:t.status?[{status:t.status,previousStatus:null,changedBy:t.createdBy||`Initial System Record`,changedByUsername:t.createdBy||`system`,timestamp:t.createdAt||e,dateStr:t.createdAt?new Date(t.createdAt).toLocaleString():n,notes:t.notes||`Initial registration`}]:[],{status:l.status,previousStatus:t.status||`Available`,changedBy:C.fullName||C.username,changedByUsername:C.username,timestamp:e,dateStr:n,notes:l.notes||`Status updated via tool editor`}]),await u(o(U,`tools/`+t.id),l),await Z(`tool-edited`,t.id,{toolName:i,quantity:s,status:l.status,uniqueId:t.uniqueId});else{let t=i.replace(/\//g,`-`).trim().toUpperCase(),r=0;T.forEach(e=>{let n=(e.toolName||``).replace(/\//g,`-`).trim().toUpperCase(),i=`CMM/SMS/${t}/`;if(n===t||e.uniqueId&&e.uniqueId.startsWith(i)){let t=(e.uniqueId||``).match(/(\d+)$/);if(t){let e=parseInt(t[1],10);e>r&&(r=e)}}}),l.uniqueId=`CMM/SMS/${t}/${String(r+1).padStart(4,`0`)}`,l.statusHistory=[{status:l.status,previousStatus:null,changedBy:C.fullName||C.username,changedByUsername:C.username,timestamp:e,dateStr:n,notes:l.notes||`Initial registration`}],l.createdAt=c(),l.createdBy=C.username,await Z(`tool-created`,(await a(o(U,`tools`),l)).key,{toolName:i,quantity:s,uniqueId:l.uniqueId})}P=!1,window.toolsStatusFilter=`all`,$(`Tool saved successfully.`),Y(`tools-dashboard`)}catch(e){O(`Error saving tool: `+e.message,{type:`danger`}),n.disabled=!1,n.textContent=`Save Tool`}finally{j(!1)}})}Dn(),window.addEventListener(`beforeunload`,e=>{if(P){let t=`You have unsaved changes. Are you sure you want to leave?`;return e.returnValue=t,t}}),Dt();var jr=document.createElement(`div`);jr.id=`offlineBanner`,jr.className=`hidden`,jr.innerHTML=`&#9888; You are offline. Changes will sync when reconnected.`,Object.assign(jr.style,{position:`fixed`,top:`0`,left:`0`,width:`100%`,backgroundColor:`#ef4444`,color:`white`,textAlign:`center`,padding:`8px`,fontSize:`13px`,fontWeight:`600`,zIndex:`1000000`,transition:`transform 0.3s`}),document.body.appendChild(jr),window.addEventListener(`offline`,()=>jr.classList.remove(`hidden`)),window.addEventListener(`online`,()=>jr.classList.add(`hidden`)),navigator.onLine||jr.classList.remove(`hidden`);var Mr=null,Nr=()=>{if(window.innerWidth<=768){document.querySelectorAll(`.anim-reveal`).forEach(e=>{e.classList.add(`is-visible`)});return}let e=document.querySelectorAll(`.kpi, .panel, .filter-bar, .reg-pagination, .request-card, .kv-row, .tool-mobile-card`);Mr||=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`is-visible`),Mr.unobserve(e.target))})},{threshold:.05}),e.forEach(e=>{e.dataset.ioObserved||(e.dataset.ioObserved=`1`,e.classList.contains(`is-visible`)||e.classList.add(`anim-reveal`),Mr.observe(e),setTimeout(()=>{e&&!e.classList.contains(`is-visible`)&&e.classList.add(`is-visible`)},350))});let t=document.querySelector(`.kpi-grid`);t&&!t.classList.contains(`anim-stagger`)&&t.classList.add(`anim-stagger`)},Pr=()=>{document.querySelectorAll(`.kpi-value`).forEach(e=>{let t=e.textContent.trim();if(e.dataset.animVal===t)return;let n=t.match(/[0-9]+/),r=n?parseInt(n[0],10):NaN;if(isNaN(r)||r===0||r>99999){e.dataset.animVal=t;return}e.dataset.animVal=t;let i=0,a=()=>{i++;let n=1-(1-i/28)**3,o=Math.round(r*n);e.textContent=t.replace(/[0-9]+/,String(o)),i<28?requestAnimationFrame(a):(e.textContent=t,e.classList.remove(`animating`))};e.classList.add(`animating`),setTimeout(()=>requestAnimationFrame(a),120)})},Fr=(e=10)=>{try{typeof window.triggerHaptic==`function`?window.triggerHaptic(e):navigator.vibrate&&navigator.vibrate(e)}catch{}},Ir=!1,Lr=()=>{Ir||(Ir=!0,document.addEventListener(`pointerdown`,e=>{let t=e.target.closest(`.btn, .navlink, .nav-tab, button, [role="button"], .tool-mobile-card, select, .filter-chip, .pagination-btn, .kpi, .request-card`);!t||t.disabled||t.getAttribute(`aria-disabled`)===`true`||Fr(t.classList.contains(`kpi`)||t.classList.contains(`request-card`)||t.classList.contains(`tool-mobile-card`)?6:10)},{passive:!0}))},Rr=!1,zr=()=>{Rr||(Rr=!0,document.addEventListener(`pointerdown`,e=>{let t=e.target.closest(`.btn`);if(!t||t.disabled)return;let n=t.getBoundingClientRect(),r=document.createElement(`span`);r.className=`ripple-wave`;let i=Math.max(n.width,n.height)*1.6;r.style.width=`${i}px`,r.style.height=`${i}px`,r.style.left=`${e.clientX-n.left-i/2}px`,r.style.top=`${e.clientY-n.top-i/2}px`,t.appendChild(r),r.addEventListener(`animationend`,()=>r.remove())},{passive:!0}))},Br=()=>{let e=document.querySelector(`.nav`);if(!e||e.dataset.inkBound)return;e.dataset.inkBound=`1`;let t=document.createElement(`span`);t.className=`nav-ink`,e.appendChild(t);let n=()=>{let n=e.querySelector(`.navlink.active`);if(!n){t.style.width=`0`;return}let r=e.getBoundingClientRect(),i=n.getBoundingClientRect();t.style.left=`${i.left-r.left+e.scrollLeft}px`,t.style.width=`${i.width}px`};n(),e.addEventListener(`click`,()=>setTimeout(n,35)),new MutationObserver(n).observe(e,{attributes:!0,subtree:!0,attributeFilter:[`class`]})},Vr=!1,Hr=()=>{if(Vr)return;Vr=!0;let e=document.querySelector(`.topbar`);if(!e)return;let t=()=>e.classList.toggle(`is-scrolled`,window.scrollY>8);window.addEventListener(`scroll`,t,{passive:!0}),t()},Ur=()=>{document.querySelectorAll(`table.reg tr`).forEach((e,t)=>{e.style.animationDelay=`${Math.min(t*.04,.28)}s`})},Wr=!1,Gr=()=>{Wr||(Wr=!0,document.addEventListener(`keydown`,e=>{let t=document.activeElement?document.activeElement.tagName.toLowerCase():``,n=[`input`,`textarea`,`select`].includes(t)||!!(document.activeElement&&document.activeElement.isContentEditable);if(e.key===`Escape`){let e=document.getElementById(`regSearch`);e&&document.activeElement===e&&e.blur();return}if(!(n&&!e.altKey&&!e.ctrlKey&&!e.metaKey)){if(e.key===`/`&&!n||e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()===`f`){let t=document.getElementById(`regSearch`);t&&(e.preventDefault(),t.focus(),t.select());return}if(e.altKey){let t=e.key.toLowerCase(),n=``;if(t===`n`?n=`.navlink[data-view="issue-new"]`:t===`r`?n=`.navlink[data-view="register"]`:t===`d`&&(n=`.navlink[data-view="dashboard"], .navlink[data-view="admin-dashboard"]`),n){e.preventDefault();let t=document.querySelector(n);t&&t.click()}}}}))},Kr=!1,qr=()=>{if(Jr(),Nr(),Lr(),zr(),Br(),Hr(),!Kr){Kr=!0;let e=document.getElementById(`appMain`);if(e&&window.MutationObserver){let t=null;new MutationObserver(()=>{clearTimeout(t),t=setTimeout(()=>{Nr(),Pr(),Ur()},50)}).observe(e,{childList:!0,subtree:!1})}}Gr(),setTimeout(Pr,250),setTimeout(Ur,100)};document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,qr):qr();function Jr(){let e=document.getElementById(`bgCanvas`);if(!e||e.dataset.initialized)return;e.dataset.initialized=`1`;let t=e.getContext(`2d`),n,r,i,a=[],o=window.innerWidth<=768?45:100,s=0,c=null,l=!1;function u(){n=e.width=window.innerWidth,r=e.height=window.innerHeight,i=Math.min(n,r)*.9}window.addEventListener(`resize`,u,{passive:!0}),u();for(let e=0;e<o;e++){let e=Math.random()*2*Math.PI,t=Math.acos(Math.random()*2-1),n=Math.sin(t)*Math.cos(e),r=Math.sin(t)*Math.sin(e),i=Math.cos(t);a.push({x:n,y:r,z:i})}function d(){t.clearRect(0,0,n,r),s+=.0015;let e=Math.cos(s),o=Math.sin(s),c=document.documentElement.getAttribute(`data-theme`)===`light`?`15, 23, 42`:`56, 189, 248`,l=i,u=a.map(t=>{let i=t.x*l,a=t.y*l,s=t.z*l,c=i*e-s*o,u=i*o+s*e,d=a,f=800/(800+u);return{x:n/2+c*f,y:r/2+d*f,z:u,scale:f}});t.lineWidth=.5;for(let e=0;e<u.length;e++)for(let n=e+1;n<u.length;n++){let r=u[e],i=u[n],a=r.x-i.x,o=r.y-i.y,s=Math.sqrt(a*a+o*o);if(s<120){let e=(1-s/120)*.25;t.strokeStyle=`rgba(${c}, ${e})`,t.beginPath(),t.moveTo(r.x,r.y),t.lineTo(i.x,i.y),t.stroke()}}u.forEach(e=>{let n=Math.max(.1,(e.z+l)/(l*2));t.fillStyle=`rgba(${c}, ${n*.6})`,t.beginPath(),t.arc(e.x,e.y,Math.max(0,2*e.scale),0,Math.PI*2),t.fill()})}function f(){l&&(d(),c=requestAnimationFrame(f))}function p(){if(!l){if(window.matchMedia&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches){d();return}l=!0,f()}}function m(){l=!1,c&&=(cancelAnimationFrame(c),null)}document.addEventListener(`visibilitychange`,()=>{document.hidden||window.__bgAnimPaused?m():p()}),window.stop3DBackground=()=>{window.__bgAnimPaused=!0,m()},window.start3DBackground=()=>{window.__bgAnimPaused=!1,document.hidden||p()},window.__bgAnimPaused||p()}