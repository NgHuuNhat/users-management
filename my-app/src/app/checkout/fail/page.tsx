import { Suspense } from 'react';
import FailComponent from './FailComponent';

export default function Page() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                Loading...
            </div>
        }>
            <FailComponent />
        </Suspense>
    );
}