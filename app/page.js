"use client";

import { useEffect, useMemo, useState } from "react";

const icons = { sun: "☀", broom: "✦", meal: "♨", moon: "☾", book: "▤", run: "◆", sparkles: "✧" };
const categories = ["すべて", "睡眠", "家事", "食事", "学習", "運動", "その他"];
const blankTask = { title: "", category: "家事", icon: "broom", frequency: "毎日", target: 1, progress: 0, dueTime: "", effectArea: "floor" };

function AuthScreen({ onAuthenticated }) {
  const [mode,setMode]=useState("welcome"); const [form,setForm]=useState({name:"",email:"",password:""}); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const submit=async e=>{e.preventDefault();setBusy(true);setError("");const endpoint=mode==="register"?"register":"login";const res=await fetch(`/api/auth/${endpoint}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const data=await res.json();setBusy(false);if(!res.ok)return setError(data.error||"エラーが発生しました");onAuthenticated(data.user)};
  return <main className="auth-page"><div className="auth-shade"/><section className={`auth-content ${mode!=="welcome"?"form-open":""}`}><div className="auth-brand"><h1>{"Life Mirror".split("").map((c,i)=><span key={i} style={{animationDelay:`${i*.08}s`}}>{c===" "?"\u00a0":c}</span>)}</h1><p>暮らしを映して、なりたい自分へ。</p></div>{mode==="welcome"?<div className="welcome-actions"><button onClick={()=>setMode("login")}>ログイン</button><button onClick={()=>setMode("register")}>新規アカウント作成</button></div>:<form className="auth-form" onSubmit={submit}><div className="auth-form-head"><div><small>{mode==="login"?"WELCOME BACK":"START YOUR STORY"}</small><h2>{mode==="login"?"ログイン":"アカウント作成"}</h2></div><button type="button" onClick={()=>{setMode("welcome");setError("")}}>×</button></div>{mode==="register"&&<label>お名前<input required autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="鏡 はると"/></label>}<label>メールアドレス<input required type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>パスワード<input required minLength="8" type="password" autoComplete={mode==="login"?"current-password":"new-password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="8文字以上"/></label>{error&&<p className="auth-error">{error}</p>}<button className="auth-submit" disabled={busy}>{busy?"確認しています…":mode==="login"?"ログインする":"アカウントを作る"}</button><p className="auth-switch">{mode==="login"?"アカウントをお持ちでない方":"すでにアカウントをお持ちの方"}<button type="button" onClick={()=>{setMode(mode==="login"?"register":"login");setError("")}}>{mode==="login"?"新規登録":"ログイン"}</button></p></form>}</section></main>;
}

function Sidebar({ view, setView, user, onLogout }) {
  const items = [["room", "⌂", "マイルーム"], ["tasks", "✓", "タスク"], ["status", "▥", "レポート"]];
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark">L</span><div><b>Life Mirror</b><small>暮らしを映す</small></div></div>
    <nav>{items.map(([id, icon, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><span>{icon}</span>{label}</button>)}</nav>
    <div className="side-bottom"><button onClick={onLogout}><span>↪</span>ログアウト</button><div className="profile"><img className="mini-face" src="/assets/avatar-states/level-7-open.png" alt="ユーザーのアバター"/><div><b>{user.name}</b><small>{user.email}</small></div></div></div>
  </aside>;
}

function Room({ tasks, setView, user }) {
  const done = tasks.filter(t => t.completed).length;
  const score = tasks.length ? Math.round(tasks.reduce((sum, t) => sum + Math.min(t.progress / t.target, 1), 0) / tasks.length * 100) : 0;
  const healthTasks = tasks.filter(t => ["睡眠", "食事"].includes(t.category));
  const healthScore = healthTasks.length ? Math.round(healthTasks.reduce((sum,t)=>sum+Math.min(t.progress/t.target,1),0)/healthTasks.length*100) : 50;
  const avatarLevel = Math.max(1, Math.min(10, Math.ceil(healthScore / 10)));
  const dirt = tasks.filter(t => t.category === "家事" && !t.completed && t.overdueDays >= 2);
  const floorDirty = dirt.some(t => t.effectArea === "floor");
  const trashDirty = dirt.some(t => t.effectArea === "trash");
  const kitchenDirty = dirt.some(t => t.effectArea === "kitchen");
  return <main className="content room-view">
    <header><div><p className="date-label">{new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric", weekday: "short" }).format(new Date())}</p><h1>おかえりなさい、{user.name}さん</h1><p>今日の暮らしが、少しずつ部屋に映っています。</p></div><button className="bell" aria-label="通知">♢<i /></button></header>
    <section className="room-card">
      <div className="room-top"><div><span className="online-dot" />今日の部屋</div><div className="condition">コンディション <b>{score >= 75 ? "とても元気" : score >= 45 ? "まあまあ" : "お疲れぎみ"}</b></div></div>
      <div className={`room-scene ${score < 45 ? "tired" : ""}`}>
        <img className="room-background" src="/assets/room/life-mirror-room.png" alt="明るい一人暮らしの部屋" />
        <div className="blinking-avatar">
          <img className="avatar-image avatar-open" src={`/assets/avatar-states/level-${avatarLevel}-open.png`} alt={`健康レベル${avatarLevel}のアバター`} />
          <img className="avatar-image avatar-closed" src={`/assets/avatar-states/level-${avatarLevel}-closed.png`} alt="" />
        </div>
        {floorDirty && <div className="dirt-layer floor-dirt"><i/><i/><i/><i/></div>}
        {trashDirty && <div className="dirt-layer trash-dirt"><span>▰</span><b>♜</b><em>▱</em></div>}
        {kitchenDirty && <div className="dirt-layer kitchen-dirt"><span>◒</span><b>▱</b><em>◓</em></div>}
        <div className="speech">{score >= 70 ? "今日もいい調子だね！" : "ひとつずつ整えていこう"}</div>
      </div>
      <div className="room-footer"><div><strong>{score}</strong><span>/100<br/><small>ライフスコア</small></span></div><div className="progress"><i style={{width: `${score}%`}}/></div><button onClick={() => setView("tasks")}>今日の記録をつける <span>→</span></button></div>
    </section>
    <section className="summary-grid"><article><div className="summary-icon blue">✓</div><div><small>今日の達成</small><strong>{done}<span> / {tasks.length} タスク</span></strong></div></article><article><div className="summary-icon orange">♨</div><div><small>継続日数</small><strong>7<span> 日</span></strong></div></article><article className="advice"><div className="ai">AI</div><div><small>ミラーからのアドバイス</small><p>{score < 60 ? "まずは短時間でできるタスクから。小さな達成が生活のリズムを作ります。" : "睡眠と食事のリズムが整ってきました。この調子で無理なく続けましょう。"}</p></div></article></section>
  </main>;
}

function TaskModal({ task, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(task ? { ...task } : blankTask);
  const update = e => setForm({ ...form, [e.target.name]: e.target.type === "number" ? Number(e.target.value) : e.target.value });
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><form className="modal" onSubmit={e => {e.preventDefault(); onSave(form)}}>
    <div className="modal-head"><div><span>{task ? "タスクを編集" : "新しい習慣"}</span><h2>{task ? "内容を見直す" : "暮らしに習慣を追加"}</h2></div><button type="button" onClick={onClose}>×</button></div>
    <label>タスク名<input autoFocus required name="title" value={form.title} onChange={update} placeholder="例：朝ごはんを食べる" /></label>
    <div className="form-grid"><label>カテゴリー<select name="category" value={form.category} onChange={update}>{categories.slice(1).map(x => <option key={x}>{x}</option>)}</select></label><label>頻度<select name="frequency" value={form.frequency} onChange={update}><option>毎日</option><option>平日</option><option>週2回</option><option>週3回</option><option>毎週</option></select></label></div>
    {form.category === "家事" && <label>未達成時に変化する場所<select name="effectArea" value={form.effectArea || "floor"} onChange={update}><option value="floor">部屋・床（ほこり／散らかり）</option><option value="trash">ごみ置き場（ごみ袋）</option><option value="kitchen">キッチン（食器）</option></select></label>}
    <div className="form-grid"><label>目標回数<input min="1" max="99" type="number" name="target" value={form.target} onChange={update}/></label><label>時刻（任意）<input type="time" name="dueTime" value={form.dueTime || ""} onChange={update}/></label></div>
    <div className="modal-actions">{task && <button type="button" className="delete" onClick={() => onDelete(task.id)}>削除</button>}<span/><button type="button" className="cancel" onClick={onClose}>キャンセル</button><button className="primary">{task ? "変更を保存" : "タスクを追加"}</button></div>
  </form></div>;
}

function Calendar({ value, onChange }) {
  const base = new Date(`${value}T12:00:00`); const year=base.getFullYear(), month=base.getMonth();
  const first=new Date(year,month,1); const cells=[]; const start=first.getDay(); const days=new Date(year,month+1,0).getDate();
  for(let i=0;i<start;i++) cells.push(null); for(let d=1;d<=days;d++) cells.push(d);
  const move=m=>{const next=new Date(year,month+m,1);onChange(next.toLocaleDateString("sv-SE"))};
  return <div className="calendar-card"><div className="calendar-head"><button onClick={()=>move(-1)}>‹</button><b>{year}年 {month+1}月</b><button onClick={()=>move(1)}>›</button></div><div className="calendar-grid">{["日","月","火","水","木","金","土"].map(x=><small key={x}>{x}</small>)}{cells.map((d,i)=>d?<button key={i} className={d===base.getDate()?"selected":""} onClick={()=>onChange(`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`)}>{d}</button>:<i key={i}/>)}</div></div>
}

function Tasks({ tasks, reload, selectedDate, setSelectedDate }) {
  const [filter, setFilter] = useState("すべて"); const [editing, setEditing] = useState(null); const [adding, setAdding] = useState(false);
  const shown = tasks.filter(t => filter === "すべて" || t.category === filter);
  async function save(task) { const editingId = editing?.id; await fetch(editingId ? `/api/tasks/${editingId}` : "/api/tasks", {method: editingId ? "PATCH" : "POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(task)}); setEditing(null); setAdding(false); reload(); }
  async function remove(id) { if (!confirm("このタスクを削除しますか？")) return; await fetch(`/api/tasks/${id}`, {method:"DELETE"}); setEditing(null); reload(); }
  async function record(task, delta) { await fetch(`/api/tasks/${task.id}/logs`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({date:selectedDate,delta})}); reload(selectedDate); }
  return <main className="content task-view"><header><div><p className="date-label">DAILY ROUTINE</p><h1>タスク管理</h1><p>毎日の小さな積み重ねが、部屋とあなたを育てます。</p></div><button className="add-button" onClick={() => setAdding(true)}>＋ 新しいタスク</button></header>
    <Calendar value={selectedDate} onChange={date=>{setSelectedDate(date);reload(date)}} />
    <div className="task-stats"><div><span>今日の達成度</span><b>{tasks.filter(t=>t.completed).length}<small> / {tasks.length}</small></b></div><div className="stat-bar"><i style={{width:`${tasks.length ? tasks.filter(t=>t.completed).length/tasks.length*100 : 0}%`}}/></div><em>{tasks.filter(t=>t.completed).length === tasks.length ? "すべて達成！" : "あと少し、焦らずいこう"}</em></div>
    <div className="filters">{categories.map(c => <button key={c} onClick={()=>setFilter(c)} className={filter===c?"active":""}>{c}</button>)}</div>
    <section className="task-list">{shown.map(task => <article key={task.id} className={task.completed ? "done" : ""}>
      <button className="check" onClick={()=>record(task, task.completed ? -task.target : 1)} aria-label="1回記録">{task.completed ? "✓" : "＋"}</button><div className={`task-icon ${task.category}`}>{icons[task.icon] || "✧"}</div><div className="task-info"><h3>{task.title}</h3><p><span>{task.category}</span>・{task.frequency}{task.dueTime && ` ・ ${task.dueTime}`}{task.overdueDays>=2 && task.category==="家事" && ` ・ ${task.overdueDays}日未消化`}</p></div><div className="count-control"><button disabled={task.progress===0} onClick={()=>record(task,-1)}>−</button><strong>{Math.min(task.progress, task.target)} / {task.target} 回</strong><button disabled={task.completed} onClick={()=>record(task,1)}>＋</button></div><span className={`status ${task.completed?"complete":"ongoing"}`}>{task.completed ? "達成" : "進行中"}</span><button className="edit" onClick={()=>setEditing(task)}>•••</button>
    </article>)}{shown.length===0 && <div className="empty">このカテゴリーには、まだタスクがありません。</div>}</section>
    {(adding || editing) && <TaskModal task={editing} onClose={()=>{setAdding(false);setEditing(null)}} onSave={save} onDelete={remove}/>}</main>;
}

function Status({ tasks }) {
  const done = tasks.filter(t=>t.completed).length; const score = tasks.length ? Math.round(done/tasks.length*100) : 0;
  const metrics = [["睡眠",78,"☀"],["食事",65,"♨"],["家事",score,"✦"],["学習",86,"▤"],["メンタル",72,"◉"]];
  return <main className="content status-view"><header><div><p className="date-label">WEEKLY REPORT</p><h1>暮らしのレポート</h1><p>今週のあなたの変化を振り返ってみましょう。</p></div></header><section className="report-grid"><article className="health-card"><h2>ライフバランス</h2><p>各項目の今週のスコア</p>{metrics.map(([n,v,i])=><div className="metric" key={n}><span>{i}</span><b>{n}</b><div><i style={{width:`${v}%`}}/></div><strong>{v}%</strong></div>)}</article><article className="mirror-card"><small>今週のあなた</small><div className="big-face">◕‿◕</div><h2>よく頑張りました</h2><p>先週より <b>+8ポイント</b></p><div className="week-score"><strong>{Math.round((score+301)/5)}</strong><span>/ 100</span></div></article></section><section className="week-card"><div><small>今週のハイライト</small><h2>7日間の継続、おめでとう！</h2><p>生活のリズムが少しずつ安定しています。完璧を目指さず、続けることを大切に。</p></div><div className="days">{["月","火","水","木","金","土","日"].map((d,i)=><span key={d} className={i<6?"filled":""}><i>{i<6?"✓":""}</i>{d}</span>)}</div></section></main>;
}

export default function Home() {
  const today = new Date().toLocaleDateString("sv-SE");
  const [view, setView] = useState("room"); const [tasks, setTasks] = useState([]); const [loading,setLoading]=useState(true); const [selectedDate,setSelectedDate]=useState(today); const [user,setUser]=useState(undefined);
  const reload = async (date=selectedDate) => { const res=await fetch(`/api/tasks?date=${date}`,{cache:"no-store"}); setTasks(await res.json()); setLoading(false); };
  useEffect(()=>{fetch("/api/auth/me").then(async res=>{if(res.ok){const data=await res.json();setUser(data.user);reload()}else{setUser(null);setLoading(false)}})},[]);
  const authenticated=u=>{setUser(u);setLoading(true);reload(today)};
  const logout=async()=>{await fetch("/api/auth/logout",{method:"POST"});setUser(null);setTasks([]);setView("room")};
  if(user===undefined)return <div className="auth-loading">Life Mirror</div>;
  if(!user)return <AuthScreen onAuthenticated={authenticated}/>;
  return <div className="app-shell"><Sidebar user={user} onLogout={logout} view={view} setView={id=>{setView(id);if(id==="room"){setSelectedDate(today);reload(today)}}}/>{loading ? <div className="loading">暮らしを映しています…</div> : view === "room" ? <Room user={user} tasks={tasks} setView={setView}/> : view === "tasks" ? <Tasks tasks={tasks} reload={reload} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/> : <Status tasks={tasks}/>}</div>;
}
