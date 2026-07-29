import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ClientPage from "./ClientPage";
import { usersQuery } from "./queries/userQueries";

export default async function Home() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(usersQuery());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientPage />
    </HydrationBoundary>
  );
}
