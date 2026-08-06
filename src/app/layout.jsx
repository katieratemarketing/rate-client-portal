export const metadata = {
  title: "Rate Client Portal",
  description: "Client-facing delivery portal for Rate Marketing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
