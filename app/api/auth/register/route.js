import db from "@/lib/db";
import { createSession, hashPassword, seedUserTasks } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const { name, email, password } = await request.json();
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (cleanName.length < 1) return Response.json({ error: "名前を入力してください" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return Response.json({ error: "正しいメールアドレスを入力してください" }, { status: 400 });
  if (String(password || "").length < 8) return Response.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });
  try {
    const result = db.prepare("INSERT INTO users (name,email,password_hash) VALUES (?,?,?)").run(cleanName, cleanEmail, hashPassword(password));
    const userId = Number(result.lastInsertRowid);
    seedUserTasks(userId);
    await createSession(userId);
    return Response.json({ user: { id: userId, name: cleanName, email: cleanEmail } }, { status: 201 });
  } catch (error) {
    if (String(error).includes("UNIQUE")) return Response.json({ error: "このメールアドレスは登録済みです" }, { status: 409 });
    throw error;
  }
}
