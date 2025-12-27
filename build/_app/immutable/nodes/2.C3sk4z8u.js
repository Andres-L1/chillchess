import{s as Rs,n as Pn,d as H,i as st,l as Br,R as la,y as ca,a as Wt,V as Tn,b,P as Be,W as ha,r as A,c as L,e as ne,g as Y,Q as ye,f as De,h as x,j as Q,t as Ne,X as ua,k as da,S as fa}from"../chunks/B1hiKLhY.js";import{S as Ps,i as Os,d as pa,t as ga,a as ma,m as va,e as _a,b as ya}from"../chunks/DJhwkcyc.js";import{e as Vr}from"../chunks/D6YF6ztN.js";import{s as wa}from"../chunks/DpFMODEa.js";import{w as Ia}from"../chunks/EHlQaz89.js";var Hr={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ds=function(i){const e=[];let n=0;for(let r=0;r<i.length;r++){let o=i.charCodeAt(r);o<128?e[n++]=o:o<2048?(e[n++]=o>>6|192,e[n++]=o&63|128):(o&64512)===55296&&r+1<i.length&&(i.charCodeAt(r+1)&64512)===56320?(o=65536+((o&1023)<<10)+(i.charCodeAt(++r)&1023),e[n++]=o>>18|240,e[n++]=o>>12&63|128,e[n++]=o>>6&63|128,e[n++]=o&63|128):(e[n++]=o>>12|224,e[n++]=o>>6&63|128,e[n++]=o&63|128)}return e},Ea=function(i){const e=[];let n=0,r=0;for(;n<i.length;){const o=i[n++];if(o<128)e[r++]=String.fromCharCode(o);else if(o>191&&o<224){const l=i[n++];e[r++]=String.fromCharCode((o&31)<<6|l&63)}else if(o>239&&o<365){const l=i[n++],h=i[n++],p=i[n++],v=((o&7)<<18|(l&63)<<12|(h&63)<<6|p&63)-65536;e[r++]=String.fromCharCode(55296+(v>>10)),e[r++]=String.fromCharCode(56320+(v&1023))}else{const l=i[n++],h=i[n++];e[r++]=String.fromCharCode((o&15)<<12|(l&63)<<6|h&63)}}return e.join("")},Ns={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(i,e){if(!Array.isArray(i))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let o=0;o<i.length;o+=3){const l=i[o],h=o+1<i.length,p=h?i[o+1]:0,v=o+2<i.length,E=v?i[o+2]:0,S=l>>2,O=(l&3)<<4|p>>4;let C=(p&15)<<2|E>>6,$=E&63;v||($=64,h||(C=64)),r.push(n[S],n[O],n[C],n[$])}return r.join("")},encodeString(i,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(i):this.encodeByteArray(Ds(i),e)},decodeString(i,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(i):Ea(this.decodeStringToByteArray(i,e))},decodeStringToByteArray(i,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let o=0;o<i.length;){const l=n[i.charAt(o++)],p=o<i.length?n[i.charAt(o)]:0;++o;const E=o<i.length?n[i.charAt(o)]:64;++o;const O=o<i.length?n[i.charAt(o)]:64;if(++o,l==null||p==null||E==null||O==null)throw new Ta;const C=l<<2|p>>4;if(r.push(C),E!==64){const $=p<<4&240|E>>2;if(r.push($),O!==64){const R=E<<6&192|O;r.push(R)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let i=0;i<this.ENCODED_VALS.length;i++)this.byteToCharMap_[i]=this.ENCODED_VALS.charAt(i),this.charToByteMap_[this.byteToCharMap_[i]]=i,this.byteToCharMapWebSafe_[i]=this.ENCODED_VALS_WEBSAFE.charAt(i),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]]=i,i>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)]=i,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)]=i)}}};class Ta extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ba=function(i){const e=Ds(i);return Ns.encodeByteArray(e,!0)},On=function(i){return ba(i).replace(/\./g,"")},Ls=function(i){try{return Ns.decodeString(i,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Aa(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sa=()=>Aa().__FIREBASE_DEFAULTS__,Ca=()=>{if(typeof process>"u"||typeof Hr>"u")return;const i=Hr.__FIREBASE_DEFAULTS__;if(i)return JSON.parse(i)},ka=()=>{if(typeof document>"u")return;let i;try{i=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=i&&Ls(i[1]);return e&&JSON.parse(e)},Si=()=>{try{return Sa()||Ca()||ka()}catch(i){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${i}`);return}},xs=i=>{var e,n;return(n=(e=Si())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[i]},Ra=i=>{const e=xs(i);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},Ms=()=>{var i;return(i=Si())===null||i===void 0?void 0:i.config},Us=i=>{var e;return(e=Si())===null||e===void 0?void 0:e[`_${i}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pa{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oa(i,e){if(i.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",o=i.iat||0,l=i.sub||i.user_id;if(!l)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const h=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:o,exp:o+3600,auth_time:o,sub:l,user_id:l,firebase:{sign_in_provider:"custom",identities:{}}},i);return[On(JSON.stringify(n)),On(JSON.stringify(h)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ie(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Da(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ie())}function Na(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function La(){const i=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof i=="object"&&i.id!==void 0}function xa(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Ma(){const i=Ie();return i.indexOf("MSIE ")>=0||i.indexOf("Trident/")>=0}function Ua(){try{return typeof indexedDB=="object"}catch{return!1}}function Fa(){return new Promise((i,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",o=self.indexedDB.open(r);o.onsuccess=()=>{o.result.close(),n||self.indexedDB.deleteDatabase(r),i(!0)},o.onupgradeneeded=()=>{n=!1},o.onerror=()=>{var l;e(((l=o.error)===null||l===void 0?void 0:l.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ja="FirebaseError";class qe extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=ja,Object.setPrototypeOf(this,qe.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,nn.prototype.create)}}class nn{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},o=`${this.service}/${e}`,l=this.errors[e],h=l?Ba(l,r):"Error",p=`${this.serviceName}: ${h} (${o}).`;return new qe(o,p,r)}}function Ba(i,e){return i.replace(Va,(n,r)=>{const o=e[r];return o!=null?String(o):`<${r}?>`})}const Va=/\{\$([^}]+)}/g;function Ha(i){for(const e in i)if(Object.prototype.hasOwnProperty.call(i,e))return!1;return!0}function Dn(i,e){if(i===e)return!0;const n=Object.keys(i),r=Object.keys(e);for(const o of n){if(!r.includes(o))return!1;const l=i[o],h=e[o];if($r(l)&&$r(h)){if(!Dn(l,h))return!1}else if(l!==h)return!1}for(const o of r)if(!n.includes(o))return!1;return!0}function $r(i){return i!==null&&typeof i=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rn(i){const e=[];for(const[n,r]of Object.entries(i))Array.isArray(r)?r.forEach(o=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(o))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Gt(i){const e={};return i.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[o,l]=r.split("=");e[decodeURIComponent(o)]=decodeURIComponent(l)}}),e}function Kt(i){const e=i.indexOf("?");if(!e)return"";const n=i.indexOf("#",e);return i.substring(e,n>0?n:void 0)}function $a(i,e){const n=new za(i,e);return n.subscribe.bind(n)}class za{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let o;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");Wa(e,["next","error","complete"])?o=e:o={next:e,error:n,complete:r},o.next===void 0&&(o.next=ci),o.error===void 0&&(o.error=ci),o.complete===void 0&&(o.complete=ci);const l=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?o.error(this.finalError):o.complete()}catch{}}),this.observers.push(o),l}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Wa(i,e){if(typeof i!="object"||i===null)return!1;for(const n of e)if(n in i&&typeof i[n]=="function")return!0;return!1}function ci(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ue(i){return i&&i._delegate?i._delegate:i}class dt{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ut="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ga{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Pa;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const o=this.getOrInitializeService({instanceIdentifier:n});o&&r.resolve(o)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),o=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(l){if(o)return null;throw l}else{if(o)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(qa(e))try{this.getOrInitializeService({instanceIdentifier:ut})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const o=this.normalizeInstanceIdentifier(n);try{const l=this.getOrInitializeService({instanceIdentifier:o});r.resolve(l)}catch{}}}}clearInstance(e=ut){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=ut){return this.instances.has(e)}getOptions(e=ut){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const o=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[l,h]of this.instancesDeferred.entries()){const p=this.normalizeInstanceIdentifier(l);r===p&&h.resolve(o)}return o}onInit(e,n){var r;const o=this.normalizeInstanceIdentifier(n),l=(r=this.onInitCallbacks.get(o))!==null&&r!==void 0?r:new Set;l.add(e),this.onInitCallbacks.set(o,l);const h=this.instances.get(o);return h&&e(h,o),()=>{l.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const o of r)try{o(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Ka(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=ut){return this.component?this.component.multipleInstances?e:ut:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Ka(i){return i===ut?void 0:i}function qa(i){return i.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ja{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Ga(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var K;(function(i){i[i.DEBUG=0]="DEBUG",i[i.VERBOSE=1]="VERBOSE",i[i.INFO=2]="INFO",i[i.WARN=3]="WARN",i[i.ERROR=4]="ERROR",i[i.SILENT=5]="SILENT"})(K||(K={}));const Xa={debug:K.DEBUG,verbose:K.VERBOSE,info:K.INFO,warn:K.WARN,error:K.ERROR,silent:K.SILENT},Ya=K.INFO,Qa={[K.DEBUG]:"log",[K.VERBOSE]:"log",[K.INFO]:"info",[K.WARN]:"warn",[K.ERROR]:"error"},Za=(i,e,...n)=>{if(e<i.logLevel)return;const r=new Date().toISOString(),o=Qa[e];if(o)console[o](`[${r}]  ${i.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Ci{constructor(e){this.name=e,this._logLevel=Ya,this._logHandler=Za,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in K))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Xa[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,K.DEBUG,...e),this._logHandler(this,K.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,K.VERBOSE,...e),this._logHandler(this,K.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,K.INFO,...e),this._logHandler(this,K.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,K.WARN,...e),this._logHandler(this,K.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,K.ERROR,...e),this._logHandler(this,K.ERROR,...e)}}const el=(i,e)=>e.some(n=>i instanceof n);let zr,Wr;function tl(){return zr||(zr=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function nl(){return Wr||(Wr=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Fs=new WeakMap,vi=new WeakMap,js=new WeakMap,hi=new WeakMap,ki=new WeakMap;function il(i){const e=new Promise((n,r)=>{const o=()=>{i.removeEventListener("success",l),i.removeEventListener("error",h)},l=()=>{n(nt(i.result)),o()},h=()=>{r(i.error),o()};i.addEventListener("success",l),i.addEventListener("error",h)});return e.then(n=>{n instanceof IDBCursor&&Fs.set(n,i)}).catch(()=>{}),ki.set(e,i),e}function rl(i){if(vi.has(i))return;const e=new Promise((n,r)=>{const o=()=>{i.removeEventListener("complete",l),i.removeEventListener("error",h),i.removeEventListener("abort",h)},l=()=>{n(),o()},h=()=>{r(i.error||new DOMException("AbortError","AbortError")),o()};i.addEventListener("complete",l),i.addEventListener("error",h),i.addEventListener("abort",h)});vi.set(i,e)}let _i={get(i,e,n){if(i instanceof IDBTransaction){if(e==="done")return vi.get(i);if(e==="objectStoreNames")return i.objectStoreNames||js.get(i);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return nt(i[e])},set(i,e,n){return i[e]=n,!0},has(i,e){return i instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in i}};function sl(i){_i=i(_i)}function ol(i){return i===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=i.call(ui(this),e,...n);return js.set(r,e.sort?e.sort():[e]),nt(r)}:nl().includes(i)?function(...e){return i.apply(ui(this),e),nt(Fs.get(this))}:function(...e){return nt(i.apply(ui(this),e))}}function al(i){return typeof i=="function"?ol(i):(i instanceof IDBTransaction&&rl(i),el(i,tl())?new Proxy(i,_i):i)}function nt(i){if(i instanceof IDBRequest)return il(i);if(hi.has(i))return hi.get(i);const e=al(i);return e!==i&&(hi.set(i,e),ki.set(e,i)),e}const ui=i=>ki.get(i);function ll(i,e,{blocked:n,upgrade:r,blocking:o,terminated:l}={}){const h=indexedDB.open(i,e),p=nt(h);return r&&h.addEventListener("upgradeneeded",v=>{r(nt(h.result),v.oldVersion,v.newVersion,nt(h.transaction),v)}),n&&h.addEventListener("blocked",v=>n(v.oldVersion,v.newVersion,v)),p.then(v=>{l&&v.addEventListener("close",()=>l()),o&&v.addEventListener("versionchange",E=>o(E.oldVersion,E.newVersion,E))}).catch(()=>{}),p}const cl=["get","getKey","getAll","getAllKeys","count"],hl=["put","add","delete","clear"],di=new Map;function Gr(i,e){if(!(i instanceof IDBDatabase&&!(e in i)&&typeof e=="string"))return;if(di.get(e))return di.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,o=hl.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(o||cl.includes(n)))return;const l=async function(h,...p){const v=this.transaction(h,o?"readwrite":"readonly");let E=v.store;return r&&(E=E.index(p.shift())),(await Promise.all([E[n](...p),o&&v.done]))[0]};return di.set(e,l),l}sl(i=>({...i,get:(e,n,r)=>Gr(e,n)||i.get(e,n,r),has:(e,n)=>!!Gr(e,n)||i.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ul{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(dl(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function dl(i){const e=i.getComponent();return(e==null?void 0:e.type)==="VERSION"}const yi="@firebase/app",Kr="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ge=new Ci("@firebase/app"),fl="@firebase/app-compat",pl="@firebase/analytics-compat",gl="@firebase/analytics",ml="@firebase/app-check-compat",vl="@firebase/app-check",_l="@firebase/auth",yl="@firebase/auth-compat",wl="@firebase/database",Il="@firebase/data-connect",El="@firebase/database-compat",Tl="@firebase/functions",bl="@firebase/functions-compat",Al="@firebase/installations",Sl="@firebase/installations-compat",Cl="@firebase/messaging",kl="@firebase/messaging-compat",Rl="@firebase/performance",Pl="@firebase/performance-compat",Ol="@firebase/remote-config",Dl="@firebase/remote-config-compat",Nl="@firebase/storage",Ll="@firebase/storage-compat",xl="@firebase/firestore",Ml="@firebase/vertexai-preview",Ul="@firebase/firestore-compat",Fl="firebase",jl="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wi="[DEFAULT]",Bl={[yi]:"fire-core",[fl]:"fire-core-compat",[gl]:"fire-analytics",[pl]:"fire-analytics-compat",[vl]:"fire-app-check",[ml]:"fire-app-check-compat",[_l]:"fire-auth",[yl]:"fire-auth-compat",[wl]:"fire-rtdb",[Il]:"fire-data-connect",[El]:"fire-rtdb-compat",[Tl]:"fire-fn",[bl]:"fire-fn-compat",[Al]:"fire-iid",[Sl]:"fire-iid-compat",[Cl]:"fire-fcm",[kl]:"fire-fcm-compat",[Rl]:"fire-perf",[Pl]:"fire-perf-compat",[Ol]:"fire-rc",[Dl]:"fire-rc-compat",[Nl]:"fire-gcs",[Ll]:"fire-gcs-compat",[xl]:"fire-fst",[Ul]:"fire-fst-compat",[Ml]:"fire-vertex","fire-js":"fire-js",[Fl]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yt=new Map,Vl=new Map,Ii=new Map;function qr(i,e){try{i.container.addComponent(e)}catch(n){Ge.debug(`Component ${e.name} failed to register with FirebaseApp ${i.name}`,n)}}function kt(i){const e=i.name;if(Ii.has(e))return Ge.debug(`There were multiple attempts to register component ${e}.`),!1;Ii.set(e,i);for(const n of Yt.values())qr(n,i);for(const n of Vl.values())qr(n,i);return!0}function Ri(i,e){const n=i.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),i.container.getProvider(e)}function Le(i){return i.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hl={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},it=new nn("app","Firebase",Hl);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $l{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new dt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw it.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pt=jl;function Bs(i,e={}){let n=i;typeof e!="object"&&(e={name:e});const r=Object.assign({name:wi,automaticDataCollectionEnabled:!1},e),o=r.name;if(typeof o!="string"||!o)throw it.create("bad-app-name",{appName:String(o)});if(n||(n=Ms()),!n)throw it.create("no-options");const l=Yt.get(o);if(l){if(Dn(n,l.options)&&Dn(r,l.config))return l;throw it.create("duplicate-app",{appName:o})}const h=new Ja(o);for(const v of Ii.values())h.addComponent(v);const p=new $l(n,r,h);return Yt.set(o,p),p}function Pi(i=wi){const e=Yt.get(i);if(!e&&i===wi&&Ms())return Bs();if(!e)throw it.create("no-app",{appName:i});return e}function zl(){return Array.from(Yt.values())}function rt(i,e,n){var r;let o=(r=Bl[i])!==null&&r!==void 0?r:i;n&&(o+=`-${n}`);const l=o.match(/\s|\//),h=e.match(/\s|\//);if(l||h){const p=[`Unable to register library "${o}" with version "${e}":`];l&&p.push(`library name "${o}" contains illegal characters (whitespace or "/")`),l&&h&&p.push("and"),h&&p.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ge.warn(p.join(" "));return}kt(new dt(`${o}-version`,()=>({library:o,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wl="firebase-heartbeat-database",Gl=1,Qt="firebase-heartbeat-store";let fi=null;function Vs(){return fi||(fi=ll(Wl,Gl,{upgrade:(i,e)=>{switch(e){case 0:try{i.createObjectStore(Qt)}catch(n){console.warn(n)}}}}).catch(i=>{throw it.create("idb-open",{originalErrorMessage:i.message})})),fi}async function Kl(i){try{const n=(await Vs()).transaction(Qt),r=await n.objectStore(Qt).get(Hs(i));return await n.done,r}catch(e){if(e instanceof qe)Ge.warn(e.message);else{const n=it.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Ge.warn(n.message)}}}async function Jr(i,e){try{const r=(await Vs()).transaction(Qt,"readwrite");await r.objectStore(Qt).put(e,Hs(i)),await r.done}catch(n){if(n instanceof qe)Ge.warn(n.message);else{const r=it.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Ge.warn(r.message)}}}function Hs(i){return`${i.name}!${i.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ql=1024,Jl=30*24*60*60*1e3;class Xl{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Ql(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const o=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),l=Xr();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===l||this._heartbeatsCache.heartbeats.some(h=>h.date===l)?void 0:(this._heartbeatsCache.heartbeats.push({date:l,agent:o}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(h=>{const p=new Date(h.date).valueOf();return Date.now()-p<=Jl}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Ge.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=Xr(),{heartbeatsToSend:r,unsentEntries:o}=Yl(this._heartbeatsCache.heartbeats),l=On(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,o.length>0?(this._heartbeatsCache.heartbeats=o,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),l}catch(n){return Ge.warn(n),""}}}function Xr(){return new Date().toISOString().substring(0,10)}function Yl(i,e=ql){const n=[];let r=i.slice();for(const o of i){const l=n.find(h=>h.agent===o.agent);if(l){if(l.dates.push(o.date),Yr(n)>e){l.dates.pop();break}}else if(n.push({agent:o.agent,dates:[o.date]}),Yr(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class Ql{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ua()?Fa().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Kl(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const o=await this.read();return Jr(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:o.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const o=await this.read();return Jr(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:o.lastSentHeartbeatDate,heartbeats:[...o.heartbeats,...e.heartbeats]})}else return}}function Yr(i){return On(JSON.stringify({version:2,heartbeats:i})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zl(i){kt(new dt("platform-logger",e=>new ul(e),"PRIVATE")),kt(new dt("heartbeat",e=>new Xl(e),"PRIVATE")),rt(yi,Kr,i),rt(yi,Kr,"esm2017"),rt("fire-js","")}Zl("");var ec="firebase",tc="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */rt(ec,tc,"app");function Oi(i,e){var n={};for(var r in i)Object.prototype.hasOwnProperty.call(i,r)&&e.indexOf(r)<0&&(n[r]=i[r]);if(i!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,r=Object.getOwnPropertySymbols(i);o<r.length;o++)e.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(i,r[o])&&(n[r[o]]=i[r[o]]);return n}function $s(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const nc=$s,zs=new nn("auth","Firebase",$s());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nn=new Ci("@firebase/auth");function ic(i,...e){Nn.logLevel<=K.WARN&&Nn.warn(`Auth (${Pt}): ${i}`,...e)}function Sn(i,...e){Nn.logLevel<=K.ERROR&&Nn.error(`Auth (${Pt}): ${i}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oe(i,...e){throw Di(i,...e)}function xe(i,...e){return Di(i,...e)}function Ws(i,e,n){const r=Object.assign(Object.assign({},nc()),{[e]:n});return new nn("auth","Firebase",r).create(e,{appName:i.name})}function We(i){return Ws(i,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Di(i,...e){if(typeof i!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=i.name),i._errorFactory.create(n,...r)}return zs.create(i,...e)}function P(i,e,...n){if(!i)throw Di(e,...n)}function He(i){const e="INTERNAL ASSERTION FAILED: "+i;throw Sn(e),new Error(e)}function Ke(i,e){i||He(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ei(){var i;return typeof self<"u"&&((i=self.location)===null||i===void 0?void 0:i.href)||""}function rc(){return Qr()==="http:"||Qr()==="https:"}function Qr(){var i;return typeof self<"u"&&((i=self.location)===null||i===void 0?void 0:i.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sc(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(rc()||La()||"connection"in navigator)?navigator.onLine:!0}function oc(){if(typeof navigator>"u")return null;const i=navigator;return i.languages&&i.languages[0]||i.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sn{constructor(e,n){this.shortDelay=e,this.longDelay=n,Ke(n>e,"Short delay should be less than long delay!"),this.isMobile=Da()||xa()}get(){return sc()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ni(i,e){Ke(i.emulator,"Emulator should always be set here");const{url:n}=i.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gs{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;He("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;He("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;He("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ac={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lc=new sn(3e4,6e4);function ot(i,e){return i.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:i.tenantId}):e}async function at(i,e,n,r,o={}){return Ks(i,o,async()=>{let l={},h={};r&&(e==="GET"?h=r:l={body:JSON.stringify(r)});const p=rn(Object.assign({key:i.config.apiKey},h)).slice(1),v=await i._getAdditionalHeaders();v["Content-Type"]="application/json",i.languageCode&&(v["X-Firebase-Locale"]=i.languageCode);const E=Object.assign({method:e,headers:v},l);return Na()||(E.referrerPolicy="no-referrer"),Gs.fetch()(qs(i,i.config.apiHost,n,p),E)})}async function Ks(i,e,n){i._canInitEmulator=!1;const r=Object.assign(Object.assign({},ac),e);try{const o=new hc(i),l=await Promise.race([n(),o.promise]);o.clearNetworkTimeout();const h=await l.json();if("needConfirmation"in h)throw bn(i,"account-exists-with-different-credential",h);if(l.ok&&!("errorMessage"in h))return h;{const p=l.ok?h.errorMessage:h.error.message,[v,E]=p.split(" : ");if(v==="FEDERATED_USER_ID_ALREADY_LINKED")throw bn(i,"credential-already-in-use",h);if(v==="EMAIL_EXISTS")throw bn(i,"email-already-in-use",h);if(v==="USER_DISABLED")throw bn(i,"user-disabled",h);const S=r[v]||v.toLowerCase().replace(/[_\s]+/g,"-");if(E)throw Ws(i,S,E);Oe(i,S)}}catch(o){if(o instanceof qe)throw o;Oe(i,"network-request-failed",{message:String(o)})}}async function on(i,e,n,r,o={}){const l=await at(i,e,n,r,o);return"mfaPendingCredential"in l&&Oe(i,"multi-factor-auth-required",{_serverResponse:l}),l}function qs(i,e,n,r){const o=`${e}${n}?${r}`;return i.config.emulator?Ni(i.config,o):`${i.config.apiScheme}://${o}`}function cc(i){switch(i){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class hc{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(xe(this.auth,"network-request-failed")),lc.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function bn(i,e,n){const r={appName:i.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const o=xe(i,e,r);return o.customData._tokenResponse=n,o}function Zr(i){return i!==void 0&&i.enterprise!==void 0}class uc{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return cc(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}}async function dc(i,e){return at(i,"GET","/v2/recaptchaConfig",ot(i,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fc(i,e){return at(i,"POST","/v1/accounts:delete",e)}async function Js(i,e){return at(i,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qt(i){if(i)try{const e=new Date(Number(i));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function pc(i,e=!1){const n=Ue(i),r=await n.getIdToken(e),o=Li(r);P(o&&o.exp&&o.auth_time&&o.iat,n.auth,"internal-error");const l=typeof o.firebase=="object"?o.firebase:void 0,h=l==null?void 0:l.sign_in_provider;return{claims:o,token:r,authTime:qt(pi(o.auth_time)),issuedAtTime:qt(pi(o.iat)),expirationTime:qt(pi(o.exp)),signInProvider:h||null,signInSecondFactor:(l==null?void 0:l.sign_in_second_factor)||null}}function pi(i){return Number(i)*1e3}function Li(i){const[e,n,r]=i.split(".");if(e===void 0||n===void 0||r===void 0)return Sn("JWT malformed, contained fewer than 3 sections"),null;try{const o=Ls(n);return o?JSON.parse(o):(Sn("Failed to decode base64 JWT payload"),null)}catch(o){return Sn("Caught error parsing JWT payload as JSON",o==null?void 0:o.toString()),null}}function es(i){const e=Li(i);return P(e,"internal-error"),P(typeof e.exp<"u","internal-error"),P(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zt(i,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof qe&&gc(r)&&i.auth.currentUser===i&&await i.auth.signOut(),r}}function gc({code:i}){return i==="auth/user-disabled"||i==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mc{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const o=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,o)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ti{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=qt(this.lastLoginAt),this.creationTime=qt(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ln(i){var e;const n=i.auth,r=await i.getIdToken(),o=await Zt(i,Js(n,{idToken:r}));P(o==null?void 0:o.users.length,n,"internal-error");const l=o.users[0];i._notifyReloadListener(l);const h=!((e=l.providerUserInfo)===null||e===void 0)&&e.length?Xs(l.providerUserInfo):[],p=_c(i.providerData,h),v=i.isAnonymous,E=!(i.email&&l.passwordHash)&&!(p!=null&&p.length),S=v?E:!1,O={uid:l.localId,displayName:l.displayName||null,photoURL:l.photoUrl||null,email:l.email||null,emailVerified:l.emailVerified||!1,phoneNumber:l.phoneNumber||null,tenantId:l.tenantId||null,providerData:p,metadata:new Ti(l.createdAt,l.lastLoginAt),isAnonymous:S};Object.assign(i,O)}async function vc(i){const e=Ue(i);await Ln(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function _c(i,e){return[...i.filter(r=>!e.some(o=>o.providerId===r.providerId)),...e]}function Xs(i){return i.map(e=>{var{providerId:n}=e,r=Oi(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yc(i,e){const n=await Ks(i,{},async()=>{const r=rn({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:o,apiKey:l}=i.config,h=qs(i,o,"/v1/token",`key=${l}`),p=await i._getAdditionalHeaders();return p["Content-Type"]="application/x-www-form-urlencoded",Gs.fetch()(h,{method:"POST",headers:p,body:r})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function wc(i,e){return at(i,"POST","/v2/accounts:revokeToken",ot(i,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){P(e.idToken,"internal-error"),P(typeof e.idToken<"u","internal-error"),P(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):es(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){P(e.length!==0,"internal-error");const n=es(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(P(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:o,expiresIn:l}=await yc(e,n);this.updateTokensAndExpiration(r,o,Number(l))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:o,expirationTime:l}=n,h=new At;return r&&(P(typeof r=="string","internal-error",{appName:e}),h.refreshToken=r),o&&(P(typeof o=="string","internal-error",{appName:e}),h.accessToken=o),l&&(P(typeof l=="number","internal-error",{appName:e}),h.expirationTime=l),h}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new At,this.toJSON())}_performRefresh(){return He("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qe(i,e){P(typeof i=="string"||typeof i>"u","internal-error",{appName:e})}class $e{constructor(e){var{uid:n,auth:r,stsTokenManager:o}=e,l=Oi(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new mc(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=o,this.accessToken=o.accessToken,this.displayName=l.displayName||null,this.email=l.email||null,this.emailVerified=l.emailVerified||!1,this.phoneNumber=l.phoneNumber||null,this.photoURL=l.photoURL||null,this.isAnonymous=l.isAnonymous||!1,this.tenantId=l.tenantId||null,this.providerData=l.providerData?[...l.providerData]:[],this.metadata=new Ti(l.createdAt||void 0,l.lastLoginAt||void 0)}async getIdToken(e){const n=await Zt(this,this.stsTokenManager.getToken(this.auth,e));return P(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return pc(this,e)}reload(){return vc(this)}_assign(e){this!==e&&(P(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new $e(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){P(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await Ln(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Le(this.auth.app))return Promise.reject(We(this.auth));const e=await this.getIdToken();return await Zt(this,fc(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,o,l,h,p,v,E,S;const O=(r=n.displayName)!==null&&r!==void 0?r:void 0,C=(o=n.email)!==null&&o!==void 0?o:void 0,$=(l=n.phoneNumber)!==null&&l!==void 0?l:void 0,R=(h=n.photoURL)!==null&&h!==void 0?h:void 0,M=(p=n.tenantId)!==null&&p!==void 0?p:void 0,D=(v=n._redirectEventId)!==null&&v!==void 0?v:void 0,ee=(E=n.createdAt)!==null&&E!==void 0?E:void 0,U=(S=n.lastLoginAt)!==null&&S!==void 0?S:void 0,{uid:j,emailVerified:ae,isAnonymous:q,providerData:G,stsTokenManager:_}=n;P(j&&_,e,"internal-error");const u=At.fromJSON(this.name,_);P(typeof j=="string",e,"internal-error"),Qe(O,e.name),Qe(C,e.name),P(typeof ae=="boolean",e,"internal-error"),P(typeof q=="boolean",e,"internal-error"),Qe($,e.name),Qe(R,e.name),Qe(M,e.name),Qe(D,e.name),Qe(ee,e.name),Qe(U,e.name);const f=new $e({uid:j,auth:e,email:C,emailVerified:ae,displayName:O,isAnonymous:q,photoURL:R,phoneNumber:$,tenantId:M,stsTokenManager:u,createdAt:ee,lastLoginAt:U});return G&&Array.isArray(G)&&(f.providerData=G.map(g=>Object.assign({},g))),D&&(f._redirectEventId=D),f}static async _fromIdTokenResponse(e,n,r=!1){const o=new At;o.updateFromServerResponse(n);const l=new $e({uid:n.localId,auth:e,stsTokenManager:o,isAnonymous:r});return await Ln(l),l}static async _fromGetAccountInfoResponse(e,n,r){const o=n.users[0];P(o.localId!==void 0,"internal-error");const l=o.providerUserInfo!==void 0?Xs(o.providerUserInfo):[],h=!(o.email&&o.passwordHash)&&!(l!=null&&l.length),p=new At;p.updateFromIdToken(r);const v=new $e({uid:o.localId,auth:e,stsTokenManager:p,isAnonymous:h}),E={uid:o.localId,displayName:o.displayName||null,photoURL:o.photoUrl||null,email:o.email||null,emailVerified:o.emailVerified||!1,phoneNumber:o.phoneNumber||null,tenantId:o.tenantId||null,providerData:l,metadata:new Ti(o.createdAt,o.lastLoginAt),isAnonymous:!(o.email&&o.passwordHash)&&!(l!=null&&l.length)};return Object.assign(v,E),v}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ts=new Map;function ze(i){Ke(i instanceof Function,"Expected a class definition");let e=ts.get(i);return e?(Ke(e instanceof i,"Instance stored in cache mismatched with class"),e):(e=new i,ts.set(i,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ys{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Ys.type="NONE";const ns=Ys;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cn(i,e,n){return`firebase:${i}:${e}:${n}`}class St{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:o,name:l}=this.auth;this.fullUserKey=Cn(this.userKey,o.apiKey,l),this.fullPersistenceKey=Cn("persistence",o.apiKey,l),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?$e._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new St(ze(ns),e,r);const o=(await Promise.all(n.map(async E=>{if(await E._isAvailable())return E}))).filter(E=>E);let l=o[0]||ze(ns);const h=Cn(r,e.config.apiKey,e.name);let p=null;for(const E of n)try{const S=await E._get(h);if(S){const O=$e._fromJSON(e,S);E!==l&&(p=O),l=E;break}}catch{}const v=o.filter(E=>E._shouldAllowMigration);return!l._shouldAllowMigration||!v.length?new St(l,e,r):(l=v[0],p&&await l._set(h,p.toJSON()),await Promise.all(n.map(async E=>{if(E!==l)try{await E._remove(h)}catch{}})),new St(l,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function is(i){const e=i.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(to(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Qs(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(io(e))return"Blackberry";if(ro(e))return"Webos";if(Zs(e))return"Safari";if((e.includes("chrome/")||eo(e))&&!e.includes("edge/"))return"Chrome";if(no(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=i.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Qs(i=Ie()){return/firefox\//i.test(i)}function Zs(i=Ie()){const e=i.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function eo(i=Ie()){return/crios\//i.test(i)}function to(i=Ie()){return/iemobile/i.test(i)}function no(i=Ie()){return/android/i.test(i)}function io(i=Ie()){return/blackberry/i.test(i)}function ro(i=Ie()){return/webos/i.test(i)}function xi(i=Ie()){return/iphone|ipad|ipod/i.test(i)||/macintosh/i.test(i)&&/mobile/i.test(i)}function Ic(i=Ie()){var e;return xi(i)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function Ec(){return Ma()&&document.documentMode===10}function so(i=Ie()){return xi(i)||no(i)||ro(i)||io(i)||/windows phone/i.test(i)||to(i)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oo(i,e=[]){let n;switch(i){case"Browser":n=is(Ie());break;case"Worker":n=`${is(Ie())}-${i}`;break;default:n=i}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Pt}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tc{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=l=>new Promise((h,p)=>{try{const v=e(l);h(v)}catch(v){p(v)}});r.onAbort=n,this.queue.push(r);const o=this.queue.length-1;return()=>{this.queue[o]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const o of n)try{o()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bc(i,e={}){return at(i,"GET","/v2/passwordPolicy",ot(i,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ac=6;class Sc{constructor(e){var n,r,o,l;const h=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=h.minPasswordLength)!==null&&n!==void 0?n:Ac,h.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=h.maxPasswordLength),h.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=h.containsLowercaseCharacter),h.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=h.containsUppercaseCharacter),h.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=h.containsNumericCharacter),h.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=h.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(o=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&o!==void 0?o:"",this.forceUpgradeOnSignin=(l=e.forceUpgradeOnSignin)!==null&&l!==void 0?l:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,o,l,h,p;const v={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,v),this.validatePasswordCharacterOptions(e,v),v.isValid&&(v.isValid=(n=v.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),v.isValid&&(v.isValid=(r=v.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),v.isValid&&(v.isValid=(o=v.containsLowercaseLetter)!==null&&o!==void 0?o:!0),v.isValid&&(v.isValid=(l=v.containsUppercaseLetter)!==null&&l!==void 0?l:!0),v.isValid&&(v.isValid=(h=v.containsNumericCharacter)!==null&&h!==void 0?h:!0),v.isValid&&(v.isValid=(p=v.containsNonAlphanumericCharacter)!==null&&p!==void 0?p:!0),v}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,o=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),o&&(n.meetsMaxPasswordLength=e.length<=o)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let o=0;o<e.length;o++)r=e.charAt(o),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,o,l){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=o)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=l))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cc{constructor(e,n,r,o){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=o,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new rs(this),this.idTokenSubscription=new rs(this),this.beforeStateQueue=new Tc(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=zs,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=o.sdkClientVersion}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=ze(n)),this._initializationPromise=this.queue(async()=>{var r,o;if(!this._deleted&&(this.persistenceManager=await St.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((o=this.currentUser)===null||o===void 0?void 0:o.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Js(this,{idToken:e}),r=await $e._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(Le(this.app)){const h=this.app.settings.authIdToken;return h?new Promise(p=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(h).then(p,p))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let o=r,l=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const h=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,p=o==null?void 0:o._redirectEventId,v=await this.tryRedirectSignIn(e);(!h||h===p)&&(v!=null&&v.user)&&(o=v.user,l=!0)}if(!o)return this.directlySetCurrentUser(null);if(!o._redirectEventId){if(l)try{await this.beforeStateQueue.runMiddleware(o)}catch(h){o=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(h))}return o?this.reloadAndSetCurrentUserOrClear(o):this.directlySetCurrentUser(null)}return P(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===o._redirectEventId?this.directlySetCurrentUser(o):this.reloadAndSetCurrentUserOrClear(o)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Ln(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=oc()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Le(this.app))return Promise.reject(We(this));const n=e?Ue(e):null;return n&&P(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&P(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Le(this.app)?Promise.reject(We(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Le(this.app)?Promise.reject(We(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ze(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await bc(this),n=new Sc(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new nn("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await wc(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&ze(e)||this._popupRedirectResolver;P(n,this,"argument-error"),this.redirectPersistenceManager=await St.create(this,[ze(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,o){if(this._deleted)return()=>{};const l=typeof n=="function"?n:n.next.bind(n);let h=!1;const p=this._isInitialized?Promise.resolve():this._initializationPromise;if(P(p,this,"internal-error"),p.then(()=>{h||l(this.currentUser)}),typeof n=="function"){const v=e.addObserver(n,r,o);return()=>{h=!0,v()}}else{const v=e.addObserver(n);return()=>{h=!0,v()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return P(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=oo(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const o=await this._getAppCheckToken();return o&&(n["X-Firebase-AppCheck"]=o),n}async _getAppCheckToken(){var e;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&ic(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function gt(i){return Ue(i)}class rs{constructor(e){this.auth=e,this.observer=null,this.addObserver=$a(n=>this.observer=n)}get next(){return P(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let jn={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function kc(i){jn=i}function ao(i){return jn.loadJS(i)}function Rc(){return jn.recaptchaEnterpriseScript}function Pc(){return jn.gapiScript}function Oc(i){return`__${i}${Math.floor(Math.random()*1e6)}`}const Dc="recaptcha-enterprise",Nc="NO_RECAPTCHA";class Lc{constructor(e){this.type=Dc,this.auth=gt(e)}async verify(e="verify",n=!1){async function r(l){if(!n){if(l.tenantId==null&&l._agentRecaptchaConfig!=null)return l._agentRecaptchaConfig.siteKey;if(l.tenantId!=null&&l._tenantRecaptchaConfigs[l.tenantId]!==void 0)return l._tenantRecaptchaConfigs[l.tenantId].siteKey}return new Promise(async(h,p)=>{dc(l,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(v=>{if(v.recaptchaKey===void 0)p(new Error("recaptcha Enterprise site key undefined"));else{const E=new uc(v);return l.tenantId==null?l._agentRecaptchaConfig=E:l._tenantRecaptchaConfigs[l.tenantId]=E,h(E.siteKey)}}).catch(v=>{p(v)})})}function o(l,h,p){const v=window.grecaptcha;Zr(v)?v.enterprise.ready(()=>{v.enterprise.execute(l,{action:e}).then(E=>{h(E)}).catch(()=>{h(Nc)})}):p(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((l,h)=>{r(this.auth).then(p=>{if(!n&&Zr(window.grecaptcha))o(p,l,h);else{if(typeof window>"u"){h(new Error("RecaptchaVerifier is only supported in browser"));return}let v=Rc();v.length!==0&&(v+=p),ao(v).then(()=>{o(p,l,h)}).catch(E=>{h(E)})}}).catch(p=>{h(p)})})}}async function ss(i,e,n,r=!1){const o=new Lc(i);let l;try{l=await o.verify(n)}catch{l=await o.verify(n,!0)}const h=Object.assign({},e);return r?Object.assign(h,{captchaResp:l}):Object.assign(h,{captchaResponse:l}),Object.assign(h,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(h,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),h}async function bi(i,e,n,r){var o;if(!((o=i._getRecaptchaConfig())===null||o===void 0)&&o.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const l=await ss(i,e,n,n==="getOobCode");return r(i,l)}else return r(i,e).catch(async l=>{if(l.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const h=await ss(i,e,n,n==="getOobCode");return r(i,h)}else return Promise.reject(l)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xc(i,e){const n=Ri(i,"auth");if(n.isInitialized()){const o=n.getImmediate(),l=n.getOptions();if(Dn(l,e??{}))return o;Oe(o,"already-initialized")}return n.initialize({options:e})}function Mc(i,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(ze);e!=null&&e.errorMap&&i._updateErrorMap(e.errorMap),i._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Uc(i,e,n){const r=gt(i);P(r._canInitEmulator,r,"emulator-config-failed"),P(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const o=!1,l=lo(e),{host:h,port:p}=Fc(e),v=p===null?"":`:${p}`;r.config.emulator={url:`${l}//${h}${v}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:h,port:p,protocol:l.replace(":",""),options:Object.freeze({disableWarnings:o})}),jc()}function lo(i){const e=i.indexOf(":");return e<0?"":i.substr(0,e+1)}function Fc(i){const e=lo(i),n=/(\/\/)?([^?#/]+)/.exec(i.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",o=/^(\[[^\]]+\])(:|$)/.exec(r);if(o){const l=o[1];return{host:l,port:os(r.substr(l.length+1))}}else{const[l,h]=r.split(":");return{host:l,port:os(h)}}}function os(i){if(!i)return null;const e=Number(i);return isNaN(e)?null:e}function jc(){function i(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",i):i())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mi{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return He("not implemented")}_getIdTokenResponse(e){return He("not implemented")}_linkToIdToken(e,n){return He("not implemented")}_getReauthenticationResolver(e){return He("not implemented")}}async function Bc(i,e){return at(i,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vc(i,e){return on(i,"POST","/v1/accounts:signInWithPassword",ot(i,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hc(i,e){return on(i,"POST","/v1/accounts:signInWithEmailLink",ot(i,e))}async function $c(i,e){return on(i,"POST","/v1/accounts:signInWithEmailLink",ot(i,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class en extends Mi{constructor(e,n,r,o=null){super("password",r),this._email=e,this._password=n,this._tenantId=o}static _fromEmailAndPassword(e,n){return new en(e,n,"password")}static _fromEmailAndCode(e,n,r=null){return new en(e,n,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return bi(e,n,"signInWithPassword",Vc);case"emailLink":return Hc(e,{email:this._email,oobCode:this._password});default:Oe(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const r={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return bi(e,r,"signUpPassword",Bc);case"emailLink":return $c(e,{idToken:n,email:this._email,oobCode:this._password});default:Oe(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ct(i,e){return on(i,"POST","/v1/accounts:signInWithIdp",ot(i,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zc="http://localhost";class ft extends Mi{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new ft(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Oe("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:o}=n,l=Oi(n,["providerId","signInMethod"]);if(!r||!o)return null;const h=new ft(r,o);return h.idToken=l.idToken||void 0,h.accessToken=l.accessToken||void 0,h.secret=l.secret,h.nonce=l.nonce,h.pendingToken=l.pendingToken||null,h}_getIdTokenResponse(e){const n=this.buildRequest();return Ct(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Ct(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Ct(e,n)}buildRequest(){const e={requestUri:zc,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=rn(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wc(i){switch(i){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function Gc(i){const e=Gt(Kt(i)).link,n=e?Gt(Kt(e)).deep_link_id:null,r=Gt(Kt(i)).deep_link_id;return(r?Gt(Kt(r)).link:null)||r||n||e||i}class Ui{constructor(e){var n,r,o,l,h,p;const v=Gt(Kt(e)),E=(n=v.apiKey)!==null&&n!==void 0?n:null,S=(r=v.oobCode)!==null&&r!==void 0?r:null,O=Wc((o=v.mode)!==null&&o!==void 0?o:null);P(E&&S&&O,"argument-error"),this.apiKey=E,this.operation=O,this.code=S,this.continueUrl=(l=v.continueUrl)!==null&&l!==void 0?l:null,this.languageCode=(h=v.languageCode)!==null&&h!==void 0?h:null,this.tenantId=(p=v.tenantId)!==null&&p!==void 0?p:null}static parseLink(e){const n=Gc(e);try{return new Ui(n)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(){this.providerId=Ot.PROVIDER_ID}static credential(e,n){return en._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const r=Ui.parseLink(n);return P(r,"argument-error"),en._fromEmailAndCode(e,r.code,r.tenantId)}}Ot.PROVIDER_ID="password";Ot.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Ot.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class co{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an extends co{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze extends an{constructor(){super("facebook.com")}static credential(e){return ft._fromParams({providerId:Ze.PROVIDER_ID,signInMethod:Ze.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Ze.credentialFromTaggedObject(e)}static credentialFromError(e){return Ze.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Ze.credential(e.oauthAccessToken)}catch{return null}}}Ze.FACEBOOK_SIGN_IN_METHOD="facebook.com";Ze.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ve extends an{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return ft._fromParams({providerId:Ve.PROVIDER_ID,signInMethod:Ve.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return Ve.credentialFromTaggedObject(e)}static credentialFromError(e){return Ve.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return Ve.credential(n,r)}catch{return null}}}Ve.GOOGLE_SIGN_IN_METHOD="google.com";Ve.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class et extends an{constructor(){super("github.com")}static credential(e){return ft._fromParams({providerId:et.PROVIDER_ID,signInMethod:et.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return et.credentialFromTaggedObject(e)}static credentialFromError(e){return et.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return et.credential(e.oauthAccessToken)}catch{return null}}}et.GITHUB_SIGN_IN_METHOD="github.com";et.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt extends an{constructor(){super("twitter.com")}static credential(e,n){return ft._fromParams({providerId:tt.PROVIDER_ID,signInMethod:tt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return tt.credentialFromTaggedObject(e)}static credentialFromError(e){return tt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return tt.credential(n,r)}catch{return null}}}tt.TWITTER_SIGN_IN_METHOD="twitter.com";tt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kc(i,e){return on(i,"POST","/v1/accounts:signUp",ot(i,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,o=!1){const l=await $e._fromIdTokenResponse(e,r,o),h=as(r);return new pt({user:l,providerId:h,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const o=as(r);return new pt({user:e,providerId:o,_tokenResponse:r,operationType:n})}}function as(i){return i.providerId?i.providerId:"phoneNumber"in i?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xn extends qe{constructor(e,n,r,o){var l;super(n.code,n.message),this.operationType=r,this.user=o,Object.setPrototypeOf(this,xn.prototype),this.customData={appName:e.name,tenantId:(l=e.tenantId)!==null&&l!==void 0?l:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,o){return new xn(e,n,r,o)}}function ho(i,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(i):n._getIdTokenResponse(i)).catch(l=>{throw l.code==="auth/multi-factor-auth-required"?xn._fromErrorAndOperation(i,l,e,r):l})}async function qc(i,e,n=!1){const r=await Zt(i,e._linkToIdToken(i.auth,await i.getIdToken()),n);return pt._forOperation(i,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Jc(i,e,n=!1){const{auth:r}=i;if(Le(r.app))return Promise.reject(We(r));const o="reauthenticate";try{const l=await Zt(i,ho(r,o,e,i),n);P(l.idToken,r,"internal-error");const h=Li(l.idToken);P(h,r,"internal-error");const{sub:p}=h;return P(i.uid===p,r,"user-mismatch"),pt._forOperation(i,o,l)}catch(l){throw(l==null?void 0:l.code)==="auth/user-not-found"&&Oe(r,"user-mismatch"),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function uo(i,e,n=!1){if(Le(i.app))return Promise.reject(We(i));const r="signIn",o=await ho(i,r,e),l=await pt._fromIdTokenResponse(i,r,o);return n||await i._updateCurrentUser(l.user),l}async function Xc(i,e){return uo(gt(i),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fo(i){const e=gt(i);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function Yc(i,e,n){if(Le(i.app))return Promise.reject(We(i));const r=gt(i),h=await bi(r,{returnSecureToken:!0,email:e,password:n,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",Kc).catch(v=>{throw v.code==="auth/password-does-not-meet-requirements"&&fo(i),v}),p=await pt._fromIdTokenResponse(r,"signIn",h);return await r._updateCurrentUser(p.user),p}function Qc(i,e,n){return Le(i.app)?Promise.reject(We(i)):Xc(Ue(i),Ot.credential(e,n)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&fo(i),r})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zc(i,e){return Ue(i).setPersistence(e)}function eh(i,e,n,r){return Ue(i).onIdTokenChanged(e,n,r)}function th(i,e,n){return Ue(i).beforeAuthStateChanged(e,n)}function nh(i,e,n,r){return Ue(i).onAuthStateChanged(e,n,r)}function ih(i){return Ue(i).signOut()}const Mn="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class po{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Mn,"1"),this.storage.removeItem(Mn),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rh=1e3,sh=10;class go extends po{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=so(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),o=this.localCache[n];r!==o&&e(n,o,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((h,p,v)=>{this.notifyListeners(h,v)});return}const r=e.key;n?this.detachListener():this.stopPolling();const o=()=>{const h=this.storage.getItem(r);!n&&this.localCache[r]===h||this.notifyListeners(r,h)},l=this.storage.getItem(r);Ec()&&l!==e.newValue&&e.newValue!==e.oldValue?setTimeout(o,sh):o()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const o of Array.from(r))o(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},rh)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}go.type="LOCAL";const mo=go;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vo extends po{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}vo.type="SESSION";const _o=vo;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oh(i){return Promise.all(i.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bn{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(o=>o.isListeningto(e));if(n)return n;const r=new Bn(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:o,data:l}=n.data,h=this.handlersMap[o];if(!(h!=null&&h.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:o});const p=Array.from(h).map(async E=>E(n.origin,l)),v=await oh(p);n.ports[0].postMessage({status:"done",eventId:r,eventType:o,response:v})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Bn.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fi(i="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return i+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ah{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const o=typeof MessageChannel<"u"?new MessageChannel:null;if(!o)throw new Error("connection_unavailable");let l,h;return new Promise((p,v)=>{const E=Fi("",20);o.port1.start();const S=setTimeout(()=>{v(new Error("unsupported_event"))},r);h={messageChannel:o,onMessage(O){const C=O;if(C.data.eventId===E)switch(C.data.status){case"ack":clearTimeout(S),l=setTimeout(()=>{v(new Error("timeout"))},3e3);break;case"done":clearTimeout(l),p(C.data.response);break;default:clearTimeout(S),clearTimeout(l),v(new Error("invalid_response"));break}}},this.handlers.add(h),o.port1.addEventListener("message",h.onMessage),this.target.postMessage({eventType:e,eventId:E,data:n},[o.port2])}).finally(()=>{h&&this.removeMessageHandler(h)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Me(){return window}function lh(i){Me().location.href=i}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yo(){return typeof Me().WorkerGlobalScope<"u"&&typeof Me().importScripts=="function"}async function ch(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function hh(){var i;return((i=navigator==null?void 0:navigator.serviceWorker)===null||i===void 0?void 0:i.controller)||null}function uh(){return yo()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wo="firebaseLocalStorageDb",dh=1,Un="firebaseLocalStorage",Io="fbase_key";class ln{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function Vn(i,e){return i.transaction([Un],e?"readwrite":"readonly").objectStore(Un)}function fh(){const i=indexedDB.deleteDatabase(wo);return new ln(i).toPromise()}function Ai(){const i=indexedDB.open(wo,dh);return new Promise((e,n)=>{i.addEventListener("error",()=>{n(i.error)}),i.addEventListener("upgradeneeded",()=>{const r=i.result;try{r.createObjectStore(Un,{keyPath:Io})}catch(o){n(o)}}),i.addEventListener("success",async()=>{const r=i.result;r.objectStoreNames.contains(Un)?e(r):(r.close(),await fh(),e(await Ai()))})})}async function ls(i,e,n){const r=Vn(i,!0).put({[Io]:e,value:n});return new ln(r).toPromise()}async function ph(i,e){const n=Vn(i,!1).get(e),r=await new ln(n).toPromise();return r===void 0?null:r.value}function cs(i,e){const n=Vn(i,!0).delete(e);return new ln(n).toPromise()}const gh=800,mh=3;class Eo{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Ai(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>mh)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return yo()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Bn._getInstance(uh()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await ch(),!this.activeServiceWorker)return;this.sender=new ah(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||hh()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Ai();return await ls(e,Mn,"1"),await cs(e,Mn),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>ls(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>ph(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>cs(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(o=>{const l=Vn(o,!1).getAll();return new ln(l).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:o,value:l}of e)r.add(o),JSON.stringify(this.localCache[o])!==JSON.stringify(l)&&(this.notifyListeners(o,l),n.push(o));for(const o of Object.keys(this.localCache))this.localCache[o]&&!r.has(o)&&(this.notifyListeners(o,null),n.push(o));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const o of Array.from(r))o(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),gh)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Eo.type="LOCAL";const vh=Eo;new sn(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _h(i,e){return e?ze(e):(P(i._popupRedirectResolver,i,"argument-error"),i._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ji extends Mi{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Ct(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Ct(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Ct(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function yh(i){return uo(i.auth,new ji(i),i.bypassAuthState)}function wh(i){const{auth:e,user:n}=i;return P(n,e,"internal-error"),Jc(n,new ji(i),i.bypassAuthState)}async function Ih(i){const{auth:e,user:n}=i;return P(n,e,"internal-error"),qc(n,new ji(i),i.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class To{constructor(e,n,r,o,l=!1){this.auth=e,this.resolver=r,this.user=o,this.bypassAuthState=l,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:o,tenantId:l,error:h,type:p}=e;if(h){this.reject(h);return}const v={auth:this.auth,requestUri:n,sessionId:r,tenantId:l||void 0,postBody:o||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(p)(v))}catch(E){this.reject(E)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return yh;case"linkViaPopup":case"linkViaRedirect":return Ih;case"reauthViaPopup":case"reauthViaRedirect":return wh;default:Oe(this.auth,"internal-error")}}resolve(e){Ke(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ke(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eh=new sn(2e3,1e4);class bt extends To{constructor(e,n,r,o,l){super(e,n,o,l),this.provider=r,this.authWindow=null,this.pollId=null,bt.currentPopupAction&&bt.currentPopupAction.cancel(),bt.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return P(e,this.auth,"internal-error"),e}async onExecution(){Ke(this.filter.length===1,"Popup operations only handle one event");const e=Fi();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(xe(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(xe(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,bt.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(xe(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Eh.get())};e()}}bt.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Th="pendingRedirect",kn=new Map;class bh extends To{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=kn.get(this.auth._key());if(!e){try{const r=await Ah(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}kn.set(this.auth._key(),e)}return this.bypassAuthState||kn.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Ah(i,e){const n=kh(e),r=Ch(i);if(!await r._isAvailable())return!1;const o=await r._get(n)==="true";return await r._remove(n),o}function Sh(i,e){kn.set(i._key(),e)}function Ch(i){return ze(i._redirectPersistence)}function kh(i){return Cn(Th,i.config.apiKey,i.name)}async function Rh(i,e,n=!1){if(Le(i.app))return Promise.reject(We(i));const r=gt(i),o=_h(r,e),h=await new bh(r,o,n).execute();return h&&!n&&(delete h.user._redirectEventId,await r._persistUserIfCurrent(h.user),await r._setRedirectUser(null,e)),h}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ph=10*60*1e3;class Oh{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Dh(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!bo(e)){const o=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(xe(this.auth,o))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Ph&&this.cachedEventUids.clear(),this.cachedEventUids.has(hs(e))}saveEventToCache(e){this.cachedEventUids.add(hs(e)),this.lastProcessedEventTime=Date.now()}}function hs(i){return[i.type,i.eventId,i.sessionId,i.tenantId].filter(e=>e).join("-")}function bo({type:i,error:e}){return i==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Dh(i){switch(i.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return bo(i);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Nh(i,e={}){return at(i,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lh=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,xh=/^https?/;async function Mh(i){if(i.config.emulator)return;const{authorizedDomains:e}=await Nh(i);for(const n of e)try{if(Uh(n))return}catch{}Oe(i,"unauthorized-domain")}function Uh(i){const e=Ei(),{protocol:n,hostname:r}=new URL(e);if(i.startsWith("chrome-extension://")){const h=new URL(i);return h.hostname===""&&r===""?n==="chrome-extension:"&&i.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&h.hostname===r}if(!xh.test(n))return!1;if(Lh.test(i))return r===i;const o=i.replace(/\./g,"\\.");return new RegExp("^(.+\\."+o+"|"+o+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fh=new sn(3e4,6e4);function us(){const i=Me().___jsl;if(i!=null&&i.H){for(const e of Object.keys(i.H))if(i.H[e].r=i.H[e].r||[],i.H[e].L=i.H[e].L||[],i.H[e].r=[...i.H[e].L],i.CP)for(let n=0;n<i.CP.length;n++)i.CP[n]=null}}function jh(i){return new Promise((e,n)=>{var r,o,l;function h(){us(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{us(),n(xe(i,"network-request-failed"))},timeout:Fh.get()})}if(!((o=(r=Me().gapi)===null||r===void 0?void 0:r.iframes)===null||o===void 0)&&o.Iframe)e(gapi.iframes.getContext());else if(!((l=Me().gapi)===null||l===void 0)&&l.load)h();else{const p=Oc("iframefcb");return Me()[p]=()=>{gapi.load?h():n(xe(i,"network-request-failed"))},ao(`${Pc()}?onload=${p}`).catch(v=>n(v))}}).catch(e=>{throw Rn=null,e})}let Rn=null;function Bh(i){return Rn=Rn||jh(i),Rn}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vh=new sn(5e3,15e3),Hh="__/auth/iframe",$h="emulator/auth/iframe",zh={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Wh=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Gh(i){const e=i.config;P(e.authDomain,i,"auth-domain-config-required");const n=e.emulator?Ni(e,$h):`https://${i.config.authDomain}/${Hh}`,r={apiKey:e.apiKey,appName:i.name,v:Pt},o=Wh.get(i.config.apiHost);o&&(r.eid=o);const l=i._getFrameworks();return l.length&&(r.fw=l.join(",")),`${n}?${rn(r).slice(1)}`}async function Kh(i){const e=await Bh(i),n=Me().gapi;return P(n,i,"internal-error"),e.open({where:document.body,url:Gh(i),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:zh,dontclear:!0},r=>new Promise(async(o,l)=>{await r.restyle({setHideOnLeave:!1});const h=xe(i,"network-request-failed"),p=Me().setTimeout(()=>{l(h)},Vh.get());function v(){Me().clearTimeout(p),o(r)}r.ping(v).then(v,()=>{l(h)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qh={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Jh=500,Xh=600,Yh="_blank",Qh="http://localhost";class ds{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Zh(i,e,n,r=Jh,o=Xh){const l=Math.max((window.screen.availHeight-o)/2,0).toString(),h=Math.max((window.screen.availWidth-r)/2,0).toString();let p="";const v=Object.assign(Object.assign({},qh),{width:r.toString(),height:o.toString(),top:l,left:h}),E=Ie().toLowerCase();n&&(p=eo(E)?Yh:n),Qs(E)&&(e=e||Qh,v.scrollbars="yes");const S=Object.entries(v).reduce((C,[$,R])=>`${C}${$}=${R},`,"");if(Ic(E)&&p!=="_self")return eu(e||"",p),new ds(null);const O=window.open(e||"",p,S);P(O,i,"popup-blocked");try{O.focus()}catch{}return new ds(O)}function eu(i,e){const n=document.createElement("a");n.href=i,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tu="__/auth/handler",nu="emulator/auth/handler",iu=encodeURIComponent("fac");async function fs(i,e,n,r,o,l){P(i.config.authDomain,i,"auth-domain-config-required"),P(i.config.apiKey,i,"invalid-api-key");const h={apiKey:i.config.apiKey,appName:i.name,authType:n,redirectUrl:r,v:Pt,eventId:o};if(e instanceof co){e.setDefaultLanguage(i.languageCode),h.providerId=e.providerId||"",Ha(e.getCustomParameters())||(h.customParameters=JSON.stringify(e.getCustomParameters()));for(const[S,O]of Object.entries({}))h[S]=O}if(e instanceof an){const S=e.getScopes().filter(O=>O!=="");S.length>0&&(h.scopes=S.join(","))}i.tenantId&&(h.tid=i.tenantId);const p=h;for(const S of Object.keys(p))p[S]===void 0&&delete p[S];const v=await i._getAppCheckToken(),E=v?`#${iu}=${encodeURIComponent(v)}`:"";return`${ru(i)}?${rn(p).slice(1)}${E}`}function ru({config:i}){return i.emulator?Ni(i,nu):`https://${i.authDomain}/${tu}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gi="webStorageSupport";class su{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=_o,this._completeRedirectFn=Rh,this._overrideRedirectResult=Sh}async _openPopup(e,n,r,o){var l;Ke((l=this.eventManagers[e._key()])===null||l===void 0?void 0:l.manager,"_initialize() not called before _openPopup()");const h=await fs(e,n,r,Ei(),o);return Zh(e,h,Fi())}async _openRedirect(e,n,r,o){await this._originValidation(e);const l=await fs(e,n,r,Ei(),o);return lh(l),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:o,promise:l}=this.eventManagers[n];return o?Promise.resolve(o):(Ke(l,"If manager is not set, promise should be"),l)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await Kh(e),r=new Oh(e);return n.register("authEvent",o=>(P(o==null?void 0:o.authEvent,e,"invalid-auth-event"),{status:r.onEvent(o.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(gi,{type:gi},o=>{var l;const h=(l=o==null?void 0:o[0])===null||l===void 0?void 0:l[gi];h!==void 0&&n(!!h),Oe(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Mh(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return so()||Zs()||xi()}}const ou=su;var ps="@firebase/auth",gs="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class au{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){P(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lu(i){switch(i){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function cu(i){kt(new dt("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),o=e.getProvider("heartbeat"),l=e.getProvider("app-check-internal"),{apiKey:h,authDomain:p}=r.options;P(h&&!h.includes(":"),"invalid-api-key",{appName:r.name});const v={apiKey:h,authDomain:p,clientPlatform:i,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:oo(i)},E=new Cc(r,o,l,v);return Mc(E,n),E},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),kt(new dt("auth-internal",e=>{const n=gt(e.getProvider("auth").getImmediate());return(r=>new au(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),rt(ps,gs,lu(i)),rt(ps,gs,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hu=5*60,uu=Us("authIdTokenMaxAge")||hu;let ms=null;const du=i=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>uu)return;const o=n==null?void 0:n.token;ms!==o&&(ms=o,await fetch(i,{method:o?"POST":"DELETE",headers:o?{Authorization:`Bearer ${o}`}:{}}))};function fu(i=Pi()){const e=Ri(i,"auth");if(e.isInitialized())return e.getImmediate();const n=xc(i,{popupRedirectResolver:ou,persistence:[vh,mo,_o]}),r=Us("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const l=new URL(r,location.origin);if(location.origin===l.origin){const h=du(l.toString());th(n,h,()=>h(n.currentUser)),eh(n,p=>h(p))}}const o=xs("auth");return o&&Uc(n,`http://${o}`),n}function pu(){var i,e;return(e=(i=document.getElementsByTagName("head"))===null||i===void 0?void 0:i[0])!==null&&e!==void 0?e:document}kc({loadJS(i){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",i),r.onload=e,r.onerror=o=>{const l=xe("internal-error");l.customData=o,n(l)},r.type="text/javascript",r.charset="UTF-8",pu().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});cu("Browser");var vs=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ao;(function(){var i;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(_,u){function f(){}f.prototype=u.prototype,_.D=u.prototype,_.prototype=new f,_.prototype.constructor=_,_.C=function(g,m,y){for(var d=Array(arguments.length-2),J=2;J<arguments.length;J++)d[J-2]=arguments[J];return u.prototype[m].apply(g,d)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function o(_,u,f){f||(f=0);var g=Array(16);if(typeof u=="string")for(var m=0;16>m;++m)g[m]=u.charCodeAt(f++)|u.charCodeAt(f++)<<8|u.charCodeAt(f++)<<16|u.charCodeAt(f++)<<24;else for(m=0;16>m;++m)g[m]=u[f++]|u[f++]<<8|u[f++]<<16|u[f++]<<24;u=_.g[0],f=_.g[1],m=_.g[2];var y=_.g[3],d=u+(y^f&(m^y))+g[0]+3614090360&4294967295;u=f+(d<<7&4294967295|d>>>25),d=y+(m^u&(f^m))+g[1]+3905402710&4294967295,y=u+(d<<12&4294967295|d>>>20),d=m+(f^y&(u^f))+g[2]+606105819&4294967295,m=y+(d<<17&4294967295|d>>>15),d=f+(u^m&(y^u))+g[3]+3250441966&4294967295,f=m+(d<<22&4294967295|d>>>10),d=u+(y^f&(m^y))+g[4]+4118548399&4294967295,u=f+(d<<7&4294967295|d>>>25),d=y+(m^u&(f^m))+g[5]+1200080426&4294967295,y=u+(d<<12&4294967295|d>>>20),d=m+(f^y&(u^f))+g[6]+2821735955&4294967295,m=y+(d<<17&4294967295|d>>>15),d=f+(u^m&(y^u))+g[7]+4249261313&4294967295,f=m+(d<<22&4294967295|d>>>10),d=u+(y^f&(m^y))+g[8]+1770035416&4294967295,u=f+(d<<7&4294967295|d>>>25),d=y+(m^u&(f^m))+g[9]+2336552879&4294967295,y=u+(d<<12&4294967295|d>>>20),d=m+(f^y&(u^f))+g[10]+4294925233&4294967295,m=y+(d<<17&4294967295|d>>>15),d=f+(u^m&(y^u))+g[11]+2304563134&4294967295,f=m+(d<<22&4294967295|d>>>10),d=u+(y^f&(m^y))+g[12]+1804603682&4294967295,u=f+(d<<7&4294967295|d>>>25),d=y+(m^u&(f^m))+g[13]+4254626195&4294967295,y=u+(d<<12&4294967295|d>>>20),d=m+(f^y&(u^f))+g[14]+2792965006&4294967295,m=y+(d<<17&4294967295|d>>>15),d=f+(u^m&(y^u))+g[15]+1236535329&4294967295,f=m+(d<<22&4294967295|d>>>10),d=u+(m^y&(f^m))+g[1]+4129170786&4294967295,u=f+(d<<5&4294967295|d>>>27),d=y+(f^m&(u^f))+g[6]+3225465664&4294967295,y=u+(d<<9&4294967295|d>>>23),d=m+(u^f&(y^u))+g[11]+643717713&4294967295,m=y+(d<<14&4294967295|d>>>18),d=f+(y^u&(m^y))+g[0]+3921069994&4294967295,f=m+(d<<20&4294967295|d>>>12),d=u+(m^y&(f^m))+g[5]+3593408605&4294967295,u=f+(d<<5&4294967295|d>>>27),d=y+(f^m&(u^f))+g[10]+38016083&4294967295,y=u+(d<<9&4294967295|d>>>23),d=m+(u^f&(y^u))+g[15]+3634488961&4294967295,m=y+(d<<14&4294967295|d>>>18),d=f+(y^u&(m^y))+g[4]+3889429448&4294967295,f=m+(d<<20&4294967295|d>>>12),d=u+(m^y&(f^m))+g[9]+568446438&4294967295,u=f+(d<<5&4294967295|d>>>27),d=y+(f^m&(u^f))+g[14]+3275163606&4294967295,y=u+(d<<9&4294967295|d>>>23),d=m+(u^f&(y^u))+g[3]+4107603335&4294967295,m=y+(d<<14&4294967295|d>>>18),d=f+(y^u&(m^y))+g[8]+1163531501&4294967295,f=m+(d<<20&4294967295|d>>>12),d=u+(m^y&(f^m))+g[13]+2850285829&4294967295,u=f+(d<<5&4294967295|d>>>27),d=y+(f^m&(u^f))+g[2]+4243563512&4294967295,y=u+(d<<9&4294967295|d>>>23),d=m+(u^f&(y^u))+g[7]+1735328473&4294967295,m=y+(d<<14&4294967295|d>>>18),d=f+(y^u&(m^y))+g[12]+2368359562&4294967295,f=m+(d<<20&4294967295|d>>>12),d=u+(f^m^y)+g[5]+4294588738&4294967295,u=f+(d<<4&4294967295|d>>>28),d=y+(u^f^m)+g[8]+2272392833&4294967295,y=u+(d<<11&4294967295|d>>>21),d=m+(y^u^f)+g[11]+1839030562&4294967295,m=y+(d<<16&4294967295|d>>>16),d=f+(m^y^u)+g[14]+4259657740&4294967295,f=m+(d<<23&4294967295|d>>>9),d=u+(f^m^y)+g[1]+2763975236&4294967295,u=f+(d<<4&4294967295|d>>>28),d=y+(u^f^m)+g[4]+1272893353&4294967295,y=u+(d<<11&4294967295|d>>>21),d=m+(y^u^f)+g[7]+4139469664&4294967295,m=y+(d<<16&4294967295|d>>>16),d=f+(m^y^u)+g[10]+3200236656&4294967295,f=m+(d<<23&4294967295|d>>>9),d=u+(f^m^y)+g[13]+681279174&4294967295,u=f+(d<<4&4294967295|d>>>28),d=y+(u^f^m)+g[0]+3936430074&4294967295,y=u+(d<<11&4294967295|d>>>21),d=m+(y^u^f)+g[3]+3572445317&4294967295,m=y+(d<<16&4294967295|d>>>16),d=f+(m^y^u)+g[6]+76029189&4294967295,f=m+(d<<23&4294967295|d>>>9),d=u+(f^m^y)+g[9]+3654602809&4294967295,u=f+(d<<4&4294967295|d>>>28),d=y+(u^f^m)+g[12]+3873151461&4294967295,y=u+(d<<11&4294967295|d>>>21),d=m+(y^u^f)+g[15]+530742520&4294967295,m=y+(d<<16&4294967295|d>>>16),d=f+(m^y^u)+g[2]+3299628645&4294967295,f=m+(d<<23&4294967295|d>>>9),d=u+(m^(f|~y))+g[0]+4096336452&4294967295,u=f+(d<<6&4294967295|d>>>26),d=y+(f^(u|~m))+g[7]+1126891415&4294967295,y=u+(d<<10&4294967295|d>>>22),d=m+(u^(y|~f))+g[14]+2878612391&4294967295,m=y+(d<<15&4294967295|d>>>17),d=f+(y^(m|~u))+g[5]+4237533241&4294967295,f=m+(d<<21&4294967295|d>>>11),d=u+(m^(f|~y))+g[12]+1700485571&4294967295,u=f+(d<<6&4294967295|d>>>26),d=y+(f^(u|~m))+g[3]+2399980690&4294967295,y=u+(d<<10&4294967295|d>>>22),d=m+(u^(y|~f))+g[10]+4293915773&4294967295,m=y+(d<<15&4294967295|d>>>17),d=f+(y^(m|~u))+g[1]+2240044497&4294967295,f=m+(d<<21&4294967295|d>>>11),d=u+(m^(f|~y))+g[8]+1873313359&4294967295,u=f+(d<<6&4294967295|d>>>26),d=y+(f^(u|~m))+g[15]+4264355552&4294967295,y=u+(d<<10&4294967295|d>>>22),d=m+(u^(y|~f))+g[6]+2734768916&4294967295,m=y+(d<<15&4294967295|d>>>17),d=f+(y^(m|~u))+g[13]+1309151649&4294967295,f=m+(d<<21&4294967295|d>>>11),d=u+(m^(f|~y))+g[4]+4149444226&4294967295,u=f+(d<<6&4294967295|d>>>26),d=y+(f^(u|~m))+g[11]+3174756917&4294967295,y=u+(d<<10&4294967295|d>>>22),d=m+(u^(y|~f))+g[2]+718787259&4294967295,m=y+(d<<15&4294967295|d>>>17),d=f+(y^(m|~u))+g[9]+3951481745&4294967295,_.g[0]=_.g[0]+u&4294967295,_.g[1]=_.g[1]+(m+(d<<21&4294967295|d>>>11))&4294967295,_.g[2]=_.g[2]+m&4294967295,_.g[3]=_.g[3]+y&4294967295}r.prototype.u=function(_,u){u===void 0&&(u=_.length);for(var f=u-this.blockSize,g=this.B,m=this.h,y=0;y<u;){if(m==0)for(;y<=f;)o(this,_,y),y+=this.blockSize;if(typeof _=="string"){for(;y<u;)if(g[m++]=_.charCodeAt(y++),m==this.blockSize){o(this,g),m=0;break}}else for(;y<u;)if(g[m++]=_[y++],m==this.blockSize){o(this,g),m=0;break}}this.h=m,this.o+=u},r.prototype.v=function(){var _=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);_[0]=128;for(var u=1;u<_.length-8;++u)_[u]=0;var f=8*this.o;for(u=_.length-8;u<_.length;++u)_[u]=f&255,f/=256;for(this.u(_),_=Array(16),u=f=0;4>u;++u)for(var g=0;32>g;g+=8)_[f++]=this.g[u]>>>g&255;return _};function l(_,u){var f=p;return Object.prototype.hasOwnProperty.call(f,_)?f[_]:f[_]=u(_)}function h(_,u){this.h=u;for(var f=[],g=!0,m=_.length-1;0<=m;m--){var y=_[m]|0;g&&y==u||(f[m]=y,g=!1)}this.g=f}var p={};function v(_){return-128<=_&&128>_?l(_,function(u){return new h([u|0],0>u?-1:0)}):new h([_|0],0>_?-1:0)}function E(_){if(isNaN(_)||!isFinite(_))return O;if(0>_)return D(E(-_));for(var u=[],f=1,g=0;_>=f;g++)u[g]=_/f|0,f*=4294967296;return new h(u,0)}function S(_,u){if(_.length==0)throw Error("number format error: empty string");if(u=u||10,2>u||36<u)throw Error("radix out of range: "+u);if(_.charAt(0)=="-")return D(S(_.substring(1),u));if(0<=_.indexOf("-"))throw Error('number format error: interior "-" character');for(var f=E(Math.pow(u,8)),g=O,m=0;m<_.length;m+=8){var y=Math.min(8,_.length-m),d=parseInt(_.substring(m,m+y),u);8>y?(y=E(Math.pow(u,y)),g=g.j(y).add(E(d))):(g=g.j(f),g=g.add(E(d)))}return g}var O=v(0),C=v(1),$=v(16777216);i=h.prototype,i.m=function(){if(M(this))return-D(this).m();for(var _=0,u=1,f=0;f<this.g.length;f++){var g=this.i(f);_+=(0<=g?g:4294967296+g)*u,u*=4294967296}return _},i.toString=function(_){if(_=_||10,2>_||36<_)throw Error("radix out of range: "+_);if(R(this))return"0";if(M(this))return"-"+D(this).toString(_);for(var u=E(Math.pow(_,6)),f=this,g="";;){var m=ae(f,u).g;f=ee(f,m.j(u));var y=((0<f.g.length?f.g[0]:f.h)>>>0).toString(_);if(f=m,R(f))return y+g;for(;6>y.length;)y="0"+y;g=y+g}},i.i=function(_){return 0>_?0:_<this.g.length?this.g[_]:this.h};function R(_){if(_.h!=0)return!1;for(var u=0;u<_.g.length;u++)if(_.g[u]!=0)return!1;return!0}function M(_){return _.h==-1}i.l=function(_){return _=ee(this,_),M(_)?-1:R(_)?0:1};function D(_){for(var u=_.g.length,f=[],g=0;g<u;g++)f[g]=~_.g[g];return new h(f,~_.h).add(C)}i.abs=function(){return M(this)?D(this):this},i.add=function(_){for(var u=Math.max(this.g.length,_.g.length),f=[],g=0,m=0;m<=u;m++){var y=g+(this.i(m)&65535)+(_.i(m)&65535),d=(y>>>16)+(this.i(m)>>>16)+(_.i(m)>>>16);g=d>>>16,y&=65535,d&=65535,f[m]=d<<16|y}return new h(f,f[f.length-1]&-2147483648?-1:0)};function ee(_,u){return _.add(D(u))}i.j=function(_){if(R(this)||R(_))return O;if(M(this))return M(_)?D(this).j(D(_)):D(D(this).j(_));if(M(_))return D(this.j(D(_)));if(0>this.l($)&&0>_.l($))return E(this.m()*_.m());for(var u=this.g.length+_.g.length,f=[],g=0;g<2*u;g++)f[g]=0;for(g=0;g<this.g.length;g++)for(var m=0;m<_.g.length;m++){var y=this.i(g)>>>16,d=this.i(g)&65535,J=_.i(m)>>>16,re=_.i(m)&65535;f[2*g+2*m]+=d*re,U(f,2*g+2*m),f[2*g+2*m+1]+=y*re,U(f,2*g+2*m+1),f[2*g+2*m+1]+=d*J,U(f,2*g+2*m+1),f[2*g+2*m+2]+=y*J,U(f,2*g+2*m+2)}for(g=0;g<u;g++)f[g]=f[2*g+1]<<16|f[2*g];for(g=u;g<2*u;g++)f[g]=0;return new h(f,0)};function U(_,u){for(;(_[u]&65535)!=_[u];)_[u+1]+=_[u]>>>16,_[u]&=65535,u++}function j(_,u){this.g=_,this.h=u}function ae(_,u){if(R(u))throw Error("division by zero");if(R(_))return new j(O,O);if(M(_))return u=ae(D(_),u),new j(D(u.g),D(u.h));if(M(u))return u=ae(_,D(u)),new j(D(u.g),u.h);if(30<_.g.length){if(M(_)||M(u))throw Error("slowDivide_ only works with positive integers.");for(var f=C,g=u;0>=g.l(_);)f=q(f),g=q(g);var m=G(f,1),y=G(g,1);for(g=G(g,2),f=G(f,2);!R(g);){var d=y.add(g);0>=d.l(_)&&(m=m.add(f),y=d),g=G(g,1),f=G(f,1)}return u=ee(_,m.j(u)),new j(m,u)}for(m=O;0<=_.l(u);){for(f=Math.max(1,Math.floor(_.m()/u.m())),g=Math.ceil(Math.log(f)/Math.LN2),g=48>=g?1:Math.pow(2,g-48),y=E(f),d=y.j(u);M(d)||0<d.l(_);)f-=g,y=E(f),d=y.j(u);R(y)&&(y=C),m=m.add(y),_=ee(_,d)}return new j(m,_)}i.A=function(_){return ae(this,_).h},i.and=function(_){for(var u=Math.max(this.g.length,_.g.length),f=[],g=0;g<u;g++)f[g]=this.i(g)&_.i(g);return new h(f,this.h&_.h)},i.or=function(_){for(var u=Math.max(this.g.length,_.g.length),f=[],g=0;g<u;g++)f[g]=this.i(g)|_.i(g);return new h(f,this.h|_.h)},i.xor=function(_){for(var u=Math.max(this.g.length,_.g.length),f=[],g=0;g<u;g++)f[g]=this.i(g)^_.i(g);return new h(f,this.h^_.h)};function q(_){for(var u=_.g.length+1,f=[],g=0;g<u;g++)f[g]=_.i(g)<<1|_.i(g-1)>>>31;return new h(f,_.h)}function G(_,u){var f=u>>5;u%=32;for(var g=_.g.length-f,m=[],y=0;y<g;y++)m[y]=0<u?_.i(y+f)>>>u|_.i(y+f+1)<<32-u:_.i(y+f);return new h(m,_.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,h.prototype.add=h.prototype.add,h.prototype.multiply=h.prototype.j,h.prototype.modulo=h.prototype.A,h.prototype.compare=h.prototype.l,h.prototype.toNumber=h.prototype.m,h.prototype.toString=h.prototype.toString,h.prototype.getBits=h.prototype.i,h.fromNumber=E,h.fromString=S,Ao=h}).apply(typeof vs<"u"?vs:typeof self<"u"?self:typeof window<"u"?window:{});var An=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var i,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(t,s,a){return t==Array.prototype||t==Object.prototype||(t[s]=a.value),t};function n(t){t=[typeof globalThis=="object"&&globalThis,t,typeof window=="object"&&window,typeof self=="object"&&self,typeof An=="object"&&An];for(var s=0;s<t.length;++s){var a=t[s];if(a&&a.Math==Math)return a}throw Error("Cannot find global object")}var r=n(this);function o(t,s){if(s)e:{var a=r;t=t.split(".");for(var c=0;c<t.length-1;c++){var w=t[c];if(!(w in a))break e;a=a[w]}t=t[t.length-1],c=a[t],s=s(c),s!=c&&s!=null&&e(a,t,{configurable:!0,writable:!0,value:s})}}function l(t,s){t instanceof String&&(t+="");var a=0,c=!1,w={next:function(){if(!c&&a<t.length){var I=a++;return{value:s(I,t[I]),done:!1}}return c=!0,{done:!0,value:void 0}}};return w[Symbol.iterator]=function(){return w},w}o("Array.prototype.values",function(t){return t||function(){return l(this,function(s,a){return a})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var h=h||{},p=this||self;function v(t){var s=typeof t;return s=s!="object"?s:t?Array.isArray(t)?"array":s:"null",s=="array"||s=="object"&&typeof t.length=="number"}function E(t){var s=typeof t;return s=="object"&&t!=null||s=="function"}function S(t,s,a){return t.call.apply(t.bind,arguments)}function O(t,s,a){if(!t)throw Error();if(2<arguments.length){var c=Array.prototype.slice.call(arguments,2);return function(){var w=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(w,c),t.apply(s,w)}}return function(){return t.apply(s,arguments)}}function C(t,s,a){return C=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?S:O,C.apply(null,arguments)}function $(t,s){var a=Array.prototype.slice.call(arguments,1);return function(){var c=a.slice();return c.push.apply(c,arguments),t.apply(this,c)}}function R(t,s){function a(){}a.prototype=s.prototype,t.aa=s.prototype,t.prototype=new a,t.prototype.constructor=t,t.Qb=function(c,w,I){for(var T=Array(arguments.length-2),Z=2;Z<arguments.length;Z++)T[Z-2]=arguments[Z];return s.prototype[w].apply(c,T)}}function M(t){const s=t.length;if(0<s){const a=Array(s);for(let c=0;c<s;c++)a[c]=t[c];return a}return[]}function D(t,s){for(let a=1;a<arguments.length;a++){const c=arguments[a];if(v(c)){const w=t.length||0,I=c.length||0;t.length=w+I;for(let T=0;T<I;T++)t[w+T]=c[T]}else t.push(c)}}class ee{constructor(s,a){this.i=s,this.j=a,this.h=0,this.g=null}get(){let s;return 0<this.h?(this.h--,s=this.g,this.g=s.next,s.next=null):s=this.i(),s}}function U(t){return/^[\s\xa0]*$/.test(t)}function j(){var t=p.navigator;return t&&(t=t.userAgent)?t:""}function ae(t){return ae[" "](t),t}ae[" "]=function(){};var q=j().indexOf("Gecko")!=-1&&!(j().toLowerCase().indexOf("webkit")!=-1&&j().indexOf("Edge")==-1)&&!(j().indexOf("Trident")!=-1||j().indexOf("MSIE")!=-1)&&j().indexOf("Edge")==-1;function G(t,s,a){for(const c in t)s.call(a,t[c],c,t)}function _(t,s){for(const a in t)s.call(void 0,t[a],a,t)}function u(t){const s={};for(const a in t)s[a]=t[a];return s}const f="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function g(t,s){let a,c;for(let w=1;w<arguments.length;w++){c=arguments[w];for(a in c)t[a]=c[a];for(let I=0;I<f.length;I++)a=f[I],Object.prototype.hasOwnProperty.call(c,a)&&(t[a]=c[a])}}function m(t){var s=1;t=t.split(":");const a=[];for(;0<s&&t.length;)a.push(t.shift()),s--;return t.length&&a.push(t.join(":")),a}function y(t){p.setTimeout(()=>{throw t},0)}function d(){var t=se;let s=null;return t.g&&(s=t.g,t.g=t.g.next,t.g||(t.h=null),s.next=null),s}class J{constructor(){this.h=this.g=null}add(s,a){const c=re.get();c.set(s,a),this.h?this.h.next=c:this.g=c,this.h=c}}var re=new ee(()=>new Ae,t=>t.reset());class Ae{constructor(){this.next=this.g=this.h=null}set(s,a){this.h=s,this.g=a,this.next=null}reset(){this.next=this.g=this.h=null}}let me,X=!1,se=new J,oe=()=>{const t=p.Promise.resolve(void 0);me=()=>{t.then(Se)}};var Se=()=>{for(var t;t=d();){try{t.h.call(t.g)}catch(a){y(a)}var s=re;s.j(t),100>s.h&&(s.h++,t.next=s.g,s.g=t)}X=!1};function he(){this.s=this.s,this.C=this.C}he.prototype.s=!1,he.prototype.ma=function(){this.s||(this.s=!0,this.N())},he.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function B(t,s){this.type=t,this.g=this.target=s,this.defaultPrevented=!1}B.prototype.h=function(){this.defaultPrevented=!0};var z=function(){if(!p.addEventListener||!Object.defineProperty)return!1;var t=!1,s=Object.defineProperty({},"passive",{get:function(){t=!0}});try{const a=()=>{};p.addEventListener("test",a,s),p.removeEventListener("test",a,s)}catch{}return t}();function N(t,s){if(B.call(this,t?t.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,t){var a=this.type=t.type,c=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:null;if(this.target=t.target||t.srcElement,this.g=s,s=t.relatedTarget){if(q){e:{try{ae(s.nodeName);var w=!0;break e}catch{}w=!1}w||(s=null)}}else a=="mouseover"?s=t.fromElement:a=="mouseout"&&(s=t.toElement);this.relatedTarget=s,c?(this.clientX=c.clientX!==void 0?c.clientX:c.pageX,this.clientY=c.clientY!==void 0?c.clientY:c.pageY,this.screenX=c.screenX||0,this.screenY=c.screenY||0):(this.clientX=t.clientX!==void 0?t.clientX:t.pageX,this.clientY=t.clientY!==void 0?t.clientY:t.pageY,this.screenX=t.screenX||0,this.screenY=t.screenY||0),this.button=t.button,this.key=t.key||"",this.ctrlKey=t.ctrlKey,this.altKey=t.altKey,this.shiftKey=t.shiftKey,this.metaKey=t.metaKey,this.pointerId=t.pointerId||0,this.pointerType=typeof t.pointerType=="string"?t.pointerType:k[t.pointerType]||"",this.state=t.state,this.i=t,t.defaultPrevented&&N.aa.h.call(this)}}R(N,B);var k={2:"touch",3:"pen",4:"mouse"};N.prototype.h=function(){N.aa.h.call(this);var t=this.i;t.preventDefault?t.preventDefault():t.returnValue=!1};var F="closure_listenable_"+(1e6*Math.random()|0),ue=0;function te(t,s,a,c,w){this.listener=t,this.proxy=null,this.src=s,this.type=a,this.capture=!!c,this.ha=w,this.key=++ue,this.da=this.fa=!1}function le(t){t.da=!0,t.listener=null,t.proxy=null,t.src=null,t.ha=null}function Ee(t){this.src=t,this.g={},this.h=0}Ee.prototype.add=function(t,s,a,c,w){var I=t.toString();t=this.g[I],t||(t=this.g[I]=[],this.h++);var T=mt(t,s,c,w);return-1<T?(s=t[T],a||(s.fa=!1)):(s=new te(s,this.src,I,!!c,w),s.fa=a,t.push(s)),s};function Ce(t,s){var a=s.type;if(a in t.g){var c=t.g[a],w=Array.prototype.indexOf.call(c,s,void 0),I;(I=0<=w)&&Array.prototype.splice.call(c,w,1),I&&(le(s),t.g[a].length==0&&(delete t.g[a],t.h--))}}function mt(t,s,a,c){for(var w=0;w<t.length;++w){var I=t[w];if(!I.da&&I.listener==s&&I.capture==!!a&&I.ha==c)return w}return-1}var vt="closure_lm_"+(1e6*Math.random()|0),_t={};function $i(t,s,a,c,w){if(Array.isArray(s)){for(var I=0;I<s.length;I++)$i(t,s[I],a,c,w);return null}return a=Gi(a),t&&t[F]?t.K(s,a,E(c)?!!c.capture:!1,w):Oo(t,s,a,!1,c,w)}function Oo(t,s,a,c,w,I){if(!s)throw Error("Invalid event type");var T=E(w)?!!w.capture:!!w,Z=$n(t);if(Z||(t[vt]=Z=new Ee(t)),a=Z.add(s,a,c,T,I),a.proxy)return a;if(c=Do(),a.proxy=c,c.src=t,c.listener=a,t.addEventListener)z||(w=T),w===void 0&&(w=!1),t.addEventListener(s.toString(),c,w);else if(t.attachEvent)t.attachEvent(Wi(s.toString()),c);else if(t.addListener&&t.removeListener)t.addListener(c);else throw Error("addEventListener and attachEvent are unavailable.");return a}function Do(){function t(a){return s.call(t.src,t.listener,a)}const s=No;return t}function zi(t,s,a,c,w){if(Array.isArray(s))for(var I=0;I<s.length;I++)zi(t,s[I],a,c,w);else c=E(c)?!!c.capture:!!c,a=Gi(a),t&&t[F]?(t=t.i,s=String(s).toString(),s in t.g&&(I=t.g[s],a=mt(I,a,c,w),-1<a&&(le(I[a]),Array.prototype.splice.call(I,a,1),I.length==0&&(delete t.g[s],t.h--)))):t&&(t=$n(t))&&(s=t.g[s.toString()],t=-1,s&&(t=mt(s,a,c,w)),(a=-1<t?s[t]:null)&&Hn(a))}function Hn(t){if(typeof t!="number"&&t&&!t.da){var s=t.src;if(s&&s[F])Ce(s.i,t);else{var a=t.type,c=t.proxy;s.removeEventListener?s.removeEventListener(a,c,t.capture):s.detachEvent?s.detachEvent(Wi(a),c):s.addListener&&s.removeListener&&s.removeListener(c),(a=$n(s))?(Ce(a,t),a.h==0&&(a.src=null,s[vt]=null)):le(t)}}}function Wi(t){return t in _t?_t[t]:_t[t]="on"+t}function No(t,s){if(t.da)t=!0;else{s=new N(s,this);var a=t.listener,c=t.ha||t.src;t.fa&&Hn(t),t=a.call(c,s)}return t}function $n(t){return t=t[vt],t instanceof Ee?t:null}var zn="__closure_events_fn_"+(1e9*Math.random()>>>0);function Gi(t){return typeof t=="function"?t:(t[zn]||(t[zn]=function(s){return t.handleEvent(s)}),t[zn])}function fe(){he.call(this),this.i=new Ee(this),this.M=this,this.F=null}R(fe,he),fe.prototype[F]=!0,fe.prototype.removeEventListener=function(t,s,a,c){zi(this,t,s,a,c)};function ve(t,s){var a,c=t.F;if(c)for(a=[];c;c=c.F)a.push(c);if(t=t.M,c=s.type||s,typeof s=="string")s=new B(s,t);else if(s instanceof B)s.target=s.target||t;else{var w=s;s=new B(c,t),g(s,w)}if(w=!0,a)for(var I=a.length-1;0<=I;I--){var T=s.g=a[I];w=hn(T,c,!0,s)&&w}if(T=s.g=t,w=hn(T,c,!0,s)&&w,w=hn(T,c,!1,s)&&w,a)for(I=0;I<a.length;I++)T=s.g=a[I],w=hn(T,c,!1,s)&&w}fe.prototype.N=function(){if(fe.aa.N.call(this),this.i){var t=this.i,s;for(s in t.g){for(var a=t.g[s],c=0;c<a.length;c++)le(a[c]);delete t.g[s],t.h--}}this.F=null},fe.prototype.K=function(t,s,a,c){return this.i.add(String(t),s,!1,a,c)},fe.prototype.L=function(t,s,a,c){return this.i.add(String(t),s,!0,a,c)};function hn(t,s,a,c){if(s=t.i.g[String(s)],!s)return!0;s=s.concat();for(var w=!0,I=0;I<s.length;++I){var T=s[I];if(T&&!T.da&&T.capture==a){var Z=T.listener,de=T.ha||T.src;T.fa&&Ce(t.i,T),w=Z.call(de,c)!==!1&&w}}return w&&!c.defaultPrevented}function Ki(t,s,a){if(typeof t=="function")a&&(t=C(t,a));else if(t&&typeof t.handleEvent=="function")t=C(t.handleEvent,t);else throw Error("Invalid listener argument");return 2147483647<Number(s)?-1:p.setTimeout(t,s||0)}function qi(t){t.g=Ki(()=>{t.g=null,t.i&&(t.i=!1,qi(t))},t.l);const s=t.h;t.h=null,t.m.apply(null,s)}class Lo extends he{constructor(s,a){super(),this.m=s,this.l=a,this.h=null,this.i=!1,this.g=null}j(s){this.h=arguments,this.g?this.i=!0:qi(this)}N(){super.N(),this.g&&(p.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Dt(t){he.call(this),this.h=t,this.g={}}R(Dt,he);var Ji=[];function Xi(t){G(t.g,function(s,a){this.g.hasOwnProperty(a)&&Hn(s)},t),t.g={}}Dt.prototype.N=function(){Dt.aa.N.call(this),Xi(this)},Dt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Wn=p.JSON.stringify,xo=p.JSON.parse,Mo=class{stringify(t){return p.JSON.stringify(t,void 0)}parse(t){return p.JSON.parse(t,void 0)}};function Gn(){}Gn.prototype.h=null;function Yi(t){return t.h||(t.h=t.i())}function Uo(){}var Nt={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Kn(){B.call(this,"d")}R(Kn,B);function qn(){B.call(this,"c")}R(qn,B);var yt={},Qi=null;function Jn(){return Qi=Qi||new fe}yt.La="serverreachability";function Zi(t){B.call(this,yt.La,t)}R(Zi,B);function Lt(t){const s=Jn();ve(s,new Zi(s))}yt.STAT_EVENT="statevent";function er(t,s){B.call(this,yt.STAT_EVENT,t),this.stat=s}R(er,B);function _e(t){const s=Jn();ve(s,new er(s,t))}yt.Ma="timingevent";function tr(t,s){B.call(this,yt.Ma,t),this.size=s}R(tr,B);function xt(t,s){if(typeof t!="function")throw Error("Fn must not be null and must be a function");return p.setTimeout(function(){t()},s)}function Mt(){this.g=!0}Mt.prototype.xa=function(){this.g=!1};function Fo(t,s,a,c,w,I){t.info(function(){if(t.g)if(I)for(var T="",Z=I.split("&"),de=0;de<Z.length;de++){var W=Z[de].split("=");if(1<W.length){var pe=W[0];W=W[1];var ge=pe.split("_");T=2<=ge.length&&ge[1]=="type"?T+(pe+"="+W+"&"):T+(pe+"=redacted&")}}else T=null;else T=I;return"XMLHTTP REQ ("+c+") [attempt "+w+"]: "+s+`
`+a+`
`+T})}function jo(t,s,a,c,w,I,T){t.info(function(){return"XMLHTTP RESP ("+c+") [ attempt "+w+"]: "+s+`
`+a+`
`+I+" "+T})}function wt(t,s,a,c){t.info(function(){return"XMLHTTP TEXT ("+s+"): "+Vo(t,a)+(c?" "+c:"")})}function Bo(t,s){t.info(function(){return"TIMEOUT: "+s})}Mt.prototype.info=function(){};function Vo(t,s){if(!t.g)return s;if(!s)return null;try{var a=JSON.parse(s);if(a){for(t=0;t<a.length;t++)if(Array.isArray(a[t])){var c=a[t];if(!(2>c.length)){var w=c[1];if(Array.isArray(w)&&!(1>w.length)){var I=w[0];if(I!="noop"&&I!="stop"&&I!="close")for(var T=1;T<w.length;T++)w[T]=""}}}}return Wn(a)}catch{return s}}var Xn={NO_ERROR:0,TIMEOUT:8},Ho={},Yn;function un(){}R(un,Gn),un.prototype.g=function(){return new XMLHttpRequest},un.prototype.i=function(){return{}},Yn=new un;function Je(t,s,a,c){this.j=t,this.i=s,this.l=a,this.R=c||1,this.U=new Dt(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new nr}function nr(){this.i=null,this.g="",this.h=!1}var ir={},Qn={};function Zn(t,s,a){t.L=1,t.v=gn(Fe(s)),t.m=a,t.P=!0,rr(t,null)}function rr(t,s){t.F=Date.now(),dn(t),t.A=Fe(t.v);var a=t.A,c=t.R;Array.isArray(c)||(c=[String(c)]),_r(a.i,"t",c),t.C=0,a=t.j.J,t.h=new nr,t.g=Mr(t.j,a?s:null,!t.m),0<t.O&&(t.M=new Lo(C(t.Y,t,t.g),t.O)),s=t.U,a=t.g,c=t.ca;var w="readystatechange";Array.isArray(w)||(w&&(Ji[0]=w.toString()),w=Ji);for(var I=0;I<w.length;I++){var T=$i(a,w[I],c||s.handleEvent,!1,s.h||s);if(!T)break;s.g[T.key]=T}s=t.H?u(t.H):{},t.m?(t.u||(t.u="POST"),s["Content-Type"]="application/x-www-form-urlencoded",t.g.ea(t.A,t.u,t.m,s)):(t.u="GET",t.g.ea(t.A,t.u,null,s)),Lt(),Fo(t.i,t.u,t.A,t.l,t.R,t.m)}Je.prototype.ca=function(t){t=t.target;const s=this.M;s&&je(t)==3?s.j():this.Y(t)},Je.prototype.Y=function(t){try{if(t==this.g)e:{const ge=je(this.g);var s=this.g.Ba();const Tt=this.g.Z();if(!(3>ge)&&(ge!=3||this.g&&(this.h.h||this.g.oa()||Ar(this.g)))){this.J||ge!=4||s==7||(s==8||0>=Tt?Lt(3):Lt(2)),ei(this);var a=this.g.Z();this.X=a;t:if(sr(this)){var c=Ar(this.g);t="";var w=c.length,I=je(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){lt(this),Ut(this);var T="";break t}this.h.i=new p.TextDecoder}for(s=0;s<w;s++)this.h.h=!0,t+=this.h.i.decode(c[s],{stream:!(I&&s==w-1)});c.length=0,this.h.g+=t,this.C=0,T=this.h.g}else T=this.g.oa();if(this.o=a==200,jo(this.i,this.u,this.A,this.l,this.R,ge,a),this.o){if(this.T&&!this.K){t:{if(this.g){var Z,de=this.g;if((Z=de.g?de.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!U(Z)){var W=Z;break t}}W=null}if(a=W)wt(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,ti(this,a);else{this.o=!1,this.s=3,_e(12),lt(this),Ut(this);break e}}if(this.P){a=!0;let Re;for(;!this.J&&this.C<T.length;)if(Re=$o(this,T),Re==Qn){ge==4&&(this.s=4,_e(14),a=!1),wt(this.i,this.l,null,"[Incomplete Response]");break}else if(Re==ir){this.s=4,_e(15),wt(this.i,this.l,T,"[Invalid Chunk]"),a=!1;break}else wt(this.i,this.l,Re,null),ti(this,Re);if(sr(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ge!=4||T.length!=0||this.h.h||(this.s=1,_e(16),a=!1),this.o=this.o&&a,!a)wt(this.i,this.l,T,"[Invalid Chunked Response]"),lt(this),Ut(this);else if(0<T.length&&!this.W){this.W=!0;var pe=this.j;pe.g==this&&pe.ba&&!pe.M&&(pe.j.info("Great, no buffering proxy detected. Bytes received: "+T.length),ai(pe),pe.M=!0,_e(11))}}else wt(this.i,this.l,T,null),ti(this,T);ge==4&&lt(this),this.o&&!this.J&&(ge==4?Dr(this.j,this):(this.o=!1,dn(this)))}else oa(this.g),a==400&&0<T.indexOf("Unknown SID")?(this.s=3,_e(12)):(this.s=0,_e(13)),lt(this),Ut(this)}}}catch{}finally{}};function sr(t){return t.g?t.u=="GET"&&t.L!=2&&t.j.Ca:!1}function $o(t,s){var a=t.C,c=s.indexOf(`
`,a);return c==-1?Qn:(a=Number(s.substring(a,c)),isNaN(a)?ir:(c+=1,c+a>s.length?Qn:(s=s.slice(c,c+a),t.C=c+a,s)))}Je.prototype.cancel=function(){this.J=!0,lt(this)};function dn(t){t.S=Date.now()+t.I,or(t,t.I)}function or(t,s){if(t.B!=null)throw Error("WatchDog timer not null");t.B=xt(C(t.ba,t),s)}function ei(t){t.B&&(p.clearTimeout(t.B),t.B=null)}Je.prototype.ba=function(){this.B=null;const t=Date.now();0<=t-this.S?(Bo(this.i,this.A),this.L!=2&&(Lt(),_e(17)),lt(this),this.s=2,Ut(this)):or(this,this.S-t)};function Ut(t){t.j.G==0||t.J||Dr(t.j,t)}function lt(t){ei(t);var s=t.M;s&&typeof s.ma=="function"&&s.ma(),t.M=null,Xi(t.U),t.g&&(s=t.g,t.g=null,s.abort(),s.ma())}function ti(t,s){try{var a=t.j;if(a.G!=0&&(a.g==t||ni(a.h,t))){if(!t.K&&ni(a.h,t)&&a.G==3){try{var c=a.Da.g.parse(s)}catch{c=null}if(Array.isArray(c)&&c.length==3){var w=c;if(w[0]==0){e:if(!a.u){if(a.g)if(a.g.F+3e3<t.F)In(a),yn(a);else break e;oi(a),_e(18)}}else a.za=w[1],0<a.za-a.T&&37500>w[2]&&a.F&&a.v==0&&!a.C&&(a.C=xt(C(a.Za,a),6e3));if(1>=cr(a.h)&&a.ca){try{a.ca()}catch{}a.ca=void 0}}else ht(a,11)}else if((t.K||a.g==t)&&In(a),!U(s))for(w=a.Da.g.parse(s),s=0;s<w.length;s++){let W=w[s];if(a.T=W[0],W=W[1],a.G==2)if(W[0]=="c"){a.K=W[1],a.ia=W[2];const pe=W[3];pe!=null&&(a.la=pe,a.j.info("VER="+a.la));const ge=W[4];ge!=null&&(a.Aa=ge,a.j.info("SVER="+a.Aa));const Tt=W[5];Tt!=null&&typeof Tt=="number"&&0<Tt&&(c=1.5*Tt,a.L=c,a.j.info("backChannelRequestTimeoutMs_="+c)),c=a;const Re=t.g;if(Re){const En=Re.g?Re.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(En){var I=c.h;I.g||En.indexOf("spdy")==-1&&En.indexOf("quic")==-1&&En.indexOf("h2")==-1||(I.j=I.l,I.g=new Set,I.h&&(ii(I,I.h),I.h=null))}if(c.D){const li=Re.g?Re.g.getResponseHeader("X-HTTP-Session-Id"):null;li&&(c.ya=li,ie(c.I,c.D,li))}}a.G=3,a.l&&a.l.ua(),a.ba&&(a.R=Date.now()-t.F,a.j.info("Handshake RTT: "+a.R+"ms")),c=a;var T=t;if(c.qa=xr(c,c.J?c.ia:null,c.W),T.K){hr(c.h,T);var Z=T,de=c.L;de&&(Z.I=de),Z.B&&(ei(Z),dn(Z)),c.g=T}else Pr(c);0<a.i.length&&wn(a)}else W[0]!="stop"&&W[0]!="close"||ht(a,7);else a.G==3&&(W[0]=="stop"||W[0]=="close"?W[0]=="stop"?ht(a,7):si(a):W[0]!="noop"&&a.l&&a.l.ta(W),a.v=0)}}Lt(4)}catch{}}var zo=class{constructor(t,s){this.g=t,this.map=s}};function ar(t){this.l=t||10,p.PerformanceNavigationTiming?(t=p.performance.getEntriesByType("navigation"),t=0<t.length&&(t[0].nextHopProtocol=="hq"||t[0].nextHopProtocol=="h2")):t=!!(p.chrome&&p.chrome.loadTimes&&p.chrome.loadTimes()&&p.chrome.loadTimes().wasFetchedViaSpdy),this.j=t?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function lr(t){return t.h?!0:t.g?t.g.size>=t.j:!1}function cr(t){return t.h?1:t.g?t.g.size:0}function ni(t,s){return t.h?t.h==s:t.g?t.g.has(s):!1}function ii(t,s){t.g?t.g.add(s):t.h=s}function hr(t,s){t.h&&t.h==s?t.h=null:t.g&&t.g.has(s)&&t.g.delete(s)}ar.prototype.cancel=function(){if(this.i=ur(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const t of this.g.values())t.cancel();this.g.clear()}};function ur(t){if(t.h!=null)return t.i.concat(t.h.D);if(t.g!=null&&t.g.size!==0){let s=t.i;for(const a of t.g.values())s=s.concat(a.D);return s}return M(t.i)}function Wo(t){if(t.V&&typeof t.V=="function")return t.V();if(typeof Map<"u"&&t instanceof Map||typeof Set<"u"&&t instanceof Set)return Array.from(t.values());if(typeof t=="string")return t.split("");if(v(t)){for(var s=[],a=t.length,c=0;c<a;c++)s.push(t[c]);return s}s=[],a=0;for(c in t)s[a++]=t[c];return s}function Go(t){if(t.na&&typeof t.na=="function")return t.na();if(!t.V||typeof t.V!="function"){if(typeof Map<"u"&&t instanceof Map)return Array.from(t.keys());if(!(typeof Set<"u"&&t instanceof Set)){if(v(t)||typeof t=="string"){var s=[];t=t.length;for(var a=0;a<t;a++)s.push(a);return s}s=[],a=0;for(const c in t)s[a++]=c;return s}}}function dr(t,s){if(t.forEach&&typeof t.forEach=="function")t.forEach(s,void 0);else if(v(t)||typeof t=="string")Array.prototype.forEach.call(t,s,void 0);else for(var a=Go(t),c=Wo(t),w=c.length,I=0;I<w;I++)s.call(void 0,c[I],a&&a[I],t)}var fr=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Ko(t,s){if(t){t=t.split("&");for(var a=0;a<t.length;a++){var c=t[a].indexOf("="),w=null;if(0<=c){var I=t[a].substring(0,c);w=t[a].substring(c+1)}else I=t[a];s(I,w?decodeURIComponent(w.replace(/\+/g," ")):"")}}}function ct(t){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,t instanceof ct){this.h=t.h,fn(this,t.j),this.o=t.o,this.g=t.g,pn(this,t.s),this.l=t.l;var s=t.i,a=new Bt;a.i=s.i,s.g&&(a.g=new Map(s.g),a.h=s.h),pr(this,a),this.m=t.m}else t&&(s=String(t).match(fr))?(this.h=!1,fn(this,s[1]||"",!0),this.o=Ft(s[2]||""),this.g=Ft(s[3]||"",!0),pn(this,s[4]),this.l=Ft(s[5]||"",!0),pr(this,s[6]||"",!0),this.m=Ft(s[7]||"")):(this.h=!1,this.i=new Bt(null,this.h))}ct.prototype.toString=function(){var t=[],s=this.j;s&&t.push(jt(s,gr,!0),":");var a=this.g;return(a||s=="file")&&(t.push("//"),(s=this.o)&&t.push(jt(s,gr,!0),"@"),t.push(encodeURIComponent(String(a)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a=this.s,a!=null&&t.push(":",String(a))),(a=this.l)&&(this.g&&a.charAt(0)!="/"&&t.push("/"),t.push(jt(a,a.charAt(0)=="/"?Xo:Jo,!0))),(a=this.i.toString())&&t.push("?",a),(a=this.m)&&t.push("#",jt(a,Qo)),t.join("")};function Fe(t){return new ct(t)}function fn(t,s,a){t.j=a?Ft(s,!0):s,t.j&&(t.j=t.j.replace(/:$/,""))}function pn(t,s){if(s){if(s=Number(s),isNaN(s)||0>s)throw Error("Bad port number "+s);t.s=s}else t.s=null}function pr(t,s,a){s instanceof Bt?(t.i=s,Zo(t.i,t.h)):(a||(s=jt(s,Yo)),t.i=new Bt(s,t.h))}function ie(t,s,a){t.i.set(s,a)}function gn(t){return ie(t,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),t}function Ft(t,s){return t?s?decodeURI(t.replace(/%25/g,"%2525")):decodeURIComponent(t):""}function jt(t,s,a){return typeof t=="string"?(t=encodeURI(t).replace(s,qo),a&&(t=t.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t):null}function qo(t){return t=t.charCodeAt(0),"%"+(t>>4&15).toString(16)+(t&15).toString(16)}var gr=/[#\/\?@]/g,Jo=/[#\?:]/g,Xo=/[#\?]/g,Yo=/[#\?@]/g,Qo=/#/g;function Bt(t,s){this.h=this.g=null,this.i=t||null,this.j=!!s}function Xe(t){t.g||(t.g=new Map,t.h=0,t.i&&Ko(t.i,function(s,a){t.add(decodeURIComponent(s.replace(/\+/g," ")),a)}))}i=Bt.prototype,i.add=function(t,s){Xe(this),this.i=null,t=It(this,t);var a=this.g.get(t);return a||this.g.set(t,a=[]),a.push(s),this.h+=1,this};function mr(t,s){Xe(t),s=It(t,s),t.g.has(s)&&(t.i=null,t.h-=t.g.get(s).length,t.g.delete(s))}function vr(t,s){return Xe(t),s=It(t,s),t.g.has(s)}i.forEach=function(t,s){Xe(this),this.g.forEach(function(a,c){a.forEach(function(w){t.call(s,w,c,this)},this)},this)},i.na=function(){Xe(this);const t=Array.from(this.g.values()),s=Array.from(this.g.keys()),a=[];for(let c=0;c<s.length;c++){const w=t[c];for(let I=0;I<w.length;I++)a.push(s[c])}return a},i.V=function(t){Xe(this);let s=[];if(typeof t=="string")vr(this,t)&&(s=s.concat(this.g.get(It(this,t))));else{t=Array.from(this.g.values());for(let a=0;a<t.length;a++)s=s.concat(t[a])}return s},i.set=function(t,s){return Xe(this),this.i=null,t=It(this,t),vr(this,t)&&(this.h-=this.g.get(t).length),this.g.set(t,[s]),this.h+=1,this},i.get=function(t,s){return t?(t=this.V(t),0<t.length?String(t[0]):s):s};function _r(t,s,a){mr(t,s),0<a.length&&(t.i=null,t.g.set(It(t,s),M(a)),t.h+=a.length)}i.toString=function(){if(this.i)return this.i;if(!this.g)return"";const t=[],s=Array.from(this.g.keys());for(var a=0;a<s.length;a++){var c=s[a];const I=encodeURIComponent(String(c)),T=this.V(c);for(c=0;c<T.length;c++){var w=I;T[c]!==""&&(w+="="+encodeURIComponent(String(T[c]))),t.push(w)}}return this.i=t.join("&")};function It(t,s){return s=String(s),t.j&&(s=s.toLowerCase()),s}function Zo(t,s){s&&!t.j&&(Xe(t),t.i=null,t.g.forEach(function(a,c){var w=c.toLowerCase();c!=w&&(mr(this,c),_r(this,w,a))},t)),t.j=s}function ea(t,s){const a=new Mt;if(p.Image){const c=new Image;c.onload=$(Ye,a,"TestLoadImage: loaded",!0,s,c),c.onerror=$(Ye,a,"TestLoadImage: error",!1,s,c),c.onabort=$(Ye,a,"TestLoadImage: abort",!1,s,c),c.ontimeout=$(Ye,a,"TestLoadImage: timeout",!1,s,c),p.setTimeout(function(){c.ontimeout&&c.ontimeout()},1e4),c.src=t}else s(!1)}function ta(t,s){const a=new Mt,c=new AbortController,w=setTimeout(()=>{c.abort(),Ye(a,"TestPingServer: timeout",!1,s)},1e4);fetch(t,{signal:c.signal}).then(I=>{clearTimeout(w),I.ok?Ye(a,"TestPingServer: ok",!0,s):Ye(a,"TestPingServer: server error",!1,s)}).catch(()=>{clearTimeout(w),Ye(a,"TestPingServer: error",!1,s)})}function Ye(t,s,a,c,w){try{w&&(w.onload=null,w.onerror=null,w.onabort=null,w.ontimeout=null),c(a)}catch{}}function na(){this.g=new Mo}function ia(t,s,a){const c=a||"";try{dr(t,function(w,I){let T=w;E(w)&&(T=Wn(w)),s.push(c+I+"="+encodeURIComponent(T))})}catch(w){throw s.push(c+"type="+encodeURIComponent("_badmap")),w}}function mn(t){this.l=t.Ub||null,this.j=t.eb||!1}R(mn,Gn),mn.prototype.g=function(){return new vn(this.l,this.j)},mn.prototype.i=function(t){return function(){return t}}({});function vn(t,s){fe.call(this),this.D=t,this.o=s,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}R(vn,fe),i=vn.prototype,i.open=function(t,s){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=t,this.A=s,this.readyState=1,Ht(this)},i.send=function(t){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const s={headers:this.u,method:this.B,credentials:this.m,cache:void 0};t&&(s.body=t),(this.D||p).fetch(new Request(this.A,s)).then(this.Sa.bind(this),this.ga.bind(this))},i.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Vt(this)),this.readyState=0},i.Sa=function(t){if(this.g&&(this.l=t,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=t.headers,this.readyState=2,Ht(this)),this.g&&(this.readyState=3,Ht(this),this.g)))if(this.responseType==="arraybuffer")t.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof p.ReadableStream<"u"&&"body"in t){if(this.j=t.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;yr(this)}else t.text().then(this.Ra.bind(this),this.ga.bind(this))};function yr(t){t.j.read().then(t.Pa.bind(t)).catch(t.ga.bind(t))}i.Pa=function(t){if(this.g){if(this.o&&t.value)this.response.push(t.value);else if(!this.o){var s=t.value?t.value:new Uint8Array(0);(s=this.v.decode(s,{stream:!t.done}))&&(this.response=this.responseText+=s)}t.done?Vt(this):Ht(this),this.readyState==3&&yr(this)}},i.Ra=function(t){this.g&&(this.response=this.responseText=t,Vt(this))},i.Qa=function(t){this.g&&(this.response=t,Vt(this))},i.ga=function(){this.g&&Vt(this)};function Vt(t){t.readyState=4,t.l=null,t.j=null,t.v=null,Ht(t)}i.setRequestHeader=function(t,s){this.u.append(t,s)},i.getResponseHeader=function(t){return this.h&&this.h.get(t.toLowerCase())||""},i.getAllResponseHeaders=function(){if(!this.h)return"";const t=[],s=this.h.entries();for(var a=s.next();!a.done;)a=a.value,t.push(a[0]+": "+a[1]),a=s.next();return t.join(`\r
`)};function Ht(t){t.onreadystatechange&&t.onreadystatechange.call(t)}Object.defineProperty(vn.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(t){this.m=t?"include":"same-origin"}});function wr(t){let s="";return G(t,function(a,c){s+=c,s+=":",s+=a,s+=`\r
`}),s}function ri(t,s,a){e:{for(c in a){var c=!1;break e}c=!0}c||(a=wr(a),typeof t=="string"?a!=null&&encodeURIComponent(String(a)):ie(t,s,a))}function ce(t){fe.call(this),this.headers=new Map,this.o=t||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}R(ce,fe);var ra=/^https?$/i,sa=["POST","PUT"];i=ce.prototype,i.Ha=function(t){this.J=t},i.ea=function(t,s,a,c){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+t);s=s?s.toUpperCase():"GET",this.D=t,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Yn.g(),this.v=this.o?Yi(this.o):Yi(Yn),this.g.onreadystatechange=C(this.Ea,this);try{this.B=!0,this.g.open(s,String(t),!0),this.B=!1}catch(I){Ir(this,I);return}if(t=a||"",a=new Map(this.headers),c)if(Object.getPrototypeOf(c)===Object.prototype)for(var w in c)a.set(w,c[w]);else if(typeof c.keys=="function"&&typeof c.get=="function")for(const I of c.keys())a.set(I,c.get(I));else throw Error("Unknown input type for opt_headers: "+String(c));c=Array.from(a.keys()).find(I=>I.toLowerCase()=="content-type"),w=p.FormData&&t instanceof p.FormData,!(0<=Array.prototype.indexOf.call(sa,s,void 0))||c||w||a.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[I,T]of a)this.g.setRequestHeader(I,T);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{br(this),this.u=!0,this.g.send(t),this.u=!1}catch(I){Ir(this,I)}};function Ir(t,s){t.h=!1,t.g&&(t.j=!0,t.g.abort(),t.j=!1),t.l=s,t.m=5,Er(t),_n(t)}function Er(t){t.A||(t.A=!0,ve(t,"complete"),ve(t,"error"))}i.abort=function(t){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=t||7,ve(this,"complete"),ve(this,"abort"),_n(this))},i.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),_n(this,!0)),ce.aa.N.call(this)},i.Ea=function(){this.s||(this.B||this.u||this.j?Tr(this):this.bb())},i.bb=function(){Tr(this)};function Tr(t){if(t.h&&typeof h<"u"&&(!t.v[1]||je(t)!=4||t.Z()!=2)){if(t.u&&je(t)==4)Ki(t.Ea,0,t);else if(ve(t,"readystatechange"),je(t)==4){t.h=!1;try{const T=t.Z();e:switch(T){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var s=!0;break e;default:s=!1}var a;if(!(a=s)){var c;if(c=T===0){var w=String(t.D).match(fr)[1]||null;!w&&p.self&&p.self.location&&(w=p.self.location.protocol.slice(0,-1)),c=!ra.test(w?w.toLowerCase():"")}a=c}if(a)ve(t,"complete"),ve(t,"success");else{t.m=6;try{var I=2<je(t)?t.g.statusText:""}catch{I=""}t.l=I+" ["+t.Z()+"]",Er(t)}}finally{_n(t)}}}}function _n(t,s){if(t.g){br(t);const a=t.g,c=t.v[0]?()=>{}:null;t.g=null,t.v=null,s||ve(t,"ready");try{a.onreadystatechange=c}catch{}}}function br(t){t.I&&(p.clearTimeout(t.I),t.I=null)}i.isActive=function(){return!!this.g};function je(t){return t.g?t.g.readyState:0}i.Z=function(){try{return 2<je(this)?this.g.status:-1}catch{return-1}},i.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},i.Oa=function(t){if(this.g){var s=this.g.responseText;return t&&s.indexOf(t)==0&&(s=s.substring(t.length)),xo(s)}};function Ar(t){try{if(!t.g)return null;if("response"in t.g)return t.g.response;switch(t.H){case"":case"text":return t.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in t.g)return t.g.mozResponseArrayBuffer}return null}catch{return null}}function oa(t){const s={};t=(t.g&&2<=je(t)&&t.g.getAllResponseHeaders()||"").split(`\r
`);for(let c=0;c<t.length;c++){if(U(t[c]))continue;var a=m(t[c]);const w=a[0];if(a=a[1],typeof a!="string")continue;a=a.trim();const I=s[w]||[];s[w]=I,I.push(a)}_(s,function(c){return c.join(", ")})}i.Ba=function(){return this.m},i.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function $t(t,s,a){return a&&a.internalChannelParams&&a.internalChannelParams[t]||s}function Sr(t){this.Aa=0,this.i=[],this.j=new Mt,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=$t("failFast",!1,t),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=$t("baseRetryDelayMs",5e3,t),this.cb=$t("retryDelaySeedMs",1e4,t),this.Wa=$t("forwardChannelMaxRetries",2,t),this.wa=$t("forwardChannelRequestTimeoutMs",2e4,t),this.pa=t&&t.xmlHttpFactory||void 0,this.Xa=t&&t.Tb||void 0,this.Ca=t&&t.useFetchStreams||!1,this.L=void 0,this.J=t&&t.supportsCrossDomainXhr||!1,this.K="",this.h=new ar(t&&t.concurrentRequestLimit),this.Da=new na,this.P=t&&t.fastHandshake||!1,this.O=t&&t.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=t&&t.Rb||!1,t&&t.xa&&this.j.xa(),t&&t.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&t&&t.detectBufferingProxy||!1,this.ja=void 0,t&&t.longPollingTimeout&&0<t.longPollingTimeout&&(this.ja=t.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}i=Sr.prototype,i.la=8,i.G=1,i.connect=function(t,s,a,c){_e(0),this.W=t,this.H=s||{},a&&c!==void 0&&(this.H.OSID=a,this.H.OAID=c),this.F=this.X,this.I=xr(this,null,this.W),wn(this)};function si(t){if(Cr(t),t.G==3){var s=t.U++,a=Fe(t.I);if(ie(a,"SID",t.K),ie(a,"RID",s),ie(a,"TYPE","terminate"),zt(t,a),s=new Je(t,t.j,s),s.L=2,s.v=gn(Fe(a)),a=!1,p.navigator&&p.navigator.sendBeacon)try{a=p.navigator.sendBeacon(s.v.toString(),"")}catch{}!a&&p.Image&&(new Image().src=s.v,a=!0),a||(s.g=Mr(s.j,null),s.g.ea(s.v)),s.F=Date.now(),dn(s)}Lr(t)}function yn(t){t.g&&(ai(t),t.g.cancel(),t.g=null)}function Cr(t){yn(t),t.u&&(p.clearTimeout(t.u),t.u=null),In(t),t.h.cancel(),t.s&&(typeof t.s=="number"&&p.clearTimeout(t.s),t.s=null)}function wn(t){if(!lr(t.h)&&!t.s){t.s=!0;var s=t.Ga;me||oe(),X||(me(),X=!0),se.add(s,t),t.B=0}}function aa(t,s){return cr(t.h)>=t.h.j-(t.s?1:0)?!1:t.s?(t.i=s.D.concat(t.i),!0):t.G==1||t.G==2||t.B>=(t.Va?0:t.Wa)?!1:(t.s=xt(C(t.Ga,t,s),Nr(t,t.B)),t.B++,!0)}i.Ga=function(t){if(this.s)if(this.s=null,this.G==1){if(!t){this.U=Math.floor(1e5*Math.random()),t=this.U++;const w=new Je(this,this.j,t);let I=this.o;if(this.S&&(I?(I=u(I),g(I,this.S)):I=this.S),this.m!==null||this.O||(w.H=I,I=null),this.P)e:{for(var s=0,a=0;a<this.i.length;a++){t:{var c=this.i[a];if("__data__"in c.map&&(c=c.map.__data__,typeof c=="string")){c=c.length;break t}c=void 0}if(c===void 0)break;if(s+=c,4096<s){s=a;break e}if(s===4096||a===this.i.length-1){s=a+1;break e}}s=1e3}else s=1e3;s=Rr(this,w,s),a=Fe(this.I),ie(a,"RID",t),ie(a,"CVER",22),this.D&&ie(a,"X-HTTP-Session-Id",this.D),zt(this,a),I&&(this.O?s="headers="+encodeURIComponent(String(wr(I)))+"&"+s:this.m&&ri(a,this.m,I)),ii(this.h,w),this.Ua&&ie(a,"TYPE","init"),this.P?(ie(a,"$req",s),ie(a,"SID","null"),w.T=!0,Zn(w,a,null)):Zn(w,a,s),this.G=2}}else this.G==3&&(t?kr(this,t):this.i.length==0||lr(this.h)||kr(this))};function kr(t,s){var a;s?a=s.l:a=t.U++;const c=Fe(t.I);ie(c,"SID",t.K),ie(c,"RID",a),ie(c,"AID",t.T),zt(t,c),t.m&&t.o&&ri(c,t.m,t.o),a=new Je(t,t.j,a,t.B+1),t.m===null&&(a.H=t.o),s&&(t.i=s.D.concat(t.i)),s=Rr(t,a,1e3),a.I=Math.round(.5*t.wa)+Math.round(.5*t.wa*Math.random()),ii(t.h,a),Zn(a,c,s)}function zt(t,s){t.H&&G(t.H,function(a,c){ie(s,c,a)}),t.l&&dr({},function(a,c){ie(s,c,a)})}function Rr(t,s,a){a=Math.min(t.i.length,a);var c=t.l?C(t.l.Na,t.l,t):null;e:{var w=t.i;let I=-1;for(;;){const T=["count="+a];I==-1?0<a?(I=w[0].g,T.push("ofs="+I)):I=0:T.push("ofs="+I);let Z=!0;for(let de=0;de<a;de++){let W=w[de].g;const pe=w[de].map;if(W-=I,0>W)I=Math.max(0,w[de].g-100),Z=!1;else try{ia(pe,T,"req"+W+"_")}catch{c&&c(pe)}}if(Z){c=T.join("&");break e}}}return t=t.i.splice(0,a),s.D=t,c}function Pr(t){if(!t.g&&!t.u){t.Y=1;var s=t.Fa;me||oe(),X||(me(),X=!0),se.add(s,t),t.v=0}}function oi(t){return t.g||t.u||3<=t.v?!1:(t.Y++,t.u=xt(C(t.Fa,t),Nr(t,t.v)),t.v++,!0)}i.Fa=function(){if(this.u=null,Or(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var t=2*this.R;this.j.info("BP detection timer enabled: "+t),this.A=xt(C(this.ab,this),t)}},i.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,_e(10),yn(this),Or(this))};function ai(t){t.A!=null&&(p.clearTimeout(t.A),t.A=null)}function Or(t){t.g=new Je(t,t.j,"rpc",t.Y),t.m===null&&(t.g.H=t.o),t.g.O=0;var s=Fe(t.qa);ie(s,"RID","rpc"),ie(s,"SID",t.K),ie(s,"AID",t.T),ie(s,"CI",t.F?"0":"1"),!t.F&&t.ja&&ie(s,"TO",t.ja),ie(s,"TYPE","xmlhttp"),zt(t,s),t.m&&t.o&&ri(s,t.m,t.o),t.L&&(t.g.I=t.L);var a=t.g;t=t.ia,a.L=1,a.v=gn(Fe(s)),a.m=null,a.P=!0,rr(a,t)}i.Za=function(){this.C!=null&&(this.C=null,yn(this),oi(this),_e(19))};function In(t){t.C!=null&&(p.clearTimeout(t.C),t.C=null)}function Dr(t,s){var a=null;if(t.g==s){In(t),ai(t),t.g=null;var c=2}else if(ni(t.h,s))a=s.D,hr(t.h,s),c=1;else return;if(t.G!=0){if(s.o)if(c==1){a=s.m?s.m.length:0,s=Date.now()-s.F;var w=t.B;c=Jn(),ve(c,new tr(c,a)),wn(t)}else Pr(t);else if(w=s.s,w==3||w==0&&0<s.X||!(c==1&&aa(t,s)||c==2&&oi(t)))switch(a&&0<a.length&&(s=t.h,s.i=s.i.concat(a)),w){case 1:ht(t,5);break;case 4:ht(t,10);break;case 3:ht(t,6);break;default:ht(t,2)}}}function Nr(t,s){let a=t.Ta+Math.floor(Math.random()*t.cb);return t.isActive()||(a*=2),a*s}function ht(t,s){if(t.j.info("Error code "+s),s==2){var a=C(t.fb,t),c=t.Xa;const w=!c;c=new ct(c||"//www.google.com/images/cleardot.gif"),p.location&&p.location.protocol=="http"||fn(c,"https"),gn(c),w?ea(c.toString(),a):ta(c.toString(),a)}else _e(2);t.G=0,t.l&&t.l.sa(s),Lr(t),Cr(t)}i.fb=function(t){t?(this.j.info("Successfully pinged google.com"),_e(2)):(this.j.info("Failed to ping google.com"),_e(1))};function Lr(t){if(t.G=0,t.ka=[],t.l){const s=ur(t.h);(s.length!=0||t.i.length!=0)&&(D(t.ka,s),D(t.ka,t.i),t.h.i.length=0,M(t.i),t.i.length=0),t.l.ra()}}function xr(t,s,a){var c=a instanceof ct?Fe(a):new ct(a);if(c.g!="")s&&(c.g=s+"."+c.g),pn(c,c.s);else{var w=p.location;c=w.protocol,s=s?s+"."+w.hostname:w.hostname,w=+w.port;var I=new ct(null);c&&fn(I,c),s&&(I.g=s),w&&pn(I,w),a&&(I.l=a),c=I}return a=t.D,s=t.ya,a&&s&&ie(c,a,s),ie(c,"VER",t.la),zt(t,c),c}function Mr(t,s,a){if(s&&!t.J)throw Error("Can't create secondary domain capable XhrIo object.");return s=t.Ca&&!t.pa?new ce(new mn({eb:a})):new ce(t.pa),s.Ha(t.J),s}i.isActive=function(){return!!this.l&&this.l.isActive(this)};function Ur(){}i=Ur.prototype,i.ua=function(){},i.ta=function(){},i.sa=function(){},i.ra=function(){},i.isActive=function(){return!0},i.Na=function(){};function ke(t,s){fe.call(this),this.g=new Sr(s),this.l=t,this.h=s&&s.messageUrlParams||null,t=s&&s.messageHeaders||null,s&&s.clientProtocolHeaderRequired&&(t?t["X-Client-Protocol"]="webchannel":t={"X-Client-Protocol":"webchannel"}),this.g.o=t,t=s&&s.initMessageHeaders||null,s&&s.messageContentType&&(t?t["X-WebChannel-Content-Type"]=s.messageContentType:t={"X-WebChannel-Content-Type":s.messageContentType}),s&&s.va&&(t?t["X-WebChannel-Client-Profile"]=s.va:t={"X-WebChannel-Client-Profile":s.va}),this.g.S=t,(t=s&&s.Sb)&&!U(t)&&(this.g.m=t),this.v=s&&s.supportsCrossDomainXhr||!1,this.u=s&&s.sendRawJson||!1,(s=s&&s.httpSessionIdParam)&&!U(s)&&(this.g.D=s,t=this.h,t!==null&&s in t&&(t=this.h,s in t&&delete t[s])),this.j=new Et(this)}R(ke,fe),ke.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},ke.prototype.close=function(){si(this.g)},ke.prototype.o=function(t){var s=this.g;if(typeof t=="string"){var a={};a.__data__=t,t=a}else this.u&&(a={},a.__data__=Wn(t),t=a);s.i.push(new zo(s.Ya++,t)),s.G==3&&wn(s)},ke.prototype.N=function(){this.g.l=null,delete this.j,si(this.g),delete this.g,ke.aa.N.call(this)};function Fr(t){Kn.call(this),t.__headers__&&(this.headers=t.__headers__,this.statusCode=t.__status__,delete t.__headers__,delete t.__status__);var s=t.__sm__;if(s){e:{for(const a in s){t=a;break e}t=void 0}(this.i=t)&&(t=this.i,s=s!==null&&t in s?s[t]:void 0),this.data=s}else this.data=t}R(Fr,Kn);function jr(){qn.call(this),this.status=1}R(jr,qn);function Et(t){this.g=t}R(Et,Ur),Et.prototype.ua=function(){ve(this.g,"a")},Et.prototype.ta=function(t){ve(this.g,new Fr(t))},Et.prototype.sa=function(t){ve(this.g,new jr)},Et.prototype.ra=function(){ve(this.g,"b")},ke.prototype.send=ke.prototype.o,ke.prototype.open=ke.prototype.m,ke.prototype.close=ke.prototype.close,Xn.NO_ERROR=0,Xn.TIMEOUT=8,Xn.HTTP_ERROR=6,Ho.COMPLETE="complete",Uo.EventType=Nt,Nt.OPEN="a",Nt.CLOSE="b",Nt.ERROR="c",Nt.MESSAGE="d",fe.prototype.listen=fe.prototype.K,ce.prototype.listenOnce=ce.prototype.L,ce.prototype.getLastError=ce.prototype.Ka,ce.prototype.getLastErrorCode=ce.prototype.Ba,ce.prototype.getStatus=ce.prototype.Z,ce.prototype.getResponseJson=ce.prototype.Oa,ce.prototype.getResponseText=ce.prototype.oa,ce.prototype.send=ce.prototype.ea,ce.prototype.setWithCredentials=ce.prototype.Ha}).apply(typeof An<"u"?An:typeof self<"u"?self:typeof window<"u"?window:{});const _s="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class we{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}we.UNAUTHENTICATED=new we(null),we.GOOGLE_CREDENTIALS=new we("google-credentials-uid"),we.FIRST_PARTY=new we("first-party-uid"),we.MOCK_USER=new we("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let cn="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rt=new Ci("@firebase/firestore");function Pe(i,...e){if(Rt.logLevel<=K.DEBUG){const n=e.map(Bi);Rt.debug(`Firestore (${cn}): ${i}`,...n)}}function So(i,...e){if(Rt.logLevel<=K.ERROR){const n=e.map(Bi);Rt.error(`Firestore (${cn}): ${i}`,...n)}}function gu(i,...e){if(Rt.logLevel<=K.WARN){const n=e.map(Bi);Rt.warn(`Firestore (${cn}): ${i}`,...n)}}function Bi(i){if(typeof i=="string")return i;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(n){return JSON.stringify(n)}(i)}catch{return i}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vi(i="Unexpected state"){const e=`FIRESTORE (${cn}) INTERNAL ASSERTION FAILED: `+i;throw So(e),new Error(e)}function Jt(i,e){i||Vi()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Te={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class be extends qe{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xt{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Co{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class mu{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(we.UNAUTHENTICATED))}shutdown(){}}class vu{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class _u{constructor(e){this.t=e,this.currentUser=we.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){Jt(this.o===void 0);let r=this.i;const o=v=>this.i!==r?(r=this.i,n(v)):Promise.resolve();let l=new Xt;this.o=()=>{this.i++,this.currentUser=this.u(),l.resolve(),l=new Xt,e.enqueueRetryable(()=>o(this.currentUser))};const h=()=>{const v=l;e.enqueueRetryable(async()=>{await v.promise,await o(this.currentUser)})},p=v=>{Pe("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=v,this.o&&(this.auth.addAuthTokenListener(this.o),h())};this.t.onInit(v=>p(v)),setTimeout(()=>{if(!this.auth){const v=this.t.getImmediate({optional:!0});v?p(v):(Pe("FirebaseAuthCredentialsProvider","Auth not yet detected"),l.resolve(),l=new Xt)}},0),h()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(Pe("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Jt(typeof r.accessToken=="string"),new Co(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Jt(e===null||typeof e=="string"),new we(e)}}class yu{constructor(e,n,r){this.l=e,this.h=n,this.P=r,this.type="FirstParty",this.user=we.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class wu{constructor(e,n,r){this.l=e,this.h=n,this.P=r}getToken(){return Promise.resolve(new yu(this.l,this.h,this.P))}start(e,n){e.enqueueRetryable(()=>n(we.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Iu{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Eu{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,n){Jt(this.o===void 0);const r=l=>{l.error!=null&&Pe("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${l.error.message}`);const h=l.token!==this.R;return this.R=l.token,Pe("FirebaseAppCheckTokenProvider",`Received ${h?"new":"existing"} token.`),h?n(l.token):Promise.resolve()};this.o=l=>{e.enqueueRetryable(()=>r(l))};const o=l=>{Pe("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=l,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(l=>o(l)),setTimeout(()=>{if(!this.appCheck){const l=this.A.getImmediate({optional:!0});l?o(l):Pe("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(Jt(typeof n.token=="string"),this.R=n.token,new Iu(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}function Tu(i){return i.name==="IndexedDbTransactionError"}class Fn{constructor(e,n){this.projectId=e,this.database=n||"(default)"}static empty(){return new Fn("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Fn&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ys,V;(V=ys||(ys={}))[V.OK=0]="OK",V[V.CANCELLED=1]="CANCELLED",V[V.UNKNOWN=2]="UNKNOWN",V[V.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",V[V.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",V[V.NOT_FOUND=5]="NOT_FOUND",V[V.ALREADY_EXISTS=6]="ALREADY_EXISTS",V[V.PERMISSION_DENIED=7]="PERMISSION_DENIED",V[V.UNAUTHENTICATED=16]="UNAUTHENTICATED",V[V.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",V[V.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",V[V.ABORTED=10]="ABORTED",V[V.OUT_OF_RANGE=11]="OUT_OF_RANGE",V[V.UNIMPLEMENTED=12]="UNIMPLEMENTED",V[V.INTERNAL=13]="INTERNAL",V[V.UNAVAILABLE=14]="UNAVAILABLE",V[V.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Ao([4294967295,4294967295],0);function mi(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bu{constructor(e,n,r=1e3,o=1.5,l=6e4){this.ui=e,this.timerId=n,this.ko=r,this.qo=o,this.Qo=l,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const n=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),o=Math.max(0,n-r);o>0&&Pe("ExponentialBackoff",`Backing off for ${o} ms (base delay: ${this.Ko} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,o,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hi{constructor(e,n,r,o,l){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=o,this.removalCallback=l,this.deferred=new Xt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(h=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,o,l){const h=Date.now()+r,p=new Hi(e,n,h,o,l);return p.start(r),p}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new be(Te.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var ws,Is;(Is=ws||(ws={})).ea="default",Is.Cache="cache";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Au(i){const e={};return i.timeoutSeconds!==void 0&&(e.timeoutSeconds=i.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Es=new Map;function Su(i,e,n,r){if(e===!0&&r===!0)throw new be(Te.INVALID_ARGUMENT,`${i} and ${n} cannot be used together.`)}function Cu(i){if(i===void 0)return"undefined";if(i===null)return"null";if(typeof i=="string")return i.length>20&&(i=`${i.substring(0,20)}...`),JSON.stringify(i);if(typeof i=="number"||typeof i=="boolean")return""+i;if(typeof i=="object"){if(i instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(i);return e?`a custom ${e} object`:"an object"}}return typeof i=="function"?"a function":Vi()}function ku(i,e){if("_delegate"in i&&(i=i._delegate),!(i instanceof e)){if(e.name===i.constructor.name)throw new be(Te.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=Cu(i);throw new be(Te.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ts{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new be(Te.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(n=e.ssl)===null||n===void 0||n;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new be(Te.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Su("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Au((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(l){if(l.timeoutSeconds!==void 0){if(isNaN(l.timeoutSeconds))throw new be(Te.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (must not be NaN)`);if(l.timeoutSeconds<5)throw new be(Te.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (minimum allowed value is 5)`);if(l.timeoutSeconds>30)throw new be(Te.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,o){return r.timeoutSeconds===o.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class ko{constructor(e,n,r,o){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=o,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Ts({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new be(Te.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new be(Te.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Ts(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new mu;switch(r.type){case"firstParty":return new wu(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new be(Te.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=Es.get(n);r&&(Pe("ComponentProvider","Removing Datastore"),Es.delete(n),r.terminate())}(this),Promise.resolve()}}function Ru(i,e,n,r={}){var o;const l=(i=ku(i,ko))._getSettings(),h=`${e}:${n}`;if(l.host!=="firestore.googleapis.com"&&l.host!==h&&gu("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),i._setSettings(Object.assign(Object.assign({},l),{host:h,ssl:!1})),r.mockUserToken){let p,v;if(typeof r.mockUserToken=="string")p=r.mockUserToken,v=we.MOCK_USER;else{p=Oa(r.mockUserToken,(o=i._app)===null||o===void 0?void 0:o.options.projectId);const E=r.mockUserToken.sub||r.mockUserToken.user_id;if(!E)throw new be(Te.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");v=new we(E)}i._authCredentials=new vu(new Co(p,v))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bs{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new bu(this,"async_queue_retry"),this.Vu=()=>{const r=mi();r&&Pe("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const n=mi();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const n=mi();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const n=new Xt;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Tu(e))throw e;Pe("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const n=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const o=function(h){let p=h.message||"";return h.stack&&(p=h.stack.includes(h.message)?h.stack:h.message+`
`+h.stack),p}(r);throw So("INTERNAL UNHANDLED ERROR: ",o),r}).then(r=>(this.du=!1,r))));return this.mu=n,n}enqueueAfterDelay(e,n,r){this.fu(),this.Ru.indexOf(e)>-1&&(n=0);const o=Hi.createAndSchedule(this,e,n,r,l=>this.yu(l));return this.Tu.push(o),o}fu(){this.Eu&&Vi()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const n of this.Tu)if(n.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.Tu)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const n=this.Tu.indexOf(e);this.Tu.splice(n,1)}}class Pu extends ko{constructor(e,n,r,o){super(e,n,r,o),this.type="firestore",this._queue=new bs,this._persistenceKey=(o==null?void 0:o.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new bs(e),this._firestoreClient=void 0,await e}}}function Ou(i,e){const n=typeof i=="object"?i:Pi(),r=typeof i=="string"?i:"(default)",o=Ri(n,"firestore").getImmediate({identifier:r});if(!o._initialized){const l=Ra("firestore");l&&Ru(o,...l)}return o}(function(e,n=!0){(function(o){cn=o})(Pt),kt(new dt("firestore",(r,{instanceIdentifier:o,options:l})=>{const h=r.getProvider("app").getImmediate(),p=new Pu(new _u(r.getProvider("auth-internal")),new Eu(r.getProvider("app-check-internal")),function(E,S){if(!Object.prototype.hasOwnProperty.apply(E.options,["projectId"]))throw new be(Te.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Fn(E.options.projectId,S)}(h,o),h);return l=Object.assign({useFetchStreams:n},l),p._setSettings(l),p},"PUBLIC").setMultipleInstances(!0)),rt(_s,"4.7.3",e),rt(_s,"4.7.3","esm2017")})();const Du={apiKey:void 0,authDomain:void 0,projectId:void 0,storageBucket:void 0,messagingSenderId:void 0,appId:void 0},Ro=zl().length?Pi():Bs(Du),tn=fu(Ro);Ou(Ro);new Ve;Zc(tn,mo).catch(i=>{console.error("Firebase Persistence Error:",i)});function As(i){let e,n,r,o,l,h="✕",p,v,E=i[1]?"Crear Cuenta":"Bienvenido",S,O,C,$=i[1]?"Únete al santuario de ajedrez.":"Continúa tu viaje de maestría.",R,M,D,ee,U,j="Email",ae,q,G,_,u,f="Contraseña",g,m,y,d,J,re=i[5]?"Procesando...":i[1]?"Registrarse":"Iniciar Sesión",Ae,me,X,se,oe=i[1]?"¿Ya tienes cuenta? Inicia Sesión":"¿No tienes cuenta? Regístrate",Se,he,B,z=i[4]&&Ss(i);return{c(){e=x("div"),n=x("button"),r=Q(),o=x("div"),l=x("button"),l.textContent=h,p=Q(),v=x("h2"),S=Ne(E),O=Q(),C=x("p"),R=Ne($),M=Q(),D=x("form"),ee=x("div"),U=x("label"),U.textContent=j,ae=Q(),q=x("input"),G=Q(),_=x("div"),u=x("label"),u.textContent=f,g=Q(),m=x("input"),y=Q(),z&&z.c(),d=Q(),J=x("button"),Ae=Ne(re),me=Q(),X=x("div"),se=x("button"),Se=Ne(oe),this.h()},l(N){e=L(N,"DIV",{class:!0});var k=ne(e);n=L(k,"BUTTON",{class:!0,"aria-label":!0}),ne(n).forEach(H),r=Y(k),o=L(k,"DIV",{class:!0});var F=ne(o);l=L(F,"BUTTON",{class:!0,"aria-label":!0,"data-svelte-h":!0}),ye(l)!=="svelte-i5n6q2"&&(l.textContent=h),p=Y(F),v=L(F,"H2",{class:!0});var ue=ne(v);S=De(ue,E),ue.forEach(H),O=Y(F),C=L(F,"P",{class:!0});var te=ne(C);R=De(te,$),te.forEach(H),M=Y(F),D=L(F,"FORM",{class:!0});var le=ne(D);ee=L(le,"DIV",{class:!0});var Ee=ne(ee);U=L(Ee,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),ye(U)!=="svelte-ew3ukl"&&(U.textContent=j),ae=Y(Ee),q=L(Ee,"INPUT",{id:!0,type:!0,placeholder:!0,class:!0}),Ee.forEach(H),G=Y(le),_=L(le,"DIV",{class:!0});var Ce=ne(_);u=L(Ce,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),ye(u)!=="svelte-14mf5cb"&&(u.textContent=f),g=Y(Ce),m=L(Ce,"INPUT",{id:!0,type:!0,placeholder:!0,class:!0}),Ce.forEach(H),y=Y(le),z&&z.l(le),d=Y(le),J=L(le,"BUTTON",{type:!0,class:!0});var mt=ne(J);Ae=De(mt,re),mt.forEach(H),le.forEach(H),me=Y(F),X=L(F,"DIV",{class:!0});var vt=ne(X);se=L(vt,"BUTTON",{class:!0});var _t=ne(se);Se=De(_t,oe),_t.forEach(H),vt.forEach(H),F.forEach(H),k.forEach(H),this.h()},h(){A(n,"class","absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm cursor-default focus:outline-none"),A(n,"aria-label","Cerrar modal"),A(l,"class","absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1"),A(l,"aria-label","Cerrar"),A(v,"class","text-2xl font-bold font-poppins mb-2 text-center"),A(C,"class","text-white/60 text-sm text-center mb-6"),A(U,"for","email"),A(U,"class","text-xs font-semibold uppercase tracking-wider text-white/40 ml-1"),A(q,"id","email"),A(q,"type","email"),A(q,"placeholder","tu@email.com"),A(q,"class","w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"),q.required=!0,A(ee,"class","space-y-1"),A(u,"for","password"),A(u,"class","text-xs font-semibold uppercase tracking-wider text-white/40 ml-1"),A(m,"id","password"),A(m,"type","password"),A(m,"placeholder","••••••••"),A(m,"class","w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"),m.required=!0,A(_,"class","space-y-1"),A(J,"type","submit"),J.disabled=i[5],A(J,"class","w-full py-3 bg-white text-black font-bold rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"),A(D,"class","space-y-4"),A(se,"class","text-sm text-white/50 hover:text-white transition-colors underline"),A(X,"class","mt-6 text-center"),A(o,"class","relative w-full max-w-md bg-[#1a1a1a]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel p-8 text-white pointer-events-auto z-10 svelte-1amko8f"),A(e,"class","fixed inset-0 z-[100] flex items-center justify-center p-4")},m(N,k){st(N,e,k),b(e,n),b(e,r),b(e,o),b(o,l),b(o,p),b(o,v),b(v,S),b(o,O),b(o,C),b(C,R),b(o,M),b(o,D),b(D,ee),b(ee,U),b(ee,ae),b(ee,q),Tn(q,i[2]),b(D,G),b(D,_),b(_,u),b(_,g),b(_,m),Tn(m,i[3]),b(D,y),z&&z.m(D,null),b(D,d),b(D,J),b(J,Ae),b(o,me),b(o,X),b(X,se),b(se,Se),he||(B=[Be(n,"click",i[8]),Be(l,"click",i[8]),Be(q,"input",i[9]),Be(m,"input",i[10]),Be(D,"submit",ha(i[6])),Be(se,"click",i[7])],he=!0)},p(N,k){k&2&&E!==(E=N[1]?"Crear Cuenta":"Bienvenido")&&Wt(S,E),k&2&&$!==($=N[1]?"Únete al santuario de ajedrez.":"Continúa tu viaje de maestría.")&&Wt(R,$),k&4&&q.value!==N[2]&&Tn(q,N[2]),k&8&&m.value!==N[3]&&Tn(m,N[3]),N[4]?z?z.p(N,k):(z=Ss(N),z.c(),z.m(D,d)):z&&(z.d(1),z=null),k&34&&re!==(re=N[5]?"Procesando...":N[1]?"Registrarse":"Iniciar Sesión")&&Wt(Ae,re),k&32&&(J.disabled=N[5]),k&2&&oe!==(oe=N[1]?"¿Ya tienes cuenta? Inicia Sesión":"¿No tienes cuenta? Regístrate")&&Wt(Se,oe)},d(N){N&&H(e),z&&z.d(),he=!1,ca(B)}}}function Ss(i){let e,n;return{c(){e=x("div"),n=Ne(i[4]),this.h()},l(r){e=L(r,"DIV",{class:!0});var o=ne(e);n=De(o,i[4]),o.forEach(H),this.h()},h(){A(e,"class","bg-red-500/10 border border-red-500/20 text-red-200 text-sm px-4 py-2 rounded-lg")},m(r,o){st(r,e,o),b(e,n)},p(r,o){o&16&&Wt(n,r[4])},d(r){r&&H(e)}}}function Nu(i){let e,n=i[0]&&As(i);return{c(){n&&n.c(),e=Br()},l(r){n&&n.l(r),e=Br()},m(r,o){n&&n.m(r,o),st(r,e,o)},p(r,[o]){r[0]?n?n.p(r,o):(n=As(r),n.c(),n.m(e.parentNode,e)):n&&(n.d(1),n=null)},i:Pn,o:Pn,d(r){r&&H(e),n&&n.d(r)}}}function Lu(i,e,n){let{show:r=!1}=e;const o=la();let l=!1,h="",p="",v="",E=!1;async function S(){n(4,v=""),n(5,E=!0);try{l?await Yc(tn,h,p):await Qc(tn,h,p),o("close")}catch(M){switch(console.error(M),M.code){case"auth/invalid-email":n(4,v="Email inválido.");break;case"auth/user-disabled":n(4,v="Usuario deshabilitado.");break;case"auth/user-not-found":n(4,v="Usuario no encontrado.");break;case"auth/wrong-password":n(4,v="Contraseña incorrecta.");break;case"auth/email-already-in-use":n(4,v="Email ya registrado.");break;case"auth/weak-password":n(4,v="Contraseña muy débil (min 6 caracteres).");break;default:n(4,v="Error de autenticación: "+M.message)}}finally{n(5,E=!1)}}function O(){n(1,l=!l),n(4,v="")}function C(){o("close")}function $(){h=this.value,n(2,h)}function R(){p=this.value,n(3,p)}return i.$$set=M=>{"show"in M&&n(0,r=M.show)},[r,l,h,p,v,E,S,O,C,$,R]}class xu extends Ps{constructor(e){super(),Os(this,e,Lu,Nu,Rs,{show:0})}}const Mu={user:null,loading:!0,isLoggedIn:!1},Po=Ia(Mu);nh(tn,i=>{Po.set({user:i,loading:!1,isLoggedIn:!!i})});const Uu=async()=>{await ih(tn)};function Cs(i,e,n){const r=i.slice();return r[7]=e[n],r}function Fu(i){let e,n="Acceso",r,o;return{c(){e=x("button"),e.textContent=n,this.h()},l(l){e=L(l,"BUTTON",{class:!0,"data-svelte-h":!0}),ye(e)!=="svelte-1hwarj3"&&(e.textContent=n),this.h()},h(){A(e,"class","ml-2 hover:text-black whitespace-nowrap transition-colors")},m(l,h){st(l,e,h),r||(o=Be(e,"click",i[4]),r=!0)},p:Pn,d(l){l&&H(e),r=!1,o()}}}function ju(i){let e,n="Salir",r,o;return{c(){e=x("button"),e.textContent=n,this.h()},l(l){e=L(l,"BUTTON",{class:!0,"data-svelte-h":!0}),ye(e)!=="svelte-v8o2gb"&&(e.textContent=n),this.h()},h(){A(e,"class","ml-2 text-red-500 hover:text-red-700 whitespace-nowrap transition-colors")},m(l,h){st(l,e,h),r||(o=Be(e,"click",Uu),r=!0)},p:Pn,d(l){l&&H(e),r=!1,o()}}}function ks(i){let e,n,r,o,l,h,p,v="▶",E,S,O=i[7].tag+"",C,$,R,M=i[7].price+"",D,ee,U,j,ae=i[7].title+"",q,G,_,u=i[7].artist+"",f,g,m,y=i[7].description+"",d,J,re,Ae;function me(){return i[6](i[7])}return{c(){e=x("div"),n=x("div"),r=x("img"),l=Q(),h=x("div"),p=x("a"),p.textContent=v,E=Q(),S=x("div"),C=Ne(O),$=Q(),R=x("div"),D=Ne(M),ee=Q(),U=x("div"),j=x("h3"),q=Ne(ae),G=Q(),_=x("p"),f=Ne(u),g=Q(),m=x("p"),d=Ne(y),J=Q(),this.h()},l(X){e=L(X,"DIV",{class:!0});var se=ne(e);n=L(se,"DIV",{class:!0});var oe=ne(n);r=L(oe,"IMG",{src:!0,alt:!0,class:!0,loading:!0}),l=Y(oe),h=L(oe,"DIV",{class:!0});var Se=ne(h);p=L(Se,"A",{href:!0,class:!0,"data-svelte-h":!0}),ye(p)!=="svelte-irnpmk"&&(p.textContent=v),Se.forEach(H),E=Y(oe),S=L(oe,"DIV",{class:!0});var he=ne(S);C=De(he,O),he.forEach(H),$=Y(oe),R=L(oe,"DIV",{class:!0});var B=ne(R);D=De(B,M),B.forEach(H),oe.forEach(H),ee=Y(se),U=L(se,"DIV",{class:!0});var z=ne(U);j=L(z,"H3",{class:!0});var N=ne(j);q=De(N,ae),N.forEach(H),G=Y(z),_=L(z,"P",{class:!0});var k=ne(_);f=De(k,u),k.forEach(H),g=Y(z),m=L(z,"P",{class:!0});var F=ne(m);d=De(F,y),F.forEach(H),z.forEach(H),J=Y(se),se.forEach(H),this.h()},h(){fa(r.src,o=i[7].cover)||A(r,"src",o),A(r,"alt",i[7].title),A(r,"class","w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"),A(r,"loading","lazy"),A(p,"href","/app"),A(p,"class","w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-110 active:scale-95 transition-transform text-black pl-1"),A(h,"class","absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]"),A(S,"class","absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-black shadow-sm"),A(R,"class","absolute bottom-4 left-4 bg-black/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"),A(n,"class","relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 cursor-pointer bg-gray-200"),A(j,"class","font-bold text-xl text-[#1a1a1a] group-hover:text-[#FF7B3D] transition-colors leading-tight"),A(_,"class","text-sm font-medium text-[#666]"),A(m,"class","text-xs text-[#888] mt-2 font-light line-clamp-2 leading-relaxed"),A(U,"class","space-y-1 px-1"),A(e,"class","group relative flex flex-col gap-4")},m(X,se){st(X,e,se),b(e,n),b(n,r),b(n,l),b(n,h),b(h,p),b(n,E),b(n,S),b(S,C),b(n,$),b(n,R),b(R,D),b(e,ee),b(e,U),b(U,j),b(j,q),b(U,G),b(U,_),b(_,f),b(U,g),b(U,m),b(m,d),b(e,J),re||(Ae=Be(p,"click",me),re=!0)},p(X,se){i=X},d(X){X&&H(e),re=!1,Ae()}}}function Bu(i){let e,n,r,o,l,h='<span class="text-2xl font-bold tracking-tight text-[#2D2D2D]">ChillChess</span> <span class="text-xs uppercase bg-[#E5E0D8] px-2 py-1 rounded-md text-[#666]">Beta v2.0</span>',p,v,E,S="Lanzamientos",O,C,$="Artistas",R,M,D="Tienda",ee,U,j,ae="<span>✨</span> Entrar al Santuario",q,G,_=`<h1 class="text-4xl md:text-7xl font-bold text-[#1a1a1a] tracking-tighter leading-[1.1]">Santuarios Visuales <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7B3D] to-[#FFB347]">De Ajedrez</span></h1> <p class="text-base md:text-xl text-[#666] max-w-2xl mx-auto font-light leading-relaxed">Experiencias atmosféricas curadas para alcanzar el estado de flujo. <br class="hidden md:block"/>
            Elige tu ambiente y domina el tablero.</p>`,u,f,g,m='<h2 class="text-xl md:text-3xl font-bold text-[#1a1a1a]">Colección Premium</h2> <button class="text-xs font-semibold text-[#666] border border-[#ccc] px-5 py-2.5 rounded-full hover:bg-white hover:border-[#aaa] transition-all hover:shadow-sm">VER TODO</button>',y,d,J,re,Ae='<div class="relative aspect-square rounded-2xl overflow-hidden bg-[#E5E0D8] flex items-center justify-center border-2 border-dashed border-[#ccc] group-hover:border-[#999] transition-colors"><div class="text-center space-y-2"><span class="text-4xl block">☕</span> <span class="text-[#999] font-bold uppercase tracking-widest text-xs block">Próximamente</span></div></div> <div class="space-y-1 px-1"><h3 class="font-bold text-xl text-[#1a1a1a]">Lo-Fi Café</h3> <p class="text-sm text-[#666]">Originales ChillChess</p></div>',me,X,se='<div class="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left"><div class="space-y-2"><h4 class="font-bold text-xl">ChillChess</h4> <p class="text-sm text-white/40">© 2025 ChillChess. Todos los derechos reservados.</p></div> <div class="flex gap-8 text-sm font-medium"><a href="javascript:void(0)" class="text-white/40 hover:text-white transition-colors">Instagram</a> <a href="javascript:void(0)" class="text-white/40 hover:text-white transition-colors">Twitter</a> <a href="javascript:void(0)" class="text-white/40 hover:text-white transition-colors">Discord</a></div></div>',oe;e=new xu({props:{show:i[0]}}),e.$on("close",i[5]);function Se(k,F){return k[1].isLoggedIn?ju:Fu}let he=Se(i),B=he(i),z=Vr(i[2]),N=[];for(let k=0;k<z.length;k+=1)N[k]=ks(Cs(i,z,k));return{c(){ya(e.$$.fragment),n=Q(),r=x("div"),o=x("nav"),l=x("div"),l.innerHTML=h,p=Q(),v=x("div"),E=x("a"),E.textContent=S,O=Q(),C=x("a"),C.textContent=$,R=Q(),M=x("a"),M.textContent=D,ee=Q(),B.c(),U=Q(),j=x("a"),j.innerHTML=ae,q=Q(),G=x("header"),G.innerHTML=_,u=Q(),f=x("main"),g=x("div"),g.innerHTML=m,y=Q(),d=x("div");for(let k=0;k<N.length;k+=1)N[k].c();J=Q(),re=x("div"),re.innerHTML=Ae,me=Q(),X=x("footer"),X.innerHTML=se,this.h()},l(k){_a(e.$$.fragment,k),n=Y(k),r=L(k,"DIV",{class:!0});var F=ne(r);o=L(F,"NAV",{class:!0});var ue=ne(o);l=L(ue,"DIV",{class:!0,"data-svelte-h":!0}),ye(l)!=="svelte-bs3108"&&(l.innerHTML=h),p=Y(ue),v=L(ue,"DIV",{class:!0});var te=ne(v);E=L(te,"A",{href:!0,class:!0,"data-svelte-h":!0}),ye(E)!=="svelte-np6mty"&&(E.textContent=S),O=Y(te),C=L(te,"A",{href:!0,class:!0,"data-svelte-h":!0}),ye(C)!=="svelte-11is05i"&&(C.textContent=$),R=Y(te),M=L(te,"A",{href:!0,class:!0,"data-svelte-h":!0}),ye(M)!=="svelte-1rq1wum"&&(M.textContent=D),ee=Y(te),B.l(te),te.forEach(H),U=Y(ue),j=L(ue,"A",{href:!0,class:!0,"data-svelte-h":!0}),ye(j)!=="svelte-ipfptm"&&(j.innerHTML=ae),ue.forEach(H),q=Y(F),G=L(F,"HEADER",{class:!0,"data-svelte-h":!0}),ye(G)!=="svelte-1rsods9"&&(G.innerHTML=_),u=Y(F),f=L(F,"MAIN",{class:!0});var le=ne(f);g=L(le,"DIV",{class:!0,"data-svelte-h":!0}),ye(g)!=="svelte-rkxu0y"&&(g.innerHTML=m),y=Y(le),d=L(le,"DIV",{class:!0});var Ee=ne(d);for(let Ce=0;Ce<N.length;Ce+=1)N[Ce].l(Ee);J=Y(Ee),re=L(Ee,"DIV",{class:!0,"data-svelte-h":!0}),ye(re)!=="svelte-1xp1s1h"&&(re.innerHTML=Ae),Ee.forEach(H),le.forEach(H),me=Y(F),X=L(F,"FOOTER",{class:!0,"data-svelte-h":!0}),ye(X)!=="svelte-ptof08"&&(X.innerHTML=se),F.forEach(H),this.h()},h(){A(l,"class","flex items-center gap-2"),A(E,"href","javascript:void(0)"),A(E,"class","hover:text-black transition-colors whitespace-nowrap"),A(C,"href","javascript:void(0)"),A(C,"class","hover:text-black transition-colors whitespace-nowrap"),A(M,"href","javascript:void(0)"),A(M,"class","hover:text-black transition-colors whitespace-nowrap"),A(v,"class","flex gap-4 md:gap-6 text-sm font-medium text-[#666] overflow-x-auto max-w-full px-2 items-center"),A(j,"href","/app"),A(j,"class","px-8 py-3 bg-[#1a1a1a] text-white rounded-full text-sm font-bold tracking-wide hover:bg-black transition-all hover:scale-105 shadow-xl hover:shadow-2xl active:scale-95 w-full md:w-auto text-center flex items-center justify-center gap-2"),A(o,"class","flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-6 max-w-7xl mx-auto gap-4"),A(G,"class","px-4 md:px-8 py-12 md:py-24 max-w-7xl mx-auto text-center space-y-6 md:space-y-8 animate-fade-in"),A(g,"class","flex justify-between items-end mb-8 border-b border-[#Ddd] pb-4"),A(re,"class","group relative flex flex-col gap-4 opacity-40 hover:opacity-60 transition-all grayscale"),A(d,"class","grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"),A(f,"class","px-4 md:px-8 pb-20 max-w-7xl mx-auto"),A(X,"class","bg-[#1a1a1a] text-white py-16 mt-12"),A(r,"class","min-h-screen bg-[#F3EFE9] text-[#4A4A4A] font-poppins overflow-x-hidden")},m(k,F){va(e,k,F),st(k,n,F),st(k,r,F),b(r,o),b(o,l),b(o,p),b(o,v),b(v,E),b(v,O),b(v,C),b(v,R),b(v,M),b(v,ee),B.m(v,null),b(o,U),b(o,j),b(r,q),b(r,G),b(r,u),b(r,f),b(f,g),b(f,y),b(f,d);for(let ue=0;ue<N.length;ue+=1)N[ue]&&N[ue].m(d,null);b(d,J),b(d,re),b(r,me),b(r,X),oe=!0},p(k,[F]){const ue={};if(F&1&&(ue.show=k[0]),e.$set(ue),he===(he=Se(k))&&B?B.p(k,F):(B.d(1),B=he(k),B&&(B.c(),B.m(v,null))),F&12){z=Vr(k[2]);let te;for(te=0;te<z.length;te+=1){const le=Cs(k,z,te);N[te]?N[te].p(le,F):(N[te]=ks(le),N[te].c(),N[te].m(d,J))}for(;te<N.length;te+=1)N[te].d(1);N.length=z.length}},i(k){oe||(ma(e.$$.fragment,k),oe=!0)},o(k){ga(e.$$.fragment,k),oe=!1},d(k){k&&(H(n),H(r)),pa(e,k),B.d(),ua(N,k)}}}function Vu(i,e,n){let r;da(i,Po,S=>n(1,r=S));let o=!1;const l=[{id:"noir",title:"Ciudad Noir",artist:"Originales ChillChess",cover:"/assets/images/covers/noir.png",tag:"Popular",price:"Gratis",description:"Lluvia cyberpunk para concentración profunda."},{id:"library",title:"Biblioteca Gran Maestro",artist:"Colección Clásica",cover:"/assets/images/covers/library.png",tag:"Nuevo",price:"Gratis",description:"Chimenea acogedora y libros antiguos."},{id:"zen",title:"Jardín Zen",artist:"Flujo Oriental",cover:"/assets/images/covers/zen.png",tag:"Relax",price:"Gratis",description:"Sonidos de naturaleza y flauta suave."}];function h(S){wa(S)}function p(){n(0,o=!0)}return[o,r,l,h,p,()=>n(0,o=!1),S=>h(S.id)]}class Ku extends Ps{constructor(e){super(),Os(this,e,Vu,Bu,Rs,{})}}export{Ku as component};
