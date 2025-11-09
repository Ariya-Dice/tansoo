import React from "react";
import { useAppContext } from "../../context/AppContext";
import { Order } from "../../types";
import "./AdminOrdersPage.css";

const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus } = useAppContext();

  const statusTranslations: { [key in Order["status"]]: string } = {
    Pending: "در انتظار پرداخت",
    Paid: "پرداخت شده",
    Shipped: "ارسال شده",
  };

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    updateOrderStatus(orderId, newStatus);
  };

  // 🩵 چک کن اگر orders هنوز لود نشده باشه:
  if (!orders) {
    return (
      <div className="admin-orders-empty">
        <h2 className="admin-orders-empty-title">در حال بارگذاری سفارشات...</h2>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <h1 className="admin-orders-title">مدیریت سفارشات</h1>
      </div>

      {orders.length === 0 ? (
        <div className="admin-orders-empty">
          <h2 className="admin-orders-empty-title">هیچ سفارشی ثبت نشده است</h2>
          <p className="admin-orders-empty-text">
            در حال حاضر سفارشی در سیستم وجود ندارد.
          </p>
        </div>
      ) : (
        <div className="admin-orders-table-container">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>شناسه سفارش</th>
                <th>تاریخ</th>
                <th>مشتری</th>
                <th>مبلغ کل</th>
                <th>وضعیت</th>
                <th>اقلام</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id.substring(0, 7)}</td>
                  <td>{new Date(order.date).toLocaleDateString("fa-IR")}</td>
                  <td>{order.customerDetails.name}</td>
                  <td>{order.total.toLocaleString("fa-IR")} تومان</td>
                  <td>
                    <select
                      className={`admin-orders-status-select admin-orders-status-${
                        order.status.toLowerCase()
                      }`}
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as Order["status"]
                        )
                      }
                    >
                      <option value="Pending">{statusTranslations.Pending}</option>
                      <option value="Paid">{statusTranslations.Paid}</option>
                      <option value="Shipped">{statusTranslations.Shipped}</option>
                    </select>
                  </td>
                  <td>
                    <ul>
                      {order.items.map((item) => (
                        <li key={`${item.product.id}-${item.color}`}>
                          {item.quantity}× {item.product.name} ({item.color})
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
