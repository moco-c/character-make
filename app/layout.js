import "./globals.css";

export const metadata = {
  title: "Life Mirror | 暮らしを映す習慣アプリ",
  description: "毎日の習慣が、あなたの部屋とアバターを育てます。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
