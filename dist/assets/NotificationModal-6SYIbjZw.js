import{j as s}from"./index-CesKL47-.js";import{b as l}from"./vendor-ijvtlm17.js";import{c}from"./createReactComponent-Du5Y4UgA.js";/**
 * @license @tabler/icons-react v3.45.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["path",{d:"M5 12l5 5l10 -10",key:"svg-0"}]],f=c("outline","check","Check",x);/**
 * @license @tabler/icons-react v3.45.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["path",{d:"M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1",key:"svg-0"}]],N=c("outline","message-circle","MessageCircle",j);/**
 * @license @tabler/icons-react v3.45.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"M18 6l-12 12",key:"svg-0"}],["path",{d:"M6 6l12 12",key:"svg-1"}]],u=c("outline","x","X",p);function y({isOpen:o,onClose:n,onConfirm:a,tenantName:t,message:d,title:m="알림톡 발송"}){const[e,i]=l.useState("idle");if(l.useEffect(()=>{o&&i("idle")},[o]),!o)return null;const r=()=>{i("sending"),setTimeout(()=>{i("success"),setTimeout(()=>{a()},1e3)},1500)};return s.jsx("div",{className:"notif-modal__overlay",children:s.jsxs("div",{className:"notif-modal__content",children:[s.jsx("button",{className:"notif-modal__close",onClick:n,disabled:e==="sending",children:s.jsx(u,{size:24})}),e==="idle"&&s.jsxs("div",{className:"notif-modal__body",children:[s.jsx("div",{className:"notif-modal__icon",children:s.jsx(N,{size:36,color:"#3A1D1D"})}),s.jsx("h2",{className:"notif-modal__title",children:m}),s.jsxs("p",{className:"notif-modal__desc",children:[s.jsx("strong",{children:t})," 임차인에게 아래 내용으로",s.jsx("br",{}),"카카오 알림톡을 발송하시겠습니까?"]}),s.jsxs("div",{className:"notif-modal__preview",children:[s.jsx("div",{className:"notif-modal__preview-header",children:"카카오톡 미리보기"}),s.jsx("div",{className:"notif-modal__preview-body",children:d.split(`
`).map((_,h)=>s.jsxs("span",{children:[_,s.jsx("br",{})]},h))})]}),s.jsx("button",{className:"notif-modal__btn-send",onClick:r,children:"발송하기"})]}),e==="sending"&&s.jsxs("div",{className:"notif-modal__body notif-modal__body--center",children:[s.jsx("div",{className:"notif-modal__spinner"}),s.jsx("h2",{className:"notif-modal__title",children:"알림톡 발송 중..."}),s.jsx("p",{className:"notif-modal__desc",children:"잠시만 기다려주세요"})]}),e==="success"&&s.jsxs("div",{className:"notif-modal__body notif-modal__body--center",children:[s.jsx("div",{className:"notif-modal__success-icon",children:s.jsx(f,{size:40,color:"white"})}),s.jsx("h2",{className:"notif-modal__title",children:"발송 완료!"}),s.jsx("p",{className:"notif-modal__desc",children:"임차인에게 성공적으로 전송되었습니다."})]})]})})}export{y as N};
