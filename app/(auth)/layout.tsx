export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-primary px-5 py-12">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/[0.04] blur-[120px]" />
      <div className="relative w-full max-w-[380px]">{children}</div>
    </div>
  );
}
