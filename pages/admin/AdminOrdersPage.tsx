
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Order } from '../../types';

const AdminOrdersPage: React.FC = () => {
    const { orders, updateOrderStatus } = useAppContext();
    
    const statusTranslations: { [key in Order['status']]: string } = {
        Pending: 'در انتظار پرداخت',
        Paid: 'پرداخت شده',
        Shipped: 'ارسال شده',
    };

    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        updateOrderStatus(orderId, newStatus);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-brand-light-text">مدیریت سفارشات</h1>
            {orders.length === 0 ? (
                <div className="bg-brand-surface shadow-md rounded-lg p-6 text-center">
                    <p className="text-brand-muted-text">هنوز هیچ سفارشی ثبت نشده است.</p>
                </div>
            ) : (
                <div className="bg-brand-surface shadow-md rounded-lg overflow-x-auto">
                    <table className="w-full text-sm text-right text-brand-muted-text">
                        <thead className="text-xs text-brand-muted-text uppercase bg-brand-dark-blue">
                            <tr>
                                <th scope="col" className="px-6 py-3">شناسه سفارش</th>
                                <th scope="col" className="px-6 py-3">تاریخ</th>
                                <th scope="col" className="px-6 py-3">مشتری</th>
                                <th scope="col" className="px-6 py-3">مبلغ کل</th>
                                <th scope="col" className="px-6 py-3">وضعیت</th>
                                <th scope="col" className="px-6 py-3">اقلام</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="bg-brand-surface border-b border-brand-neon-blue/20 hover:bg-brand-dark-blue">
                                    <td className="px-6 py-4 font-medium text-brand-light-text">#{order.id.substring(0, 7)}</td>
                                    <td className="px-6 py-4">{new Date(order.date).toLocaleDateString('fa-IR')}</td>
                                    <td className="px-6 py-4 text-brand-light-text">{order.customerDetails.name}</td>
                                    <td className="px-6 py-4">{order.total.toLocaleString('fa-IR')} تومان</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                            className={`rounded-md p-1 text-xs border bg-transparent focus:ring-brand-neon-blue focus:border-brand-neon-blue ${
                                                order.status === 'Paid' ? 'text-green-400 border-green-500/50' :
                                                order.status === 'Shipped' ? 'text-blue-400 border-blue-500/50' :
                                                'text-yellow-400 border-yellow-500/50'
                                            }`}
                                        >
                                            <option value="Pending" className="bg-brand-dark-blue text-yellow-400">{statusTranslations.Pending}</option>
                                            <option value="Paid" className="bg-brand-dark-blue text-green-400">{statusTranslations.Paid}</option>
                                            <option value="Shipped" className="bg-brand-dark-blue text-blue-400">{statusTranslations.Shipped}</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <ul className="space-y-1">
                                        {order.items.map(item => (
                                            <li key={`${item.product.id}-${item.color}`} className="text-xs text-brand-muted-text">
                                                {item.quantity}x {item.product.name} ({item.color})
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