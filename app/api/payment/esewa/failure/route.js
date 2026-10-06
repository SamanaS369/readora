import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const params = Object.fromEntries(
    searchParams.entries()
  );

  console.log("====================================");
  console.log("ESEWA FAILURE CALLBACK");
  console.log("====================================");
  console.log(JSON.stringify(params, null, 2));
  console.log("====================================");

  return NextResponse.json({
    success: false,
    message: "eSewa returned to the failure URL",
    parameters: params,
  });
}