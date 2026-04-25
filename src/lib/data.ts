import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  runTransaction 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order } from './types';

// Hooks for real-time data
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
        setProducts(data);
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'products')
    );

    return () => unsubscribe();
  }, [auth.currentUser]);

  return { products, loading };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Using a simple collection call since timestamp may not exist to order by accurately
    // But we sort by date descending client-side
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Order);
        setOrders(data);
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'orders')
    );

    return () => unsubscribe();
  }, [auth.currentUser]);

  return { orders, loading };
}

// Product operations
export async function addProduct(productData: Omit<Product, 'id'>) {
  try {
    await addDoc(collection(db, 'products'), productData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'products');
  }
}

export async function updateProduct(id: string, productData: Partial<Omit<Product, 'id'>>) {
  try {
    await updateDoc(doc(db, 'products', id), productData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
  }
}

export async function deleteProduct(id: string) {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
  }
}

// Order operation (transactional to update stock)
export async function placeOrder(items: Omit<Order['items'][0], 'name'>[], productsDict: Record<string, Product>) {
  if (!auth.currentUser) throw new Error("Must be logged in to order");
  
  // Prepare enriched items and calculate total
  const enrichedItems: Order['items'] = [];
  let totalPrice = 0;

  for (const item of items) {
    const product = productsDict[item.productId];
    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (product.quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    enrichedItems.push({
      productId: item.productId,
      name: product.name,
      price: product.price,
      quantity: item.quantity
    });
    totalPrice += product.price * item.quantity;
  }

  // Create order transaction
  try {
    await runTransaction(db, async (transaction) => {
      // 1. Read all product docs to verify stock in transaction
      const productRefs = enrichedItems.map(item => doc(db, 'products', item.productId));
      const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

      // Validate stock again inside transaction
      productDocs.forEach((pDoc, i) => {
        if (!pDoc.exists()) throw new Error("Product no longer exists");
        const currentQty = pDoc.data().quantity;
        const requestedQty = enrichedItems[i].quantity;
        if (currentQty < requestedQty) {
          throw new Error(`Insufficient stock for ${enrichedItems[i].name}`);
        }
      });

      // 2. Perform all writes
      const orderRef = doc(collection(db, 'orders'));
      const orderData: Omit<Order, 'id'> = {
        date: new Date().toISOString(),
        timestamp: Date.now(),
        totalPrice,
        items: enrichedItems,
        userId: auth.currentUser!.uid
      };
      
      transaction.set(orderRef, orderData);

      // Decrement product quantities
      enrichedItems.forEach((item, i) => {
        const pDoc = productDocs[i];
        const newQty = pDoc.data().quantity - item.quantity;
        transaction.update(pDoc.ref, { quantity: newQty });
      });
    });
  } catch (error) {
    // Standardize transaction errors or re-throw
    if (error instanceof Error && error.message.includes("Insufficient stock")) {
       throw error; // Let UI handle custom business logic error
    }
    handleFirestoreError(error, OperationType.CREATE, 'orders'); // default fallback
  }
}
