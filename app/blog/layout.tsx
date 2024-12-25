export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(25, 25, 25, 0.8) 0%, rgba(15, 15, 15, 0.8) 100%)',
      minHeight: '100vh',
    }}>
      {children}
    </div>
  );
} 