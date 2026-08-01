// 状態名はテスト画面からも使います。
const AVATAR_STATES={1:{name:'とても不健康',description:'顔色が悪く、猫背で疲れ切っています。'},2:{name:'かなり疲れている',description:'強い疲れが顔と姿勢に出ています。'},3:{name:'疲れている',description:'目が重く、少し猫背になっています。'},4:{name:'少し疲れている',description:'少し眠そうですが、普段に近い状態です。'},5:{name:'普通',description:'落ち着いた標準の状態です。'},6:{name:'少し元気',description:'表情がやわらかく、姿勢も良くなっています。'},7:{name:'元気',description:'明るい表情で、元気に立っています。'},8:{name:'とても元気',description:'笑顔になり、いきいきとしています。'},9:{name:'健康で明るい',description:'健康的な顔色と明るい笑顔です。'},10:{name:'最高の状態',description:'満面の笑顔で、キラキラ輝いています。'}};
window.AVATAR_STATES=AVATAR_STATES;

class LifeMirrorAvatar extends HTMLElement{
  static get observedAttributes(){return['level','hair-color','skin','outfit-color','accessory','animation','direction'];}
  constructor(){super();this.attachShadow({mode:'open'});this.frame=0;this.walkTick=0;this.frames={open:{},closed:{}};this.stateMasks={};this.walkImage=new Image();this.walkMasks={};this.walkImage.src='./assets/avatar-reference-walk.png?v=4';this.walkImage.onload=()=>this.draw();for(let level=1;level<=10;level++){this.stateMasks[level]={};for(const eye of ['open','closed']){const image=new Image();image.src=`./assets/avatar-states/level-${level}-${eye}.png?v=3`;image.onload=()=>this.draw();this.frames[eye][level]=image;}for(const part of ['hair','skin','outfit']){const mask=new Image();mask.src=part==='skin'?`./assets/avatar-states/level-${level}-skin-mask-v3.png`:`./assets/avatar-states/level-${level}-${part}-mask.png?v=8`;mask.onload=()=>this.draw();this.stateMasks[level][part]=mask;}}for(const part of ['hair','skin','outfit']){const mask=new Image();mask.src=`./assets/walk-${part}-mask.png?v=1`;mask.onload=()=>this.draw();this.walkMasks[part]=mask;}}
  connectedCallback(){this.render();this.timer=setInterval(()=>{if(this.getAttribute('animation')==='walk'){this.walkTick++;const delay=this.level<=2?3:this.level<=5?2:1;if(this.walkTick%delay===0)this.frame=(this.frame+1)%4;}this.draw();},100);}
  disconnectedCallback(){clearInterval(this.timer);}
  attributeChangedCallback(name){if(!this.isConnected)return;if(name==='animation'||name==='direction'||name==='level')this.render();else this.draw();}
  get level(){return Math.min(10,Math.max(1,Math.round(Number(this.getAttribute('level'))||5)));}
  set level(v){this.setAttribute('level',v);}
  render(){const walking=this.getAttribute('animation')==='walk',left=this.getAttribute('direction')==='left',fatigue=Math.max(0,(5-this.level)/4),energy=Math.max(0,(this.level-5)/5),brightness=.76+energy*.28+(1-fatigue)*.24,saturation=.48+energy*.42+(1-fatigue)*.52;this.shadowRoot.innerHTML=`<style>:host{display:block;width:min(350px,82vw);aspect-ratio:2/3}.stage{position:relative;width:100%;height:100%;transform:${left?'scaleX(-1)':'none'}}canvas{display:block;width:100%;height:100%;filter:drop-shadow(0 12px 9px rgba(35,52,60,.18))}.idle{animation:breathe 1.8s ease-in-out infinite}.walk canvas{transform-origin:50% 92%;transform:translateY(${fatigue*22-energy*4}px) rotate(${-fatigue*7}deg);filter:brightness(${brightness}) saturate(${saturation}) drop-shadow(0 12px 9px rgba(35,52,60,.18))}.walk:after{content:'✦';position:absolute;right:12%;top:20%;color:#ffd94f;font-size:2rem;opacity:${energy>.65?energy:0};text-shadow:-35px 55px 0 #ffe887;animation:sparkle .8s ease-in-out infinite alternate}@keyframes breathe{0%,100%{transform:translateY(2px)}50%{transform:translateY(-5px)}}@keyframes sparkle{to{transform:scale(1.18);opacity:.55}}@media(prefers-reduced-motion:reduce){.idle{animation:none}.walk:after{animation:none}}</style><div class="stage ${walking?'walk':'idle'}"><canvas width="512" height="768" role="img"></canvas></div>`;this.draw();}
  hex(value,fallback){const text=value||fallback;return[text.slice(1,3),text.slice(3,5),text.slice(5,7)].map(x=>parseInt(x,16));}
  tint(r,g,b,target,strength){const light=(Math.max(r,g,b)+Math.min(r,g,b))/510;return target.map(v=>Math.round(v*(.48+light*.7)*strength+[r,g,b][target.indexOf(v)]*(1-strength)));}
  draw(){
    const canvas=this.shadowRoot?.querySelector('canvas'),walking=this.getAttribute('animation')==='walk',level=this.level;
    // 3.8秒に一度、約200msだけ対応する「閉じ目」の行へ切り替えます。
    const blinkPhase=Date.now()%3800,isBlinking=!walking&&blinkPhase>=3500&&blinkPhase<3700;
    const source=walking?this.walkImage:this.frames[isBlinking?'closed':'open'][level];if(!canvas||!source.complete||!source.naturalWidth)return;
    const ctx=canvas.getContext('2d',{willReadFrequently:true}),col=walking?this.frame:0,columns=walking?4:1,sw=source.naturalWidth/columns,sh=source.naturalHeight,dw=walking?768*(sw/sh):512,dx=walking?(512-dw)/2:0;
    ctx.clearRect(0,0,512,768);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(source,col*sw,0,sw,sh,dx,0,dw,768);
    try{
      const data=ctx.getImageData(0,0,512,768),targets={hair:this.hex(this.getAttribute('hair-color'),'#77777b'),skin:this.hex(this.getAttribute('skin'),'#f4c9aa'),outfit:this.hex(this.getAttribute('outfit-color'),'#b6e3ea')},maskData={};
      // 事前作成した専用マスクを同じ位置・大きさで切り出します。
      for(const part of ['hair','skin','outfit']){const mask=walking?this.walkMasks[part]:this.stateMasks[level][part];if(!mask.complete||!mask.naturalWidth)continue;const maskCanvas=document.createElement('canvas');maskCanvas.width=512;maskCanvas.height=768;const maskCtx=maskCanvas.getContext('2d');if(walking)maskCtx.drawImage(mask,col*(mask.naturalWidth/4),0,mask.naturalWidth/4,mask.naturalHeight,dx,0,dw,768);else maskCtx.drawImage(mask,0,0,512,768);maskData[part]=maskCtx.getImageData(0,0,512,768).data;}
      for(let i=0;i<data.data.length;i+=4){if(data.data[i+3]<20)continue;let part=null,weight=0;for(const candidate of ['skin','outfit','hair']){const value=(maskData[candidate]?.[i]||0)/255;if(value>weight){part=candidate;weight=value;}}if(!part||weight<.05)continue;const r=data.data[i],g=data.data[i+1],b=data.data[i+2],lum=(r+g+b)/765,target=targets[part],partStrength={skin:.96,hair:.92,outfit:.82}[part],strength=partStrength*weight;for(let channel=0;channel<3;channel++){const shaded=target[channel]*(.38+lum*.82);data.data[i+channel]=Math.round(shaded*strength+data.data[i+channel]*(1-strength));}}
      ctx.putImageData(data,0,0);
    }catch(error){/* 色替えできない環境でも元のイラストは表示します。 */}
    const item=walking?'none':this.getAttribute('accessory');ctx.lineWidth=6;ctx.strokeStyle='#49505c';ctx.fillStyle='#f18a9a';
    if(item==='glasses'){ctx.beginPath();ctx.arc(145,145,24,0,Math.PI*2);ctx.arc(215,145,24,0,Math.PI*2);ctx.moveTo(169,145);ctx.lineTo(191,145);ctx.stroke();}
    if(item==='hairpin'){ctx.strokeStyle='#ffd557';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(224,90);ctx.lineTo(246,73);ctx.moveTo(229,100);ctx.lineTo(251,83);ctx.stroke();}
    if(item==='headphones'){ctx.lineWidth=10;ctx.beginPath();ctx.arc(180,137,86,Math.PI,0);ctx.stroke();ctx.fillRect(86,132,18,52);ctx.fillRect(256,132,18,52);}
    canvas.setAttribute('aria-label',`健康レベル${level}、${AVATAR_STATES[level].name}の手描き風ミニアバター`);
  }
}
if(!customElements.get('life-mirror-avatar'))customElements.define('life-mirror-avatar',LifeMirrorAvatar);
