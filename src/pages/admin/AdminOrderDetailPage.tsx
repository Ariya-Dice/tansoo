import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { OrderDetail, OrderStatus } from '../../types';
import {
  ORDER_STATUS_LABELS,
  canTransitionStatus,
  formatOrderDate,
  getAllowedNextStatuses,
} from '../../utils/orderStatus';
import './AdminOrderDetailPage.css';

const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrder, updateOrderStatus, showToast } = useAppContext();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getOrder(id);
      setOrder(data);
      setSelectedStatus('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در دریافت سفارش');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [getOrder, id, showToast]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusUpdate = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return;

    if (!canTransitionStatus(order.status, selectedStatus)) {
      showToast('این تغییر وضعیت مجاز نیست.');
      return;
    }

    if (selectedStatus === 'cancelled') {
      const confirmed = window.confirm('آیا از لغو این سفارش مطمئن هستید؟');
      if (!confirmed) return;
    }

    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, order.status, selectedStatus);
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              status_history: prev.status_history,
              items: prev.items,
            }
          : prev,
      );
      await loadOrder();
      setSelectedStatus('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در به‌روزرسانی وضعیت');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-order-detail">
        <p className="admin-order-detail-loading">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-order-detail">
        <p className="admin-order-detail-error">سفارش یافت نشد.</p>
        <Link to="/admin/orders" className="admin-order-detail-back">
          بازگشت به لیست سفارشات
        </Link>
      </div>
    );
  }

  const allowedNext = getAllowedNextStatuses(order.status);

  return (
    <div className="admin-order-detail">
      <div className="admin-order-detail-header">
        <div>
          <h1 className="admin-order-detail-title">جزئیات سفارش</h1>
          <p className="admin-order-detail-number" dir="ltr">
            {order.order_number}
          </p>
        </div>
        <Link to="/admin/orders" className="admin-order-detail-back">
          بازگشت به لیست
        </Link>
      </div>

      <div className="admin-order-detail-grid">
        <section className="admin-order-detail-card">
          <h2>اطلاعات مشتری</h2>
          <dl>
            <div><dt>نام</dt><dd>{order.customer_name}</dd></div>
            <div><dt>موبایل</dt><dd dir="ltr">{order.customer_phone}</dd></div>
            <div><dt>ایمیل</dt><dd>{order.customer_email || '—'}</dd></div>
            <div><dt>آدرس</dt><dd>{order.customer_address}</dd></div>
            {order.customer_note && (
              <div><dt>یادداشت</dt><dd>{order.customer_note}</dd></div>
            )}
          </dl>
        </section>

        <section className="admin-order-detail-card">
          <h2>اطلاعات سفارش</h2>
          <dl>
            <div><dt>تاریخ ثبت</dt><dd>{formatOrderDate(order.created_at)}</dd></div>
            <div><dt>وضعیت</dt><dd>{ORDER_STATUS_LABELS[order.status]}</dd></div>
            <div><dt>مبلغ کل</dt><dd>{order.total_amount.toLocaleString('fa-IR')} تومان</dd></div>
            <div><dt>تاریخ پرداخت</dt><dd>{formatOrderDate(order.paid_at)}</dd></div>
          </dl>
        </section>

        <section className="admin-order-detail-card">
          <h2>اطلاعات پرداخت</h2>
          <dl>
            <div><dt>Zibal Track ID</dt><dd dir="ltr">{order.zibal_track_id ?? '—'}</dd></div>
            <div><dt>Zibal Reference</dt><dd dir="ltr">{order.zibal_ref_number ?? '—'}</dd></div>
          </dl>
        </section>
      </div>

      <section className="admin-order-detail-card">
        <h2>اقلام سفارش</h2>
        <div className="admin-order-detail-items-table-wrap">
          <table className="admin-order-detail-items-table">
            <thead>
              <tr>
                <th>محصول</th>
                <th>مدل</th>
                <th>رنگ</th>
                <th>تعداد</th>
                <th>قیمت واحد</th>
                <th>قیمت کل</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_goods_type}</td>
                  <td>{item.product_model}</td>
                  <td>{item.product_color}</td>
                  <td>{item.quantity.toLocaleString('fa-IR')}</td>
                  <td>{item.unit_price.toLocaleString('fa-IR')} تومان</td>
                  <td>{(item.unit_price * item.quantity).toLocaleString('fa-IR')} تومان</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-order-detail-card">
        <h2>تاریخچه وضعیت</h2>
        {order.status_history.length === 0 ? (
          <p className="admin-order-detail-muted">تاریخچه‌ای ثبت نشده است.</p>
        ) : (
          <ol className="admin-order-detail-history">
            {order.status_history.map((entry) => (
              <li key={entry.id}>
                <span className="admin-order-detail-history-status">
                  {entry.old_status ? ORDER_STATUS_LABELS[entry.old_status] : '—'}
                  {' → '}
                  {ORDER_STATUS_LABELS[entry.new_status]}
                </span>
                <span className="admin-order-detail-history-meta">
                  {formatOrderDate(entry.created_at)}
                  {entry.changed_by !== 'system' && ` — ${entry.changed_by}`}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {allowedNext.length > 0 && (
        <section className="admin-order-detail-card admin-order-detail-status-actions">
          <h2>تغییر وضعیت</h2>
          <div className="admin-order-detail-status-row">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | '')}
              className="admin-order-detail-status-select"
              disabled={updating}
            >
              <option value="">انتخاب وضعیت جدید...</option>
              {allowedNext.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={!selectedStatus || updating}
              className="admin-order-detail-status-btn"
            >
              {updating ? 'در حال ذخیره...' : 'اعمال تغییر'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminOrderDetailPage;
