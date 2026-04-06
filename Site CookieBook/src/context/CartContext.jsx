import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);

function money(n) {
  return Math.round(n * 100) / 100;
}

function cartReducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return action.payload ?? state;

    case "ADD_ITEM": {
      const item = action.payload;
      return { ...state, items: [item, ...state.items] };
    }

    case "REMOVE_ITEM": {
      const id = action.payload;
      return { ...state, items: state.items.filter((i) => i.id !== id) };
    }

    case "UPDATE_ITEM": {
      const { id, patch } = action.payload;
      return {
        ...state,
        items: state.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      };
    }

    case "CLEAR":
      return { ...state, items: [] };

    default:
      return state;
  }
}

const initialState = {
  items: [],
};

function calcSubtotal(items) {
  return money(items.reduce((sum, it) => sum + it.totalPrice, 0));
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persist localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cookiebook_cart_v1");
      if (raw) dispatch({ type: "LOAD", payload: JSON.parse(raw) });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cookiebook_cart_v1", JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const value = useMemo(() => {
    const subtotal = calcSubtotal(state.items);
    const count = state.items.reduce((n, it) => n + (it.quantity ?? 1), 0);

    return {
      items: state.items,
      subtotal,
      count,
      addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", payload: id }),
      updateItem: (id, patch) => dispatch({ type: "UPDATE_ITEM", payload: { id, patch } }),
      clear: () => dispatch({ type: "CLEAR" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

// Helpers
export function formatCAD(amount) {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(amount);
}

export function uid() {
  return crypto?.randomUUID?.() ?? String(Date.now() + Math.random());
}

