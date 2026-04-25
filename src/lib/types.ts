export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  timestamp?: number;
  totalPrice: number;
  items: OrderItem[];
  userId: string;
}
