import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteLearnerSession, LEARNER_COOKIE } from "@/lib/learner/auth";
import { getPublicOrigin } from "@/lib/public-origin";
export async function POST(request:Request){const jar=await cookies();await deleteLearnerSession(jar.get(LEARNER_COOKIE)?.value);const response=NextResponse.redirect(new URL("/learner-login",getPublicOrigin(request)),303);response.cookies.delete(LEARNER_COOKIE);return response;}
