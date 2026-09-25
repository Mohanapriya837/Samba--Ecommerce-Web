import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as cartApi from '../api/cart';
import { getErrorMessage, isSessionExpiredError } from '../api/client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isShopper = user?.role === 'USER';

  const refresh = useCallback(async () => {
    if (!isShopper) {
      setCart(null);
      setLoaded(false);
      return;
    }
    setLoading(true);
    try {
      setCart(await cartApi.getCart());
    } catch (err) {
      // A 401 here means the session just expired; AuthContext already logs out and
      // redirects with its own message, so an extra toast here would just be noise.
      if (!isSessionExpiredError(err)) toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [isShopper, toast]);

  useEffect(() => {
    refresh();
  }, [refresh, user?.id]);

  const mutate = useCallback(
    async (fn, successMessage) => {
      try {
        setCart(await fn());
        if (successMessage) toast.success(successMessage);
        return true;
      } catch (err) {
        if (!isSessionExpiredError(err)) toast.error(getErrorMessage(err));
        return false;
      }
    },
    [toast]
  );

  const value = useMemo(
    () => ({
      cart,
      loading,
      ready: loaded,
      count: cart?.totalItems || 0,
      refresh,
      addItem: (bookId, quantity = 1) => mutate(() => cartApi.addItem({ bookId, quantity }), 'Added to cart'),
      updateItem: (itemId, quantity) => mutate(() => cartApi.updateItem(itemId, quantity)),
      removeItem: (itemId) => mutate(() => cartApi.removeItem(itemId), 'Item removed'),
      clear: () => mutate(() => cartApi.clearCart(), 'Cart cleared'),
    }),
    [cart, loading, loaded, refresh, mutate]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
