import { AppHeader } from "@/components/layout/AppHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <AppHeader />
      <main className="h-[calc(100dvh-3.5rem)] overflow-hidden">{children}</main>
    </div>
  );
}
