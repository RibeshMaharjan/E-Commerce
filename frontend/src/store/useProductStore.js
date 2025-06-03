import {create} from "zustand";
import axios from "axios";

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
  }
}));