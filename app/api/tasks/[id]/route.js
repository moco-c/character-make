import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "ログインが必要です" }, { status: 401 });
  const { id } = await params;
  const existing = db.prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?").get(id, user.id);
  if (!existing) return Response.json({ error: "タスクが見つかりません" }, { status: 404 });
  const body = await request.json();
  const title = String(body.title ?? existing.title).trim();
  if (!title) return Response.json({ error: "タスク名を入力してください" }, { status: 400 });
  const target = Math.max(1, Number(body.target ?? existing.target) || 1);
  const progress = Math.max(0, Number(body.progress ?? existing.progress) || 0);
  const completed = body.completed == null ? progress >= target : Boolean(body.completed);
  const category = body.category ?? existing.category;
  const fallbackArea = category === "家事" ? "floor" : ["睡眠", "食事"].includes(category) ? "avatar" : "none";
  const effectArea = body.effectArea ?? (existing.effect_area !== "none" ? existing.effect_area : fallbackArea);
  db.prepare(`UPDATE tasks SET title=?, category=?, icon=?, frequency=?, target=?, due_time=?, effect_area=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(title, category, body.icon ?? existing.icon, body.frequency ?? existing.frequency, target, body.dueTime ?? existing.due_time, effectArea, id);
  return Response.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "ログインが必要です" }, { status: 401 });
  const { id } = await params;
  const task = db.prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?").get(id, user.id);
  if (!task) return Response.json({ error: "タスクが見つかりません" }, { status: 404 });
  db.prepare("DELETE FROM task_logs WHERE task_id = ?").run(id);
  db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(id, user.id);
  return Response.json({ ok: true });
}
