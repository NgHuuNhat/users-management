import { Suspense } from "react";
import SuccessComponent from "./SuccessComponent";

export default function Success() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SuccessComponent />
    </Suspense>
  );
}