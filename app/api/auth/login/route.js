import db from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const { email, password } = await request.json();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(String(email || "").trim().toLowerCase());
  if (!user || !verifyPassword(String(password || ""), user.password_hash)) {
    return Response.json({ error: "メールアドレスまたはパスワードが違います" }, { status: 401 });
  }
  await createSession(user.id);
  return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
}
