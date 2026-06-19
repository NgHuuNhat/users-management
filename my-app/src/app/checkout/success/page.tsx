import { Suspense } from "react";
import SuccessComponent from "./SuccessComponent";

export default function Success() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
        </div>
      }
    >
      <SuccessComponent />
    </Suspense>
  );
}