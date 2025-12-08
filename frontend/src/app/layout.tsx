import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/my_ui/theme-provider"
import NavigationBar from "@/components/my_ui/Navigation";

const space_Grotesk = Space_Grotesk({
  weight: "400"
});

export const metadata: Metadata = {
  title: "Email Manager",
  description: "An Agent that has access to your emails.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={space_Grotesk.className}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <NavigationBar />

          <main className="scroll-smooth pt-20 bg-gray-50 dark:bg-gray-900 min-h-screen">{children}</main>

        </ThemeProvider>
      </body>
    </html>
  );
}
