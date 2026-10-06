export default function RedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-PR">
      <body>{children}</body>
    </html>
  );
}
