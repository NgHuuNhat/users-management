// import Sidebar from "@/components/admin/Sidebar";

import Sidebar from "@/core/features/admin/Sidebar";

// import Sidebar from "./components/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased">
            {/* Sidebar cố định bên trái */}
            <Sidebar />

            {/* Vùng nội dung bên phải */}
            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Hệ thống Quản trị</h2>
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-slate-600">Quyền Admin</span>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}