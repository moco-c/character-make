import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "ログインが必要です" }, { status: 401 });
  const { id } = await params;
  const task = db.prepare("SELECT id, target FROM tasks WHERE id = ? AND user_id = ?").get(id, user.id);
  if (!task) return Response.json({ error: "タスクが見つかりません" }, { status: 404 });
  const body = await request.json();
  const date = String(body.date || new Date().toISOString().slice(0, 10));
  const current = db.prepare("SELECT count FROM task_logs WHERE task_id = ? AND record_date = ?").get(id, date)?.count || 0;
  const next = Math.max(0, Math.min(task.target, current + (Number(body.delta) || 1)));
  db.prepare(`INSERT INTO task_logs (task_id, record_date, count) VALUES (?, ?, ?)
    ON CONFLICT(task_id, record_date) DO UPDATE SET count=excluded.count, updated_at=CURRENT_TIMESTAMP`).run(id, date, next);
  return Response.json({ count: next, completed: next >= task.target });
}
