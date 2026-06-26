import { Suspense } from "react";
import SuccessComponent from "./SuccessComponent";

export default function CheckoutSuccess() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <SuccessComponent />
    </Suspense>
  );
}