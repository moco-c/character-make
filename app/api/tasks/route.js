import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalize = (body) => ({
  title: String(body.title || "").trim(),
  category: String(body.category || "その他"),
  icon: String(body.icon || "sparkles"),
  frequency: String(body.frequency || "毎日"),
  target: Math.max(1, Number(body.target) || 1),
  progress: Math.max(0, Number(body.progress) || 0),
  dueTime: body.dueTime ? String(body.dueTime) : null,
  effectArea: String(body.effectArea || (body.category === "家事" ? "floor" : ["睡眠", "食事"].includes(body.category) ? "avatar" : "none")),
});

function rows(date, userId) {
  return db.prepare(`SELECT tasks.*, COALESCE(task_logs.count, 0) AS daily_progress,
    CAST(julianday(?) - julianday(COALESCE((SELECT MAX(record_date) FROM task_logs done WHERE done.task_id = tasks.id AND done.count >= tasks.target), date(tasks.created_at))) AS INTEGER) AS overdue_days
    FROM tasks LEFT JOIN task_logs ON task_logs.task_id = tasks.id AND task_logs.record_date = ?
    WHERE tasks.user_id = ? ORDER BY tasks.id ASC`).all(date, date, userId).map((row) => ({
    ...row,
    progress: row.daily_progress,
    completed: row.daily_progress >= row.target,
    dueTime: row.due_time,
    effectArea: row.effect_area,
    overdueDays: Math.max(0, row.overdue_days || 0),
  })).map((row) => ({
    ...row,
    effectArea: row.effectArea !== "none" ? row.effectArea : row.category === "家事" ? "floor" : ["睡眠", "食事"].includes(row.category) ? "avatar" : "none",
  }));
}

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "ログインが必要です" }, { status: 401 });
  const date = new URL(request.url).searchParams.get("date") || new Date().toISOString().slice(0, 10);
  return Response.json(rows(date, user.id), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "ログインが必要です" }, { status: 401 });
  const task = normalize(await request.json());
  if (!task.title) return Response.json({ error: "タスク名を入力してください" }, { status: 400 });
  const result = db.prepare(`INSERT INTO tasks
    (user_id, title, category, icon, frequency, target, progress, due_time, completed, effect_area)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(user.id, task.title, task.category, task.icon, task.frequency, task.target, 0, task.dueTime, 0, task.effectArea);
  return Response.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}
