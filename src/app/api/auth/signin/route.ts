import { NextRequest } from "next/server";
import { handleSignIn } from "@/lib/auth/signin-handler";

export async function POST(req: NextRequest) {
  return handleSignIn(req);
}
