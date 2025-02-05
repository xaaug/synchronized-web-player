import type { Metadata } from "next";
import { Afacad } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const afacad = Afacad({subsets: ['latin']})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body
        className={`${afacad.className} antialiased`}
      >
         <header className="flex items-center justify-center py-6 text-white" style={{background: '#091020'}}>
          <nav className="flex gap-5">
            <Link href='/'  className="text-xl font-semibold">Home</Link>
            <Link href='/rooms'  className="text-xl font-semibold">Rooms</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
