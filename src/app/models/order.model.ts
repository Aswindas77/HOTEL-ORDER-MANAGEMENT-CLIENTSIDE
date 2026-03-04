import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  tokenNumber: number;
  tableNumber?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}