import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    const headersList = await headers();
    const userRole = headersList.get("x-user-role");

    console.log("THE ROLE IS:", userRole);
    const response = await fetch("https://fakestoreapi.com/products",{
        next:{
            revalidate: 300
        }
    });
    const data = await response.json();

    return NextResponse.json(data);
}