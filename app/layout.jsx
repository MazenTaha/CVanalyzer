import "./globals.css";

export const metadata = {
  title: "Mazen's LLM Prototype",
  description: "AI CV and LinkedIn profile analyzer powered by Gemini."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
