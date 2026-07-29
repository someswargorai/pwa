import fetchProduct from "@/lib/product.api";
import { mutationOptions, queryOptions } from "@tanstack/react-query";

export const usersQuery = () =>
  queryOptions({
    queryKey: ["product"],
    queryFn: fetchProduct,
    staleTime: 1000 * 60,
  });

export const createUserMutation = async () =>
  mutationOptions({
    mutationKey: ["product"],
    mutationFn: async() => {
        const response = await fetch("https://fakestoreapi.com");
        return response.json();
    }
});
