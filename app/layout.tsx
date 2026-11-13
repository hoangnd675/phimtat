import type { Metadata } from "next";

export const metadata: Metadata = { title: "Universal Media Downloader API", description: "Private media resolver API" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body style={{ fontFamily: "system-ui", margin: 0, padding: 32 }}>{children}</body></html>;
}
