import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`https://fakestoreapi.com/products/${id}`, {
      next: {
        revalidate: 300,
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: "Product not found" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
