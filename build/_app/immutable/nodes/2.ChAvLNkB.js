import{s as As,n as yn,d as U,i as ye,l as Mr,R as Zo,y as ea,b,P as mt,r as P,c as O,e as ie,g as K,Q as re,h as D,j as q,a as ta,f as jt,t as Bt,V as Ur,W as Fr,X as na,k as ia,S as ra}from"../chunks/CvlmyTT0.js";import{S as Ss,i as Cs,d as sa,t as oa,a as aa,m as la,e as ca,b as ha}from"../chunks/C5mepjIe.js";import{e as jr}from"../chunks/D6YF6ztN.js";import{s as ua}from"../chunks/D7z3DisO.js";import{w as da}from"../chunks/f01t9ARR.js";var Br={};/**
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
 */const ks=function(i){const e=[];let n=0;for(let r=0;r<i.length;r++){let o=i.charCodeAt(r);o<128?e[n++]=o:o<2048?(e[n++]=o>>6|192,e[n++]=o&63|128):(o&64512)===55296&&r+1<i.length&&(i.charCodeAt(r+1)&64512)===56320?(o=65536+((o&1023)<<10)+(i.charCodeAt(++r)&1023),e[n++]=o>>18|240,e[n++]=o>>12&63|128,e[n++]=o>>6&63|128,e[n++]=o&63|128):(e[n++]=o>>12|224,e[n++]=o>>6&63|128,e[n++]=o&63|128)}return e},fa=function(i){const e=[];let n=0,r=0;for(;n<i.length;){const o=i[n++];if(o<128)e[r++]=String.fromCharCode(o);else if(o>191&&o<224){const l=i[n++];e[r++]=String.fromCharCode((o&31)<<6|l&63)}else if(o>239&&o<365){const l=i[n++],h=i[n++],g=i[n++],w=((o&7)<<18|(l&63)<<12|(h&63)<<6|g&63)-65536;e[r++]=String.fromCharCode(55296+(w>>10)),e[r++]=String.fromCharCode(56320+(w&1023))}else{const l=i[n++],h=i[n++];e[r++]=String.fromCharCode((o&15)<<12|(l&63)<<6|h&63)}}return e.join("")},Ps={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(i,e){if(!Array.isArray(i))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let o=0;o<i.length;o+=3){const l=i[o],h=o+1<i.length,g=h?i[o+1]:0,w=o+2<i.length,E=w?i[o+2]:0,A=l>>2,R=(l&3)<<4|g>>4;let k=(g&15)<<2|E>>6,z=E&63;w||(z=64,h||(k=64)),r.push(n[A],n[R],n[k],n[z])}return r.join("")},encodeString(i,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(i):this.encodeByteArray(ks(i),e)},decodeString(i,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(i):fa(this.decodeStringToByteArray(i,e))},decodeStringToByteArray(i,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let o=0;o<i.length;){const l=n[i.charAt(o++)],g=o<i.length?n[i.charAt(o)]:0;++o;const E=o<i.length?n[i.charAt(o)]:64;++o;const R=o<i.length?n[i.charAt(o)]:64;if(++o,l==null||g==null||E==null||R==null)throw new pa;const k=l<<2|g>>4;if(r.push(k),E!==64){const z=g<<4&240|E>>2;if(r.push(z),R!==64){const S=E<<6&192|R;r.push(S)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let i=0;i<this.ENCODED_VALS.length;i++)this.byteToCharMap_[i]=this.ENCODED_VALS.charAt(i),this.charToByteMap_[this.byteToCharMap_[i]]=i,this.byteToCharMapWebSafe_[i]=this.ENCODED_VALS_WEBSAFE.charAt(i),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]]=i,i>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)]=i,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)]=i)}}};class pa extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ga=function(i){const e=ks(i);return Ps.encodeByteArray(e,!0)},wn=function(i){return ga(i).replace(/\./g,"")},Rs=function(i){try{return Ps.decodeString(i,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function ma(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const va=()=>ma().__FIREBASE_DEFAULTS__,_a=()=>{if(typeof process>"u"||typeof Br>"u")return;const i=Br.__FIREBASE_DEFAULTS__;if(i)return JSON.parse(i)},ya=()=>{if(typeof document>"u")return;let i;try{i=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=i&&Rs(i[1]);return e&&JSON.parse(e)},wi=()=>{try{return va()||_a()||ya()}catch(i){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${i}`);return}},Os=i=>{var e,n;return(n=(e=wi())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[i]},wa=i=>{const e=Os(i);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},Ds=()=>{var i;return(i=wi())===null||i===void 0?void 0:i.config},Ns=i=>{var e;return(e=wi())===null||e===void 0?void 0:e[`_${i}`]};/**
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
 */class Ia{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
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
 */function Ea(i,e){if(i.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",o=i.iat||0,l=i.sub||i.user_id;if(!l)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const h=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:o,exp:o+3600,auth_time:o,sub:l,user_id:l,firebase:{sign_in_provider:"custom",identities:{}}},i);return[wn(JSON.stringify(n)),wn(JSON.stringify(h)),""].join(".")}/**
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
 */function me(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ta(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(me())}function ba(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Aa(){const i=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof i=="object"&&i.id!==void 0}function Sa(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Ca(){const i=me();return i.indexOf("MSIE ")>=0||i.indexOf("Trident/")>=0}function ka(){try{return typeof indexedDB=="object"}catch{return!1}}function Pa(){return new Promise((i,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",o=self.indexedDB.open(r);o.onsuccess=()=>{o.result.close(),n||self.indexedDB.deleteDatabase(r),i(!0)},o.onupgradeneeded=()=>{n=!1},o.onerror=()=>{var l;e(((l=o.error)===null||l===void 0?void 0:l.message)||"")}}catch(n){e(n)}})}/**
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
 */const Ra="FirebaseError";class Ve extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=Ra,Object.setPrototypeOf(this,Ve.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,qt.prototype.create)}}class qt{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},o=`${this.service}/${e}`,l=this.errors[e],h=l?Oa(l,r):"Error",g=`${this.serviceName}: ${h} (${o}).`;return new Ve(o,g,r)}}function Oa(i,e){return i.replace(Da,(n,r)=>{const o=e[r];return o!=null?String(o):`<${r}?>`})}const Da=/\{\$([^}]+)}/g;function Na(i){for(const e in i)if(Object.prototype.hasOwnProperty.call(i,e))return!1;return!0}function In(i,e){if(i===e)return!0;const n=Object.keys(i),r=Object.keys(e);for(const o of n){if(!r.includes(o))return!1;const l=i[o],h=e[o];if(Vr(l)&&Vr(h)){if(!In(l,h))return!1}else if(l!==h)return!1}for(const o of r)if(!n.includes(o))return!1;return!0}function Vr(i){return i!==null&&typeof i=="object"}/**
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
 */function Jt(i){const e=[];for(const[n,r]of Object.entries(i))Array.isArray(r)?r.forEach(o=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(o))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function xa(i,e){const n=new La(i,e);return n.subscribe.bind(n)}class La{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let o;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");Ma(e,["next","error","complete"])?o=e:o={next:e,error:n,complete:r},o.next===void 0&&(o.next=ni),o.error===void 0&&(o.error=ni),o.complete===void 0&&(o.complete=ni);const l=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?o.error(this.finalError):o.complete()}catch{}}),this.observers.push(o),l}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Ma(i,e){if(typeof i!="object"||i===null)return!1;for(const n of e)if(n in i&&typeof i[n]=="function")return!0;return!1}function ni(){}/**
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
 */function He(i){return i&&i._delegate?i._delegate:i}class ht{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const at="[DEFAULT]";/**
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
 */class Ua{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Ia;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const o=this.getOrInitializeService({instanceIdentifier:n});o&&r.resolve(o)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),o=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(l){if(o)return null;throw l}else{if(o)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(ja(e))try{this.getOrInitializeService({instanceIdentifier:at})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const o=this.normalizeInstanceIdentifier(n);try{const l=this.getOrInitializeService({instanceIdentifier:o});r.resolve(l)}catch{}}}}clearInstance(e=at){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=at){return this.instances.has(e)}getOptions(e=at){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const o=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[l,h]of this.instancesDeferred.entries()){const g=this.normalizeInstanceIdentifier(l);r===g&&h.resolve(o)}return o}onInit(e,n){var r;const o=this.normalizeInstanceIdentifier(n),l=(r=this.onInitCallbacks.get(o))!==null&&r!==void 0?r:new Set;l.add(e),this.onInitCallbacks.set(o,l);const h=this.instances.get(o);return h&&e(h,o),()=>{l.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const o of r)try{o(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Fa(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=at){return this.component?this.component.multipleInstances?e:at:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Fa(i){return i===at?void 0:i}function ja(i){return i.instantiationMode==="EAGER"}/**
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
 */class Ba{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Ua(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var $;(function(i){i[i.DEBUG=0]="DEBUG",i[i.VERBOSE=1]="VERBOSE",i[i.INFO=2]="INFO",i[i.WARN=3]="WARN",i[i.ERROR=4]="ERROR",i[i.SILENT=5]="SILENT"})($||($={}));const Va={debug:$.DEBUG,verbose:$.VERBOSE,info:$.INFO,warn:$.WARN,error:$.ERROR,silent:$.SILENT},Ha=$.INFO,$a={[$.DEBUG]:"log",[$.VERBOSE]:"log",[$.INFO]:"info",[$.WARN]:"warn",[$.ERROR]:"error"},za=(i,e,...n)=>{if(e<i.logLevel)return;const r=new Date().toISOString(),o=$a[e];if(o)console[o](`[${r}]  ${i.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Ii{constructor(e){this.name=e,this._logLevel=Ha,this._logHandler=za,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in $))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Va[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,$.DEBUG,...e),this._logHandler(this,$.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,$.VERBOSE,...e),this._logHandler(this,$.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,$.INFO,...e),this._logHandler(this,$.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,$.WARN,...e),this._logHandler(this,$.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,$.ERROR,...e),this._logHandler(this,$.ERROR,...e)}}const Wa=(i,e)=>e.some(n=>i instanceof n);let Hr,$r;function Ga(){return Hr||(Hr=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Ka(){return $r||($r=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const xs=new WeakMap,ui=new WeakMap,Ls=new WeakMap,ii=new WeakMap,Ei=new WeakMap;function qa(i){const e=new Promise((n,r)=>{const o=()=>{i.removeEventListener("success",l),i.removeEventListener("error",h)},l=()=>{n(Qe(i.result)),o()},h=()=>{r(i.error),o()};i.addEventListener("success",l),i.addEventListener("error",h)});return e.then(n=>{n instanceof IDBCursor&&xs.set(n,i)}).catch(()=>{}),Ei.set(e,i),e}function Ja(i){if(ui.has(i))return;const e=new Promise((n,r)=>{const o=()=>{i.removeEventListener("complete",l),i.removeEventListener("error",h),i.removeEventListener("abort",h)},l=()=>{n(),o()},h=()=>{r(i.error||new DOMException("AbortError","AbortError")),o()};i.addEventListener("complete",l),i.addEventListener("error",h),i.addEventListener("abort",h)});ui.set(i,e)}let di={get(i,e,n){if(i instanceof IDBTransaction){if(e==="done")return ui.get(i);if(e==="objectStoreNames")return i.objectStoreNames||Ls.get(i);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Qe(i[e])},set(i,e,n){return i[e]=n,!0},has(i,e){return i instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in i}};function Xa(i){di=i(di)}function Ya(i){return i===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=i.call(ri(this),e,...n);return Ls.set(r,e.sort?e.sort():[e]),Qe(r)}:Ka().includes(i)?function(...e){return i.apply(ri(this),e),Qe(xs.get(this))}:function(...e){return Qe(i.apply(ri(this),e))}}function Qa(i){return typeof i=="function"?Ya(i):(i instanceof IDBTransaction&&Ja(i),Wa(i,Ga())?new Proxy(i,di):i)}function Qe(i){if(i instanceof IDBRequest)return qa(i);if(ii.has(i))return ii.get(i);const e=Qa(i);return e!==i&&(ii.set(i,e),Ei.set(e,i)),e}const ri=i=>Ei.get(i);function Za(i,e,{blocked:n,upgrade:r,blocking:o,terminated:l}={}){const h=indexedDB.open(i,e),g=Qe(h);return r&&h.addEventListener("upgradeneeded",w=>{r(Qe(h.result),w.oldVersion,w.newVersion,Qe(h.transaction),w)}),n&&h.addEventListener("blocked",w=>n(w.oldVersion,w.newVersion,w)),g.then(w=>{l&&w.addEventListener("close",()=>l()),o&&w.addEventListener("versionchange",E=>o(E.oldVersion,E.newVersion,E))}).catch(()=>{}),g}const el=["get","getKey","getAll","getAllKeys","count"],tl=["put","add","delete","clear"],si=new Map;function zr(i,e){if(!(i instanceof IDBDatabase&&!(e in i)&&typeof e=="string"))return;if(si.get(e))return si.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,o=tl.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(o||el.includes(n)))return;const l=async function(h,...g){const w=this.transaction(h,o?"readwrite":"readonly");let E=w.store;return r&&(E=E.index(g.shift())),(await Promise.all([E[n](...g),o&&w.done]))[0]};return si.set(e,l),l}Xa(i=>({...i,get:(e,n,r)=>zr(e,n)||i.get(e,n,r),has:(e,n)=>!!zr(e,n)||i.has(e,n)}));/**
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
 */class nl{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(il(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function il(i){const e=i.getComponent();return(e==null?void 0:e.type)==="VERSION"}const fi="@firebase/app",Wr="0.10.13";/**
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
 */const Fe=new Ii("@firebase/app"),rl="@firebase/app-compat",sl="@firebase/analytics-compat",ol="@firebase/analytics",al="@firebase/app-check-compat",ll="@firebase/app-check",cl="@firebase/auth",hl="@firebase/auth-compat",ul="@firebase/database",dl="@firebase/data-connect",fl="@firebase/database-compat",pl="@firebase/functions",gl="@firebase/functions-compat",ml="@firebase/installations",vl="@firebase/installations-compat",_l="@firebase/messaging",yl="@firebase/messaging-compat",wl="@firebase/performance",Il="@firebase/performance-compat",El="@firebase/remote-config",Tl="@firebase/remote-config-compat",bl="@firebase/storage",Al="@firebase/storage-compat",Sl="@firebase/firestore",Cl="@firebase/vertexai-preview",kl="@firebase/firestore-compat",Pl="firebase",Rl="10.14.1";/**
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
 */const pi="[DEFAULT]",Ol={[fi]:"fire-core",[rl]:"fire-core-compat",[ol]:"fire-analytics",[sl]:"fire-analytics-compat",[ll]:"fire-app-check",[al]:"fire-app-check-compat",[cl]:"fire-auth",[hl]:"fire-auth-compat",[ul]:"fire-rtdb",[dl]:"fire-data-connect",[fl]:"fire-rtdb-compat",[pl]:"fire-fn",[gl]:"fire-fn-compat",[ml]:"fire-iid",[vl]:"fire-iid-compat",[_l]:"fire-fcm",[yl]:"fire-fcm-compat",[wl]:"fire-perf",[Il]:"fire-perf-compat",[El]:"fire-rc",[Tl]:"fire-rc-compat",[bl]:"fire-gcs",[Al]:"fire-gcs-compat",[Sl]:"fire-fst",[kl]:"fire-fst-compat",[Cl]:"fire-vertex","fire-js":"fire-js",[Pl]:"fire-js-all"};/**
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
 */const Wt=new Map,Dl=new Map,gi=new Map;function Gr(i,e){try{i.container.addComponent(e)}catch(n){Fe.debug(`Component ${e.name} failed to register with FirebaseApp ${i.name}`,n)}}function wt(i){const e=i.name;if(gi.has(e))return Fe.debug(`There were multiple attempts to register component ${e}.`),!1;gi.set(e,i);for(const n of Wt.values())Gr(n,i);for(const n of Dl.values())Gr(n,i);return!0}function Ti(i,e){const n=i.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),i.container.getProvider(e)}function xe(i){return i.settings!==void 0}/**
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
 */const Nl={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Ze=new qt("app","Firebase",Nl);/**
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
 */class xl{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new ht("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Ze.create("app-deleted",{appName:this._name})}}/**
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
 */const Tt=Rl;function Ms(i,e={}){let n=i;typeof e!="object"&&(e={name:e});const r=Object.assign({name:pi,automaticDataCollectionEnabled:!1},e),o=r.name;if(typeof o!="string"||!o)throw Ze.create("bad-app-name",{appName:String(o)});if(n||(n=Ds()),!n)throw Ze.create("no-options");const l=Wt.get(o);if(l){if(In(n,l.options)&&In(r,l.config))return l;throw Ze.create("duplicate-app",{appName:o})}const h=new Ba(o);for(const w of gi.values())h.addComponent(w);const g=new xl(n,r,h);return Wt.set(o,g),g}function bi(i=pi){const e=Wt.get(i);if(!e&&i===pi&&Ds())return Ms();if(!e)throw Ze.create("no-app",{appName:i});return e}function Ll(){return Array.from(Wt.values())}function et(i,e,n){var r;let o=(r=Ol[i])!==null&&r!==void 0?r:i;n&&(o+=`-${n}`);const l=o.match(/\s|\//),h=e.match(/\s|\//);if(l||h){const g=[`Unable to register library "${o}" with version "${e}":`];l&&g.push(`library name "${o}" contains illegal characters (whitespace or "/")`),l&&h&&g.push("and"),h&&g.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Fe.warn(g.join(" "));return}wt(new ht(`${o}-version`,()=>({library:o,version:e}),"VERSION"))}/**
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
 */const Ml="firebase-heartbeat-database",Ul=1,Gt="firebase-heartbeat-store";let oi=null;function Us(){return oi||(oi=Za(Ml,Ul,{upgrade:(i,e)=>{switch(e){case 0:try{i.createObjectStore(Gt)}catch(n){console.warn(n)}}}}).catch(i=>{throw Ze.create("idb-open",{originalErrorMessage:i.message})})),oi}async function Fl(i){try{const n=(await Us()).transaction(Gt),r=await n.objectStore(Gt).get(Fs(i));return await n.done,r}catch(e){if(e instanceof Ve)Fe.warn(e.message);else{const n=Ze.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Fe.warn(n.message)}}}async function Kr(i,e){try{const r=(await Us()).transaction(Gt,"readwrite");await r.objectStore(Gt).put(e,Fs(i)),await r.done}catch(n){if(n instanceof Ve)Fe.warn(n.message);else{const r=Ze.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Fe.warn(r.message)}}}function Fs(i){return`${i.name}!${i.options.appId}`}/**
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
 */const jl=1024,Bl=30*24*60*60*1e3;class Vl{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new $l(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const o=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),l=qr();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===l||this._heartbeatsCache.heartbeats.some(h=>h.date===l)?void 0:(this._heartbeatsCache.heartbeats.push({date:l,agent:o}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(h=>{const g=new Date(h.date).valueOf();return Date.now()-g<=Bl}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Fe.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=qr(),{heartbeatsToSend:r,unsentEntries:o}=Hl(this._heartbeatsCache.heartbeats),l=wn(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,o.length>0?(this._heartbeatsCache.heartbeats=o,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),l}catch(n){return Fe.warn(n),""}}}function qr(){return new Date().toISOString().substring(0,10)}function Hl(i,e=jl){const n=[];let r=i.slice();for(const o of i){const l=n.find(h=>h.agent===o.agent);if(l){if(l.dates.push(o.date),Jr(n)>e){l.dates.pop();break}}else if(n.push({agent:o.agent,dates:[o.date]}),Jr(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class $l{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return ka()?Pa().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Fl(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const o=await this.read();return Kr(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:o.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const o=await this.read();return Kr(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:o.lastSentHeartbeatDate,heartbeats:[...o.heartbeats,...e.heartbeats]})}else return}}function Jr(i){return wn(JSON.stringify({version:2,heartbeats:i})).length}/**
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
 */function zl(i){wt(new ht("platform-logger",e=>new nl(e),"PRIVATE")),wt(new ht("heartbeat",e=>new Vl(e),"PRIVATE")),et(fi,Wr,i),et(fi,Wr,"esm2017"),et("fire-js","")}zl("");var Wl="firebase",Gl="10.14.1";/**
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
 */et(Wl,Gl,"app");function Ai(i,e){var n={};for(var r in i)Object.prototype.hasOwnProperty.call(i,r)&&e.indexOf(r)<0&&(n[r]=i[r]);if(i!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,r=Object.getOwnPropertySymbols(i);o<r.length;o++)e.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(i,r[o])&&(n[r[o]]=i[r[o]]);return n}function js(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Kl=js,Bs=new qt("auth","Firebase",js());/**
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
 */const En=new Ii("@firebase/auth");function ql(i,...e){En.logLevel<=$.WARN&&En.warn(`Auth (${Tt}): ${i}`,...e)}function gn(i,...e){En.logLevel<=$.ERROR&&En.error(`Auth (${Tt}): ${i}`,...e)}/**
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
 */function Re(i,...e){throw Ci(i,...e)}function Ce(i,...e){return Ci(i,...e)}function Si(i,e,n){const r=Object.assign(Object.assign({},Kl()),{[e]:n});return new qt("auth","Firebase",r).create(e,{appName:i.name})}function ct(i){return Si(i,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Jl(i,e,n){const r=n;if(!(e instanceof r))throw r.name!==e.constructor.name&&Re(i,"argument-error"),Si(i,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Ci(i,...e){if(typeof i!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=i.name),i._errorFactory.create(n,...r)}return Bs.create(i,...e)}function C(i,e,...n){if(!i)throw Ci(e,...n)}function Le(i){const e="INTERNAL ASSERTION FAILED: "+i;throw gn(e),new Error(e)}function je(i,e){i||Le(e)}/**
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
 */function mi(){var i;return typeof self<"u"&&((i=self.location)===null||i===void 0?void 0:i.href)||""}function Xl(){return Xr()==="http:"||Xr()==="https:"}function Xr(){var i;return typeof self<"u"&&((i=self.location)===null||i===void 0?void 0:i.protocol)||null}/**
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
 */function Yl(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Xl()||Aa()||"connection"in navigator)?navigator.onLine:!0}function Ql(){if(typeof navigator>"u")return null;const i=navigator;return i.languages&&i.languages[0]||i.language||null}/**
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
 */class Xt{constructor(e,n){this.shortDelay=e,this.longDelay=n,je(n>e,"Short delay should be less than long delay!"),this.isMobile=Ta()||Sa()}get(){return Yl()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function ki(i,e){je(i.emulator,"Emulator should always be set here");const{url:n}=i.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
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
 */class Vs{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Le("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Le("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Le("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const Zl={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const ec=new Xt(3e4,6e4);function Pi(i,e){return i.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:i.tenantId}):e}async function bt(i,e,n,r,o={}){return Hs(i,o,async()=>{let l={},h={};r&&(e==="GET"?h=r:l={body:JSON.stringify(r)});const g=Jt(Object.assign({key:i.config.apiKey},h)).slice(1),w=await i._getAdditionalHeaders();w["Content-Type"]="application/json",i.languageCode&&(w["X-Firebase-Locale"]=i.languageCode);const E=Object.assign({method:e,headers:w},l);return ba()||(E.referrerPolicy="no-referrer"),Vs.fetch()($s(i,i.config.apiHost,n,g),E)})}async function Hs(i,e,n){i._canInitEmulator=!1;const r=Object.assign(Object.assign({},Zl),e);try{const o=new nc(i),l=await Promise.race([n(),o.promise]);o.clearNetworkTimeout();const h=await l.json();if("needConfirmation"in h)throw fn(i,"account-exists-with-different-credential",h);if(l.ok&&!("errorMessage"in h))return h;{const g=l.ok?h.errorMessage:h.error.message,[w,E]=g.split(" : ");if(w==="FEDERATED_USER_ID_ALREADY_LINKED")throw fn(i,"credential-already-in-use",h);if(w==="EMAIL_EXISTS")throw fn(i,"email-already-in-use",h);if(w==="USER_DISABLED")throw fn(i,"user-disabled",h);const A=r[w]||w.toLowerCase().replace(/[_\s]+/g,"-");if(E)throw Si(i,A,E);Re(i,A)}}catch(o){if(o instanceof Ve)throw o;Re(i,"network-request-failed",{message:String(o)})}}async function tc(i,e,n,r,o={}){const l=await bt(i,e,n,r,o);return"mfaPendingCredential"in l&&Re(i,"multi-factor-auth-required",{_serverResponse:l}),l}function $s(i,e,n,r){const o=`${e}${n}?${r}`;return i.config.emulator?ki(i.config,o):`${i.config.apiScheme}://${o}`}class nc{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(Ce(this.auth,"network-request-failed")),ec.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function fn(i,e,n){const r={appName:i.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const o=Ce(i,e,r);return o.customData._tokenResponse=n,o}/**
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
 */async function ic(i,e){return bt(i,"POST","/v1/accounts:delete",e)}async function zs(i,e){return bt(i,"POST","/v1/accounts:lookup",e)}/**
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
 */function Vt(i){if(i)try{const e=new Date(Number(i));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function rc(i,e=!1){const n=He(i),r=await n.getIdToken(e),o=Ri(r);C(o&&o.exp&&o.auth_time&&o.iat,n.auth,"internal-error");const l=typeof o.firebase=="object"?o.firebase:void 0,h=l==null?void 0:l.sign_in_provider;return{claims:o,token:r,authTime:Vt(ai(o.auth_time)),issuedAtTime:Vt(ai(o.iat)),expirationTime:Vt(ai(o.exp)),signInProvider:h||null,signInSecondFactor:(l==null?void 0:l.sign_in_second_factor)||null}}function ai(i){return Number(i)*1e3}function Ri(i){const[e,n,r]=i.split(".");if(e===void 0||n===void 0||r===void 0)return gn("JWT malformed, contained fewer than 3 sections"),null;try{const o=Rs(n);return o?JSON.parse(o):(gn("Failed to decode base64 JWT payload"),null)}catch(o){return gn("Caught error parsing JWT payload as JSON",o==null?void 0:o.toString()),null}}function Yr(i){const e=Ri(i);return C(e,"internal-error"),C(typeof e.exp<"u","internal-error"),C(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Kt(i,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof Ve&&sc(r)&&i.auth.currentUser===i&&await i.auth.signOut(),r}}function sc({code:i}){return i==="auth/user-disabled"||i==="auth/user-token-expired"}/**
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
 */class oc{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const o=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,o)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class vi{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Vt(this.lastLoginAt),this.creationTime=Vt(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Tn(i){var e;const n=i.auth,r=await i.getIdToken(),o=await Kt(i,zs(n,{idToken:r}));C(o==null?void 0:o.users.length,n,"internal-error");const l=o.users[0];i._notifyReloadListener(l);const h=!((e=l.providerUserInfo)===null||e===void 0)&&e.length?Ws(l.providerUserInfo):[],g=lc(i.providerData,h),w=i.isAnonymous,E=!(i.email&&l.passwordHash)&&!(g!=null&&g.length),A=w?E:!1,R={uid:l.localId,displayName:l.displayName||null,photoURL:l.photoUrl||null,email:l.email||null,emailVerified:l.emailVerified||!1,phoneNumber:l.phoneNumber||null,tenantId:l.tenantId||null,providerData:g,metadata:new vi(l.createdAt,l.lastLoginAt),isAnonymous:A};Object.assign(i,R)}async function ac(i){const e=He(i);await Tn(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function lc(i,e){return[...i.filter(r=>!e.some(o=>o.providerId===r.providerId)),...e]}function Ws(i){return i.map(e=>{var{providerId:n}=e,r=Ai(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
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
 */async function cc(i,e){const n=await Hs(i,{},async()=>{const r=Jt({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:o,apiKey:l}=i.config,h=$s(i,o,"/v1/token",`key=${l}`),g=await i._getAdditionalHeaders();return g["Content-Type"]="application/x-www-form-urlencoded",Vs.fetch()(h,{method:"POST",headers:g,body:r})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function hc(i,e){return bt(i,"POST","/v2/accounts:revokeToken",Pi(i,e))}/**
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
 */class vt{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){C(e.idToken,"internal-error"),C(typeof e.idToken<"u","internal-error"),C(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Yr(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){C(e.length!==0,"internal-error");const n=Yr(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(C(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:o,expiresIn:l}=await cc(e,n);this.updateTokensAndExpiration(r,o,Number(l))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:o,expirationTime:l}=n,h=new vt;return r&&(C(typeof r=="string","internal-error",{appName:e}),h.refreshToken=r),o&&(C(typeof o=="string","internal-error",{appName:e}),h.accessToken=o),l&&(C(typeof l=="number","internal-error",{appName:e}),h.expirationTime=l),h}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new vt,this.toJSON())}_performRefresh(){return Le("not implemented")}}/**
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
 */function Ke(i,e){C(typeof i=="string"||typeof i>"u","internal-error",{appName:e})}class Me{constructor(e){var{uid:n,auth:r,stsTokenManager:o}=e,l=Ai(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new oc(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=o,this.accessToken=o.accessToken,this.displayName=l.displayName||null,this.email=l.email||null,this.emailVerified=l.emailVerified||!1,this.phoneNumber=l.phoneNumber||null,this.photoURL=l.photoURL||null,this.isAnonymous=l.isAnonymous||!1,this.tenantId=l.tenantId||null,this.providerData=l.providerData?[...l.providerData]:[],this.metadata=new vi(l.createdAt||void 0,l.lastLoginAt||void 0)}async getIdToken(e){const n=await Kt(this,this.stsTokenManager.getToken(this.auth,e));return C(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return rc(this,e)}reload(){return ac(this)}_assign(e){this!==e&&(C(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new Me(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){C(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await Tn(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(xe(this.auth.app))return Promise.reject(ct(this.auth));const e=await this.getIdToken();return await Kt(this,ic(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,o,l,h,g,w,E,A;const R=(r=n.displayName)!==null&&r!==void 0?r:void 0,k=(o=n.email)!==null&&o!==void 0?o:void 0,z=(l=n.phoneNumber)!==null&&l!==void 0?l:void 0,S=(h=n.photoURL)!==null&&h!==void 0?h:void 0,N=(g=n.tenantId)!==null&&g!==void 0?g:void 0,F=(w=n._redirectEventId)!==null&&w!==void 0?w:void 0,te=(E=n.createdAt)!==null&&E!==void 0?E:void 0,B=(A=n.lastLoginAt)!==null&&A!==void 0?A:void 0,{uid:L,emailVerified:J,isAnonymous:se,providerData:H,stsTokenManager:v}=n;C(L&&v,e,"internal-error");const u=vt.fromJSON(this.name,v);C(typeof L=="string",e,"internal-error"),Ke(R,e.name),Ke(k,e.name),C(typeof J=="boolean",e,"internal-error"),C(typeof se=="boolean",e,"internal-error"),Ke(z,e.name),Ke(S,e.name),Ke(N,e.name),Ke(F,e.name),Ke(te,e.name),Ke(B,e.name);const f=new Me({uid:L,auth:e,email:k,emailVerified:J,displayName:R,isAnonymous:se,photoURL:S,phoneNumber:z,tenantId:N,stsTokenManager:u,createdAt:te,lastLoginAt:B});return H&&Array.isArray(H)&&(f.providerData=H.map(p=>Object.assign({},p))),F&&(f._redirectEventId=F),f}static async _fromIdTokenResponse(e,n,r=!1){const o=new vt;o.updateFromServerResponse(n);const l=new Me({uid:n.localId,auth:e,stsTokenManager:o,isAnonymous:r});return await Tn(l),l}static async _fromGetAccountInfoResponse(e,n,r){const o=n.users[0];C(o.localId!==void 0,"internal-error");const l=o.providerUserInfo!==void 0?Ws(o.providerUserInfo):[],h=!(o.email&&o.passwordHash)&&!(l!=null&&l.length),g=new vt;g.updateFromIdToken(r);const w=new Me({uid:o.localId,auth:e,stsTokenManager:g,isAnonymous:h}),E={uid:o.localId,displayName:o.displayName||null,photoURL:o.photoUrl||null,email:o.email||null,emailVerified:o.emailVerified||!1,phoneNumber:o.phoneNumber||null,tenantId:o.tenantId||null,providerData:l,metadata:new vi(o.createdAt,o.lastLoginAt),isAnonymous:!(o.email&&o.passwordHash)&&!(l!=null&&l.length)};return Object.assign(w,E),w}}/**
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
 */const Qr=new Map;function Ue(i){je(i instanceof Function,"Expected a class definition");let e=Qr.get(i);return e?(je(e instanceof i,"Instance stored in cache mismatched with class"),e):(e=new i,Qr.set(i,e),e)}/**
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
 */class Gs{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Gs.type="NONE";const Zr=Gs;/**
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
 */function mn(i,e,n){return`firebase:${i}:${e}:${n}`}class _t{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:o,name:l}=this.auth;this.fullUserKey=mn(this.userKey,o.apiKey,l),this.fullPersistenceKey=mn("persistence",o.apiKey,l),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?Me._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new _t(Ue(Zr),e,r);const o=(await Promise.all(n.map(async E=>{if(await E._isAvailable())return E}))).filter(E=>E);let l=o[0]||Ue(Zr);const h=mn(r,e.config.apiKey,e.name);let g=null;for(const E of n)try{const A=await E._get(h);if(A){const R=Me._fromJSON(e,A);E!==l&&(g=R),l=E;break}}catch{}const w=o.filter(E=>E._shouldAllowMigration);return!l._shouldAllowMigration||!w.length?new _t(l,e,r):(l=w[0],g&&await l._set(h,g.toJSON()),await Promise.all(n.map(async E=>{if(E!==l)try{await E._remove(h)}catch{}})),new _t(l,e,r))}}/**
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
 */function es(i){const e=i.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Xs(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Ks(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Qs(e))return"Blackberry";if(Zs(e))return"Webos";if(qs(e))return"Safari";if((e.includes("chrome/")||Js(e))&&!e.includes("edge/"))return"Chrome";if(Ys(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=i.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Ks(i=me()){return/firefox\//i.test(i)}function qs(i=me()){const e=i.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Js(i=me()){return/crios\//i.test(i)}function Xs(i=me()){return/iemobile/i.test(i)}function Ys(i=me()){return/android/i.test(i)}function Qs(i=me()){return/blackberry/i.test(i)}function Zs(i=me()){return/webos/i.test(i)}function Oi(i=me()){return/iphone|ipad|ipod/i.test(i)||/macintosh/i.test(i)&&/mobile/i.test(i)}function uc(i=me()){var e;return Oi(i)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function dc(){return Ca()&&document.documentMode===10}function eo(i=me()){return Oi(i)||Ys(i)||Zs(i)||Qs(i)||/windows phone/i.test(i)||Xs(i)}/**
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
 */function to(i,e=[]){let n;switch(i){case"Browser":n=es(me());break;case"Worker":n=`${es(me())}-${i}`;break;default:n=i}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Tt}/${r}`}/**
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
 */class fc{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=l=>new Promise((h,g)=>{try{const w=e(l);h(w)}catch(w){g(w)}});r.onAbort=n,this.queue.push(r);const o=this.queue.length-1;return()=>{this.queue[o]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const o of n)try{o()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function pc(i,e={}){return bt(i,"GET","/v2/passwordPolicy",Pi(i,e))}/**
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
 */const gc=6;class mc{constructor(e){var n,r,o,l;const h=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=h.minPasswordLength)!==null&&n!==void 0?n:gc,h.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=h.maxPasswordLength),h.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=h.containsLowercaseCharacter),h.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=h.containsUppercaseCharacter),h.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=h.containsNumericCharacter),h.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=h.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(o=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&o!==void 0?o:"",this.forceUpgradeOnSignin=(l=e.forceUpgradeOnSignin)!==null&&l!==void 0?l:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,o,l,h,g;const w={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,w),this.validatePasswordCharacterOptions(e,w),w.isValid&&(w.isValid=(n=w.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),w.isValid&&(w.isValid=(r=w.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),w.isValid&&(w.isValid=(o=w.containsLowercaseLetter)!==null&&o!==void 0?o:!0),w.isValid&&(w.isValid=(l=w.containsUppercaseLetter)!==null&&l!==void 0?l:!0),w.isValid&&(w.isValid=(h=w.containsNumericCharacter)!==null&&h!==void 0?h:!0),w.isValid&&(w.isValid=(g=w.containsNonAlphanumericCharacter)!==null&&g!==void 0?g:!0),w}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,o=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),o&&(n.meetsMaxPasswordLength=e.length<=o)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let o=0;o<e.length;o++)r=e.charAt(o),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,o,l){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=o)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=l))}}/**
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
 */class vc{constructor(e,n,r,o){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=o,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new ts(this),this.idTokenSubscription=new ts(this),this.beforeStateQueue=new fc(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Bs,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=o.sdkClientVersion}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Ue(n)),this._initializationPromise=this.queue(async()=>{var r,o;if(!this._deleted&&(this.persistenceManager=await _t.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((o=this.currentUser)===null||o===void 0?void 0:o.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await zs(this,{idToken:e}),r=await Me._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(xe(this.app)){const h=this.app.settings.authIdToken;return h?new Promise(g=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(h).then(g,g))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let o=r,l=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const h=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,g=o==null?void 0:o._redirectEventId,w=await this.tryRedirectSignIn(e);(!h||h===g)&&(w!=null&&w.user)&&(o=w.user,l=!0)}if(!o)return this.directlySetCurrentUser(null);if(!o._redirectEventId){if(l)try{await this.beforeStateQueue.runMiddleware(o)}catch(h){o=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(h))}return o?this.reloadAndSetCurrentUserOrClear(o):this.directlySetCurrentUser(null)}return C(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===o._redirectEventId?this.directlySetCurrentUser(o):this.reloadAndSetCurrentUserOrClear(o)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Tn(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Ql()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(xe(this.app))return Promise.reject(ct(this));const n=e?He(e):null;return n&&C(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&C(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return xe(this.app)?Promise.reject(ct(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return xe(this.app)?Promise.reject(ct(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Ue(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await pc(this),n=new mc(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new qt("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await hc(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&Ue(e)||this._popupRedirectResolver;C(n,this,"argument-error"),this.redirectPersistenceManager=await _t.create(this,[Ue(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,o){if(this._deleted)return()=>{};const l=typeof n=="function"?n:n.next.bind(n);let h=!1;const g=this._isInitialized?Promise.resolve():this._initializationPromise;if(C(g,this,"internal-error"),g.then(()=>{h||l(this.currentUser)}),typeof n=="function"){const w=e.addObserver(n,r,o);return()=>{h=!0,w()}}else{const w=e.addObserver(n);return()=>{h=!0,w()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return C(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=to(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const o=await this._getAppCheckToken();return o&&(n["X-Firebase-AppCheck"]=o),n}async _getAppCheckToken(){var e;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&ql(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Pn(i){return He(i)}class ts{constructor(e){this.auth=e,this.observer=null,this.addObserver=xa(n=>this.observer=n)}get next(){return C(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let Di={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function _c(i){Di=i}function yc(i){return Di.loadJS(i)}function wc(){return Di.gapiScript}function Ic(i){return`__${i}${Math.floor(Math.random()*1e6)}`}/**
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
 */function Ec(i,e){const n=Ti(i,"auth");if(n.isInitialized()){const o=n.getImmediate(),l=n.getOptions();if(In(l,e??{}))return o;Re(o,"already-initialized")}return n.initialize({options:e})}function Tc(i,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(Ue);e!=null&&e.errorMap&&i._updateErrorMap(e.errorMap),i._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function bc(i,e,n){const r=Pn(i);C(r._canInitEmulator,r,"emulator-config-failed"),C(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const o=!1,l=no(e),{host:h,port:g}=Ac(e),w=g===null?"":`:${g}`;r.config.emulator={url:`${l}//${h}${w}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:h,port:g,protocol:l.replace(":",""),options:Object.freeze({disableWarnings:o})}),Sc()}function no(i){const e=i.indexOf(":");return e<0?"":i.substr(0,e+1)}function Ac(i){const e=no(i),n=/(\/\/)?([^?#/]+)/.exec(i.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",o=/^(\[[^\]]+\])(:|$)/.exec(r);if(o){const l=o[1];return{host:l,port:ns(r.substr(l.length+1))}}else{const[l,h]=r.split(":");return{host:l,port:ns(h)}}}function ns(i){if(!i)return null;const e=Number(i);return isNaN(e)?null:e}function Sc(){function i(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",i):i())}/**
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
 */class io{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Le("not implemented")}_getIdTokenResponse(e){return Le("not implemented")}_linkToIdToken(e,n){return Le("not implemented")}_getReauthenticationResolver(e){return Le("not implemented")}}/**
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
 */async function yt(i,e){return tc(i,"POST","/v1/accounts:signInWithIdp",Pi(i,e))}/**
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
 */const Cc="http://localhost";class Be extends io{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new Be(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Re("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:o}=n,l=Ai(n,["providerId","signInMethod"]);if(!r||!o)return null;const h=new Be(r,o);return h.idToken=l.idToken||void 0,h.accessToken=l.accessToken||void 0,h.secret=l.secret,h.nonce=l.nonce,h.pendingToken=l.pendingToken||null,h}_getIdTokenResponse(e){const n=this.buildRequest();return yt(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,yt(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,yt(e,n)}buildRequest(){const e={requestUri:Cc,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Jt(n)}return e}}/**
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
 */class Ni{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class At extends Ni{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class Ht extends At{static credentialFromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;return C("providerId"in n&&"signInMethod"in n,"argument-error"),Be._fromParams(n)}credential(e){return this._credential(Object.assign(Object.assign({},e),{nonce:e.rawNonce}))}_credential(e){return C(e.idToken||e.accessToken,"argument-error"),Be._fromParams(Object.assign(Object.assign({},e),{providerId:this.providerId,signInMethod:this.providerId}))}static credentialFromResult(e){return Ht.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return Ht.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r,oauthTokenSecret:o,pendingToken:l,nonce:h,providerId:g}=e;if(!r&&!o&&!n&&!l||!g)return null;try{return new Ht(g)._credential({idToken:n,accessToken:r,nonce:h,pendingToken:l})}catch{return null}}}/**
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
 */class qe extends At{constructor(){super("facebook.com")}static credential(e){return Be._fromParams({providerId:qe.PROVIDER_ID,signInMethod:qe.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return qe.credentialFromTaggedObject(e)}static credentialFromError(e){return qe.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return qe.credential(e.oauthAccessToken)}catch{return null}}}qe.FACEBOOK_SIGN_IN_METHOD="facebook.com";qe.PROVIDER_ID="facebook.com";/**
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
 */class Je extends At{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Be._fromParams({providerId:Je.PROVIDER_ID,signInMethod:Je.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return Je.credentialFromTaggedObject(e)}static credentialFromError(e){return Je.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return Je.credential(n,r)}catch{return null}}}Je.GOOGLE_SIGN_IN_METHOD="google.com";Je.PROVIDER_ID="google.com";/**
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
 */class Xe extends At{constructor(){super("github.com")}static credential(e){return Be._fromParams({providerId:Xe.PROVIDER_ID,signInMethod:Xe.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Xe.credentialFromTaggedObject(e)}static credentialFromError(e){return Xe.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Xe.credential(e.oauthAccessToken)}catch{return null}}}Xe.GITHUB_SIGN_IN_METHOD="github.com";Xe.PROVIDER_ID="github.com";/**
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
 */class Ye extends At{constructor(){super("twitter.com")}static credential(e,n){return Be._fromParams({providerId:Ye.PROVIDER_ID,signInMethod:Ye.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return Ye.credentialFromTaggedObject(e)}static credentialFromError(e){return Ye.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return Ye.credential(n,r)}catch{return null}}}Ye.TWITTER_SIGN_IN_METHOD="twitter.com";Ye.PROVIDER_ID="twitter.com";/**
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
 */class It{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,o=!1){const l=await Me._fromIdTokenResponse(e,r,o),h=is(r);return new It({user:l,providerId:h,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const o=is(r);return new It({user:e,providerId:o,_tokenResponse:r,operationType:n})}}function is(i){return i.providerId?i.providerId:"phoneNumber"in i?"phone":null}/**
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
 */class bn extends Ve{constructor(e,n,r,o){var l;super(n.code,n.message),this.operationType=r,this.user=o,Object.setPrototypeOf(this,bn.prototype),this.customData={appName:e.name,tenantId:(l=e.tenantId)!==null&&l!==void 0?l:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,o){return new bn(e,n,r,o)}}function ro(i,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(i):n._getIdTokenResponse(i)).catch(l=>{throw l.code==="auth/multi-factor-auth-required"?bn._fromErrorAndOperation(i,l,e,r):l})}async function kc(i,e,n=!1){const r=await Kt(i,e._linkToIdToken(i.auth,await i.getIdToken()),n);return It._forOperation(i,"link",r)}/**
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
 */async function Pc(i,e,n=!1){const{auth:r}=i;if(xe(r.app))return Promise.reject(ct(r));const o="reauthenticate";try{const l=await Kt(i,ro(r,o,e,i),n);C(l.idToken,r,"internal-error");const h=Ri(l.idToken);C(h,r,"internal-error");const{sub:g}=h;return C(i.uid===g,r,"user-mismatch"),It._forOperation(i,o,l)}catch(l){throw(l==null?void 0:l.code)==="auth/user-not-found"&&Re(r,"user-mismatch"),l}}/**
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
 */async function Rc(i,e,n=!1){if(xe(i.app))return Promise.reject(ct(i));const r="signIn",o=await ro(i,r,e),l=await It._fromIdTokenResponse(i,r,o);return n||await i._updateCurrentUser(l.user),l}/**
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
 */function Oc(i,e){return He(i).setPersistence(e)}function Dc(i,e,n,r){return He(i).onIdTokenChanged(e,n,r)}function Nc(i,e,n){return He(i).beforeAuthStateChanged(e,n)}function xc(i,e,n,r){return He(i).onAuthStateChanged(e,n,r)}function Lc(i){return He(i).signOut()}const An="__sak";/**
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
 */class so{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(An,"1"),this.storage.removeItem(An),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const Mc=1e3,Uc=10;class oo extends so{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=eo(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),o=this.localCache[n];r!==o&&e(n,o,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((h,g,w)=>{this.notifyListeners(h,w)});return}const r=e.key;n?this.detachListener():this.stopPolling();const o=()=>{const h=this.storage.getItem(r);!n&&this.localCache[r]===h||this.notifyListeners(r,h)},l=this.storage.getItem(r);dc()&&l!==e.newValue&&e.newValue!==e.oldValue?setTimeout(o,Uc):o()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const o of Array.from(r))o(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},Mc)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}oo.type="LOCAL";const ao=oo;/**
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
 */class lo extends so{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}lo.type="SESSION";const co=lo;/**
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
 */function Fc(i){return Promise.all(i.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class Rn{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(o=>o.isListeningto(e));if(n)return n;const r=new Rn(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:o,data:l}=n.data,h=this.handlersMap[o];if(!(h!=null&&h.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:o});const g=Array.from(h).map(async E=>E(n.origin,l)),w=await Fc(g);n.ports[0].postMessage({status:"done",eventId:r,eventType:o,response:w})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Rn.receivers=[];/**
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
 */function xi(i="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return i+n}/**
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
 */class jc{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const o=typeof MessageChannel<"u"?new MessageChannel:null;if(!o)throw new Error("connection_unavailable");let l,h;return new Promise((g,w)=>{const E=xi("",20);o.port1.start();const A=setTimeout(()=>{w(new Error("unsupported_event"))},r);h={messageChannel:o,onMessage(R){const k=R;if(k.data.eventId===E)switch(k.data.status){case"ack":clearTimeout(A),l=setTimeout(()=>{w(new Error("timeout"))},3e3);break;case"done":clearTimeout(l),g(k.data.response);break;default:clearTimeout(A),clearTimeout(l),w(new Error("invalid_response"));break}}},this.handlers.add(h),o.port1.addEventListener("message",h.onMessage),this.target.postMessage({eventType:e,eventId:E,data:n},[o.port2])}).finally(()=>{h&&this.removeMessageHandler(h)})}}/**
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
 */function Pe(){return window}function Bc(i){Pe().location.href=i}/**
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
 */function ho(){return typeof Pe().WorkerGlobalScope<"u"&&typeof Pe().importScripts=="function"}async function Vc(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Hc(){var i;return((i=navigator==null?void 0:navigator.serviceWorker)===null||i===void 0?void 0:i.controller)||null}function $c(){return ho()?self:null}/**
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
 */const uo="firebaseLocalStorageDb",zc=1,Sn="firebaseLocalStorage",fo="fbase_key";class Yt{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function On(i,e){return i.transaction([Sn],e?"readwrite":"readonly").objectStore(Sn)}function Wc(){const i=indexedDB.deleteDatabase(uo);return new Yt(i).toPromise()}function _i(){const i=indexedDB.open(uo,zc);return new Promise((e,n)=>{i.addEventListener("error",()=>{n(i.error)}),i.addEventListener("upgradeneeded",()=>{const r=i.result;try{r.createObjectStore(Sn,{keyPath:fo})}catch(o){n(o)}}),i.addEventListener("success",async()=>{const r=i.result;r.objectStoreNames.contains(Sn)?e(r):(r.close(),await Wc(),e(await _i()))})})}async function rs(i,e,n){const r=On(i,!0).put({[fo]:e,value:n});return new Yt(r).toPromise()}async function Gc(i,e){const n=On(i,!1).get(e),r=await new Yt(n).toPromise();return r===void 0?null:r.value}function ss(i,e){const n=On(i,!0).delete(e);return new Yt(n).toPromise()}const Kc=800,qc=3;class po{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await _i(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>qc)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return ho()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Rn._getInstance($c()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await Vc(),!this.activeServiceWorker)return;this.sender=new jc(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Hc()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await _i();return await rs(e,An,"1"),await ss(e,An),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>rs(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>Gc(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>ss(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(o=>{const l=On(o,!1).getAll();return new Yt(l).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:o,value:l}of e)r.add(o),JSON.stringify(this.localCache[o])!==JSON.stringify(l)&&(this.notifyListeners(o,l),n.push(o));for(const o of Object.keys(this.localCache))this.localCache[o]&&!r.has(o)&&(this.notifyListeners(o,null),n.push(o));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const o of Array.from(r))o(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Kc)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}po.type="LOCAL";const Jc=po;new Xt(3e4,6e4);/**
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
 */function go(i,e){return e?Ue(e):(C(i._popupRedirectResolver,i,"argument-error"),i._popupRedirectResolver)}/**
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
 */class Li extends io{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return yt(e,this._buildIdpRequest())}_linkToIdToken(e,n){return yt(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return yt(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function Xc(i){return Rc(i.auth,new Li(i),i.bypassAuthState)}function Yc(i){const{auth:e,user:n}=i;return C(n,e,"internal-error"),Pc(n,new Li(i),i.bypassAuthState)}async function Qc(i){const{auth:e,user:n}=i;return C(n,e,"internal-error"),kc(n,new Li(i),i.bypassAuthState)}/**
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
 */class mo{constructor(e,n,r,o,l=!1){this.auth=e,this.resolver=r,this.user=o,this.bypassAuthState=l,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:o,tenantId:l,error:h,type:g}=e;if(h){this.reject(h);return}const w={auth:this.auth,requestUri:n,sessionId:r,tenantId:l||void 0,postBody:o||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(g)(w))}catch(E){this.reject(E)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Xc;case"linkViaPopup":case"linkViaRedirect":return Qc;case"reauthViaPopup":case"reauthViaRedirect":return Yc;default:Re(this.auth,"internal-error")}}resolve(e){je(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){je(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const Zc=new Xt(2e3,1e4);async function eh(i,e,n){if(xe(i.app))return Promise.reject(Ce(i,"operation-not-supported-in-this-environment"));const r=Pn(i);Jl(i,e,Ni);const o=go(r,n);return new lt(r,"signInViaPopup",e,o).executeNotNull()}class lt extends mo{constructor(e,n,r,o,l){super(e,n,o,l),this.provider=r,this.authWindow=null,this.pollId=null,lt.currentPopupAction&&lt.currentPopupAction.cancel(),lt.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return C(e,this.auth,"internal-error"),e}async onExecution(){je(this.filter.length===1,"Popup operations only handle one event");const e=xi();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(Ce(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Ce(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,lt.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Ce(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Zc.get())};e()}}lt.currentPopupAction=null;/**
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
 */const th="pendingRedirect",vn=new Map;class nh extends mo{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=vn.get(this.auth._key());if(!e){try{const r=await ih(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}vn.set(this.auth._key(),e)}return this.bypassAuthState||vn.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function ih(i,e){const n=oh(e),r=sh(i);if(!await r._isAvailable())return!1;const o=await r._get(n)==="true";return await r._remove(n),o}function rh(i,e){vn.set(i._key(),e)}function sh(i){return Ue(i._redirectPersistence)}function oh(i){return mn(th,i.config.apiKey,i.name)}async function ah(i,e,n=!1){if(xe(i.app))return Promise.reject(ct(i));const r=Pn(i),o=go(r,e),h=await new nh(r,o,n).execute();return h&&!n&&(delete h.user._redirectEventId,await r._persistUserIfCurrent(h.user),await r._setRedirectUser(null,e)),h}/**
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
 */const lh=10*60*1e3;class ch{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!hh(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!vo(e)){const o=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(Ce(this.auth,o))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=lh&&this.cachedEventUids.clear(),this.cachedEventUids.has(os(e))}saveEventToCache(e){this.cachedEventUids.add(os(e)),this.lastProcessedEventTime=Date.now()}}function os(i){return[i.type,i.eventId,i.sessionId,i.tenantId].filter(e=>e).join("-")}function vo({type:i,error:e}){return i==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function hh(i){switch(i.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return vo(i);default:return!1}}/**
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
 */async function uh(i,e={}){return bt(i,"GET","/v1/projects",e)}/**
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
 */const dh=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,fh=/^https?/;async function ph(i){if(i.config.emulator)return;const{authorizedDomains:e}=await uh(i);for(const n of e)try{if(gh(n))return}catch{}Re(i,"unauthorized-domain")}function gh(i){const e=mi(),{protocol:n,hostname:r}=new URL(e);if(i.startsWith("chrome-extension://")){const h=new URL(i);return h.hostname===""&&r===""?n==="chrome-extension:"&&i.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&h.hostname===r}if(!fh.test(n))return!1;if(dh.test(i))return r===i;const o=i.replace(/\./g,"\\.");return new RegExp("^(.+\\."+o+"|"+o+")$","i").test(r)}/**
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
 */const mh=new Xt(3e4,6e4);function as(){const i=Pe().___jsl;if(i!=null&&i.H){for(const e of Object.keys(i.H))if(i.H[e].r=i.H[e].r||[],i.H[e].L=i.H[e].L||[],i.H[e].r=[...i.H[e].L],i.CP)for(let n=0;n<i.CP.length;n++)i.CP[n]=null}}function vh(i){return new Promise((e,n)=>{var r,o,l;function h(){as(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{as(),n(Ce(i,"network-request-failed"))},timeout:mh.get()})}if(!((o=(r=Pe().gapi)===null||r===void 0?void 0:r.iframes)===null||o===void 0)&&o.Iframe)e(gapi.iframes.getContext());else if(!((l=Pe().gapi)===null||l===void 0)&&l.load)h();else{const g=Ic("iframefcb");return Pe()[g]=()=>{gapi.load?h():n(Ce(i,"network-request-failed"))},yc(`${wc()}?onload=${g}`).catch(w=>n(w))}}).catch(e=>{throw _n=null,e})}let _n=null;function _h(i){return _n=_n||vh(i),_n}/**
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
 */const yh=new Xt(5e3,15e3),wh="__/auth/iframe",Ih="emulator/auth/iframe",Eh={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Th=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function bh(i){const e=i.config;C(e.authDomain,i,"auth-domain-config-required");const n=e.emulator?ki(e,Ih):`https://${i.config.authDomain}/${wh}`,r={apiKey:e.apiKey,appName:i.name,v:Tt},o=Th.get(i.config.apiHost);o&&(r.eid=o);const l=i._getFrameworks();return l.length&&(r.fw=l.join(",")),`${n}?${Jt(r).slice(1)}`}async function Ah(i){const e=await _h(i),n=Pe().gapi;return C(n,i,"internal-error"),e.open({where:document.body,url:bh(i),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Eh,dontclear:!0},r=>new Promise(async(o,l)=>{await r.restyle({setHideOnLeave:!1});const h=Ce(i,"network-request-failed"),g=Pe().setTimeout(()=>{l(h)},yh.get());function w(){Pe().clearTimeout(g),o(r)}r.ping(w).then(w,()=>{l(h)})}))}/**
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
 */const Sh={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Ch=500,kh=600,Ph="_blank",Rh="http://localhost";class ls{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Oh(i,e,n,r=Ch,o=kh){const l=Math.max((window.screen.availHeight-o)/2,0).toString(),h=Math.max((window.screen.availWidth-r)/2,0).toString();let g="";const w=Object.assign(Object.assign({},Sh),{width:r.toString(),height:o.toString(),top:l,left:h}),E=me().toLowerCase();n&&(g=Js(E)?Ph:n),Ks(E)&&(e=e||Rh,w.scrollbars="yes");const A=Object.entries(w).reduce((k,[z,S])=>`${k}${z}=${S},`,"");if(uc(E)&&g!=="_self")return Dh(e||"",g),new ls(null);const R=window.open(e||"",g,A);C(R,i,"popup-blocked");try{R.focus()}catch{}return new ls(R)}function Dh(i,e){const n=document.createElement("a");n.href=i,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
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
 */const Nh="__/auth/handler",xh="emulator/auth/handler",Lh=encodeURIComponent("fac");async function cs(i,e,n,r,o,l){C(i.config.authDomain,i,"auth-domain-config-required"),C(i.config.apiKey,i,"invalid-api-key");const h={apiKey:i.config.apiKey,appName:i.name,authType:n,redirectUrl:r,v:Tt,eventId:o};if(e instanceof Ni){e.setDefaultLanguage(i.languageCode),h.providerId=e.providerId||"",Na(e.getCustomParameters())||(h.customParameters=JSON.stringify(e.getCustomParameters()));for(const[A,R]of Object.entries({}))h[A]=R}if(e instanceof At){const A=e.getScopes().filter(R=>R!=="");A.length>0&&(h.scopes=A.join(","))}i.tenantId&&(h.tid=i.tenantId);const g=h;for(const A of Object.keys(g))g[A]===void 0&&delete g[A];const w=await i._getAppCheckToken(),E=w?`#${Lh}=${encodeURIComponent(w)}`:"";return`${Mh(i)}?${Jt(g).slice(1)}${E}`}function Mh({config:i}){return i.emulator?ki(i,xh):`https://${i.authDomain}/${Nh}`}/**
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
 */const li="webStorageSupport";class Uh{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=co,this._completeRedirectFn=ah,this._overrideRedirectResult=rh}async _openPopup(e,n,r,o){var l;je((l=this.eventManagers[e._key()])===null||l===void 0?void 0:l.manager,"_initialize() not called before _openPopup()");const h=await cs(e,n,r,mi(),o);return Oh(e,h,xi())}async _openRedirect(e,n,r,o){await this._originValidation(e);const l=await cs(e,n,r,mi(),o);return Bc(l),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:o,promise:l}=this.eventManagers[n];return o?Promise.resolve(o):(je(l,"If manager is not set, promise should be"),l)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await Ah(e),r=new ch(e);return n.register("authEvent",o=>(C(o==null?void 0:o.authEvent,e,"invalid-auth-event"),{status:r.onEvent(o.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(li,{type:li},o=>{var l;const h=(l=o==null?void 0:o[0])===null||l===void 0?void 0:l[li];h!==void 0&&n(!!h),Re(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=ph(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return eo()||qs()||Oi()}}const Fh=Uh;var hs="@firebase/auth",us="1.7.9";/**
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
 */class jh{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){C(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function Bh(i){switch(i){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Vh(i){wt(new ht("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),o=e.getProvider("heartbeat"),l=e.getProvider("app-check-internal"),{apiKey:h,authDomain:g}=r.options;C(h&&!h.includes(":"),"invalid-api-key",{appName:r.name});const w={apiKey:h,authDomain:g,clientPlatform:i,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:to(i)},E=new vc(r,o,l,w);return Tc(E,n),E},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),wt(new ht("auth-internal",e=>{const n=Pn(e.getProvider("auth").getImmediate());return(r=>new jh(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),et(hs,us,Bh(i)),et(hs,us,"esm2017")}/**
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
 */const Hh=5*60,$h=Ns("authIdTokenMaxAge")||Hh;let ds=null;const zh=i=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>$h)return;const o=n==null?void 0:n.token;ds!==o&&(ds=o,await fetch(i,{method:o?"POST":"DELETE",headers:o?{Authorization:`Bearer ${o}`}:{}}))};function Wh(i=bi()){const e=Ti(i,"auth");if(e.isInitialized())return e.getImmediate();const n=Ec(i,{popupRedirectResolver:Fh,persistence:[Jc,ao,co]}),r=Ns("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const l=new URL(r,location.origin);if(location.origin===l.origin){const h=zh(l.toString());Nc(n,h,()=>h(n.currentUser)),Dc(n,g=>h(g))}}const o=Os("auth");return o&&bc(n,`http://${o}`),n}function Gh(){var i,e;return(e=(i=document.getElementsByTagName("head"))===null||i===void 0?void 0:i[0])!==null&&e!==void 0?e:document}_c({loadJS(i){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",i),r.onload=e,r.onerror=o=>{const l=Ce("internal-error");l.customData=o,n(l)},r.type="text/javascript",r.charset="UTF-8",Gh().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Vh("Browser");var fs=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var _o;(function(){var i;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(v,u){function f(){}f.prototype=u.prototype,v.D=u.prototype,v.prototype=new f,v.prototype.constructor=v,v.C=function(p,m,_){for(var d=Array(arguments.length-2),x=2;x<arguments.length;x++)d[x-2]=arguments[x];return u.prototype[m].apply(p,d)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function o(v,u,f){f||(f=0);var p=Array(16);if(typeof u=="string")for(var m=0;16>m;++m)p[m]=u.charCodeAt(f++)|u.charCodeAt(f++)<<8|u.charCodeAt(f++)<<16|u.charCodeAt(f++)<<24;else for(m=0;16>m;++m)p[m]=u[f++]|u[f++]<<8|u[f++]<<16|u[f++]<<24;u=v.g[0],f=v.g[1],m=v.g[2];var _=v.g[3],d=u+(_^f&(m^_))+p[0]+3614090360&4294967295;u=f+(d<<7&4294967295|d>>>25),d=_+(m^u&(f^m))+p[1]+3905402710&4294967295,_=u+(d<<12&4294967295|d>>>20),d=m+(f^_&(u^f))+p[2]+606105819&4294967295,m=_+(d<<17&4294967295|d>>>15),d=f+(u^m&(_^u))+p[3]+3250441966&4294967295,f=m+(d<<22&4294967295|d>>>10),d=u+(_^f&(m^_))+p[4]+4118548399&4294967295,u=f+(d<<7&4294967295|d>>>25),d=_+(m^u&(f^m))+p[5]+1200080426&4294967295,_=u+(d<<12&4294967295|d>>>20),d=m+(f^_&(u^f))+p[6]+2821735955&4294967295,m=_+(d<<17&4294967295|d>>>15),d=f+(u^m&(_^u))+p[7]+4249261313&4294967295,f=m+(d<<22&4294967295|d>>>10),d=u+(_^f&(m^_))+p[8]+1770035416&4294967295,u=f+(d<<7&4294967295|d>>>25),d=_+(m^u&(f^m))+p[9]+2336552879&4294967295,_=u+(d<<12&4294967295|d>>>20),d=m+(f^_&(u^f))+p[10]+4294925233&4294967295,m=_+(d<<17&4294967295|d>>>15),d=f+(u^m&(_^u))+p[11]+2304563134&4294967295,f=m+(d<<22&4294967295|d>>>10),d=u+(_^f&(m^_))+p[12]+1804603682&4294967295,u=f+(d<<7&4294967295|d>>>25),d=_+(m^u&(f^m))+p[13]+4254626195&4294967295,_=u+(d<<12&4294967295|d>>>20),d=m+(f^_&(u^f))+p[14]+2792965006&4294967295,m=_+(d<<17&4294967295|d>>>15),d=f+(u^m&(_^u))+p[15]+1236535329&4294967295,f=m+(d<<22&4294967295|d>>>10),d=u+(m^_&(f^m))+p[1]+4129170786&4294967295,u=f+(d<<5&4294967295|d>>>27),d=_+(f^m&(u^f))+p[6]+3225465664&4294967295,_=u+(d<<9&4294967295|d>>>23),d=m+(u^f&(_^u))+p[11]+643717713&4294967295,m=_+(d<<14&4294967295|d>>>18),d=f+(_^u&(m^_))+p[0]+3921069994&4294967295,f=m+(d<<20&4294967295|d>>>12),d=u+(m^_&(f^m))+p[5]+3593408605&4294967295,u=f+(d<<5&4294967295|d>>>27),d=_+(f^m&(u^f))+p[10]+38016083&4294967295,_=u+(d<<9&4294967295|d>>>23),d=m+(u^f&(_^u))+p[15]+3634488961&4294967295,m=_+(d<<14&4294967295|d>>>18),d=f+(_^u&(m^_))+p[4]+3889429448&4294967295,f=m+(d<<20&4294967295|d>>>12),d=u+(m^_&(f^m))+p[9]+568446438&4294967295,u=f+(d<<5&4294967295|d>>>27),d=_+(f^m&(u^f))+p[14]+3275163606&4294967295,_=u+(d<<9&4294967295|d>>>23),d=m+(u^f&(_^u))+p[3]+4107603335&4294967295,m=_+(d<<14&4294967295|d>>>18),d=f+(_^u&(m^_))+p[8]+1163531501&4294967295,f=m+(d<<20&4294967295|d>>>12),d=u+(m^_&(f^m))+p[13]+2850285829&4294967295,u=f+(d<<5&4294967295|d>>>27),d=_+(f^m&(u^f))+p[2]+4243563512&4294967295,_=u+(d<<9&4294967295|d>>>23),d=m+(u^f&(_^u))+p[7]+1735328473&4294967295,m=_+(d<<14&4294967295|d>>>18),d=f+(_^u&(m^_))+p[12]+2368359562&4294967295,f=m+(d<<20&4294967295|d>>>12),d=u+(f^m^_)+p[5]+4294588738&4294967295,u=f+(d<<4&4294967295|d>>>28),d=_+(u^f^m)+p[8]+2272392833&4294967295,_=u+(d<<11&4294967295|d>>>21),d=m+(_^u^f)+p[11]+1839030562&4294967295,m=_+(d<<16&4294967295|d>>>16),d=f+(m^_^u)+p[14]+4259657740&4294967295,f=m+(d<<23&4294967295|d>>>9),d=u+(f^m^_)+p[1]+2763975236&4294967295,u=f+(d<<4&4294967295|d>>>28),d=_+(u^f^m)+p[4]+1272893353&4294967295,_=u+(d<<11&4294967295|d>>>21),d=m+(_^u^f)+p[7]+4139469664&4294967295,m=_+(d<<16&4294967295|d>>>16),d=f+(m^_^u)+p[10]+3200236656&4294967295,f=m+(d<<23&4294967295|d>>>9),d=u+(f^m^_)+p[13]+681279174&4294967295,u=f+(d<<4&4294967295|d>>>28),d=_+(u^f^m)+p[0]+3936430074&4294967295,_=u+(d<<11&4294967295|d>>>21),d=m+(_^u^f)+p[3]+3572445317&4294967295,m=_+(d<<16&4294967295|d>>>16),d=f+(m^_^u)+p[6]+76029189&4294967295,f=m+(d<<23&4294967295|d>>>9),d=u+(f^m^_)+p[9]+3654602809&4294967295,u=f+(d<<4&4294967295|d>>>28),d=_+(u^f^m)+p[12]+3873151461&4294967295,_=u+(d<<11&4294967295|d>>>21),d=m+(_^u^f)+p[15]+530742520&4294967295,m=_+(d<<16&4294967295|d>>>16),d=f+(m^_^u)+p[2]+3299628645&4294967295,f=m+(d<<23&4294967295|d>>>9),d=u+(m^(f|~_))+p[0]+4096336452&4294967295,u=f+(d<<6&4294967295|d>>>26),d=_+(f^(u|~m))+p[7]+1126891415&4294967295,_=u+(d<<10&4294967295|d>>>22),d=m+(u^(_|~f))+p[14]+2878612391&4294967295,m=_+(d<<15&4294967295|d>>>17),d=f+(_^(m|~u))+p[5]+4237533241&4294967295,f=m+(d<<21&4294967295|d>>>11),d=u+(m^(f|~_))+p[12]+1700485571&4294967295,u=f+(d<<6&4294967295|d>>>26),d=_+(f^(u|~m))+p[3]+2399980690&4294967295,_=u+(d<<10&4294967295|d>>>22),d=m+(u^(_|~f))+p[10]+4293915773&4294967295,m=_+(d<<15&4294967295|d>>>17),d=f+(_^(m|~u))+p[1]+2240044497&4294967295,f=m+(d<<21&4294967295|d>>>11),d=u+(m^(f|~_))+p[8]+1873313359&4294967295,u=f+(d<<6&4294967295|d>>>26),d=_+(f^(u|~m))+p[15]+4264355552&4294967295,_=u+(d<<10&4294967295|d>>>22),d=m+(u^(_|~f))+p[6]+2734768916&4294967295,m=_+(d<<15&4294967295|d>>>17),d=f+(_^(m|~u))+p[13]+1309151649&4294967295,f=m+(d<<21&4294967295|d>>>11),d=u+(m^(f|~_))+p[4]+4149444226&4294967295,u=f+(d<<6&4294967295|d>>>26),d=_+(f^(u|~m))+p[11]+3174756917&4294967295,_=u+(d<<10&4294967295|d>>>22),d=m+(u^(_|~f))+p[2]+718787259&4294967295,m=_+(d<<15&4294967295|d>>>17),d=f+(_^(m|~u))+p[9]+3951481745&4294967295,v.g[0]=v.g[0]+u&4294967295,v.g[1]=v.g[1]+(m+(d<<21&4294967295|d>>>11))&4294967295,v.g[2]=v.g[2]+m&4294967295,v.g[3]=v.g[3]+_&4294967295}r.prototype.u=function(v,u){u===void 0&&(u=v.length);for(var f=u-this.blockSize,p=this.B,m=this.h,_=0;_<u;){if(m==0)for(;_<=f;)o(this,v,_),_+=this.blockSize;if(typeof v=="string"){for(;_<u;)if(p[m++]=v.charCodeAt(_++),m==this.blockSize){o(this,p),m=0;break}}else for(;_<u;)if(p[m++]=v[_++],m==this.blockSize){o(this,p),m=0;break}}this.h=m,this.o+=u},r.prototype.v=function(){var v=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);v[0]=128;for(var u=1;u<v.length-8;++u)v[u]=0;var f=8*this.o;for(u=v.length-8;u<v.length;++u)v[u]=f&255,f/=256;for(this.u(v),v=Array(16),u=f=0;4>u;++u)for(var p=0;32>p;p+=8)v[f++]=this.g[u]>>>p&255;return v};function l(v,u){var f=g;return Object.prototype.hasOwnProperty.call(f,v)?f[v]:f[v]=u(v)}function h(v,u){this.h=u;for(var f=[],p=!0,m=v.length-1;0<=m;m--){var _=v[m]|0;p&&_==u||(f[m]=_,p=!1)}this.g=f}var g={};function w(v){return-128<=v&&128>v?l(v,function(u){return new h([u|0],0>u?-1:0)}):new h([v|0],0>v?-1:0)}function E(v){if(isNaN(v)||!isFinite(v))return R;if(0>v)return F(E(-v));for(var u=[],f=1,p=0;v>=f;p++)u[p]=v/f|0,f*=4294967296;return new h(u,0)}function A(v,u){if(v.length==0)throw Error("number format error: empty string");if(u=u||10,2>u||36<u)throw Error("radix out of range: "+u);if(v.charAt(0)=="-")return F(A(v.substring(1),u));if(0<=v.indexOf("-"))throw Error('number format error: interior "-" character');for(var f=E(Math.pow(u,8)),p=R,m=0;m<v.length;m+=8){var _=Math.min(8,v.length-m),d=parseInt(v.substring(m,m+_),u);8>_?(_=E(Math.pow(u,_)),p=p.j(_).add(E(d))):(p=p.j(f),p=p.add(E(d)))}return p}var R=w(0),k=w(1),z=w(16777216);i=h.prototype,i.m=function(){if(N(this))return-F(this).m();for(var v=0,u=1,f=0;f<this.g.length;f++){var p=this.i(f);v+=(0<=p?p:4294967296+p)*u,u*=4294967296}return v},i.toString=function(v){if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(S(this))return"0";if(N(this))return"-"+F(this).toString(v);for(var u=E(Math.pow(v,6)),f=this,p="";;){var m=J(f,u).g;f=te(f,m.j(u));var _=((0<f.g.length?f.g[0]:f.h)>>>0).toString(v);if(f=m,S(f))return _+p;for(;6>_.length;)_="0"+_;p=_+p}},i.i=function(v){return 0>v?0:v<this.g.length?this.g[v]:this.h};function S(v){if(v.h!=0)return!1;for(var u=0;u<v.g.length;u++)if(v.g[u]!=0)return!1;return!0}function N(v){return v.h==-1}i.l=function(v){return v=te(this,v),N(v)?-1:S(v)?0:1};function F(v){for(var u=v.g.length,f=[],p=0;p<u;p++)f[p]=~v.g[p];return new h(f,~v.h).add(k)}i.abs=function(){return N(this)?F(this):this},i.add=function(v){for(var u=Math.max(this.g.length,v.g.length),f=[],p=0,m=0;m<=u;m++){var _=p+(this.i(m)&65535)+(v.i(m)&65535),d=(_>>>16)+(this.i(m)>>>16)+(v.i(m)>>>16);p=d>>>16,_&=65535,d&=65535,f[m]=d<<16|_}return new h(f,f[f.length-1]&-2147483648?-1:0)};function te(v,u){return v.add(F(u))}i.j=function(v){if(S(this)||S(v))return R;if(N(this))return N(v)?F(this).j(F(v)):F(F(this).j(v));if(N(v))return F(this.j(F(v)));if(0>this.l(z)&&0>v.l(z))return E(this.m()*v.m());for(var u=this.g.length+v.g.length,f=[],p=0;p<2*u;p++)f[p]=0;for(p=0;p<this.g.length;p++)for(var m=0;m<v.g.length;m++){var _=this.i(p)>>>16,d=this.i(p)&65535,x=v.i(m)>>>16,X=v.i(m)&65535;f[2*p+2*m]+=d*X,B(f,2*p+2*m),f[2*p+2*m+1]+=_*X,B(f,2*p+2*m+1),f[2*p+2*m+1]+=d*x,B(f,2*p+2*m+1),f[2*p+2*m+2]+=_*x,B(f,2*p+2*m+2)}for(p=0;p<u;p++)f[p]=f[2*p+1]<<16|f[2*p];for(p=u;p<2*u;p++)f[p]=0;return new h(f,0)};function B(v,u){for(;(v[u]&65535)!=v[u];)v[u+1]+=v[u]>>>16,v[u]&=65535,u++}function L(v,u){this.g=v,this.h=u}function J(v,u){if(S(u))throw Error("division by zero");if(S(v))return new L(R,R);if(N(v))return u=J(F(v),u),new L(F(u.g),F(u.h));if(N(u))return u=J(v,F(u)),new L(F(u.g),u.h);if(30<v.g.length){if(N(v)||N(u))throw Error("slowDivide_ only works with positive integers.");for(var f=k,p=u;0>=p.l(v);)f=se(f),p=se(p);var m=H(f,1),_=H(p,1);for(p=H(p,2),f=H(f,2);!S(p);){var d=_.add(p);0>=d.l(v)&&(m=m.add(f),_=d),p=H(p,1),f=H(f,1)}return u=te(v,m.j(u)),new L(m,u)}for(m=R;0<=v.l(u);){for(f=Math.max(1,Math.floor(v.m()/u.m())),p=Math.ceil(Math.log(f)/Math.LN2),p=48>=p?1:Math.pow(2,p-48),_=E(f),d=_.j(u);N(d)||0<d.l(v);)f-=p,_=E(f),d=_.j(u);S(_)&&(_=k),m=m.add(_),v=te(v,d)}return new L(m,v)}i.A=function(v){return J(this,v).h},i.and=function(v){for(var u=Math.max(this.g.length,v.g.length),f=[],p=0;p<u;p++)f[p]=this.i(p)&v.i(p);return new h(f,this.h&v.h)},i.or=function(v){for(var u=Math.max(this.g.length,v.g.length),f=[],p=0;p<u;p++)f[p]=this.i(p)|v.i(p);return new h(f,this.h|v.h)},i.xor=function(v){for(var u=Math.max(this.g.length,v.g.length),f=[],p=0;p<u;p++)f[p]=this.i(p)^v.i(p);return new h(f,this.h^v.h)};function se(v){for(var u=v.g.length+1,f=[],p=0;p<u;p++)f[p]=v.i(p)<<1|v.i(p-1)>>>31;return new h(f,v.h)}function H(v,u){var f=u>>5;u%=32;for(var p=v.g.length-f,m=[],_=0;_<p;_++)m[_]=0<u?v.i(_+f)>>>u|v.i(_+f+1)<<32-u:v.i(_+f);return new h(m,v.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,h.prototype.add=h.prototype.add,h.prototype.multiply=h.prototype.j,h.prototype.modulo=h.prototype.A,h.prototype.compare=h.prototype.l,h.prototype.toNumber=h.prototype.m,h.prototype.toString=h.prototype.toString,h.prototype.getBits=h.prototype.i,h.fromNumber=E,h.fromString=A,_o=h}).apply(typeof fs<"u"?fs:typeof self<"u"?self:typeof window<"u"?window:{});var pn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var i,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(t,s,a){return t==Array.prototype||t==Object.prototype||(t[s]=a.value),t};function n(t){t=[typeof globalThis=="object"&&globalThis,t,typeof window=="object"&&window,typeof self=="object"&&self,typeof pn=="object"&&pn];for(var s=0;s<t.length;++s){var a=t[s];if(a&&a.Math==Math)return a}throw Error("Cannot find global object")}var r=n(this);function o(t,s){if(s)e:{var a=r;t=t.split(".");for(var c=0;c<t.length-1;c++){var y=t[c];if(!(y in a))break e;a=a[y]}t=t[t.length-1],c=a[t],s=s(c),s!=c&&s!=null&&e(a,t,{configurable:!0,writable:!0,value:s})}}function l(t,s){t instanceof String&&(t+="");var a=0,c=!1,y={next:function(){if(!c&&a<t.length){var I=a++;return{value:s(I,t[I]),done:!1}}return c=!0,{done:!0,value:void 0}}};return y[Symbol.iterator]=function(){return y},y}o("Array.prototype.values",function(t){return t||function(){return l(this,function(s,a){return a})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var h=h||{},g=this||self;function w(t){var s=typeof t;return s=s!="object"?s:t?Array.isArray(t)?"array":s:"null",s=="array"||s=="object"&&typeof t.length=="number"}function E(t){var s=typeof t;return s=="object"&&t!=null||s=="function"}function A(t,s,a){return t.call.apply(t.bind,arguments)}function R(t,s,a){if(!t)throw Error();if(2<arguments.length){var c=Array.prototype.slice.call(arguments,2);return function(){var y=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(y,c),t.apply(s,y)}}return function(){return t.apply(s,arguments)}}function k(t,s,a){return k=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?A:R,k.apply(null,arguments)}function z(t,s){var a=Array.prototype.slice.call(arguments,1);return function(){var c=a.slice();return c.push.apply(c,arguments),t.apply(this,c)}}function S(t,s){function a(){}a.prototype=s.prototype,t.aa=s.prototype,t.prototype=new a,t.prototype.constructor=t,t.Qb=function(c,y,I){for(var T=Array(arguments.length-2),G=2;G<arguments.length;G++)T[G-2]=arguments[G];return s.prototype[y].apply(c,T)}}function N(t){const s=t.length;if(0<s){const a=Array(s);for(let c=0;c<s;c++)a[c]=t[c];return a}return[]}function F(t,s){for(let a=1;a<arguments.length;a++){const c=arguments[a];if(w(c)){const y=t.length||0,I=c.length||0;t.length=y+I;for(let T=0;T<I;T++)t[y+T]=c[T]}else t.push(c)}}class te{constructor(s,a){this.i=s,this.j=a,this.h=0,this.g=null}get(){let s;return 0<this.h?(this.h--,s=this.g,this.g=s.next,s.next=null):s=this.i(),s}}function B(t){return/^[\s\xa0]*$/.test(t)}function L(){var t=g.navigator;return t&&(t=t.userAgent)?t:""}function J(t){return J[" "](t),t}J[" "]=function(){};var se=L().indexOf("Gecko")!=-1&&!(L().toLowerCase().indexOf("webkit")!=-1&&L().indexOf("Edge")==-1)&&!(L().indexOf("Trident")!=-1||L().indexOf("MSIE")!=-1)&&L().indexOf("Edge")==-1;function H(t,s,a){for(const c in t)s.call(a,t[c],c,t)}function v(t,s){for(const a in t)s.call(void 0,t[a],a,t)}function u(t){const s={};for(const a in t)s[a]=t[a];return s}const f="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function p(t,s){let a,c;for(let y=1;y<arguments.length;y++){c=arguments[y];for(a in c)t[a]=c[a];for(let I=0;I<f.length;I++)a=f[I],Object.prototype.hasOwnProperty.call(c,a)&&(t[a]=c[a])}}function m(t){var s=1;t=t.split(":");const a=[];for(;0<s&&t.length;)a.push(t.shift()),s--;return t.length&&a.push(t.join(":")),a}function _(t){g.setTimeout(()=>{throw t},0)}function d(){var t=we;let s=null;return t.g&&(s=t.g,t.g=t.g.next,t.g||(t.h=null),s.next=null),s}class x{constructor(){this.h=this.g=null}add(s,a){const c=X.get();c.set(s,a),this.h?this.h.next=c:this.g=c,this.h=c}}var X=new te(()=>new be,t=>t.reset());class be{constructor(){this.next=this.g=this.h=null}set(s,a){this.h=s,this.g=a,this.next=null}reset(){this.next=this.g=this.h=null}}let Ie,ae=!1,we=new x,ke=()=>{const t=g.Promise.resolve(void 0);Ie=()=>{t.then(nt)}};var nt=()=>{for(var t;t=d();){try{t.h.call(t.g)}catch(a){_(a)}var s=X;s.j(t),100>s.h&&(s.h++,t.next=s.g,s.g=t)}ae=!1};function le(){this.s=this.s,this.C=this.C}le.prototype.s=!1,le.prototype.ma=function(){this.s||(this.s=!0,this.N())},le.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function W(t,s){this.type=t,this.g=this.target=s,this.defaultPrevented=!1}W.prototype.h=function(){this.defaultPrevented=!0};var $e=function(){if(!g.addEventListener||!Object.defineProperty)return!1;var t=!1,s=Object.defineProperty({},"passive",{get:function(){t=!0}});try{const a=()=>{};g.addEventListener("test",a,s),g.removeEventListener("test",a,s)}catch{}return t}();function Q(t,s){if(W.call(this,t?t.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,t){var a=this.type=t.type,c=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:null;if(this.target=t.target||t.srcElement,this.g=s,s=t.relatedTarget){if(se){e:{try{J(s.nodeName);var y=!0;break e}catch{}y=!1}y||(s=null)}}else a=="mouseover"?s=t.fromElement:a=="mouseout"&&(s=t.toElement);this.relatedTarget=s,c?(this.clientX=c.clientX!==void 0?c.clientX:c.pageX,this.clientY=c.clientY!==void 0?c.clientY:c.pageY,this.screenX=c.screenX||0,this.screenY=c.screenY||0):(this.clientX=t.clientX!==void 0?t.clientX:t.pageX,this.clientY=t.clientY!==void 0?t.clientY:t.pageY,this.screenX=t.screenX||0,this.screenY=t.screenY||0),this.button=t.button,this.key=t.key||"",this.ctrlKey=t.ctrlKey,this.altKey=t.altKey,this.shiftKey=t.shiftKey,this.metaKey=t.metaKey,this.pointerId=t.pointerId||0,this.pointerType=typeof t.pointerType=="string"?t.pointerType:M[t.pointerType]||"",this.state=t.state,this.i=t,t.defaultPrevented&&Q.aa.h.call(this)}}S(Q,W);var M={2:"touch",3:"pen",4:"mouse"};Q.prototype.h=function(){Q.aa.h.call(this);var t=this.i;t.preventDefault?t.preventDefault():t.returnValue=!1};var Z="closure_listenable_"+(1e6*Math.random()|0),ce=0;function ee(t,s,a,c,y){this.listener=t,this.proxy=null,this.src=s,this.type=a,this.capture=!!c,this.ha=y,this.key=++ce,this.da=this.fa=!1}function Ee(t){t.da=!0,t.listener=null,t.proxy=null,t.src=null,t.ha=null}function Oe(t){this.src=t,this.g={},this.h=0}Oe.prototype.add=function(t,s,a,c,y){var I=t.toString();t=this.g[I],t||(t=this.g[I]=[],this.h++);var T=Dn(t,s,c,y);return-1<T?(s=t[T],a||(s.fa=!1)):(s=new ee(s,this.src,I,!!c,y),s.fa=a,t.push(s)),s};function it(t,s){var a=s.type;if(a in t.g){var c=t.g[a],y=Array.prototype.indexOf.call(c,s,void 0),I;(I=0<=y)&&Array.prototype.splice.call(c,y,1),I&&(Ee(s),t.g[a].length==0&&(delete t.g[a],t.h--))}}function Dn(t,s,a,c){for(var y=0;y<t.length;++y){var I=t[y];if(!I.da&&I.listener==s&&I.capture==!!a&&I.ha==c)return y}return-1}var Nn="closure_lm_"+(1e6*Math.random()|0),xn={};function ji(t,s,a,c,y){if(Array.isArray(s)){for(var I=0;I<s.length;I++)ji(t,s[I],a,c,y);return null}return a=Hi(a),t&&t[Z]?t.K(s,a,E(c)?!!c.capture:!1,y):Eo(t,s,a,!1,c,y)}function Eo(t,s,a,c,y,I){if(!s)throw Error("Invalid event type");var T=E(y)?!!y.capture:!!y,G=Mn(t);if(G||(t[Nn]=G=new Oe(t)),a=G.add(s,a,c,T,I),a.proxy)return a;if(c=To(),a.proxy=c,c.src=t,c.listener=a,t.addEventListener)$e||(y=T),y===void 0&&(y=!1),t.addEventListener(s.toString(),c,y);else if(t.attachEvent)t.attachEvent(Vi(s.toString()),c);else if(t.addListener&&t.removeListener)t.addListener(c);else throw Error("addEventListener and attachEvent are unavailable.");return a}function To(){function t(a){return s.call(t.src,t.listener,a)}const s=bo;return t}function Bi(t,s,a,c,y){if(Array.isArray(s))for(var I=0;I<s.length;I++)Bi(t,s[I],a,c,y);else c=E(c)?!!c.capture:!!c,a=Hi(a),t&&t[Z]?(t=t.i,s=String(s).toString(),s in t.g&&(I=t.g[s],a=Dn(I,a,c,y),-1<a&&(Ee(I[a]),Array.prototype.splice.call(I,a,1),I.length==0&&(delete t.g[s],t.h--)))):t&&(t=Mn(t))&&(s=t.g[s.toString()],t=-1,s&&(t=Dn(s,a,c,y)),(a=-1<t?s[t]:null)&&Ln(a))}function Ln(t){if(typeof t!="number"&&t&&!t.da){var s=t.src;if(s&&s[Z])it(s.i,t);else{var a=t.type,c=t.proxy;s.removeEventListener?s.removeEventListener(a,c,t.capture):s.detachEvent?s.detachEvent(Vi(a),c):s.addListener&&s.removeListener&&s.removeListener(c),(a=Mn(s))?(it(a,t),a.h==0&&(a.src=null,s[Nn]=null)):Ee(t)}}}function Vi(t){return t in xn?xn[t]:xn[t]="on"+t}function bo(t,s){if(t.da)t=!0;else{s=new Q(s,this);var a=t.listener,c=t.ha||t.src;t.fa&&Ln(t),t=a.call(c,s)}return t}function Mn(t){return t=t[Nn],t instanceof Oe?t:null}var Un="__closure_events_fn_"+(1e9*Math.random()>>>0);function Hi(t){return typeof t=="function"?t:(t[Un]||(t[Un]=function(s){return t.handleEvent(s)}),t[Un])}function he(){le.call(this),this.i=new Oe(this),this.M=this,this.F=null}S(he,le),he.prototype[Z]=!0,he.prototype.removeEventListener=function(t,s,a,c){Bi(this,t,s,a,c)};function fe(t,s){var a,c=t.F;if(c)for(a=[];c;c=c.F)a.push(c);if(t=t.M,c=s.type||s,typeof s=="string")s=new W(s,t);else if(s instanceof W)s.target=s.target||t;else{var y=s;s=new W(c,t),p(s,y)}if(y=!0,a)for(var I=a.length-1;0<=I;I--){var T=s.g=a[I];y=Zt(T,c,!0,s)&&y}if(T=s.g=t,y=Zt(T,c,!0,s)&&y,y=Zt(T,c,!1,s)&&y,a)for(I=0;I<a.length;I++)T=s.g=a[I],y=Zt(T,c,!1,s)&&y}he.prototype.N=function(){if(he.aa.N.call(this),this.i){var t=this.i,s;for(s in t.g){for(var a=t.g[s],c=0;c<a.length;c++)Ee(a[c]);delete t.g[s],t.h--}}this.F=null},he.prototype.K=function(t,s,a,c){return this.i.add(String(t),s,!1,a,c)},he.prototype.L=function(t,s,a,c){return this.i.add(String(t),s,!0,a,c)};function Zt(t,s,a,c){if(s=t.i.g[String(s)],!s)return!0;s=s.concat();for(var y=!0,I=0;I<s.length;++I){var T=s[I];if(T&&!T.da&&T.capture==a){var G=T.listener,oe=T.ha||T.src;T.fa&&it(t.i,T),y=G.call(oe,c)!==!1&&y}}return y&&!c.defaultPrevented}function $i(t,s,a){if(typeof t=="function")a&&(t=k(t,a));else if(t&&typeof t.handleEvent=="function")t=k(t.handleEvent,t);else throw Error("Invalid listener argument");return 2147483647<Number(s)?-1:g.setTimeout(t,s||0)}function zi(t){t.g=$i(()=>{t.g=null,t.i&&(t.i=!1,zi(t))},t.l);const s=t.h;t.h=null,t.m.apply(null,s)}class Ao extends le{constructor(s,a){super(),this.m=s,this.l=a,this.h=null,this.i=!1,this.g=null}j(s){this.h=arguments,this.g?this.i=!0:zi(this)}N(){super.N(),this.g&&(g.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function St(t){le.call(this),this.h=t,this.g={}}S(St,le);var Wi=[];function Gi(t){H(t.g,function(s,a){this.g.hasOwnProperty(a)&&Ln(s)},t),t.g={}}St.prototype.N=function(){St.aa.N.call(this),Gi(this)},St.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Fn=g.JSON.stringify,So=g.JSON.parse,Co=class{stringify(t){return g.JSON.stringify(t,void 0)}parse(t){return g.JSON.parse(t,void 0)}};function jn(){}jn.prototype.h=null;function Ki(t){return t.h||(t.h=t.i())}function ko(){}var Ct={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Bn(){W.call(this,"d")}S(Bn,W);function Vn(){W.call(this,"c")}S(Vn,W);var ut={},qi=null;function Hn(){return qi=qi||new he}ut.La="serverreachability";function Ji(t){W.call(this,ut.La,t)}S(Ji,W);function kt(t){const s=Hn();fe(s,new Ji(s))}ut.STAT_EVENT="statevent";function Xi(t,s){W.call(this,ut.STAT_EVENT,t),this.stat=s}S(Xi,W);function pe(t){const s=Hn();fe(s,new Xi(s,t))}ut.Ma="timingevent";function Yi(t,s){W.call(this,ut.Ma,t),this.size=s}S(Yi,W);function Pt(t,s){if(typeof t!="function")throw Error("Fn must not be null and must be a function");return g.setTimeout(function(){t()},s)}function Rt(){this.g=!0}Rt.prototype.xa=function(){this.g=!1};function Po(t,s,a,c,y,I){t.info(function(){if(t.g)if(I)for(var T="",G=I.split("&"),oe=0;oe<G.length;oe++){var V=G[oe].split("=");if(1<V.length){var ue=V[0];V=V[1];var de=ue.split("_");T=2<=de.length&&de[1]=="type"?T+(ue+"="+V+"&"):T+(ue+"=redacted&")}}else T=null;else T=I;return"XMLHTTP REQ ("+c+") [attempt "+y+"]: "+s+`
`+a+`
`+T})}function Ro(t,s,a,c,y,I,T){t.info(function(){return"XMLHTTP RESP ("+c+") [ attempt "+y+"]: "+s+`
`+a+`
`+I+" "+T})}function dt(t,s,a,c){t.info(function(){return"XMLHTTP TEXT ("+s+"): "+Do(t,a)+(c?" "+c:"")})}function Oo(t,s){t.info(function(){return"TIMEOUT: "+s})}Rt.prototype.info=function(){};function Do(t,s){if(!t.g)return s;if(!s)return null;try{var a=JSON.parse(s);if(a){for(t=0;t<a.length;t++)if(Array.isArray(a[t])){var c=a[t];if(!(2>c.length)){var y=c[1];if(Array.isArray(y)&&!(1>y.length)){var I=y[0];if(I!="noop"&&I!="stop"&&I!="close")for(var T=1;T<y.length;T++)y[T]=""}}}}return Fn(a)}catch{return s}}var $n={NO_ERROR:0,TIMEOUT:8},No={},zn;function en(){}S(en,jn),en.prototype.g=function(){return new XMLHttpRequest},en.prototype.i=function(){return{}},zn=new en;function ze(t,s,a,c){this.j=t,this.i=s,this.l=a,this.R=c||1,this.U=new St(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Qi}function Qi(){this.i=null,this.g="",this.h=!1}var Zi={},Wn={};function Gn(t,s,a){t.L=1,t.v=sn(De(s)),t.m=a,t.P=!0,er(t,null)}function er(t,s){t.F=Date.now(),tn(t),t.A=De(t.v);var a=t.A,c=t.R;Array.isArray(c)||(c=[String(c)]),pr(a.i,"t",c),t.C=0,a=t.j.J,t.h=new Qi,t.g=Dr(t.j,a?s:null,!t.m),0<t.O&&(t.M=new Ao(k(t.Y,t,t.g),t.O)),s=t.U,a=t.g,c=t.ca;var y="readystatechange";Array.isArray(y)||(y&&(Wi[0]=y.toString()),y=Wi);for(var I=0;I<y.length;I++){var T=ji(a,y[I],c||s.handleEvent,!1,s.h||s);if(!T)break;s.g[T.key]=T}s=t.H?u(t.H):{},t.m?(t.u||(t.u="POST"),s["Content-Type"]="application/x-www-form-urlencoded",t.g.ea(t.A,t.u,t.m,s)):(t.u="GET",t.g.ea(t.A,t.u,null,s)),kt(),Po(t.i,t.u,t.A,t.l,t.R,t.m)}ze.prototype.ca=function(t){t=t.target;const s=this.M;s&&Ne(t)==3?s.j():this.Y(t)},ze.prototype.Y=function(t){try{if(t==this.g)e:{const de=Ne(this.g);var s=this.g.Ba();const gt=this.g.Z();if(!(3>de)&&(de!=3||this.g&&(this.h.h||this.g.oa()||Ir(this.g)))){this.J||de!=4||s==7||(s==8||0>=gt?kt(3):kt(2)),Kn(this);var a=this.g.Z();this.X=a;t:if(tr(this)){var c=Ir(this.g);t="";var y=c.length,I=Ne(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){rt(this),Ot(this);var T="";break t}this.h.i=new g.TextDecoder}for(s=0;s<y;s++)this.h.h=!0,t+=this.h.i.decode(c[s],{stream:!(I&&s==y-1)});c.length=0,this.h.g+=t,this.C=0,T=this.h.g}else T=this.g.oa();if(this.o=a==200,Ro(this.i,this.u,this.A,this.l,this.R,de,a),this.o){if(this.T&&!this.K){t:{if(this.g){var G,oe=this.g;if((G=oe.g?oe.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!B(G)){var V=G;break t}}V=null}if(a=V)dt(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,qn(this,a);else{this.o=!1,this.s=3,pe(12),rt(this),Ot(this);break e}}if(this.P){a=!0;let Ae;for(;!this.J&&this.C<T.length;)if(Ae=xo(this,T),Ae==Wn){de==4&&(this.s=4,pe(14),a=!1),dt(this.i,this.l,null,"[Incomplete Response]");break}else if(Ae==Zi){this.s=4,pe(15),dt(this.i,this.l,T,"[Invalid Chunk]"),a=!1;break}else dt(this.i,this.l,Ae,null),qn(this,Ae);if(tr(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),de!=4||T.length!=0||this.h.h||(this.s=1,pe(16),a=!1),this.o=this.o&&a,!a)dt(this.i,this.l,T,"[Invalid Chunked Response]"),rt(this),Ot(this);else if(0<T.length&&!this.W){this.W=!0;var ue=this.j;ue.g==this&&ue.ba&&!ue.M&&(ue.j.info("Great, no buffering proxy detected. Bytes received: "+T.length),ei(ue),ue.M=!0,pe(11))}}else dt(this.i,this.l,T,null),qn(this,T);de==4&&rt(this),this.o&&!this.J&&(de==4?kr(this.j,this):(this.o=!1,tn(this)))}else Yo(this.g),a==400&&0<T.indexOf("Unknown SID")?(this.s=3,pe(12)):(this.s=0,pe(13)),rt(this),Ot(this)}}}catch{}finally{}};function tr(t){return t.g?t.u=="GET"&&t.L!=2&&t.j.Ca:!1}function xo(t,s){var a=t.C,c=s.indexOf(`
`,a);return c==-1?Wn:(a=Number(s.substring(a,c)),isNaN(a)?Zi:(c+=1,c+a>s.length?Wn:(s=s.slice(c,c+a),t.C=c+a,s)))}ze.prototype.cancel=function(){this.J=!0,rt(this)};function tn(t){t.S=Date.now()+t.I,nr(t,t.I)}function nr(t,s){if(t.B!=null)throw Error("WatchDog timer not null");t.B=Pt(k(t.ba,t),s)}function Kn(t){t.B&&(g.clearTimeout(t.B),t.B=null)}ze.prototype.ba=function(){this.B=null;const t=Date.now();0<=t-this.S?(Oo(this.i,this.A),this.L!=2&&(kt(),pe(17)),rt(this),this.s=2,Ot(this)):nr(this,this.S-t)};function Ot(t){t.j.G==0||t.J||kr(t.j,t)}function rt(t){Kn(t);var s=t.M;s&&typeof s.ma=="function"&&s.ma(),t.M=null,Gi(t.U),t.g&&(s=t.g,t.g=null,s.abort(),s.ma())}function qn(t,s){try{var a=t.j;if(a.G!=0&&(a.g==t||Jn(a.h,t))){if(!t.K&&Jn(a.h,t)&&a.G==3){try{var c=a.Da.g.parse(s)}catch{c=null}if(Array.isArray(c)&&c.length==3){var y=c;if(y[0]==0){e:if(!a.u){if(a.g)if(a.g.F+3e3<t.F)un(a),cn(a);else break e;Zn(a),pe(18)}}else a.za=y[1],0<a.za-a.T&&37500>y[2]&&a.F&&a.v==0&&!a.C&&(a.C=Pt(k(a.Za,a),6e3));if(1>=sr(a.h)&&a.ca){try{a.ca()}catch{}a.ca=void 0}}else ot(a,11)}else if((t.K||a.g==t)&&un(a),!B(s))for(y=a.Da.g.parse(s),s=0;s<y.length;s++){let V=y[s];if(a.T=V[0],V=V[1],a.G==2)if(V[0]=="c"){a.K=V[1],a.ia=V[2];const ue=V[3];ue!=null&&(a.la=ue,a.j.info("VER="+a.la));const de=V[4];de!=null&&(a.Aa=de,a.j.info("SVER="+a.Aa));const gt=V[5];gt!=null&&typeof gt=="number"&&0<gt&&(c=1.5*gt,a.L=c,a.j.info("backChannelRequestTimeoutMs_="+c)),c=a;const Ae=t.g;if(Ae){const dn=Ae.g?Ae.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(dn){var I=c.h;I.g||dn.indexOf("spdy")==-1&&dn.indexOf("quic")==-1&&dn.indexOf("h2")==-1||(I.j=I.l,I.g=new Set,I.h&&(Xn(I,I.h),I.h=null))}if(c.D){const ti=Ae.g?Ae.g.getResponseHeader("X-HTTP-Session-Id"):null;ti&&(c.ya=ti,Y(c.I,c.D,ti))}}a.G=3,a.l&&a.l.ua(),a.ba&&(a.R=Date.now()-t.F,a.j.info("Handshake RTT: "+a.R+"ms")),c=a;var T=t;if(c.qa=Or(c,c.J?c.ia:null,c.W),T.K){or(c.h,T);var G=T,oe=c.L;oe&&(G.I=oe),G.B&&(Kn(G),tn(G)),c.g=T}else Sr(c);0<a.i.length&&hn(a)}else V[0]!="stop"&&V[0]!="close"||ot(a,7);else a.G==3&&(V[0]=="stop"||V[0]=="close"?V[0]=="stop"?ot(a,7):Qn(a):V[0]!="noop"&&a.l&&a.l.ta(V),a.v=0)}}kt(4)}catch{}}var Lo=class{constructor(t,s){this.g=t,this.map=s}};function ir(t){this.l=t||10,g.PerformanceNavigationTiming?(t=g.performance.getEntriesByType("navigation"),t=0<t.length&&(t[0].nextHopProtocol=="hq"||t[0].nextHopProtocol=="h2")):t=!!(g.chrome&&g.chrome.loadTimes&&g.chrome.loadTimes()&&g.chrome.loadTimes().wasFetchedViaSpdy),this.j=t?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function rr(t){return t.h?!0:t.g?t.g.size>=t.j:!1}function sr(t){return t.h?1:t.g?t.g.size:0}function Jn(t,s){return t.h?t.h==s:t.g?t.g.has(s):!1}function Xn(t,s){t.g?t.g.add(s):t.h=s}function or(t,s){t.h&&t.h==s?t.h=null:t.g&&t.g.has(s)&&t.g.delete(s)}ir.prototype.cancel=function(){if(this.i=ar(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const t of this.g.values())t.cancel();this.g.clear()}};function ar(t){if(t.h!=null)return t.i.concat(t.h.D);if(t.g!=null&&t.g.size!==0){let s=t.i;for(const a of t.g.values())s=s.concat(a.D);return s}return N(t.i)}function Mo(t){if(t.V&&typeof t.V=="function")return t.V();if(typeof Map<"u"&&t instanceof Map||typeof Set<"u"&&t instanceof Set)return Array.from(t.values());if(typeof t=="string")return t.split("");if(w(t)){for(var s=[],a=t.length,c=0;c<a;c++)s.push(t[c]);return s}s=[],a=0;for(c in t)s[a++]=t[c];return s}function Uo(t){if(t.na&&typeof t.na=="function")return t.na();if(!t.V||typeof t.V!="function"){if(typeof Map<"u"&&t instanceof Map)return Array.from(t.keys());if(!(typeof Set<"u"&&t instanceof Set)){if(w(t)||typeof t=="string"){var s=[];t=t.length;for(var a=0;a<t;a++)s.push(a);return s}s=[],a=0;for(const c in t)s[a++]=c;return s}}}function lr(t,s){if(t.forEach&&typeof t.forEach=="function")t.forEach(s,void 0);else if(w(t)||typeof t=="string")Array.prototype.forEach.call(t,s,void 0);else for(var a=Uo(t),c=Mo(t),y=c.length,I=0;I<y;I++)s.call(void 0,c[I],a&&a[I],t)}var cr=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Fo(t,s){if(t){t=t.split("&");for(var a=0;a<t.length;a++){var c=t[a].indexOf("="),y=null;if(0<=c){var I=t[a].substring(0,c);y=t[a].substring(c+1)}else I=t[a];s(I,y?decodeURIComponent(y.replace(/\+/g," ")):"")}}}function st(t){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,t instanceof st){this.h=t.h,nn(this,t.j),this.o=t.o,this.g=t.g,rn(this,t.s),this.l=t.l;var s=t.i,a=new xt;a.i=s.i,s.g&&(a.g=new Map(s.g),a.h=s.h),hr(this,a),this.m=t.m}else t&&(s=String(t).match(cr))?(this.h=!1,nn(this,s[1]||"",!0),this.o=Dt(s[2]||""),this.g=Dt(s[3]||"",!0),rn(this,s[4]),this.l=Dt(s[5]||"",!0),hr(this,s[6]||"",!0),this.m=Dt(s[7]||"")):(this.h=!1,this.i=new xt(null,this.h))}st.prototype.toString=function(){var t=[],s=this.j;s&&t.push(Nt(s,ur,!0),":");var a=this.g;return(a||s=="file")&&(t.push("//"),(s=this.o)&&t.push(Nt(s,ur,!0),"@"),t.push(encodeURIComponent(String(a)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a=this.s,a!=null&&t.push(":",String(a))),(a=this.l)&&(this.g&&a.charAt(0)!="/"&&t.push("/"),t.push(Nt(a,a.charAt(0)=="/"?Vo:Bo,!0))),(a=this.i.toString())&&t.push("?",a),(a=this.m)&&t.push("#",Nt(a,$o)),t.join("")};function De(t){return new st(t)}function nn(t,s,a){t.j=a?Dt(s,!0):s,t.j&&(t.j=t.j.replace(/:$/,""))}function rn(t,s){if(s){if(s=Number(s),isNaN(s)||0>s)throw Error("Bad port number "+s);t.s=s}else t.s=null}function hr(t,s,a){s instanceof xt?(t.i=s,zo(t.i,t.h)):(a||(s=Nt(s,Ho)),t.i=new xt(s,t.h))}function Y(t,s,a){t.i.set(s,a)}function sn(t){return Y(t,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),t}function Dt(t,s){return t?s?decodeURI(t.replace(/%25/g,"%2525")):decodeURIComponent(t):""}function Nt(t,s,a){return typeof t=="string"?(t=encodeURI(t).replace(s,jo),a&&(t=t.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t):null}function jo(t){return t=t.charCodeAt(0),"%"+(t>>4&15).toString(16)+(t&15).toString(16)}var ur=/[#\/\?@]/g,Bo=/[#\?:]/g,Vo=/[#\?]/g,Ho=/[#\?@]/g,$o=/#/g;function xt(t,s){this.h=this.g=null,this.i=t||null,this.j=!!s}function We(t){t.g||(t.g=new Map,t.h=0,t.i&&Fo(t.i,function(s,a){t.add(decodeURIComponent(s.replace(/\+/g," ")),a)}))}i=xt.prototype,i.add=function(t,s){We(this),this.i=null,t=ft(this,t);var a=this.g.get(t);return a||this.g.set(t,a=[]),a.push(s),this.h+=1,this};function dr(t,s){We(t),s=ft(t,s),t.g.has(s)&&(t.i=null,t.h-=t.g.get(s).length,t.g.delete(s))}function fr(t,s){return We(t),s=ft(t,s),t.g.has(s)}i.forEach=function(t,s){We(this),this.g.forEach(function(a,c){a.forEach(function(y){t.call(s,y,c,this)},this)},this)},i.na=function(){We(this);const t=Array.from(this.g.values()),s=Array.from(this.g.keys()),a=[];for(let c=0;c<s.length;c++){const y=t[c];for(let I=0;I<y.length;I++)a.push(s[c])}return a},i.V=function(t){We(this);let s=[];if(typeof t=="string")fr(this,t)&&(s=s.concat(this.g.get(ft(this,t))));else{t=Array.from(this.g.values());for(let a=0;a<t.length;a++)s=s.concat(t[a])}return s},i.set=function(t,s){return We(this),this.i=null,t=ft(this,t),fr(this,t)&&(this.h-=this.g.get(t).length),this.g.set(t,[s]),this.h+=1,this},i.get=function(t,s){return t?(t=this.V(t),0<t.length?String(t[0]):s):s};function pr(t,s,a){dr(t,s),0<a.length&&(t.i=null,t.g.set(ft(t,s),N(a)),t.h+=a.length)}i.toString=function(){if(this.i)return this.i;if(!this.g)return"";const t=[],s=Array.from(this.g.keys());for(var a=0;a<s.length;a++){var c=s[a];const I=encodeURIComponent(String(c)),T=this.V(c);for(c=0;c<T.length;c++){var y=I;T[c]!==""&&(y+="="+encodeURIComponent(String(T[c]))),t.push(y)}}return this.i=t.join("&")};function ft(t,s){return s=String(s),t.j&&(s=s.toLowerCase()),s}function zo(t,s){s&&!t.j&&(We(t),t.i=null,t.g.forEach(function(a,c){var y=c.toLowerCase();c!=y&&(dr(this,c),pr(this,y,a))},t)),t.j=s}function Wo(t,s){const a=new Rt;if(g.Image){const c=new Image;c.onload=z(Ge,a,"TestLoadImage: loaded",!0,s,c),c.onerror=z(Ge,a,"TestLoadImage: error",!1,s,c),c.onabort=z(Ge,a,"TestLoadImage: abort",!1,s,c),c.ontimeout=z(Ge,a,"TestLoadImage: timeout",!1,s,c),g.setTimeout(function(){c.ontimeout&&c.ontimeout()},1e4),c.src=t}else s(!1)}function Go(t,s){const a=new Rt,c=new AbortController,y=setTimeout(()=>{c.abort(),Ge(a,"TestPingServer: timeout",!1,s)},1e4);fetch(t,{signal:c.signal}).then(I=>{clearTimeout(y),I.ok?Ge(a,"TestPingServer: ok",!0,s):Ge(a,"TestPingServer: server error",!1,s)}).catch(()=>{clearTimeout(y),Ge(a,"TestPingServer: error",!1,s)})}function Ge(t,s,a,c,y){try{y&&(y.onload=null,y.onerror=null,y.onabort=null,y.ontimeout=null),c(a)}catch{}}function Ko(){this.g=new Co}function qo(t,s,a){const c=a||"";try{lr(t,function(y,I){let T=y;E(y)&&(T=Fn(y)),s.push(c+I+"="+encodeURIComponent(T))})}catch(y){throw s.push(c+"type="+encodeURIComponent("_badmap")),y}}function on(t){this.l=t.Ub||null,this.j=t.eb||!1}S(on,jn),on.prototype.g=function(){return new an(this.l,this.j)},on.prototype.i=function(t){return function(){return t}}({});function an(t,s){he.call(this),this.D=t,this.o=s,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}S(an,he),i=an.prototype,i.open=function(t,s){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=t,this.A=s,this.readyState=1,Mt(this)},i.send=function(t){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const s={headers:this.u,method:this.B,credentials:this.m,cache:void 0};t&&(s.body=t),(this.D||g).fetch(new Request(this.A,s)).then(this.Sa.bind(this),this.ga.bind(this))},i.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Lt(this)),this.readyState=0},i.Sa=function(t){if(this.g&&(this.l=t,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=t.headers,this.readyState=2,Mt(this)),this.g&&(this.readyState=3,Mt(this),this.g)))if(this.responseType==="arraybuffer")t.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof g.ReadableStream<"u"&&"body"in t){if(this.j=t.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;gr(this)}else t.text().then(this.Ra.bind(this),this.ga.bind(this))};function gr(t){t.j.read().then(t.Pa.bind(t)).catch(t.ga.bind(t))}i.Pa=function(t){if(this.g){if(this.o&&t.value)this.response.push(t.value);else if(!this.o){var s=t.value?t.value:new Uint8Array(0);(s=this.v.decode(s,{stream:!t.done}))&&(this.response=this.responseText+=s)}t.done?Lt(this):Mt(this),this.readyState==3&&gr(this)}},i.Ra=function(t){this.g&&(this.response=this.responseText=t,Lt(this))},i.Qa=function(t){this.g&&(this.response=t,Lt(this))},i.ga=function(){this.g&&Lt(this)};function Lt(t){t.readyState=4,t.l=null,t.j=null,t.v=null,Mt(t)}i.setRequestHeader=function(t,s){this.u.append(t,s)},i.getResponseHeader=function(t){return this.h&&this.h.get(t.toLowerCase())||""},i.getAllResponseHeaders=function(){if(!this.h)return"";const t=[],s=this.h.entries();for(var a=s.next();!a.done;)a=a.value,t.push(a[0]+": "+a[1]),a=s.next();return t.join(`\r
`)};function Mt(t){t.onreadystatechange&&t.onreadystatechange.call(t)}Object.defineProperty(an.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(t){this.m=t?"include":"same-origin"}});function mr(t){let s="";return H(t,function(a,c){s+=c,s+=":",s+=a,s+=`\r
`}),s}function Yn(t,s,a){e:{for(c in a){var c=!1;break e}c=!0}c||(a=mr(a),typeof t=="string"?a!=null&&encodeURIComponent(String(a)):Y(t,s,a))}function ne(t){he.call(this),this.headers=new Map,this.o=t||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}S(ne,he);var Jo=/^https?$/i,Xo=["POST","PUT"];i=ne.prototype,i.Ha=function(t){this.J=t},i.ea=function(t,s,a,c){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+t);s=s?s.toUpperCase():"GET",this.D=t,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():zn.g(),this.v=this.o?Ki(this.o):Ki(zn),this.g.onreadystatechange=k(this.Ea,this);try{this.B=!0,this.g.open(s,String(t),!0),this.B=!1}catch(I){vr(this,I);return}if(t=a||"",a=new Map(this.headers),c)if(Object.getPrototypeOf(c)===Object.prototype)for(var y in c)a.set(y,c[y]);else if(typeof c.keys=="function"&&typeof c.get=="function")for(const I of c.keys())a.set(I,c.get(I));else throw Error("Unknown input type for opt_headers: "+String(c));c=Array.from(a.keys()).find(I=>I.toLowerCase()=="content-type"),y=g.FormData&&t instanceof g.FormData,!(0<=Array.prototype.indexOf.call(Xo,s,void 0))||c||y||a.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[I,T]of a)this.g.setRequestHeader(I,T);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{wr(this),this.u=!0,this.g.send(t),this.u=!1}catch(I){vr(this,I)}};function vr(t,s){t.h=!1,t.g&&(t.j=!0,t.g.abort(),t.j=!1),t.l=s,t.m=5,_r(t),ln(t)}function _r(t){t.A||(t.A=!0,fe(t,"complete"),fe(t,"error"))}i.abort=function(t){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=t||7,fe(this,"complete"),fe(this,"abort"),ln(this))},i.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),ln(this,!0)),ne.aa.N.call(this)},i.Ea=function(){this.s||(this.B||this.u||this.j?yr(this):this.bb())},i.bb=function(){yr(this)};function yr(t){if(t.h&&typeof h<"u"&&(!t.v[1]||Ne(t)!=4||t.Z()!=2)){if(t.u&&Ne(t)==4)$i(t.Ea,0,t);else if(fe(t,"readystatechange"),Ne(t)==4){t.h=!1;try{const T=t.Z();e:switch(T){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var s=!0;break e;default:s=!1}var a;if(!(a=s)){var c;if(c=T===0){var y=String(t.D).match(cr)[1]||null;!y&&g.self&&g.self.location&&(y=g.self.location.protocol.slice(0,-1)),c=!Jo.test(y?y.toLowerCase():"")}a=c}if(a)fe(t,"complete"),fe(t,"success");else{t.m=6;try{var I=2<Ne(t)?t.g.statusText:""}catch{I=""}t.l=I+" ["+t.Z()+"]",_r(t)}}finally{ln(t)}}}}function ln(t,s){if(t.g){wr(t);const a=t.g,c=t.v[0]?()=>{}:null;t.g=null,t.v=null,s||fe(t,"ready");try{a.onreadystatechange=c}catch{}}}function wr(t){t.I&&(g.clearTimeout(t.I),t.I=null)}i.isActive=function(){return!!this.g};function Ne(t){return t.g?t.g.readyState:0}i.Z=function(){try{return 2<Ne(this)?this.g.status:-1}catch{return-1}},i.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},i.Oa=function(t){if(this.g){var s=this.g.responseText;return t&&s.indexOf(t)==0&&(s=s.substring(t.length)),So(s)}};function Ir(t){try{if(!t.g)return null;if("response"in t.g)return t.g.response;switch(t.H){case"":case"text":return t.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in t.g)return t.g.mozResponseArrayBuffer}return null}catch{return null}}function Yo(t){const s={};t=(t.g&&2<=Ne(t)&&t.g.getAllResponseHeaders()||"").split(`\r
`);for(let c=0;c<t.length;c++){if(B(t[c]))continue;var a=m(t[c]);const y=a[0];if(a=a[1],typeof a!="string")continue;a=a.trim();const I=s[y]||[];s[y]=I,I.push(a)}v(s,function(c){return c.join(", ")})}i.Ba=function(){return this.m},i.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Ut(t,s,a){return a&&a.internalChannelParams&&a.internalChannelParams[t]||s}function Er(t){this.Aa=0,this.i=[],this.j=new Rt,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Ut("failFast",!1,t),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Ut("baseRetryDelayMs",5e3,t),this.cb=Ut("retryDelaySeedMs",1e4,t),this.Wa=Ut("forwardChannelMaxRetries",2,t),this.wa=Ut("forwardChannelRequestTimeoutMs",2e4,t),this.pa=t&&t.xmlHttpFactory||void 0,this.Xa=t&&t.Tb||void 0,this.Ca=t&&t.useFetchStreams||!1,this.L=void 0,this.J=t&&t.supportsCrossDomainXhr||!1,this.K="",this.h=new ir(t&&t.concurrentRequestLimit),this.Da=new Ko,this.P=t&&t.fastHandshake||!1,this.O=t&&t.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=t&&t.Rb||!1,t&&t.xa&&this.j.xa(),t&&t.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&t&&t.detectBufferingProxy||!1,this.ja=void 0,t&&t.longPollingTimeout&&0<t.longPollingTimeout&&(this.ja=t.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}i=Er.prototype,i.la=8,i.G=1,i.connect=function(t,s,a,c){pe(0),this.W=t,this.H=s||{},a&&c!==void 0&&(this.H.OSID=a,this.H.OAID=c),this.F=this.X,this.I=Or(this,null,this.W),hn(this)};function Qn(t){if(Tr(t),t.G==3){var s=t.U++,a=De(t.I);if(Y(a,"SID",t.K),Y(a,"RID",s),Y(a,"TYPE","terminate"),Ft(t,a),s=new ze(t,t.j,s),s.L=2,s.v=sn(De(a)),a=!1,g.navigator&&g.navigator.sendBeacon)try{a=g.navigator.sendBeacon(s.v.toString(),"")}catch{}!a&&g.Image&&(new Image().src=s.v,a=!0),a||(s.g=Dr(s.j,null),s.g.ea(s.v)),s.F=Date.now(),tn(s)}Rr(t)}function cn(t){t.g&&(ei(t),t.g.cancel(),t.g=null)}function Tr(t){cn(t),t.u&&(g.clearTimeout(t.u),t.u=null),un(t),t.h.cancel(),t.s&&(typeof t.s=="number"&&g.clearTimeout(t.s),t.s=null)}function hn(t){if(!rr(t.h)&&!t.s){t.s=!0;var s=t.Ga;Ie||ke(),ae||(Ie(),ae=!0),we.add(s,t),t.B=0}}function Qo(t,s){return sr(t.h)>=t.h.j-(t.s?1:0)?!1:t.s?(t.i=s.D.concat(t.i),!0):t.G==1||t.G==2||t.B>=(t.Va?0:t.Wa)?!1:(t.s=Pt(k(t.Ga,t,s),Pr(t,t.B)),t.B++,!0)}i.Ga=function(t){if(this.s)if(this.s=null,this.G==1){if(!t){this.U=Math.floor(1e5*Math.random()),t=this.U++;const y=new ze(this,this.j,t);let I=this.o;if(this.S&&(I?(I=u(I),p(I,this.S)):I=this.S),this.m!==null||this.O||(y.H=I,I=null),this.P)e:{for(var s=0,a=0;a<this.i.length;a++){t:{var c=this.i[a];if("__data__"in c.map&&(c=c.map.__data__,typeof c=="string")){c=c.length;break t}c=void 0}if(c===void 0)break;if(s+=c,4096<s){s=a;break e}if(s===4096||a===this.i.length-1){s=a+1;break e}}s=1e3}else s=1e3;s=Ar(this,y,s),a=De(this.I),Y(a,"RID",t),Y(a,"CVER",22),this.D&&Y(a,"X-HTTP-Session-Id",this.D),Ft(this,a),I&&(this.O?s="headers="+encodeURIComponent(String(mr(I)))+"&"+s:this.m&&Yn(a,this.m,I)),Xn(this.h,y),this.Ua&&Y(a,"TYPE","init"),this.P?(Y(a,"$req",s),Y(a,"SID","null"),y.T=!0,Gn(y,a,null)):Gn(y,a,s),this.G=2}}else this.G==3&&(t?br(this,t):this.i.length==0||rr(this.h)||br(this))};function br(t,s){var a;s?a=s.l:a=t.U++;const c=De(t.I);Y(c,"SID",t.K),Y(c,"RID",a),Y(c,"AID",t.T),Ft(t,c),t.m&&t.o&&Yn(c,t.m,t.o),a=new ze(t,t.j,a,t.B+1),t.m===null&&(a.H=t.o),s&&(t.i=s.D.concat(t.i)),s=Ar(t,a,1e3),a.I=Math.round(.5*t.wa)+Math.round(.5*t.wa*Math.random()),Xn(t.h,a),Gn(a,c,s)}function Ft(t,s){t.H&&H(t.H,function(a,c){Y(s,c,a)}),t.l&&lr({},function(a,c){Y(s,c,a)})}function Ar(t,s,a){a=Math.min(t.i.length,a);var c=t.l?k(t.l.Na,t.l,t):null;e:{var y=t.i;let I=-1;for(;;){const T=["count="+a];I==-1?0<a?(I=y[0].g,T.push("ofs="+I)):I=0:T.push("ofs="+I);let G=!0;for(let oe=0;oe<a;oe++){let V=y[oe].g;const ue=y[oe].map;if(V-=I,0>V)I=Math.max(0,y[oe].g-100),G=!1;else try{qo(ue,T,"req"+V+"_")}catch{c&&c(ue)}}if(G){c=T.join("&");break e}}}return t=t.i.splice(0,a),s.D=t,c}function Sr(t){if(!t.g&&!t.u){t.Y=1;var s=t.Fa;Ie||ke(),ae||(Ie(),ae=!0),we.add(s,t),t.v=0}}function Zn(t){return t.g||t.u||3<=t.v?!1:(t.Y++,t.u=Pt(k(t.Fa,t),Pr(t,t.v)),t.v++,!0)}i.Fa=function(){if(this.u=null,Cr(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var t=2*this.R;this.j.info("BP detection timer enabled: "+t),this.A=Pt(k(this.ab,this),t)}},i.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,pe(10),cn(this),Cr(this))};function ei(t){t.A!=null&&(g.clearTimeout(t.A),t.A=null)}function Cr(t){t.g=new ze(t,t.j,"rpc",t.Y),t.m===null&&(t.g.H=t.o),t.g.O=0;var s=De(t.qa);Y(s,"RID","rpc"),Y(s,"SID",t.K),Y(s,"AID",t.T),Y(s,"CI",t.F?"0":"1"),!t.F&&t.ja&&Y(s,"TO",t.ja),Y(s,"TYPE","xmlhttp"),Ft(t,s),t.m&&t.o&&Yn(s,t.m,t.o),t.L&&(t.g.I=t.L);var a=t.g;t=t.ia,a.L=1,a.v=sn(De(s)),a.m=null,a.P=!0,er(a,t)}i.Za=function(){this.C!=null&&(this.C=null,cn(this),Zn(this),pe(19))};function un(t){t.C!=null&&(g.clearTimeout(t.C),t.C=null)}function kr(t,s){var a=null;if(t.g==s){un(t),ei(t),t.g=null;var c=2}else if(Jn(t.h,s))a=s.D,or(t.h,s),c=1;else return;if(t.G!=0){if(s.o)if(c==1){a=s.m?s.m.length:0,s=Date.now()-s.F;var y=t.B;c=Hn(),fe(c,new Yi(c,a)),hn(t)}else Sr(t);else if(y=s.s,y==3||y==0&&0<s.X||!(c==1&&Qo(t,s)||c==2&&Zn(t)))switch(a&&0<a.length&&(s=t.h,s.i=s.i.concat(a)),y){case 1:ot(t,5);break;case 4:ot(t,10);break;case 3:ot(t,6);break;default:ot(t,2)}}}function Pr(t,s){let a=t.Ta+Math.floor(Math.random()*t.cb);return t.isActive()||(a*=2),a*s}function ot(t,s){if(t.j.info("Error code "+s),s==2){var a=k(t.fb,t),c=t.Xa;const y=!c;c=new st(c||"//www.google.com/images/cleardot.gif"),g.location&&g.location.protocol=="http"||nn(c,"https"),sn(c),y?Wo(c.toString(),a):Go(c.toString(),a)}else pe(2);t.G=0,t.l&&t.l.sa(s),Rr(t),Tr(t)}i.fb=function(t){t?(this.j.info("Successfully pinged google.com"),pe(2)):(this.j.info("Failed to ping google.com"),pe(1))};function Rr(t){if(t.G=0,t.ka=[],t.l){const s=ar(t.h);(s.length!=0||t.i.length!=0)&&(F(t.ka,s),F(t.ka,t.i),t.h.i.length=0,N(t.i),t.i.length=0),t.l.ra()}}function Or(t,s,a){var c=a instanceof st?De(a):new st(a);if(c.g!="")s&&(c.g=s+"."+c.g),rn(c,c.s);else{var y=g.location;c=y.protocol,s=s?s+"."+y.hostname:y.hostname,y=+y.port;var I=new st(null);c&&nn(I,c),s&&(I.g=s),y&&rn(I,y),a&&(I.l=a),c=I}return a=t.D,s=t.ya,a&&s&&Y(c,a,s),Y(c,"VER",t.la),Ft(t,c),c}function Dr(t,s,a){if(s&&!t.J)throw Error("Can't create secondary domain capable XhrIo object.");return s=t.Ca&&!t.pa?new ne(new on({eb:a})):new ne(t.pa),s.Ha(t.J),s}i.isActive=function(){return!!this.l&&this.l.isActive(this)};function Nr(){}i=Nr.prototype,i.ua=function(){},i.ta=function(){},i.sa=function(){},i.ra=function(){},i.isActive=function(){return!0},i.Na=function(){};function Te(t,s){he.call(this),this.g=new Er(s),this.l=t,this.h=s&&s.messageUrlParams||null,t=s&&s.messageHeaders||null,s&&s.clientProtocolHeaderRequired&&(t?t["X-Client-Protocol"]="webchannel":t={"X-Client-Protocol":"webchannel"}),this.g.o=t,t=s&&s.initMessageHeaders||null,s&&s.messageContentType&&(t?t["X-WebChannel-Content-Type"]=s.messageContentType:t={"X-WebChannel-Content-Type":s.messageContentType}),s&&s.va&&(t?t["X-WebChannel-Client-Profile"]=s.va:t={"X-WebChannel-Client-Profile":s.va}),this.g.S=t,(t=s&&s.Sb)&&!B(t)&&(this.g.m=t),this.v=s&&s.supportsCrossDomainXhr||!1,this.u=s&&s.sendRawJson||!1,(s=s&&s.httpSessionIdParam)&&!B(s)&&(this.g.D=s,t=this.h,t!==null&&s in t&&(t=this.h,s in t&&delete t[s])),this.j=new pt(this)}S(Te,he),Te.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Te.prototype.close=function(){Qn(this.g)},Te.prototype.o=function(t){var s=this.g;if(typeof t=="string"){var a={};a.__data__=t,t=a}else this.u&&(a={},a.__data__=Fn(t),t=a);s.i.push(new Lo(s.Ya++,t)),s.G==3&&hn(s)},Te.prototype.N=function(){this.g.l=null,delete this.j,Qn(this.g),delete this.g,Te.aa.N.call(this)};function xr(t){Bn.call(this),t.__headers__&&(this.headers=t.__headers__,this.statusCode=t.__status__,delete t.__headers__,delete t.__status__);var s=t.__sm__;if(s){e:{for(const a in s){t=a;break e}t=void 0}(this.i=t)&&(t=this.i,s=s!==null&&t in s?s[t]:void 0),this.data=s}else this.data=t}S(xr,Bn);function Lr(){Vn.call(this),this.status=1}S(Lr,Vn);function pt(t){this.g=t}S(pt,Nr),pt.prototype.ua=function(){fe(this.g,"a")},pt.prototype.ta=function(t){fe(this.g,new xr(t))},pt.prototype.sa=function(t){fe(this.g,new Lr)},pt.prototype.ra=function(){fe(this.g,"b")},Te.prototype.send=Te.prototype.o,Te.prototype.open=Te.prototype.m,Te.prototype.close=Te.prototype.close,$n.NO_ERROR=0,$n.TIMEOUT=8,$n.HTTP_ERROR=6,No.COMPLETE="complete",ko.EventType=Ct,Ct.OPEN="a",Ct.CLOSE="b",Ct.ERROR="c",Ct.MESSAGE="d",he.prototype.listen=he.prototype.K,ne.prototype.listenOnce=ne.prototype.L,ne.prototype.getLastError=ne.prototype.Ka,ne.prototype.getLastErrorCode=ne.prototype.Ba,ne.prototype.getStatus=ne.prototype.Z,ne.prototype.getResponseJson=ne.prototype.Oa,ne.prototype.getResponseText=ne.prototype.oa,ne.prototype.send=ne.prototype.ea,ne.prototype.setWithCredentials=ne.prototype.Ha}).apply(typeof pn<"u"?pn:typeof self<"u"?self:typeof window<"u"?window:{});const ps="@firebase/firestore";/**
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
 */class ge{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}ge.UNAUTHENTICATED=new ge(null),ge.GOOGLE_CREDENTIALS=new ge("google-credentials-uid"),ge.FIRST_PARTY=new ge("first-party-uid"),ge.MOCK_USER=new ge("mock-user");/**
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
 */let Qt="10.14.0";/**
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
 */const Et=new Ii("@firebase/firestore");function Se(i,...e){if(Et.logLevel<=$.DEBUG){const n=e.map(Mi);Et.debug(`Firestore (${Qt}): ${i}`,...n)}}function yo(i,...e){if(Et.logLevel<=$.ERROR){const n=e.map(Mi);Et.error(`Firestore (${Qt}): ${i}`,...n)}}function Kh(i,...e){if(Et.logLevel<=$.WARN){const n=e.map(Mi);Et.warn(`Firestore (${Qt}): ${i}`,...n)}}function Mi(i){if(typeof i=="string")return i;try{/**
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
 */function Ui(i="Unexpected state"){const e=`FIRESTORE (${Qt}) INTERNAL ASSERTION FAILED: `+i;throw yo(e),new Error(e)}function $t(i,e){i||Ui()}/**
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
 */const ve={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class _e extends Ve{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class zt{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
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
 */class wo{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class qh{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(ge.UNAUTHENTICATED))}shutdown(){}}class Jh{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class Xh{constructor(e){this.t=e,this.currentUser=ge.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){$t(this.o===void 0);let r=this.i;const o=w=>this.i!==r?(r=this.i,n(w)):Promise.resolve();let l=new zt;this.o=()=>{this.i++,this.currentUser=this.u(),l.resolve(),l=new zt,e.enqueueRetryable(()=>o(this.currentUser))};const h=()=>{const w=l;e.enqueueRetryable(async()=>{await w.promise,await o(this.currentUser)})},g=w=>{Se("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=w,this.o&&(this.auth.addAuthTokenListener(this.o),h())};this.t.onInit(w=>g(w)),setTimeout(()=>{if(!this.auth){const w=this.t.getImmediate({optional:!0});w?g(w):(Se("FirebaseAuthCredentialsProvider","Auth not yet detected"),l.resolve(),l=new zt)}},0),h()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(Se("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?($t(typeof r.accessToken=="string"),new wo(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return $t(e===null||typeof e=="string"),new ge(e)}}class Yh{constructor(e,n,r){this.l=e,this.h=n,this.P=r,this.type="FirstParty",this.user=ge.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class Qh{constructor(e,n,r){this.l=e,this.h=n,this.P=r}getToken(){return Promise.resolve(new Yh(this.l,this.h,this.P))}start(e,n){e.enqueueRetryable(()=>n(ge.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Zh{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class eu{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,n){$t(this.o===void 0);const r=l=>{l.error!=null&&Se("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${l.error.message}`);const h=l.token!==this.R;return this.R=l.token,Se("FirebaseAppCheckTokenProvider",`Received ${h?"new":"existing"} token.`),h?n(l.token):Promise.resolve()};this.o=l=>{e.enqueueRetryable(()=>r(l))};const o=l=>{Se("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=l,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(l=>o(l)),setTimeout(()=>{if(!this.appCheck){const l=this.A.getImmediate({optional:!0});l?o(l):Se("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?($t(typeof n.token=="string"),this.R=n.token,new Zh(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}function tu(i){return i.name==="IndexedDbTransactionError"}class Cn{constructor(e,n){this.projectId=e,this.database=n||"(default)"}static empty(){return new Cn("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Cn&&e.projectId===this.projectId&&e.database===this.database}}/**
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
 */var gs,j;(j=gs||(gs={}))[j.OK=0]="OK",j[j.CANCELLED=1]="CANCELLED",j[j.UNKNOWN=2]="UNKNOWN",j[j.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",j[j.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",j[j.NOT_FOUND=5]="NOT_FOUND",j[j.ALREADY_EXISTS=6]="ALREADY_EXISTS",j[j.PERMISSION_DENIED=7]="PERMISSION_DENIED",j[j.UNAUTHENTICATED=16]="UNAUTHENTICATED",j[j.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",j[j.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",j[j.ABORTED=10]="ABORTED",j[j.OUT_OF_RANGE=11]="OUT_OF_RANGE",j[j.UNIMPLEMENTED=12]="UNIMPLEMENTED",j[j.INTERNAL=13]="INTERNAL",j[j.UNAVAILABLE=14]="UNAVAILABLE",j[j.DATA_LOSS=15]="DATA_LOSS";/**
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
 */new _o([4294967295,4294967295],0);function ci(){return typeof document<"u"?document:null}/**
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
 */class nu{constructor(e,n,r=1e3,o=1.5,l=6e4){this.ui=e,this.timerId=n,this.ko=r,this.qo=o,this.Qo=l,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const n=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),o=Math.max(0,n-r);o>0&&Se("ExponentialBackoff",`Backing off for ${o} ms (base delay: ${this.Ko} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,o,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
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
 */class Fi{constructor(e,n,r,o,l){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=o,this.removalCallback=l,this.deferred=new zt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(h=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,o,l){const h=Date.now()+r,g=new Fi(e,n,h,o,l);return g.start(r),g}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new _e(ve.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var ms,vs;(vs=ms||(ms={})).ea="default",vs.Cache="cache";/**
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
 */function iu(i){const e={};return i.timeoutSeconds!==void 0&&(e.timeoutSeconds=i.timeoutSeconds),e}/**
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
 */const _s=new Map;function ru(i,e,n,r){if(e===!0&&r===!0)throw new _e(ve.INVALID_ARGUMENT,`${i} and ${n} cannot be used together.`)}function su(i){if(i===void 0)return"undefined";if(i===null)return"null";if(typeof i=="string")return i.length>20&&(i=`${i.substring(0,20)}...`),JSON.stringify(i);if(typeof i=="number"||typeof i=="boolean")return""+i;if(typeof i=="object"){if(i instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(i);return e?`a custom ${e} object`:"an object"}}return typeof i=="function"?"a function":Ui()}function ou(i,e){if("_delegate"in i&&(i=i._delegate),!(i instanceof e)){if(e.name===i.constructor.name)throw new _e(ve.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=su(i);throw new _e(ve.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return i}/**
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
 */class ys{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new _e(ve.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(n=e.ssl)===null||n===void 0||n;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new _e(ve.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}ru("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=iu((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(l){if(l.timeoutSeconds!==void 0){if(isNaN(l.timeoutSeconds))throw new _e(ve.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (must not be NaN)`);if(l.timeoutSeconds<5)throw new _e(ve.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (minimum allowed value is 5)`);if(l.timeoutSeconds>30)throw new _e(ve.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,o){return r.timeoutSeconds===o.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Io{constructor(e,n,r,o){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=o,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ys({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new _e(ve.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new _e(ve.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ys(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new qh;switch(r.type){case"firstParty":return new Qh(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new _e(ve.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=_s.get(n);r&&(Se("ComponentProvider","Removing Datastore"),_s.delete(n),r.terminate())}(this),Promise.resolve()}}function au(i,e,n,r={}){var o;const l=(i=ou(i,Io))._getSettings(),h=`${e}:${n}`;if(l.host!=="firestore.googleapis.com"&&l.host!==h&&Kh("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),i._setSettings(Object.assign(Object.assign({},l),{host:h,ssl:!1})),r.mockUserToken){let g,w;if(typeof r.mockUserToken=="string")g=r.mockUserToken,w=ge.MOCK_USER;else{g=Ea(r.mockUserToken,(o=i._app)===null||o===void 0?void 0:o.options.projectId);const E=r.mockUserToken.sub||r.mockUserToken.user_id;if(!E)throw new _e(ve.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");w=new ge(E)}i._authCredentials=new Jh(new wo(g,w))}}/**
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
 */class ws{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new nu(this,"async_queue_retry"),this.Vu=()=>{const r=ci();r&&Se("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const n=ci();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const n=ci();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const n=new zt;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!tu(e))throw e;Se("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const n=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const o=function(h){let g=h.message||"";return h.stack&&(g=h.stack.includes(h.message)?h.stack:h.message+`
`+h.stack),g}(r);throw yo("INTERNAL UNHANDLED ERROR: ",o),r}).then(r=>(this.du=!1,r))));return this.mu=n,n}enqueueAfterDelay(e,n,r){this.fu(),this.Ru.indexOf(e)>-1&&(n=0);const o=Fi.createAndSchedule(this,e,n,r,l=>this.yu(l));return this.Tu.push(o),o}fu(){this.Eu&&Ui()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const n of this.Tu)if(n.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.Tu)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const n=this.Tu.indexOf(e);this.Tu.splice(n,1)}}class lu extends Io{constructor(e,n,r,o){super(e,n,r,o),this.type="firestore",this._queue=new ws,this._persistenceKey=(o==null?void 0:o.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new ws(e),this._firestoreClient=void 0,await e}}}function cu(i,e){const n=typeof i=="object"?i:bi(),r=typeof i=="string"?i:"(default)",o=Ti(n,"firestore").getImmediate({identifier:r});if(!o._initialized){const l=wa("firestore");l&&au(o,...l)}return o}(function(e,n=!0){(function(o){Qt=o})(Tt),wt(new ht("firestore",(r,{instanceIdentifier:o,options:l})=>{const h=r.getProvider("app").getImmediate(),g=new lu(new Xh(r.getProvider("auth-internal")),new eu(r.getProvider("app-check-internal")),function(E,A){if(!Object.prototype.hasOwnProperty.apply(E.options,["projectId"]))throw new _e(ve.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Cn(E.options.projectId,A)}(h,o),h);return l=Object.assign({useFetchStreams:n},l),g._setSettings(l),g},"PUBLIC").setMultipleInstances(!0)),et(ps,"4.7.3",e),et(ps,"4.7.3","esm2017")})();const hu={apiKey:void 0,authDomain:void 0,projectId:void 0,storageBucket:void 0,messagingSenderId:void 0,appId:void 0};let hi,tt,uu,kn;try{hi=Ll().length?bi():Ms(hu),tt=Wh(hi),uu=cu(hi),kn=new Ht("discord.com"),kn.addScope("identify"),Oc(tt,ao).catch(i=>{console.warn("Auth Persistence Error:",i)})}catch(i){console.error("Error initializing Firebase (Check .env variables):",i)}function Is(i){let e,n,r,o,l,h="✕",g,w,E="👾",A,R,k="Únete al Club",z,S,N=`Conecta tu cuenta de Discord para guardar tu progreso,\r
                desbloquear ambientes y sincronizar tus partidas.`,F,te,B,L,J,se="Al continuar, aceptas nuestros términos de servicio.",H,v,u=i[1]&&Es(i);function f(_,d){return _[2]?fu:du}let p=f(i),m=p(i);return{c(){e=D("div"),n=D("button"),r=q(),o=D("div"),l=D("button"),l.textContent=h,g=q(),w=D("div"),w.textContent=E,A=q(),R=D("h2"),R.textContent=k,z=q(),S=D("p"),S.textContent=N,F=q(),u&&u.c(),te=q(),B=D("button"),m.c(),L=q(),J=D("p"),J.textContent=se,this.h()},l(_){e=O(_,"DIV",{class:!0});var d=ie(e);n=O(d,"BUTTON",{class:!0,"aria-label":!0}),ie(n).forEach(U),r=K(d),o=O(d,"DIV",{class:!0});var x=ie(o);l=O(x,"BUTTON",{class:!0,"aria-label":!0,"data-svelte-h":!0}),re(l)!=="svelte-i5n6q2"&&(l.textContent=h),g=K(x),w=O(x,"DIV",{class:!0,"data-svelte-h":!0}),re(w)!=="svelte-zk14dy"&&(w.textContent=E),A=K(x),R=O(x,"H2",{class:!0,"data-svelte-h":!0}),re(R)!=="svelte-1np8b40"&&(R.textContent=k),z=K(x),S=O(x,"P",{class:!0,"data-svelte-h":!0}),re(S)!=="svelte-kberbs"&&(S.textContent=N),F=K(x),u&&u.l(x),te=K(x),B=O(x,"BUTTON",{class:!0});var X=ie(B);m.l(X),X.forEach(U),L=K(x),J=O(x,"P",{class:!0,"data-svelte-h":!0}),re(J)!=="svelte-1vno8z"&&(J.textContent=se),x.forEach(U),d.forEach(U),this.h()},h(){P(n,"class","absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm cursor-default focus:outline-none"),P(n,"aria-label","Cerrar modal"),P(l,"class","absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1"),P(l,"aria-label","Cerrar"),P(w,"class","w-16 h-16 bg-[#5865F2]/20 rounded-full flex items-center justify-center mb-6 text-3xl"),P(R,"class","text-2xl font-bold font-poppins mb-2"),P(S,"class","text-white/60 text-sm mb-8 leading-relaxed"),B.disabled=i[2],P(B,"class","w-full py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#5865F2]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"),P(J,"class","mt-6 text-xs text-white/30"),P(o,"class","relative w-full max-w-sm bg-[#1a1a1a]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel p-8 text-white pointer-events-auto z-10 flex flex-col items-center text-center svelte-13t4ha9"),P(e,"class","fixed inset-0 z-[100] flex items-center justify-center p-4")},m(_,d){ye(_,e,d),b(e,n),b(e,r),b(e,o),b(o,l),b(o,g),b(o,w),b(o,A),b(o,R),b(o,z),b(o,S),b(o,F),u&&u.m(o,null),b(o,te),b(o,B),m.m(B,null),b(o,L),b(o,J),H||(v=[mt(n,"click",i[4]),mt(l,"click",i[4]),mt(B,"click",i[3])],H=!0)},p(_,d){_[1]?u?u.p(_,d):(u=Es(_),u.c(),u.m(o,te)):u&&(u.d(1),u=null),p!==(p=f(_))&&(m.d(1),m=p(_),m&&(m.c(),m.m(B,null))),d&4&&(B.disabled=_[2])},d(_){_&&U(e),u&&u.d(),m.d(),H=!1,ea(v)}}}function Es(i){let e,n;return{c(){e=D("div"),n=Bt(i[1]),this.h()},l(r){e=O(r,"DIV",{class:!0});var o=ie(e);n=jt(o,i[1]),o.forEach(U),this.h()},h(){P(e,"class","w-full bg-red-500/10 border border-red-500/20 text-red-200 text-xs px-4 py-2 rounded-lg mb-4 text-left")},m(r,o){ye(r,e,o),b(e,n)},p(r,o){o&2&&ta(n,r[1])},d(r){r&&U(e)}}}function du(i){let e,n,r,o,l="Continuar con Discord";return{c(){e=Fr("svg"),n=Fr("path"),r=q(),o=D("span"),o.textContent=l,this.h()},l(h){e=Ur(h,"svg",{class:!0,viewBox:!0});var g=ie(e);n=Ur(g,"path",{d:!0}),ie(n).forEach(U),g.forEach(U),r=K(h),o=O(h,"SPAN",{"data-svelte-h":!0}),re(o)!=="svelte-1hyut4l"&&(o.textContent=l),this.h()},h(){P(n,"d","M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22c1.24-23.28-5.83-47.5-22.11-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"),P(e,"class","w-6 h-6 fill-current"),P(e,"viewBox","0 0 127.14 96.36")},m(h,g){ye(h,e,g),b(e,n),ye(h,r,g),ye(h,o,g)},d(h){h&&(U(e),U(r),U(o))}}}function fu(i){let e,n,r,o="Conectando...";return{c(){e=D("span"),n=q(),r=D("span"),r.textContent=o,this.h()},l(l){e=O(l,"SPAN",{class:!0}),ie(e).forEach(U),n=K(l),r=O(l,"SPAN",{"data-svelte-h":!0}),re(r)!=="svelte-166tn4i"&&(r.textContent=o),this.h()},h(){P(e,"class","w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin")},m(l,h){ye(l,e,h),ye(l,n,h),ye(l,r,h)},d(l){l&&(U(e),U(n),U(r))}}}function pu(i){let e,n=i[0]&&Is(i);return{c(){n&&n.c(),e=Mr()},l(r){n&&n.l(r),e=Mr()},m(r,o){n&&n.m(r,o),ye(r,e,o)},p(r,[o]){r[0]?n?n.p(r,o):(n=Is(r),n.c(),n.m(e.parentNode,e)):n&&(n.d(1),n=null)},i:yn,o:yn,d(r){r&&U(e),n&&n.d(r)}}}function gu(i,e,n){let{show:r=!1}=e;const o=Zo();let l="",h=!1;async function g(){if(!tt||!kn){n(1,l="Error de configuración: Firebase no inicializado.");return}n(1,l=""),n(2,h=!0);try{await eh(tt,kn),o("close")}catch(E){if(console.error(E),E.code==="auth/popup-closed-by-user")return;n(1,l="Error al conectar con Discord. Inténtalo de nuevo.")}finally{n(2,h=!1)}}function w(){o("close")}return i.$$set=E=>{"show"in E&&n(0,r=E.show)},[r,l,h,g,w]}class mu extends Ss{constructor(e){super(),Cs(this,e,gu,pu,As,{show:0})}}const vu={user:null,loading:!0,isLoggedIn:!1},yi=da(vu);typeof window<"u"&&tt?xc(tt,i=>{yi.set({user:i,loading:!1,isLoggedIn:!!i})}):yi.update(i=>({...i,loading:!1}));const _u=async()=>{tt&&await Lc(tt)};function Ts(i,e,n){const r=i.slice();return r[7]=e[n],r}function yu(i){let e,n="Acceso",r,o;return{c(){e=D("button"),e.textContent=n,this.h()},l(l){e=O(l,"BUTTON",{class:!0,"data-svelte-h":!0}),re(e)!=="svelte-160jmm6"&&(e.textContent=n),this.h()},h(){P(e,"class","ml-2 hover:text-white whitespace-nowrap transition-colors bg-transparent border-none cursor-pointer")},m(l,h){ye(l,e,h),r||(o=mt(e,"click",i[4]),r=!0)},p:yn,d(l){l&&U(e),r=!1,o()}}}function wu(i){let e,n="Salir",r,o;return{c(){e=D("button"),e.textContent=n,this.h()},l(l){e=O(l,"BUTTON",{class:!0,"data-svelte-h":!0}),re(e)!=="svelte-1cluazh"&&(e.textContent=n),this.h()},h(){P(e,"class","ml-2 text-red-400 hover:text-red-300 whitespace-nowrap transition-colors bg-transparent border-none cursor-pointer")},m(l,h){ye(l,e,h),r||(o=mt(e,"click",_u),r=!0)},p:yn,d(l){l&&U(e),r=!1,o()}}}function bs(i){let e,n,r,o,l,h,g,w="▶",E,A,R=i[7].tag+"",k,z,S,N,F=i[7].title+"",te,B,L,J=i[7].artist+"",se,H,v,u=i[7].description+"",f,p,m,_;function d(){return i[6](i[7])}return{c(){e=D("div"),n=D("div"),r=D("img"),l=q(),h=D("div"),g=D("a"),g.textContent=w,E=q(),A=D("div"),k=Bt(R),z=q(),S=D("div"),N=D("h3"),te=Bt(F),B=q(),L=D("p"),se=Bt(J),H=q(),v=D("p"),f=Bt(u),p=q(),this.h()},l(x){e=O(x,"DIV",{class:!0});var X=ie(e);n=O(X,"DIV",{class:!0});var be=ie(n);r=O(be,"IMG",{src:!0,alt:!0,class:!0,loading:!0}),l=K(be),h=O(be,"DIV",{class:!0});var Ie=ie(h);g=O(Ie,"A",{href:!0,class:!0,"data-svelte-h":!0}),re(g)!=="svelte-irnpmk"&&(g.textContent=w),Ie.forEach(U),E=K(be),A=O(be,"DIV",{class:!0});var ae=ie(A);k=jt(ae,R),ae.forEach(U),be.forEach(U),z=K(X),S=O(X,"DIV",{class:!0});var we=ie(S);N=O(we,"H3",{class:!0});var ke=ie(N);te=jt(ke,F),ke.forEach(U),B=K(we),L=O(we,"P",{class:!0});var nt=ie(L);se=jt(nt,J),nt.forEach(U),H=K(we),v=O(we,"P",{class:!0});var le=ie(v);f=jt(le,u),le.forEach(U),we.forEach(U),p=K(X),X.forEach(U),this.h()},h(){ra(r.src,o=i[7].cover)||P(r,"src",o),P(r,"alt",i[7].title),P(r,"class","w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"),P(r,"loading","lazy"),P(g,"href","/app"),P(g,"class","w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-110 active:scale-95 transition-transform text-black pl-1"),P(h,"class","absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]"),P(A,"class","absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/10"),P(n,"class","relative aspect-square rounded-2xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 cursor-pointer bg-[#1e293b]"),P(N,"class","font-bold text-xl text-white group-hover:text-[#FF7B3D] transition-colors leading-tight"),P(L,"class","text-sm font-medium text-slate-400"),P(v,"class","text-xs text-slate-500 mt-2 font-light line-clamp-2 leading-relaxed"),P(S,"class","space-y-1 px-1"),P(e,"class","group relative flex flex-col gap-4")},m(x,X){ye(x,e,X),b(e,n),b(n,r),b(n,l),b(n,h),b(h,g),b(n,E),b(n,A),b(A,k),b(e,z),b(e,S),b(S,N),b(N,te),b(S,B),b(S,L),b(L,se),b(S,H),b(S,v),b(v,f),b(e,p),m||(_=mt(g,"click",d),m=!0)},p(x,X){i=x},d(x){x&&U(e),m=!1,_()}}}function Iu(i){let e,n,r,o,l,h='<img src="/favicon.svg" alt="ChillChess Logo" class="w-10 h-10 hover:rotate-12 transition-transform duration-300 drop-shadow-sm filter brightness-110"/> <span class="text-2xl font-bold tracking-tight text-white hover:scale-105 transition-transform cursor-default">ChillChess</span> <span class="text-xs uppercase bg-white/10 px-2 py-1 rounded-md text-slate-400">Beta v2.0</span>',g,w,E,A="Lanzamientos",R,k,z="Artistas",S,N,F="Tienda",te,B,L,J="<span>✨</span> Entrar",se,H,v=`<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div> <h1 class="text-4xl md:text-7xl font-bold text-white tracking-tighter leading-[1.1]">Tu Espacio <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7B3D] to-[#FFB347]">De Concentración</span></h1> <p class="text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">Atmósferas inmersivas diseñadas para estudiar, jugar y fluir. <br class="hidden md:block"/>
            Ajedrez, música Lo-Fi y calma.</p>`,u,f,p,m='<h2 class="text-xl md:text-3xl font-bold text-white">Colección</h2> <button class="text-xs font-semibold text-slate-400 border border-white/20 px-5 py-2.5 rounded-full hover:bg-white hover:text-black hover:border-white transition-all hover:shadow-sm cursor-pointer">VER TODO</button>',_,d,x,X,be='<div class="relative aspect-square rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center border-2 border-dashed border-white/20 group-hover:border-white/40 transition-colors"><div class="text-center space-y-2"><span class="text-4xl block opacity-50">☕</span> <span class="text-slate-400 font-bold uppercase tracking-widest text-xs block">Próximamente</span></div></div> <div class="space-y-1 px-1"><h3 class="font-bold text-xl text-white/50">Lo-Fi Café</h3> <p class="text-sm text-slate-600">Originales ChillChess</p></div>',Ie,ae,we='<div class="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left"><div class="space-y-2"><div class="flex items-center gap-2 justify-center md:justify-start opacity-80"><img src="/favicon.svg" alt="Logo" class="w-6 h-6 grayscale opacity-50"/> <h4 class="font-bold text-xl">ChillChess</h4></div> <p class="text-sm text-slate-500">© 2025 ChillChess. Todos los derechos reservados.</p></div> <div class="flex gap-8 text-sm font-medium"><button class="text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer">Instagram</button> <button class="text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer">Twitter</button> <button class="text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer">Discord</button></div></div>',ke;e=new mu({props:{show:i[0]}}),e.$on("close",i[5]);function nt(M,Z){return M[1].isLoggedIn?wu:yu}let le=nt(i),W=le(i),$e=jr(i[2]),Q=[];for(let M=0;M<$e.length;M+=1)Q[M]=bs(Ts(i,$e,M));return{c(){ha(e.$$.fragment),n=q(),r=D("div"),o=D("nav"),l=D("div"),l.innerHTML=h,g=q(),w=D("div"),E=D("button"),E.textContent=A,R=q(),k=D("button"),k.textContent=z,S=q(),N=D("button"),N.textContent=F,te=q(),W.c(),B=q(),L=D("a"),L.innerHTML=J,se=q(),H=D("header"),H.innerHTML=v,u=q(),f=D("main"),p=D("div"),p.innerHTML=m,_=q(),d=D("div");for(let M=0;M<Q.length;M+=1)Q[M].c();x=q(),X=D("div"),X.innerHTML=be,Ie=q(),ae=D("footer"),ae.innerHTML=we,this.h()},l(M){ca(e.$$.fragment,M),n=K(M),r=O(M,"DIV",{class:!0});var Z=ie(r);o=O(Z,"NAV",{class:!0});var ce=ie(o);l=O(ce,"DIV",{class:!0,"data-svelte-h":!0}),re(l)!=="svelte-assgol"&&(l.innerHTML=h),g=K(ce),w=O(ce,"DIV",{class:!0});var ee=ie(w);E=O(ee,"BUTTON",{class:!0,"data-svelte-h":!0}),re(E)!=="svelte-qj5ddl"&&(E.textContent=A),R=K(ee),k=O(ee,"BUTTON",{class:!0,"data-svelte-h":!0}),re(k)!=="svelte-1nhinrt"&&(k.textContent=z),S=K(ee),N=O(ee,"BUTTON",{class:!0,"data-svelte-h":!0}),re(N)!=="svelte-ck2mlx"&&(N.textContent=F),te=K(ee),W.l(ee),ee.forEach(U),B=K(ce),L=O(ce,"A",{href:!0,class:!0,"data-svelte-h":!0}),re(L)!=="svelte-o7rt43"&&(L.innerHTML=J),ce.forEach(U),se=K(Z),H=O(Z,"HEADER",{class:!0,"data-svelte-h":!0}),re(H)!=="svelte-an7jxf"&&(H.innerHTML=v),u=K(Z),f=O(Z,"MAIN",{class:!0});var Ee=ie(f);p=O(Ee,"DIV",{class:!0,"data-svelte-h":!0}),re(p)!=="svelte-zkhjm"&&(p.innerHTML=m),_=K(Ee),d=O(Ee,"DIV",{class:!0});var Oe=ie(d);for(let it=0;it<Q.length;it+=1)Q[it].l(Oe);x=K(Oe),X=O(Oe,"DIV",{class:!0,"data-svelte-h":!0}),re(X)!=="svelte-teg77f"&&(X.innerHTML=be),Oe.forEach(U),Ee.forEach(U),Ie=K(Z),ae=O(Z,"FOOTER",{class:!0,"data-svelte-h":!0}),re(ae)!=="svelte-9gsmws"&&(ae.innerHTML=we),Z.forEach(U),this.h()},h(){P(l,"class","flex items-center gap-3"),P(E,"class","hover:text-white transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer"),P(k,"class","hover:text-white transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer"),P(N,"class","hover:text-white transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer"),P(w,"class","flex gap-4 md:gap-6 text-sm font-medium text-slate-400 overflow-x-auto max-w-full px-2 items-center"),P(L,"href","/app"),P(L,"class","px-8 py-3 bg-white text-black rounded-full text-sm font-bold tracking-wide hover:bg-slate-200 transition-all hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-white/20 active:scale-95 w-full md:w-auto text-center flex items-center justify-center gap-2"),P(o,"class","flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-6 max-w-7xl mx-auto gap-4"),P(H,"class","px-4 md:px-8 py-12 md:py-24 max-w-7xl mx-auto text-center space-y-6 md:space-y-8 animate-fade-in relative"),P(p,"class","flex justify-between items-end mb-8 border-b border-white/10 pb-4"),P(X,"class","group relative flex flex-col gap-4 opacity-40 hover:opacity-60 transition-all"),P(d,"class","grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"),P(f,"class","px-4 md:px-8 pb-32 max-w-7xl mx-auto"),P(ae,"class","bg-[#050914] text-white py-16 mt-12 border-t border-white/5"),P(r,"class","min-h-screen bg-[#0B1120] text-slate-200 font-poppins overflow-x-hidden")},m(M,Z){la(e,M,Z),ye(M,n,Z),ye(M,r,Z),b(r,o),b(o,l),b(o,g),b(o,w),b(w,E),b(w,R),b(w,k),b(w,S),b(w,N),b(w,te),W.m(w,null),b(o,B),b(o,L),b(r,se),b(r,H),b(r,u),b(r,f),b(f,p),b(f,_),b(f,d);for(let ce=0;ce<Q.length;ce+=1)Q[ce]&&Q[ce].m(d,null);b(d,x),b(d,X),b(r,Ie),b(r,ae),ke=!0},p(M,[Z]){const ce={};if(Z&1&&(ce.show=M[0]),e.$set(ce),le===(le=nt(M))&&W?W.p(M,Z):(W.d(1),W=le(M),W&&(W.c(),W.m(w,null))),Z&12){$e=jr(M[2]);let ee;for(ee=0;ee<$e.length;ee+=1){const Ee=Ts(M,$e,ee);Q[ee]?Q[ee].p(Ee,Z):(Q[ee]=bs(Ee),Q[ee].c(),Q[ee].m(d,x))}for(;ee<Q.length;ee+=1)Q[ee].d(1);Q.length=$e.length}},i(M){ke||(aa(e.$$.fragment,M),ke=!0)},o(M){oa(e.$$.fragment,M),ke=!1},d(M){M&&(U(n),U(r)),sa(e,M),W.d(),na(Q,M)}}}function Eu(i,e,n){let r;ia(i,yi,A=>n(1,r=A));let o=!1;const l=[{id:"noir",title:"Ciudad Noir",artist:"Originales ChillChess",cover:"/assets/images/covers/noir.png",tag:"Popular",price:"Gratis",description:"Lluvia cyberpunk para concentración profunda."},{id:"library",title:"Biblioteca Gran Maestro",artist:"Colección Clásica",cover:"/assets/images/covers/library.png",tag:"Nuevo",price:"Gratis",description:"Chimenea acogedora y libros antiguos."},{id:"zen",title:"Jardín Zen",artist:"Flujo Oriental",cover:"/assets/images/covers/zen.png",tag:"Relax",price:"Gratis",description:"Sonidos de naturaleza y flauta suave."}];function h(A){ua(A)}function g(){n(0,o=!0)}return[o,r,l,h,g,()=>n(0,o=!1),A=>h(A.id)]}class ku extends Ss{constructor(e){super(),Cs(this,e,Eu,Iu,As,{})}}export{ku as component};
