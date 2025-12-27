import puppeteer from "puppeteer";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type RouteParams = Promise<{ id: string }>;

export async function GET(
  req: NextRequest,
  ctx: { params: RouteParams }
): Promise<Response> {
  let browser;

  try {
    const { id } = await ctx.params;
    const auth = req.headers.get("authorization") ?? "";

    // probleme kan f protocol https my9darch ydwi m3a Http !!
    const origin = process.env.NEXT_PUBLIC_APP_URL ||
      (req.nextUrl.origin.includes('localhost')
        ? req.nextUrl.origin.replace('https:', 'http:')
        : req.nextUrl.origin);

    const targetUrl = `${origin}/printable/contracts/${id}`;

    console.log(`Attempting to generate PDF for: ${targetUrl}`);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security", // Add this for localhost
        "--disable-features=VizDisplayCompositor"
      ],
    });

    const page = await browser.newPage();

    // Set headers if auth is provided
    if (auth) {
      await page.setExtraHTTPHeaders({
        "authorization": auth,
        "x-auth-proxy": auth
      });
    }

    // Navigate with better error handling
    const response = await page.goto(targetUrl, {
      waitUntil: "networkidle0",
      timeout: 30000 // 30 second timeout
    });

    if (!response || !response.ok()) {
      throw new Error(`Failed to load page: ${response?.status()} ${response?.statusText()}`);
    }

    await page.emulateMediaType("screen");

    // Wait a bit for any dynamic content
    // await page.waitForTimeout(1000);

    await page.evaluate(() => {
      document.body.style.zoom = "0.9";

    });

    const pdfBytes = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
    });

    const safeId = id.replace(/[^a-zA-Z0-9-_]/g, "");

    return new Response(pdfBytes as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=contract-${safeId}.pdf`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

  } catch (error) {
    console.error("PDF Generation Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown PDF generation error";

    return new Response(
      JSON.stringify({
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
  }
}