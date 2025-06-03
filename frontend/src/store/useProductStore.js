import {create} from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:3000"

export const useProductStore = create((set, get) => ({
  // product state
  products: [],
  loading: false,
  error: null,
  
  fetchProducts: async () => {
    set({ loading: true });
    
    try {
      const response = await axios.get(`${BASE_URL}/api/products`);
      
      if(!response.data.success) {
        set({ error: response.data.message });
      }
      
      set({ products: response.data.data, error: null });
    } catch (err) {
      if(err.status === 429) set({ error: "Too many requests", products: [] });
      else set({ error: "Something went wrong" });
    } finally {
      set({ loading: false });
    }
  },
  
  deleteProduct: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.delete(`${BASE_URL}/api/products/${id}`);
      
      if(!response.data.success) {
        set({ error: response.data.message });
      }
      
      set(prev => ({ product: prev.products.filter(product => product.id !== id ) }))
      toast.success(response.data.message);
    } catch (err) {
      console.log("Error while deleting product:", err);
      toast.error("Something went wring")
    } finally {
      set({ loading: false });
    }
  }
}));