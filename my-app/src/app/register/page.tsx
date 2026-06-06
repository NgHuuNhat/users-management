import { FormSection } from "@/core/features/register/components/form-section/page"

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl shadow-md">
                <h1 className="text-xl font-semibold text-center mb-5">
                    Đăng ký tài khoản
                </h1>
                
                {/* Toàn bộ logic Client được đóng gói trong Component này */}
                <FormSection />
            </div>
        </div>
    )
}