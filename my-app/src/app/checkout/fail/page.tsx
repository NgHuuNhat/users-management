import { Suspense } from 'react';
import FailComponent from './FailComponent';

export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <FailComponent />
    </Suspense>
  );
}