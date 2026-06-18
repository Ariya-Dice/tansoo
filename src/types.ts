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
