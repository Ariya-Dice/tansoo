
export interface Product {
  id: number;
  name: string;
  category: string;
  type: string;
  price: number;
  description: string;
  specs: { [key: string]: string };
  images: { [color: string]: string };
  isNew?: boolean;
  isBestSeller?: boolean;
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
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerDetails: {
    name: string;
    email: string;
    address: string;
  };
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Paid' | 'Shipped';
  date: Date;
}