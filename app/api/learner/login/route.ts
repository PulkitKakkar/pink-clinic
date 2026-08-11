import { NextResponse } from "next/server";
import { createLearnerSession, LEARNER_COOKIE, verifyPassword } from "@/lib/learner/auth";
import { findLearnerForLogin } from "@/lib/learner/storage";
import { getPublicOrigin } from "@/lib/public-origin";
import { consumeRateLimit, requestIdentifier } from "@/lib/security/rate-limit";

export async function POST(request:Request){
  const form=await request.formData();const email=String(form.get("email")||"");const password=String(form.get("password")||"");const origin=getPublicOrigin(request);
  const allowed=await consumeRateLimit({scope:"learner-login",identifier:requestIdentifier(request),limit:8,windowSeconds:15*60});
  if(!allowed)return NextResponse.redirect(new URL("/learner-login?error=rate-limit",origin),303);
  const learner=await findLearnerForLogin(email);if(!learner||!learner.active||!(await verifyPassword(password,learner.passwordHash)))return NextResponse.redirect(new URL("/learner-login?error=credentials",origin),303);
  const session=await createLearnerSession(learner.id);const response=NextResponse.redirect(new URL("/learners",origin),303);response.cookies.set(LEARNER_COOKIE,session.token,{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/",expires:session.expiresAt});return response;
}
