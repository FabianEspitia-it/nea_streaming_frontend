import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/backend/proxy-backend-handler";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handleProxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const joinedPath = path.join("/");

  try {
    return await proxyToBackend(request, joinedPath);
  } catch (error) {
    console.error("Error en reverse proxy:", error);

    return NextResponse.json(
      { detail: "No se pudo conectar con el backend" },
      { status: 503 }
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handleProxy(request, context);
}
