'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function FailComponent() {
  const orderId = useSearchParams().get('orderId');

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;

    (async () => {
      const res = await fetch(`/api/payment/fail?orderId=${orderId}`);
      const json = await res.json();
      setData(json);
    })();
  }, [orderId]);

  return (
    <div style={{ padding: 20 }}>
      <h1>❌ Thanh toán thất bại</h1>

      {!data ? (
        <p>Loading...</p>
      ) : (
        <>
          <p style={{ color: 'red', fontSize: 16 }}>
            {data.error?.message || 'Có lỗi xảy ra'}
          </p>

          <pre style={{
            marginTop: 10,
            background: '#111',
            color: '#0f0',
            padding: 10,
            fontSize: 12,
            overflow: 'auto'
          }}>
            {JSON.stringify(data.error, null, 2)}
          </pre>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>
            Order ID: {data.orderId}
          </div>
        </>
      )}
    </div>
  );
}