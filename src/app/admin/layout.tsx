import Sidebar from "@/core/features/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 text-slate-800 antialiased">
      <Sidebar />

      <div className="ml-64 flex min-h-screen flex-col overflow-x-hidden">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
            Hệ thống Quản trị
          </h2>

          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs font-medium text-slate-600">
              Quyền Admin
            </span>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}