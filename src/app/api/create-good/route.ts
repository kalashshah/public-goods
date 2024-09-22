import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(JSON.stringify({ NextResponse }));

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

    // cloudinary.config({
    //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //   api_key: process.env.CLOUDINARY_API_KEY,
    //   api_secret: process.env.CLOUDINARY_API_SECRET,
    // });

    // const uploadResponse = await cloudinary.uploader.upload(body.image, {
    //   overwrite: true,
    //   invalidate: true,
    //   width: 810,
    //   height: 456,
    //   crop: "fill",
    // });

    // const imageUrl = uploadResponse.secure_url;

    const imageUrl =
      "https://res.cloudinary.com/drlni3r6u/image/upload/v1726944753/qrp2lthyht6ndljqbfyx.jpg";

    console.log("✅ image url", imageUrl);

    return NextResponse.json(
      { success: "Success", data: imageUrl },
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating good:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
