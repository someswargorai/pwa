export default async function fetchProduct() {
  try {
    const isServer = typeof window === 'undefined';
    const url = isServer 
      ? "https://fakestoreapi.com/products" 
      : "/api/product";

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.log("Fetch products error:", err);
    return [];
  }
}

export async function fetchProductById(id: number | string) {
  try {
    const isServer = typeof window === 'undefined';
    const url = isServer 
      ? `https://fakestoreapi.com/products/${id}` 
      : `/api/product/${id}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch product ${id}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.log("Fetch product by ID error:", err);
    return null;
  }
}
