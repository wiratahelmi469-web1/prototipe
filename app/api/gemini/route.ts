import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the modern @google/genai client only when needed.
// Secure key is kept hidden on the server.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyFakeKeyPlaceholderForAppToBuildNow",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing parameter: 'prompt'" }, { status: 400 });
    }

    const systemInstruction = `
      Anda adalah "MindMate Kampus Assistant" yang terintegrasi di EventHub Kampus Universitas Nurul Fikri.
      Tugas Anda adalah membalas pertanyaan atau membantu pembuatan / koordinasi event dengan gaya bahasa Indonesia yang ramah, sopan, dan solutif.
      Posisikan diri sebagai mentor mahasiswa yang cerdas dan mendukung.
      Konteks Pengguna Aktif: ${JSON.stringify(context || {})}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "Terjadi kesalahan dalam mengurai jawaban Gemini.";
    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    console.error("Gemini server error: ", error);
    return NextResponse.json({
      success: false,
      error: "Gagal berdiskusi dengan Gemini. Silakan coba kembali sesaat lagi.",
      details: error?.message || ""
    }, { status: 500 });
  }
}
