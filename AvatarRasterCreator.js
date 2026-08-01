// 状態名はテスト画面からも使います。
const AVATAR_STATES={1:{name:'とても不健康',description:'顔色が悪く、猫背で疲れ切っています。'},2:{name:'かなり疲れている',description:'強い疲れが顔と姿勢に出ています。'},3:{name:'疲れている',description:'目が重く、少し猫背になっています。'},4:{name:'少し疲れている',description:'少し眠そうですが、普段に近い状態です。'},5:{name:'普通',description:'落ち着いた標準の状態です。'},6:{name:'少し元気',description:'表情がやわらかく、姿勢も良くなっています。'},7:{name:'元気',description:'明るい表情で、元気に立っています。'},8:{name:'とても元気',description:'笑顔になり、いきいきとしています。'},9:{name:'健康で明るい',description:'健康的な顔色と明るい笑顔です。'},10:{name:'最高の状態',description:'満面の笑顔で、キラキラ輝いています。'}};
window.AVATAR_STATES=AVATAR_STATES;

class LifeMirrorAvatar extends HTMLElement{
  static get observedAttributes(){return['level','hair-color','skin','outfit-color','accessory','animation','direction'];}
  constructor(){super();this.attachShadow({mode:'open'});this.frame=0;this.walkTick=0;this.frames={};this.walkImage=new Image();this.walkImage.src='./assets/avatar-threequarter-walk-8-v2-clean.png';this.walkImage.onload=()=>this.draw();for(let level=1;level<=10;level++){const image=new Image();const version=level===1?'-clean':[2,3,7,8,10].includes(level)?'-v2':'';image.src=`./assets/avatar-states/level-${level}-threequarter-aligned${version}.png`;image.onload=()=>this.draw();this.frames[level]=image;}}
  connectedCallback(){this.render();this.timer=setInterval(()=>{if(this.getAttribute('animation')==='walk'){this.walkTick++;const delay=this.level<=2?2:1;if(this.walkTick%delay===0)this.frame=(this.frame+1)%8;}this.draw();},90);}
  disconnectedCallback(){clearInterval(this.timer);}
  attributeChangedCallback(name){if(!this.isConnected)return;if(name==='animation'||name==='direction'||name==='level')this.render();else this.draw();}
  get level(){return Math.min(10,Math.max(1,Math.round(Number(this.getAttribute('level'))||5)));}
  set level(v){this.setAttribute('level',v);}
  render(){
    const walking=this.getAttribute('animation')==='walk',left=this.getAttribute('direction')==='left',fatigue=Math.max(0,(5-this.level)/4),energy=Math.max(0,(this.level-5)/5),brightness=.76+energy*.28+(1-fatigue)*.24,saturation=.48+energy*.42+(1-fatigue)*.52;
    const layers=walking?'<canvas class="whole" data-part="whole" width="512" height="768"></canvas>':['legs','torso','arm-left','arm-right','head'].map(part=>`<canvas class="layer ${part}" data-part="${part}" width="512" height="768"></canvas>`).join('');
    this.shadowRoot.innerHTML=`<style>
      :host{display:block;width:min(350px,82vw);aspect-ratio:2/3}
      .stage{position:relative;width:100%;height:100%;transform:${left?'scaleX(-1)':'none'};filter:drop-shadow(0 12px 9px rgba(35,52,60,.18))}
      canvas{display:block;width:100%;height:100%}
      .layer{position:absolute;inset:0;will-change:transform}
      .head{clip-path:polygon(7% 4%,93% 4%,93% 57%,7% 57%);transform-origin:50% 51%;animation:head-idle 4.2s ease-in-out infinite}
      .torso{clip-path:polygon(25% 53%,75% 53%,75% 76%,25% 76%);transform-origin:50% 70%;animation:torso-idle 3.2s ease-in-out infinite}
      .arm-left{clip-path:polygon(13% 53%,42% 53%,42% 78%,12% 78%);transform-origin:38% 55%;animation:arm-left-idle 4.2s ease-in-out infinite}
      .arm-right{clip-path:polygon(58% 53%,88% 53%,89% 78%,58% 78%);transform-origin:62% 55%;animation:arm-right-idle 4.2s ease-in-out infinite}
      .legs{clip-path:inset(64% 14% 1% 14%);animation:legs-idle 3.2s ease-in-out infinite}
      .walk canvas{transform-origin:50% 92%;filter:brightness(${brightness}) saturate(${saturation});animation:walk-body .72s linear infinite}
      .walk:after{content:'✦';position:absolute;right:12%;top:20%;color:#ffd94f;font-size:2rem;opacity:${energy>.65?energy:0};text-shadow:-35px 55px 0 #ffe887;animation:sparkle .8s ease-in-out infinite alternate}
      @keyframes head-idle{0%,100%{transform:translateY(1px) rotate(-.45deg)}50%{transform:translateY(-1px) rotate(.45deg)}}
      @keyframes torso-idle{0%,100%{transform:translateY(1px) scale(1)}50%{transform:translateY(-1px) scale(1.003)}}
      @keyframes arm-left-idle{0%,100%{transform:rotate(.7deg)}50%{transform:rotate(-.7deg)}}
      @keyframes arm-right-idle{0%,100%{transform:rotate(-.7deg)}50%{transform:rotate(.7deg)}}
      @keyframes legs-idle{0%,100%{transform:translateY(1px)}50%{transform:translateY(0)}}
      @keyframes walk-body{0%,50%,100%{transform:translateY(${fatigue*10-energy*2}px) rotate(${-fatigue*3}deg)}25%,75%{transform:translateY(${fatigue*10-energy*2+3}px) rotate(${-fatigue*3}deg)}}
      @keyframes sparkle{to{transform:scale(1.18);opacity:.55}}
      @media(prefers-reduced-motion:reduce){.layer{animation:none!important}.walk:after{animation:none}}
    </style><div class="stage ${walking?'walk':'idle'}" role="img">${layers}</div>`;
    this.draw();
  }
  hex(value,fallback){const text=value||fallback;return[text.slice(1,3),text.slice(3,5),text.slice(5,7)].map(x=>parseInt(x,16));}
  tint(r,g,b,target,strength){const light=(Math.max(r,g,b)+Math.min(r,g,b))/510;return target.map(v=>Math.round(v*(.48+light*.7)*strength+[r,g,b][target.indexOf(v)]*(1-strength)));}
  draw(){
    const canvas=this.shadowRoot?.querySelector('canvas'),walking=this.getAttribute('animation')==='walk',level=this.level;
    // 3.8秒に一度、約200msだけ対応する「閉じ目」の行へ切り替えます。
    const blinkPhase=Date.now()%3800,isBlinking=!walking&&blinkPhase>=3500&&blinkPhase<3700;
    const source=walking?this.walkImage:this.frames[level];if(!canvas||!source.complete||!source.naturalWidth)return;
    /* The walk sheet has eight intact full-body frames in a 4-by-2 grid. */
    /* 右脚と左脚が交互に前へ出る順番で8コマを再生します。 */
    const walkOrder=[0,1,2,3,4,5,6,7],shownFrame=walking?walkOrder[this.frame]:0;
    const ctx=canvas.getContext('2d',{willReadFrequently:true}),col=walking?shownFrame%4:0,row=walking?Math.floor(shownFrame/4):0,columns=walking?4:1,rows=walking?2:1,sw=source.naturalWidth/columns,sh=source.naturalHeight/rows,dw=512,dx=0;
    ctx.clearRect(0,0,512,768);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(source,col*sw,row*sh,sw,sh,dx,0,dw,768);
    // 瞬きでは画像を交換せず、同じ場所の目だけを閉じます。
    // そのため、瞬いた瞬間に頭や全身が上下へずれません。
    if(isBlinking)this.drawBlink(ctx,level);
    // 色マスクによる変更は、画像を汚す原因になったため停止しています。
    // 元の高解像度イラストをそのまま表示します。
    /* アクセサリーは待機画像にだけ重ねます。 */
    const item=walking?'none':this.getAttribute('accessory');ctx.lineWidth=6;ctx.strokeStyle='#49505c';ctx.fillStyle='#f18a9a';
    if(item==='glasses'){ctx.beginPath();ctx.arc(145,145,24,0,Math.PI*2);ctx.arc(215,145,24,0,Math.PI*2);ctx.moveTo(169,145);ctx.lineTo(191,145);ctx.stroke();}
    if(item==='hairpin'){ctx.strokeStyle='#ffd557';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(224,90);ctx.lineTo(246,73);ctx.moveTo(229,100);ctx.lineTo(251,83);ctx.stroke();}
    if(item==='headphones'){ctx.lineWidth=10;ctx.beginPath();ctx.arc(180,137,86,Math.PI,0);ctx.stroke();ctx.fillRect(86,132,18,52);ctx.fillRect(256,132,18,52);}
    /* 待機時は同じ画像を各レイヤーへコピーします。 */
    for(const layer of this.shadowRoot.querySelectorAll('canvas'))if(layer!==canvas){const layerContext=layer.getContext('2d');layerContext.clearRect(0,0,512,768);layerContext.drawImage(canvas,0,0);}
    canvas.setAttribute('aria-label',`健康レベル${level}、${AVATAR_STATES[level].name}の手描き風ミニアバター`);
    this.shadowRoot.querySelector('.stage')?.setAttribute('aria-label',`健康レベル${level}、${AVATAR_STATES[level].name}の手描き風ミニアバター`);
  }
  drawBlink(ctx,level){
    // 顔の範囲にある黒い楕円を探し、目の位置を画像ごとに自動判定します。
    const pixels=ctx.getImageData(0,0,512,768).data,visited=new Uint8Array(512*768),parts=[];
    const isDark=(x,y)=>{const i=(y*512+x)*4;return pixels[i+3]>180&&pixels[i]<65&&pixels[i+1]<65&&pixels[i+2]<65;};
    for(let y=225;y<350;y++)for(let x=120;x<335;x++){
      const start=y*512+x;if(visited[start]||!isDark(x,y))continue;
      const queue=[start];visited[start]=1;let count=0,minX=x,maxX=x,minY=y,maxY=y;
      for(let q=0;q<queue.length;q++){const point=queue[q],px=point%512,py=Math.floor(point/512);count++;minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);for(const [nx,ny] of [[px-1,py],[px+1,py],[px,py-1],[px,py+1]]){const next=ny*512+nx;if(nx>=120&&nx<335&&ny>=225&&ny<350&&!visited[next]&&isDark(nx,ny)){visited[next]=1;queue.push(next);}}}
      const width=maxX-minX+1,height=maxY-minY+1;if(count>35&&width>=8&&width<=46&&height>=12&&height<=58)parts.push({count,minX,maxX,minY,maxY,width,height,x:(minX+maxX)/2,y:(minY+maxY)/2});
    }
    let eyes=parts.sort((a,b)=>b.count-a.count).filter((part,index,list)=>index===0||list.slice(0,index).every(other=>Math.abs(other.x-part.x)>38)).slice(0,2).sort((a,b)=>a.x-b.x);
    /* Level 1 uses fixed bounds because its upper eyelids touch the eyes. */
    if(level===1)eyes=[{minX:161,maxX:196,minY:330,maxY:350,width:36,height:21,x:179,y:340},{minX:249,maxX:297,minY:328,maxY:349,width:49,height:22,x:273,y:339}];
    if(eyes.length!==2)return;
    ctx.save();ctx.strokeStyle='#252525';ctx.lineWidth=4;ctx.lineCap='round';
    /* Exclude dark eyelid pixels when sampling the level-1 face color. */
    if(level===1){for(const eye of eyes){let red=0,green=0,blue=0,count=0;const left=Math.max(0,eye.minX-10),right=Math.min(511,eye.maxX+10),top=Math.max(0,eye.minY-10),bottom=Math.min(767,eye.maxY+10);for(let py=top;py<=bottom;py++)for(let px=left;px<=right;px++){const index=(py*512+px)*4,r=pixels[index],g=pixels[index+1],b=pixels[index+2],a=pixels[index+3];if(a>180&&r>105&&g>105&&b>105){red+=r;green+=g;blue+=b;count++;}}const skin=count?`rgb(${Math.round(red/count)},${Math.round(green/count)},${Math.round(blue/count)})`:'#dfe5ef';ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(eye.x,eye.y,eye.width*.65,eye.height*.82,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(eye.x-eye.width*.38,eye.y);ctx.quadraticCurveTo(eye.x,eye.y-eye.height*.18,eye.x+eye.width*.38,eye.y);ctx.stroke();}ctx.restore();return;}
    /* Rebuild the skin horizontally for all other levels. */
    const original=new Uint8ClampedArray(pixels),patched=ctx.createImageData(512,768);patched.data.set(pixels);
    for(const eye of eyes){const pad=5,left=Math.max(1,eye.minX-pad),right=Math.min(510,eye.maxX+pad),top=Math.max(1,eye.minY-pad),bottom=Math.min(766,eye.maxY+pad);for(let py=top;py<=bottom;py++)for(let px=left;px<=right;px++){const index=(py*512+px)*4;if(level===1){const amount=(py-top+1)/(bottom-top+2),topIndex=((top-1)*512+px)*4,bottomIndex=((bottom+1)*512+px)*4;for(let channel=0;channel<4;channel++)patched.data[index+channel]=Math.round(original[topIndex+channel]*(1-amount)+original[bottomIndex+channel]*amount);}else{const amount=(px-left+1)/(right-left+2),leftIndex=(py*512+left-1)*4,rightIndex=(py*512+right+1)*4;for(let channel=0;channel<4;channel++)patched.data[index+channel]=Math.round(original[leftIndex+channel]*(1-amount)+original[rightIndex+channel]*amount);}}}
    ctx.putImageData(patched,0,0);
    for(const eye of eyes){ctx.beginPath();ctx.moveTo(eye.x-eye.width*.38,eye.y);ctx.quadraticCurveTo(eye.x,eye.y-eye.height*.18,eye.x+eye.width*.38,eye.y);ctx.stroke();}
    ctx.restore();
  }
}
if(!customElements.get('life-mirror-avatar'))customElements.define('life-mirror-avatar',LifeMirrorAvatar);
