import { Sidebar } from "@/components/layout/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-bg-primary">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-hidden pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
