export interface Product {
  id: number;
  model: string;
  /** نوع کالا: شیر ظرفشویی، شیر توالت، ... */
  goodsType: string;
  /** @deprecated از goodsType استفاده کنید — برای سازگاری با داده قدیمی */
  type?: string;
  color: string;
  bodyMaterial?: string;
  handleMaterial?: string;
  bodyWeight: string;
  packageWeight?: string;
  cartridgeSize?: string;
  cartridgeNutMaterial?: string;
  leftHandedNut?: string;
  hotColdOutput?: string;
  packageDimensions?: string;
  postalHose?: string;
  escutcheon?: string;
  valveMaterial?: string;
  spoutMaterial?: string;
  platorMaterial?: string;
  /** @deprecated */
  hoseMaterial?: string;
  tags: string[];
  price: number;
  /** برند محصول — مثلاً تانسو، قهرمان */
  brand: string;
  /** موجودی قابل فروش */
  stock: number;
  description: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ProductType {
  id: string;
  name: string;
}

export interface Color {
  id: string;
  name: string;
  tailwindClass: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export type BulkOrderStatus = 'pending' | 'contacted' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  customer_note: string;
  total_amount: number;
  status: OrderStatus;
  zibal_track_id: number | null;
  zibal_ref_number: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface OrderItem {
  id: number;
  order_id: string;
  product_id: number;
  product_model: string;
  product_goods_type: string;
  product_color: string;
  quantity: number;
  unit_price: number;
}

export interface OrderStatusHistory {
  id: number;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by: string;
  created_at: string;
}

export interface BulkOrderRequest {
  id: number;
  name: string;
  phone: string;
  company: string;
  goods_type: string;
  quantity: string;
  note: string;
  status: BulkOrderStatus;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderDetail extends OrderWithItems {
  status_history: OrderStatusHistory[];
}

export interface OrdersListResult {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BulkOrdersListResult {
  requests: BulkOrderRequest[];
  total: number;
  page: number;
  pageSize: number;
}
