import { NextResponse } from "next/server";
import {
  isPeachCancelledOrFailedResult,
  isPeachPendingResult,
  isPeachSuccessfulResult,
  verifyPeachSignature
} from "@/lib/peach";

type PeachResultStatus = "success" | "pending" | "failed";

function normaliseResultParams(params: URLSearchParams) {
  const entries = Array.from(params.entries()).map(([key, value]) => [key.replace(/_/g, "."), value]);
  return Object.fromEntries(entries) as Record<string, string>;
}

function getResultCode(params: Record<string, string>) {
  return params["result.code"] ?? params.result_code ?? params["resultCode"] ?? params.code;
}

function getResultStatus(params: Record<string, string>): PeachResultStatus {
  const resultCode = getResultCode(params);
  if (isPeachSuccessfulResult(resultCode)) return "success";
  if (isPeachPendingResult(resultCode)) return "pending";
  if (isPeachCancelledOrFailedResult(resultCode)) return "failed";
  return "failed";
}

function buildRedirect(request: Request, rawParams: Record<string, string>, params: Record<string, string>, statusCode: 302 | 303 = 302) {
  const signaturePresent = Boolean(rawParams.signature || params.signature);
  const signatureInvalid =
    signaturePresent &&
    !verifyPeachSignature(rawParams, process.env.PEACH_SECRET_TOKEN) &&
    !verifyPeachSignature(params, process.env.PEACH_SECRET_TOKEN);
  const status = signatureInvalid ? "failed" : getResultStatus(params);
  const target = new URL(status === "failed" ? "/peach/failed" : "/peach/return", request.url);
  const code = getResultCode(params);

  target.searchParams.set("status", signatureInvalid ? "failed" : status);
  if (code) target.searchParams.set("code", code);
  if (params.merchantTransactionId) target.searchParams.set("transaction", params.merchantTransactionId);

  return NextResponse.redirect(target, statusCode);
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const rawParams = Object.fromEntries(searchParams.entries()) as Record<string, string>;
  const params = normaliseResultParams(searchParams);
  return buildRedirect(request, rawParams, params);
}

export async function POST(request: Request) {
  const body = await request.text();
  const bodyParams = new URLSearchParams(body);
  const rawParams = Object.fromEntries(bodyParams.entries()) as Record<string, string>;
  const params = normaliseResultParams(bodyParams);
  return buildRedirect(request, rawParams, params, 303);
}
