import { NextResponse } from "next/server";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();

    const cloudProofResponse = await fetch(
      "https://developer.worldcoin.org/api/v2/verify/app_staging_ba8f7d74a9bcc471a13ebb050024aeb5",
      {
        method: "POST",
        body: JSON.stringify({
          nullifier_hash: body.nullifier_hash,
          merkle_root: body.merkle_root,
          proof: body.proof,
          verification_level: body.verification_level,
          action: body.action,
          signal_hash: body.signal_hash,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!cloudProofResponse) {
      return NextResponse.json(
        { error: "Proof verification failed!" },
        { status: 400 }
      );
    }

    if (!body.image || !body.data) {
      return NextResponse.json(
        { error: "Image and data are required" },
        { status: 405 }
      );
    }

    const client = new OpenAI({
      baseURL: "https://llama.us.gaianet.network/v1",
      apiKey: "",
    });

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadResponse = await cloudinary.uploader.upload(body.image, {
      overwrite: true,
      invalidate: true,
      width: 810,
      height: 456,
      crop: "fill",
    });

    const imageUrl = uploadResponse.secure_url;

    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are the judge of a social good event, give response in this json form { isPublicGood: boolean, score: number } by taking a look at the image provided and the score should vary between 0 and 100 depending on its scale and impact. Don't return anything else, just the json.",
        },
        { role: "user", content: `${body.data}\n${imageUrl}` },
      ],
      model: "Meta-Llama-3-8B-Instruct-Q5_K_M",
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log("response", response.choices[0].message.content);

    return NextResponse.json(
      { success: "Success", data: response.choices[0].message.content },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating good:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
