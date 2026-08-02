import crypto from "node:crypto";
import { cookies } from "next/headers";
import db from "@/lib/db";

const COOKIE_NAME = "life_mirror_session";
const SESSION_DAYS = 30;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [salt, value] = stored.split(":");
    const actual = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(actual, Buffer.from(value, "hex"));
  } catch { return false; }
}

const tokenHash = token => crypto.createHash("sha256").update(token).digest("hex");

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  db.prepare("DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP").run();
  db.prepare("INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)").run(userId, tokenHash(token), expires.toISOString());
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash(token));
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return db.prepare(`SELECT users.id, users.name, users.email FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > CURRENT_TIMESTAMP`).get(tokenHash(token)) || null;
}

export function seedUserTasks(userId) {
  const insert = db.prepare(`INSERT INTO tasks (user_id,title,category,icon,frequency,target,due_time,effect_area) VALUES (?,?,?,?,?,?,?,?)`);
  [["7時までに起きる","睡眠","sun","毎日",1,"07:00","avatar"],["部屋を掃除する","家事","broom","週2回",2,null,"floor"],["自炊する","食事","meal","毎日",3,null,"avatar"],["24時までに寝る","睡眠","moon","毎日",1,"24:00","avatar"],["食器を洗う","家事","sparkles","毎日",1,null,"kitchen"],["ごみを出す","家事","sparkles","毎週",1,null,"trash"]].forEach(row => insert.run(userId,...row));
}
