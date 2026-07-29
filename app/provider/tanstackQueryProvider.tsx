"use client";
import { persister, queryClient } from "./persistor";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

export default function Layout({children}:{
    children: React.ReactNode
}){
        
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{
            persister
        }}>
            {children}
        </PersistQueryClientProvider>
    )
}