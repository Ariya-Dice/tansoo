import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { ORDER_STATUS_FILTER_OPTIONS, ORDER_STATUS_LABELS, formatOrderDate } from '../../utils/orderStatus';
import './AdminOrdersPage.css';

const PAGE_SIZE = 20;

const AdminOrdersPage: React.FC = () => {
  const { searchOrders, showToast } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await searchOrders({
        search: searchQuery || undefined,
        status: statusFilter,
        page,
        pageSize: PAGE_SIZE,
      });
      setOrders(result.orders);
      setTotal(result.total);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در دریافت سفارش‌ها');
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchOrders, searchQuery, statusFilter, page, showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleStatusFilterChange = (value: OrderStatus | 'all') => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <h1 className="admin-orders-title">مدیریت سفارشات</h1>
      </div>

      <div className="admin-orders-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-orders-search-form">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="جستجو: شماره سفارش، نام، موبایل، ایمیل، Zibal..."
            className="admin-orders-search-input"
          />
          <button type="submit" className="admin-orders-search-btn" disabled={loading}>
            جستجو
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value as OrderStatus | 'all')}
          className="admin-orders-filter-select"
          disabled={loading}
        >
          {ORDER_STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-orders-empty">
          <h2 className="admin-orders-empty-title">در حال بارگذاری سفارشات...</h2>
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-orders-empty">
          <h2 className="admin-orders-empty-title">سفارشی یافت نشد</h2>
          <p className="admin-orders-empty-text">
            {searchQuery || statusFilter !== 'all'
              ? 'فیلتر یا عبارت جستجو را تغییر دهید.'
              : 'هنوز سفارشی در سیستم ثبت نشده است.'}
          </p>
        </div>
      ) : (
        <>
          <div className="admin-orders-table-container">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>شماره سفارش</th>
                  <th>تاریخ</th>
                  <th>مشتری</th>
                  <th>موبایل</th>
                  <th>مبلغ کل</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td dir="ltr">{order.order_number || order.id.slice(0, 8)}</td>
                    <td>{formatOrderDate(order.created_at)}</td>
                    <td>{order.customer_name}</td>
                    <td dir="ltr">{order.customer_phone}</td>
                    <td>{order.total_amount.toLocaleString('fa-IR')} تومان</td>
                    <td>
                      <span className={`admin-orders-status admin-orders-status-${order.status}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} className="admin-orders-view-link">
                        جزئیات
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-orders-pagination">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="admin-orders-page-btn"
            >
              قبلی
            </button>
            <span className="admin-orders-page-info">
              صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
              {' '}({total.toLocaleString('fa-IR')} سفارش)
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="admin-orders-page-btn"
            >
              بعدی
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrdersPage;
