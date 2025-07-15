import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import PPTXGenJS from "pptxgenjs";

export async function POST(req) {
  try {
    const { filename } = await req.json();
    if (!filename) {
      return new Response(JSON.stringify({ error: "Filename required" }), { status: 400 });
    }

    // 1. Create PPTX as Buffer (pptxgenjs v4+ API)
    const pptx = new PPTXGenJS();
    pptx.addSlide(); // Blank slide
    const pptxBuffer = await pptx.write("nodebuffer");

    // 2. Save to Blob Storage
    const safeName = encodeURIComponent(filename.replace(/[^a-z0-9_\-.]/gi, "_")) + ".pptx";
    const { url } = await put(safeName, pptxBuffer, { access: 'public' });

    // 3. Return public download link
    return new Response(JSON.stringify({ url }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
