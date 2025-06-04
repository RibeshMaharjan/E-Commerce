import {create} from "zustand";
import axios, {toFormData} from "axios";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:3000"

export const useProductStore = create((set, get) => ({
  // product state
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  
  // form state
  formData: {
    name: "",
    price: "",
    image: "",
  },
  
  setFormData: (formData) => set({ formData }),
  resetFormData: (formData) => set({ formData: {
      name: "",
      price: "",
      image: "",
    }
  }),
  resetCurrentProduct: (currentProduct) => set({ currentProduct: null }),
  
  addProduct: async (e) => {
    e.preventDefault();
    set({ loading: true });
    try {
      const {formData} = get();
      await axios.post(`${BASE_URL}/api/products`, formData);
      await get().fetchProducts();
      get().resetFormData();
      toast.success("Product added successfully");
      document.getElementById("add_product_modal").close();
    } catch (err) {
      console.log("Error while adding product:", err);
      toast.error("Something went wring");
    } finally {
      set({ loading: false });
    }
  },
  
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
      await get().fetchProducts();
    }
  },
  
  fetchProduct: async (id) => {
    set({ loading: true });
    
    try {
      const response = await axios.get(`${BASE_URL}/api/products/${id}`);
      
      set({
        currentProduct: response.data.data,
        formData: response.data.data,
        error: null,
      });
    } catch (err) {
      console.log("Error while fetching single product:", err);
      set({ error: "Something went wrong", currentProduct: null });
      toast.error("Something went wrong");
    } finally {
      set({ loading: false });
    }
  },
  
  updateProduct: async (id) => {
    set({ loading: true });
    try {
      const {formData} = get();
      const response = await axios.put(`${BASE_URL}/api/products/${id}`, {...formData});
      
      set({
        currentProduct: response.data.data,
        error: null,
      });
      toast.success("Product updated successfully");
    } catch (err) {
      console.log("Error while updating product:", err);
      set({ error: "Something went wrong", currentProduct: null });
      toast.error("Something went wrong");
    } finally {
      set({ loading: false });
    }
  }
}));