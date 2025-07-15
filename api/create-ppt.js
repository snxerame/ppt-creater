// Install these packages beforehand:
// npm install @vercel/blob pptxgenjs

import { put } from "@vercel/blob";
import { NextRequest } from "next/server";
import PPTXGenJS from "pptxgenjs";
import stream from "stream";
import { promisify } from "util";

const pipeline = promisify(stream.pipeline);

export async function POST(req) {
  try {
    const { filename } = await req.json();
    if (!filename || !filename.trim()) {
      return new Response(JSON.stringify({ error: "Filename required" }), { status: 400 });
    }

    // 1. Create PPTX file in memory
    const pptx = new PPTXGenJS();
    pptx.addSlide(); // Blank slide

    // We need a writable stream, so export to node buffer
    const buffer = await pptx.write("nodebuffer");

    // 2. Upload to Vercel Blob Storage
    const targetFilename = encodeURIComponent(filename.replace(/[^a-z0-9_\-.]/gi, "_")) + ".pptx";
    const { url } = await put(targetFilename, buffer, { access: "public" });

    // 3. Return the direct download link
    return new Response(JSON.stringify({ url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Server Error" }), { status: 500 });
  }
}

export const config = { api: { bodyParser: false } }; // Allows JSON body in Next.js API routes
