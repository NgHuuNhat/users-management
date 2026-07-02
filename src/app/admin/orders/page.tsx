"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, doc, updateDoc, orderBy } from "firebase/firestore";
import { Order } from "@/core/services/data-base";
import { db } from "@/core/services/firebase";

import OrderHeader from "./OrderHeader";
import OrderTable from "./OrderTable";
import OrderModal from "./OrderModal"; 

export default function OrdersPage() {
  const COLLECTION_NAME = "orders";

  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [debtInput, setDebtInput] = useState<number | null>(null);
  const [showDebtInput, setShowDebtInput] = useState(false);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");

  // 1. Fetch Real-time
  useEffect(() => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() } as Order));
      setOrders(list);
    });
    return () => unsubscribe();
  }, []);

  // 2. Hàm update Firebase
  const handleUpdateStatus = async (orderId: string, fieldsToUpdate: Partial<Order>) => {
    setUpdatingId(orderId);
    try {
      const orderRef = doc(db, COLLECTION_NAME, orderId);
      await updateDoc(orderRef, fieldsToUpdate);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, ...fieldsToUpdate } : null);
      }
    } catch (error: any) {
      alert(`Lỗi cập nhật: ${error.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. Tính toán Data
  const metrics = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  const totalOrderAmount = orders.reduce((s, o) => s + (o.amount || 0), 0);
  const totalSePayReceived = orders.reduce((s, o) => s + (o.bank?.transferAmount || 0), 0);
  const totalDebt = orders.reduce((s, o) => s + (o.debtAmount || 0), 0);
  const totalCashReceived = totalOrderAmount - totalSePayReceived - totalDebt;

  const moneyMetrics = { totalOrderAmount, totalSePayReceived, totalDebt, totalCashReceived };

  const filteredOrders = orders.filter((order) => {
    const matchStatus = filterStatus === "all" || order.status === filterStatus;
    const matchPayment = filterPaymentStatus === "all" || order.paymentStatus === filterPaymentStatus;
    return matchStatus && matchPayment;
  });

  const statusCount = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed: orders.filter(o => o.status === "completed").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };
  
  const paymentStatusCount = {
    all: orders.length,
    pending: orders.filter(o => o.paymentStatus === "pending").length,
    paid: orders.filter(o => o.paymentStatus === "paid").length,
    failed: orders.filter(o => o.paymentStatus === "failed").length,
    refunded: orders.filter(o => o.paymentStatus === "refunded").length,
  };

  const statusLabel = { all: "Tất cả", pending: "Chờ duyệt tay", processing: "Đang xử lý/giao", completed: "Đã giao thành công", cancelled: "Đã huỷ" };
  const paymentLabel = { all: "Tất cả", pending: "Chưa trả tiền", paid: "Đã thu tiền", failed: "Thanh toán thất bại", refunded: "Đã hoàn tiền" };

  return (
    <div className="space-y-6">
      <OrderHeader metrics={metrics} moneyMetrics={moneyMetrics} />
      
      <OrderTable 
        filteredOrders={filteredOrders}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPaymentStatus={filterPaymentStatus}
        setFilterPaymentStatus={setFilterPaymentStatus}
        statusCount={statusCount}
        statusLabel={statusLabel}
        paymentStatusCount={paymentStatusCount}
        paymentLabel={paymentLabel}
        setSelectedOrder={setSelectedOrder}
      />

      {selectedOrder && (
        <OrderModal 
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          updatingId={updatingId}
          handleUpdateStatus={handleUpdateStatus}
          showDebtInput={showDebtInput}
          setShowDebtInput={setShowDebtInput}
          debtInput={debtInput}
          setDebtInput={setDebtInput}
        />
      )}
    </div>
  );
}