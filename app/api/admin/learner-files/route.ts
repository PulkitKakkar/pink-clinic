import { observeApi } from "@/lib/observe-api";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { learnerFileS3, requireLearnerFileBucket } from "@/lib/learner/file-storage";
import { listSubmissions } from "@/lib/learner/storage";
async function handleGET(request:Request){const key=new URL(request.url).searchParams.get("key")||"";if(!(await listSubmissions()).some(s=>s.files.some(f=>f.key===key)))return NextResponse.json({error:"Not found"},{status:404});const url=await getSignedUrl(learnerFileS3,new GetObjectCommand({Bucket:requireLearnerFileBucket(),Key:key}),{expiresIn:120});return NextResponse.redirect(url,303);}

export const GET = observeApi("/api/admin/learner-files", handleGET);
