export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  foodType?: 'VEG' | 'NON_VEG';
}

export interface Order {
  _id: string;
  orderNumber: string;
  tableNumber: string;
  tokenNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}