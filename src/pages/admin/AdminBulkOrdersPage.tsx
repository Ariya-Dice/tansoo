import React, { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { BulkOrderRequest, BulkOrderStatus } from '../../types';
import { BULK_STATUS_LABELS } from '../../services/bulkOrder';
import { formatOrderDate } from '../../utils/orderStatus';
import './AdminBulkOrdersPage.css';

const PAGE_SIZE = 20;

const BULK_STATUS_OPTIONS: Array<{ value: BulkOrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'همه' },
  { value: 'pending', label: BULK_STATUS_LABELS.pending },
  { value: 'contacted', label: BULK_STATUS_LABELS.contacted },
  { value: 'completed', label: BULK_STATUS_LABELS.completed },
  { value: 'cancelled', label: BULK_STATUS_LABELS.cancelled },
];

const AdminBulkOrdersPage: React.FC = () => {
  const { getBulkOrders, updateBulkOrderStatus, showToast } = useAppContext();
  const [requests, setRequests] = useState<BulkOrderRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BulkOrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBulkOrders({
        search: searchQuery || undefined,
        status: statusFilter,
        page,
        pageSize: PAGE_SIZE,
      });
      setRequests(result.requests);
      setTotal(result.total);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در دریافت درخواست‌ها');
      setRequests([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [getBulkOrders, searchQuery, statusFilter, page, showToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleStatusChange = async (id: number, status: BulkOrderStatus) => {
    setUpdatingId(id);
    try {
      await updateBulkOrderStatus(id, status);
      await loadRequests();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-bulk-orders-page">
      <div className="admin-bulk-orders-header">
        <h1>درخواست‌های خرید عمده</h1>
      </div>

      <div className="admin-bulk-orders-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-bulk-orders-search-form">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="جستجو: نام، موبایل، شرکت، نوع کالا..."
            className="admin-bulk-orders-search-input"
          />
          <button type="submit" disabled={loading}>جستجو</button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as BulkOrderStatus | 'all');
            setPage(1);
          }}
          disabled={loading}
        >
          {BULK_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="admin-bulk-orders-loading">در حال بارگذاری...</p>
      ) : requests.length === 0 ? (
        <p className="admin-bulk-orders-empty">درخواستی یافت نشد.</p>
      ) : (
        <>
          <div className="admin-bulk-orders-table-wrap">
            <table className="admin-bulk-orders-table">
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>نام</th>
                  <th>موبایل</th>
                  <th>شرکت</th>
                  <th>نوع کالا</th>
                  <th>تعداد</th>
                  <th>وضعیت</th>
                  <th>یادداشت</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{formatOrderDate(req.created_at)}</td>
                    <td>{req.name}</td>
                    <td dir="ltr">{req.phone}</td>
                    <td>{req.company || '—'}</td>
                    <td>{req.goods_type}</td>
                    <td>{req.quantity}</td>
                    <td>
                      <select
                        value={req.status}
                        onChange={(e) =>
                          handleStatusChange(req.id, e.target.value as BulkOrderStatus)
                        }
                        disabled={updatingId === req.id}
                      >
                        {(Object.keys(BULK_STATUS_LABELS) as BulkOrderStatus[]).map((s) => (
                          <option key={s} value={s}>{BULK_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="admin-bulk-orders-note">{req.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-bulk-orders-pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              قبلی
            </button>
            <span>
              صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
            </span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              بعدی
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBulkOrdersPage;
