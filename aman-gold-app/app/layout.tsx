import "./globals.css";
export const metadata = { title: "Aman Gold - MVP Prototype", description: "Clickable prototype (demo data)" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="font-sans antialiased">{children}</body></html>);
}
