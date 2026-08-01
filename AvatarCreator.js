// 健康状態ごとの表情・姿勢です。
const AVATAR_STATES = {
  1:{name:'とても不健康',description:'顔色が悪く、猫背で疲れ切っています。',eye:.15,lean:12,y:14,mouth:'sad',blush:0,aura:0,tired:1},
  2:{name:'かなり疲れている',description:'強い疲れが顔と姿勢に出ています。',eye:.28,lean:9,y:11,mouth:'sad',blush:0,aura:0,tired:.8},
  3:{name:'疲れている',description:'目が重く、少し猫背になっています。',eye:.42,lean:7,y:8,mouth:'sad',blush:.08,aura:0,tired:.6},
  4:{name:'少し疲れている',description:'少し眠そうですが、普段に近い状態です。',eye:.62,lean:4,y:5,mouth:'flat',blush:.15,aura:0,tired:.35},
  5:{name:'普通',description:'落ち着いた標準の状態です。',eye:.82,lean:1,y:1,mouth:'flat',blush:.25,aura:0,tired:0},
  6:{name:'少し元気',description:'表情がやわらかく、姿勢も良くなっています。',eye:.95,lean:0,y:0,mouth:'smile',blush:.35,aura:.1,tired:0},
  7:{name:'元気',description:'明るい表情で、元気に立っています。',eye:1,lean:-1,y:-2,mouth:'smile',blush:.45,aura:.25,tired:0},
  8:{name:'とても元気',description:'笑顔になり、いきいきとしています。',eye:1.05,lean:-2,y:-3,mouth:'happy',blush:.55,aura:.45,tired:0},
  9:{name:'健康で明るい',description:'健康的な顔色と明るい笑顔です。',eye:1.1,lean:-2,y:-4,mouth:'happy',blush:.65,aura:.7,tired:0},
  10:{name:'最高の状態',description:'満面の笑顔で、キラキラ輝いています。',eye:1.12,lean:-3,y:-6,mouth:'happy',blush:.8,aura:1,tired:0},
};
window.AVATAR_STATES=AVATAR_STATES;

class LifeMirrorAvatar extends HTMLElement {
  static get observedAttributes(){return ['level','hair','hair-color','skin','outfit-color','accessory'];}
  constructor(){super();this.attachShadow({mode:'open'});}
  connectedCallback(){this.render();}
  attributeChangedCallback(){if(this.isConnected)this.render();}
  get level(){return Math.min(10,Math.max(1,Math.round(Number(this.getAttribute('level'))||5)));}
  set level(value){this.setAttribute('level',value);}

  render(){
    const level=this.level,state=AVATAR_STATES[level];
    const hair=this.getAttribute('hair')||'short';
    const hairColor=this.getAttribute('hair-color')||'#493a3d';
    const skin=this.getAttribute('skin')||'#f4c9aa';
    const outfit=this.getAttribute('outfit-color')||'#55a7a0';
    const accessory=this.getAttribute('accessory')||'none';
    const mouth=state.mouth==='happy'?'M128 134Q145 153 162 134Q145 163 128 134Z':state.mouth==='smile'?'M130 137Q145 150 160 137':state.mouth==='sad'?'M132 145Q145 134 158 145':'M133 141L157 141';
    const backHair=hair==='long'?`<path d="M76 79Q80 20 145 18Q210 22 213 83L205 184Q184 204 165 184H125Q100 204 80 181Z" fill="${hairColor}" stroke="#332b31" stroke-width="5"/>`:hair==='bob'?`<path d="M76 80Q78 22 145 18Q211 22 214 82L202 157Q185 174 168 156H119Q98 174 82 154Z" fill="${hairColor}" stroke="#332b31" stroke-width="5"/>`:`<path d="M78 83Q78 23 145 18Q211 23 212 84L198 130H92Z" fill="${hairColor}" stroke="#332b31" stroke-width="5"/>`;
    const frontHair=hair==='curly'?`<path d="M80 75Q76 43 103 38Q104 13 132 30Q151 4 168 30Q200 16 198 46Q222 52 205 81Q185 66 174 48Q154 72 130 50Q109 73 80 75Z" fill="${hairColor}" stroke="#332b31" stroke-width="5"/>`:`<path d="M80 78Q77 34 117 25Q152 5 190 30Q211 45 208 78Q187 67 175 48Q163 69 143 49Q123 73 80 78Z" fill="${hairColor}" stroke="#332b31" stroke-width="5"/>`;
    const item=accessory==='glasses'?'<g fill="none" stroke="#4a5361" stroke-width="4"><circle cx="116" cy="111" r="17"/><circle cx="174" cy="111" r="17"/><path d="M133 110h24M99 107l-13-4M191 107l13-4"/></g>':accessory==='hairpin'?'<path d="M185 58l16-11M190 65l16-11" stroke="#ffd45c" stroke-width="6" stroke-linecap="round"/>':accessory==='headphones'?'<path d="M84 100Q81 38 145 35Q209 38 206 100" fill="none" stroke="#4e596a" stroke-width="8"/><rect x="76" y="91" width="18" height="38" rx="8" fill="#f0808d"/><rect x="196" y="91" width="18" height="38" rx="8" fill="#f0808d"/>':'';
    this.shadowRoot.innerHTML=`<style>:host{display:block;width:min(310px,80vw);aspect-ratio:290/390}svg{width:100%;height:100%;overflow:visible}.pose{transform-origin:145px 330px;transform:translateY(${state.y}px) rotate(${state.lean}deg);transition:transform .25s}.eyes{transform-box:fill-box;transform-origin:center;transform:scaleY(${state.eye})}.tired{opacity:${state.tired}}.aura{opacity:${state.aura};animation:twinkle 1.3s ease-in-out infinite alternate}@keyframes twinkle{to{transform:scale(1.08) rotate(5deg)}}@media(prefers-reduced-motion:reduce){.aura{animation:none}}</style>
    <svg viewBox="0 0 290 390" role="img" aria-label="健康レベル${level}、${state.name}のミニアバター"><defs><filter id="glow"><feGaussianBlur stdDeviation="10"/></filter></defs><ellipse class="aura" cx="145" cy="210" rx="105" ry="160" fill="#ffe477" opacity=".22" filter="url(#glow)"/><g class="aura" fill="#fff07a" stroke="#e7b83e" stroke-width="2"><path d="M32 80l5 13 13 5-13 5-5 13-5-13-13-5 13-5z"/><path d="M248 145l4 11 11 4-11 4-4 11-4-11-11-4 11-4z"/></g><g class="pose"><ellipse cx="145" cy="368" rx="72" ry="10" fill="#38505a" opacity=".12"/><path d="M103 302h36l-5 52q-19 9-38-1zM151 302h36l7 51q-19 10-38 1z" fill="#415474" stroke="#313d56" stroke-width="5"/><path d="M94 348q22-6 43 4l-1 18q-32 7-52-9zM154 352q22-10 42-4l11 13q-21 16-53 9z" fill="#fff" stroke="#4d5660" stroke-width="5"/><path d="M82 214q63-30 126 0l-14 96q-49 17-98 0z" fill="${outfit}" stroke="#315d61" stroke-width="6"/><path d="M117 202q28 24 56 0l-8 36q-20 12-40 0z" fill="#fff4dc"/><path d="M88 219q-23 8-21 55l11 32q11 5 18-7l-5-38 18-30z" fill="${outfit}" stroke="#315d61" stroke-width="6"/><circle cx="82" cy="307" r="12" fill="${skin}" stroke="#9d6f5a" stroke-width="3"/><path d="M202 219q23 8 21 55l-11 32q-11 5-18-7l5-38-18-30z" fill="${outfit}" stroke="#315d61" stroke-width="6"/><circle cx="208" cy="307" r="12" fill="${skin}" stroke="#9d6f5a" stroke-width="3"/>${backHair}<ellipse cx="145" cy="109" rx="69" ry="78" fill="${skin}" stroke="#734f45" stroke-width="5"/>${frontHair}<ellipse cx="111" cy="132" rx="15" ry="8" fill="#ee7f8a" opacity="${state.blush}"/><ellipse cx="179" cy="132" rx="15" ry="8" fill="#ee7f8a" opacity="${state.blush}"/><g class="eyes" fill="#303744"><ellipse cx="115" cy="109" rx="8" ry="12"/><ellipse cx="175" cy="109" rx="8" ry="12"/><circle cx="112" cy="105" r="3" fill="#fff"/><circle cx="172" cy="105" r="3" fill="#fff"/></g><g class="tired" fill="none" stroke="#73838b" stroke-width="5" stroke-linecap="round"><path d="M99 128q15 10 30 0M161 128q15 10 30 0"/></g><path d="${mouth}" fill="${state.mouth==='happy'?'#ed7782':'none'}" stroke="#7b4650" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path class="tired" d="M203 91q12 17 0 26q-12-9 0-26z" fill="#79d9e7" stroke="#397f90" stroke-width="3"/>${item}</g></svg>`;
  }
}
if(!customElements.get('life-mirror-avatar'))customElements.define('life-mirror-avatar',LifeMirrorAvatar);
