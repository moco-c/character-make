// 各レベルの見た目をまとめた設定です。
// 新しい見た目に調整したい場合は、まずこの数値や色を変更してください。
const AVATAR_STATES = {
  1: { name: 'とても不健康', description: '顔色が悪く、猫背で疲れ切っています。', skin: '#91a8a6', blush: 0, eye: 0.16, mouth: 'sad', slump: 28, arm: 24, sparkle: 0, aura: '#667b7b' },
  2: { name: 'かなり疲れている', description: '強い疲れが顔と姿勢に出ています。', skin: '#a9b8b0', blush: 0, eye: 0.28, mouth: 'sad', slump: 23, arm: 20, sparkle: 0, aura: '#788c88' },
  3: { name: '疲れている', description: '目が重く、少し猫背になっています。', skin: '#c2c6b3', blush: 0.03, eye: 0.42, mouth: 'sad', slump: 17, arm: 15, sparkle: 0, aura: '#91a39b' },
  4: { name: '少し疲れている', description: '少し眠そうですが、普段に近い状態です。', skin: '#ddc6aa', blush: 0.1, eye: 0.62, mouth: 'flat', slump: 10, arm: 9, sparkle: 0, aura: '#aebeb3' },
  5: { name: '普通', description: '落ち着いた標準の状態です。', skin: '#f0c9aa', blush: 0.2, eye: 0.82, mouth: 'flat', slump: 2, arm: 2, sparkle: 0, aura: '#bfd7dc' },
  6: { name: '少し元気', description: '表情がやわらかく、姿勢も良くなっています。', skin: '#f2c6a4', blush: 0.3, eye: 0.92, mouth: 'smile', slump: 0, arm: 0, sparkle: 0, aura: '#9ed8dc' },
  7: { name: '元気', description: '明るい表情で、元気に立っています。', skin: '#f4c39f', blush: 0.4, eye: 1, mouth: 'smile', slump: -3, arm: -8, sparkle: 0, aura: '#80d6d7' },
  8: { name: 'とても元気', description: '笑顔になり、いきいきとしています。', skin: '#f5c09a', blush: 0.5, eye: 1.08, mouth: 'happy', slump: -5, arm: -18, sparkle: 0.3, aura: '#66d9cd' },
  9: { name: '健康で明るい', description: '健康的な顔色と明るい笑顔です。', skin: '#f6bd94', blush: 0.65, eye: 1.12, mouth: 'happy', slump: -7, arm: -28, sparkle: 0.7, aura: '#5cddbd' },
  10: { name: '最高の状態', description: '満面の笑顔で、キラキラ輝いています。', skin: '#f7bb90', blush: 0.8, eye: 1.18, mouth: 'happy', slump: -9, arm: -38, sparkle: 1, aura: '#ffd75e' },
};

// 通常のscriptタグから状態名を参照できるように公開します。
window.AVATAR_STATES = AVATAR_STATES;

class LifeMirrorAvatar extends HTMLElement {
  static get observedAttributes() { return ['level']; }

  constructor() {
    super();
    // Shadow DOMにすることで、外側のCSSに見た目を壊されにくくします。
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  get level() {
    const value = Number(this.getAttribute('level')) || 5;
    return Math.min(10, Math.max(1, Math.round(value)));
  }

  set level(value) { this.setAttribute('level', String(value)); }

  render() {
    const level = this.level;
    const state = AVATAR_STATES[level];
    // 疲労表現と元気表現の強さです。レベル差がはっきり見えるように使います。
    const tired = Math.max(0, (5 - level) / 4);
    const energy = Math.max(0, (level - 5) / 5);
    const mouthPath = state.mouth === 'happy'
      ? 'M 111 104 Q 120 116 129 104 Q 120 123 111 104'
      : state.mouth === 'smile'
        ? 'M 110 105 Q 120 114 130 105'
        : state.mouth === 'sad'
          ? 'M 111 111 Q 120 102 129 111'
          : 'M 112 108 Q 120 110 128 108';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; width: min(280px, 72vw); aspect-ratio: 3 / 5; }
        svg { display: block; width: 100%; height: 100%; overflow: visible; }
        .body { transform-origin: 120px 235px; transform: rotate(${state.slump * -0.38}deg) translate(${-state.slump * .13}px, ${Math.max(0, state.slump * 0.5)}px); }
        .head { transform-origin: 120px 93px; transform: translate(${-state.slump * .28}px, ${Math.max(0, state.slump * 0.55)}px) rotate(${state.slump * -0.35}deg); }
        .left-arm { transform-origin: 82px 178px; transform: rotate(${state.arm}deg); }
        .right-arm { transform-origin: 158px 178px; transform: rotate(${-state.arm}deg); }
        .eye-open { transform-box: fill-box; transform-origin: center; transform: scaleY(${state.eye}); }
        .sparkle { opacity: ${state.sparkle}; transform-origin: center; animation: twinkle 1.6s ease-in-out infinite alternate; }
        .sparkle.two { animation-delay: .45s; }
        .tired-mark { opacity: ${tired}; }
        .energy-mark { opacity: ${energy}; }
        @keyframes twinkle { from { transform: scale(.75) rotate(0); } to { transform: scale(1.12) rotate(10deg); } }
        @media (prefers-reduced-motion: reduce) { .sparkle { animation: none; } }
      </style>
      <svg viewBox="0 0 240 400" role="img" aria-labelledby="avatarTitle avatarDescription">
        <title id="avatarTitle">健康レベル${level}、${state.name}の2Dアバター</title>
        <desc id="avatarDescription">正面を向いた大学生くらいの全身キャラクターです。</desc>
        <defs>
          <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#6faec7"/><stop offset="1" stop-color="#487f9e"/>
          </linearGradient>
          <filter id="softGlow"><feGaussianBlur stdDeviation="8"/></filter>
        </defs>

        <!-- 元気なレベルほど、背後の淡い光が強くなります。背景自体は透明です。 -->
        <ellipse cx="120" cy="214" rx="76" ry="142" fill="${state.aura}" opacity="${0.03 + energy * 0.2}" filter="url(#softGlow)"/>

        <!-- 元気なときに背後へ出るゲーム風のエネルギー線 -->
        <g class="energy-mark" stroke="${state.aura}" stroke-width="5" stroke-linecap="round">
          <path d="M48 68 L34 50 M192 68 L206 50 M35 190 L15 188 M205 190 L225 188 M61 326 L47 343 M179 326 L193 343"/>
        </g>

        <g class="body">
          <!-- 脚と靴 -->
          <path d="M89 263 L115 263 L112 345 L85 345 Z" fill="#334d6e" stroke="#24364e" stroke-width="3"/>
          <path d="M125 263 L151 263 L155 345 L128 345 Z" fill="#334d6e" stroke="#24364e" stroke-width="3"/>
          <path d="M83 342 Q98 337 114 345 L114 358 Q92 364 77 354 Q76 347 83 342Z" fill="#f4f6f8" stroke="#354453" stroke-width="3"/>
          <path d="M127 345 Q143 337 157 342 Q164 347 163 354 Q148 364 126 358Z" fill="#f4f6f8" stroke="#354453" stroke-width="3"/>

          <!-- 胴体と腕 -->
          <path d="M81 170 Q120 153 159 170 L153 269 Q120 279 87 269 Z" fill="url(#shirt)" stroke="#315e76" stroke-width="3"/>
          <path d="M98 164 Q120 181 142 164 L137 192 Q120 204 103 192Z" fill="#f6f7f4"/>
          <g class="left-arm"><path d="M84 174 Q68 183 65 221 L70 266 Q77 272 84 266 L85 220 L98 188Z" fill="url(#shirt)" stroke="#315e76" stroke-width="3"/><circle cx="77" cy="270" r="9" fill="${state.skin}" stroke="#8c6755" stroke-width="2"/></g>
          <g class="right-arm"><path d="M156 174 Q172 183 175 221 L170 266 Q163 272 156 266 L155 220 L142 188Z" fill="url(#shirt)" stroke="#315e76" stroke-width="3"/><circle cx="163" cy="270" r="9" fill="${state.skin}" stroke="#8c6755" stroke-width="2"/></g>
          <path d="M89 264 Q120 275 151 264" fill="none" stroke="#24364e" stroke-width="4"/>
        </g>

        <!-- 顔 -->
        <g class="head">
          <circle cx="120" cy="101" r="55" fill="${state.skin}" stroke="#664a42" stroke-width="3"/>
          <path d="M69 96 Q65 43 116 37 Q169 38 173 92 Q154 76 142 56 Q115 78 73 74Z" fill="#3f3437" stroke="#2a2325" stroke-width="3"/>
          <path d="M72 89 Q65 93 70 111 Q73 121 81 118" fill="${state.skin}" stroke="#664a42" stroke-width="3"/>
          <path d="M168 89 Q175 93 170 111 Q167 121 159 118" fill="${state.skin}" stroke="#664a42" stroke-width="3"/>
          <ellipse cx="94" cy="107" rx="11" ry="6" fill="#ec7d83" opacity="${state.blush}"/>
          <ellipse cx="146" cy="107" rx="11" ry="6" fill="#ec7d83" opacity="${state.blush}"/>
          <!-- 低レベルほど濃くなる目の下のクマ -->
          <g class="tired-mark" fill="none" stroke="#667878" stroke-width="4" stroke-linecap="round">
            <path d="M88 104 Q99 111 110 104"/><path d="M130 104 Q141 111 152 104"/>
          </g>
          <g class="eye-open" fill="#29323c">
            <ellipse cx="99" cy="94" rx="5" ry="7"/><ellipse cx="141" cy="94" rx="5" ry="7"/>
          </g>
          ${level <= 3 ? '<path d="M88 86 L108 89 M132 89 L152 86" stroke="#59484a" stroke-width="3" stroke-linecap="round"/>' : ''}
          <path d="${mouthPath}" fill="${state.mouth === 'happy' ? '#ef7180' : 'none'}" stroke="#75464d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- 疲労が強いときの汗 -->
          <path class="tired-mark" d="M164 77 Q174 91 164 98 Q154 91 164 77Z" fill="#83d8e7" stroke="#397b8b" stroke-width="2"/>
        </g>

        <!-- レベル1〜4で見える、ふらふらした疲労マーク -->
        <g class="tired-mark" fill="none" stroke="#718184" stroke-width="4" stroke-linecap="round">
          <path d="M30 115 Q18 124 31 134 Q44 144 30 154"/>
          <path d="M205 228 Q218 237 205 247"/>
        </g>

        <!-- レベル8以上で現れるキラキラ -->
        <g class="sparkle" fill="#fff4a8" stroke="#e4ad32" stroke-width="1.5">
          <path d="M42 90 L46 100 L56 104 L46 108 L42 118 L38 108 L28 104 L38 100Z"/>
          <path class="two" d="M195 139 L198 147 L206 150 L198 153 L195 161 L192 153 L184 150 L192 147Z"/>
          <circle cx="194" cy="74" r="4"/><circle cx="49" cy="156" r="3"/>
        </g>
      </svg>`;
  }
}

// 同じ名前で二重登録されないように確認してから登録します。
if (!customElements.get('life-mirror-avatar')) {
  customElements.define('life-mirror-avatar', LifeMirrorAvatar);
}
