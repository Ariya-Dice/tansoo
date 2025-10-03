'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Cart, Product } from '@/types'

interface CartContextType {
  cart: Cart
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: { cart: Cart } }

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload
      const existingItem = state.items.find(item => item.product.id === product.id)
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
          total: state.total + (product.price * quantity)
        }
      } else {
        return {
          ...state,
          items: [...state.items, { product, quantity }],
          total: state.total + (product.price * quantity)
        }
      }
    }
    
    case 'REMOVE_FROM_CART': {
      const { productId } = action.payload
      const itemToRemove = state.items.find(item => item.product.id === productId)
      if (!itemToRemove) return state
      
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== productId),
        total: state.total - (itemToRemove.product.price * itemToRemove.quantity)
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { productId } })
      }
      
      const item = state.items.find(item => item.product.id === productId)
      if (!item) return state
      
      const quantityDiff = quantity - item.quantity
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        ),
        total: state.total + (item.product.price * quantityDiff)
      }
    }
    
    case 'CLEAR_CART':
      return { items: [], total: 0 }
    
    case 'LOAD_CART':
      return action.payload.cart
    
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], total: 0 })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('tansoo-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: { cart: parsedCart } })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tansoo-cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } })
  }

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getTotalItems = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
