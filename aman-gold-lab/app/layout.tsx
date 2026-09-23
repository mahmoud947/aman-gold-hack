import "./globals.css";
export const metadata = { title: "Aman Gold — Business Case Lab", description: "Internal decision-support tool" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
