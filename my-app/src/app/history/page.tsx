'use client';
import { useState } from 'react';
import emailjs from '@emailjs/browser';

const mockDatabase = [
  { id: 'ORD001', email: 'nhat200901@gmail.com', product: 'MacBook Air M2', status: 'Đã giao', price: '25.000.000đ', date: '2026-06-20' },
  { id: 'ORD002', email: 'nhat200901@gmail.com', product: 'Chuột Magic Mouse', status: 'Đang giao', price: '2.100.000đ', date: '2026-06-21' },
];

export default function HistoryPage() {
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [step, setStep] = useState(1);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const SERVICE_ID = "service_qygt0wi";
  const TEMPLATE_ID = "template_zlr1bok";
  const PUBLIC_KEY = "45xH0yseTKSDsv0Vm";

  const handleSendOtp = async () => {
    if (!email) return alert("Vui lòng nhập email");
    setLoading(true);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        to_email: email,
        otp_code: code
      }, PUBLIC_KEY);

      setStep(2);
    } catch (error: any) {
      alert(error?.text || 'Gửi email thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    if (otpInput === generatedOtp) {
      setOrders(mockDatabase.filter(o => o.email === email));
      setStep(3);
    } else {
      alert('Mã OTP không chính xác!');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">

        <h1 className="text-2xl font-semibold text-center text-zinc-900 mb-6">
          Tra cứu đơn hàng
        </h1>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-center text-zinc-500">
              Mã đã gửi tới <span className="font-medium text-zinc-700">{email}</span>
            </p>

            <input
              type="text"
              placeholder="Nhập 6 số OTP"
              onChange={(e) => setOtpInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-center tracking-widest"
            />

            <button
              onClick={handleVerify}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700"
            >
              Xác nhận
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">
              Kết quả đơn hàng
            </h3>

            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map(o => (
                  <div
                    key={o.id}
                    className="p-4 rounded-xl border border-zinc-100 bg-zinc-50"
                  >
                    <div className="font-medium text-zinc-900">
                      {o.product}
                    </div>
                    <div className="text-sm text-zinc-500 mt-1">
                      Trạng thái: {o.status} • Giá: {o.price}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                Không tìm thấy đơn hàng cho email này.
              </p>
            )}

            <button
              onClick={() => setStep(1)}
              className="text-sm text-blue-600 hover:underline"
            >
              Tra cứu email khác
            </button>
          </div>
        )}

      </div>
    </div>
  );
}