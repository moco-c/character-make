// Life Mirrorで使う10段階の状態名と説明です。
const AVATAR_STATES = {
  1: { name: 'とても不健康', description: '顔色が悪く、猫背で疲れ切っています。' },
  2: { name: 'かなり疲れている', description: '強い疲れが顔と姿勢に出ています。' },
  3: { name: '疲れている', description: '目が重く、少し猫背になっています。' },
  4: { name: '少し疲れている', description: '少し眠そうですが、普段に近い状態です。' },
  5: { name: '普通', description: '落ち着いた標準の状態です。' },
  6: { name: '少し元気', description: '表情がやわらかく、姿勢も良くなっています。' },
  7: { name: '元気', description: '明るい表情で、元気に立っています。' },
  8: { name: 'とても元気', description: '笑顔になり、いきいきとしています。' },
  9: { name: '健康で明るい', description: '健康的な顔色と明るい笑顔です。' },
  10: { name: '最高の状態', description: '満面の笑顔で、キラキラ輝いています。' },
};

window.AVATAR_STATES = AVATAR_STATES;

class LifeMirrorAvatar extends HTMLElement {
  static get observedAttributes() { return ['level']; }

  constructor() {
    super();
    // 外側の画面のCSSから影響を受けないようにします。
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
    const column = (level - 1) % 5;
    const row = level <= 5 ? 0 : 1;
    // 5列の画像なので、左端から0・25・50・75・100%の位置を使います。
    const positionX = column * 25;
    const positionY = row * 100;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: min(330px, 82vw);
          aspect-ratio: 1 / 1.34;
        }
        .avatar {
          width: 100%;
          height: 100%;
          background-image: url('./assets/avatar-sprite.png?v=2');
          background-repeat: no-repeat;
          background-size: 500% 200%;
          background-position: ${positionX}% ${positionY}%;
          filter: drop-shadow(0 12px 8px rgba(33, 52, 61, .18));
          transition: background-position .15s ease;
        }
      </style>
      <div
        class="avatar"
        role="img"
        aria-label="健康レベル${level}、${state.name}の大学生アバター"
      ></div>`;
  }
}

if (!customElements.get('life-mirror-avatar')) {
  customElements.define('life-mirror-avatar', LifeMirrorAvatar);
}
