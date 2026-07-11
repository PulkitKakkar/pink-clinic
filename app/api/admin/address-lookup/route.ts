import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const postcode = new URL(request.url).searchParams.get("postcode")?.trim();
  if (!postcode)
    return NextResponse.json(
      { error: "Postcode is required." },
      { status: 400 },
    );
  const key = process.env.GETADDRESS_API_KEY;
  if (key) {
    const response = await fetch(
      `https://api.getaddress.io/autocomplete/${encodeURIComponent(postcode)}?api-key=${encodeURIComponent(key)}&all=true`,
      { cache: "no-store" },
    );
    if (response.ok) {
      const data = (await response.json()) as {
        suggestions?: { address: string }[];
      };
      return NextResponse.json({
        addresses: (data.suggestions || []).map((item) => item.address),
      });
    }
  }
  const response = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
    { cache: "no-store" },
  );
  if (!response.ok)
    return NextResponse.json({ error: "Postcode not found." }, { status: 404 });
  const data = (await response.json()) as {
    result?: {
      postcode: string;
      admin_ward?: string;
      admin_district?: string;
      region?: string;
    };
  };
  const result = data.result;
  return NextResponse.json({
    addresses: result
      ? [
          `${result.postcode}, ${result.admin_ward || ""}, ${result.admin_district || ""}, ${result.region || ""}`.replace(
            /,\s*,/g,
            ",",
          ),
        ]
      : [],
  });
}
