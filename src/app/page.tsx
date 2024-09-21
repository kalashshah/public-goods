"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  IDKitWidget,
  ISuccessResult,
  VerificationLevel,
} from "@worldcoin/idkit";

export default function Home() {
  const [text, setText] = useState("");
  const [image, setImage] = useState("");

  const onSuccess = async (res: ISuccessResult) => {
    try {
      console.log({
        text,
        image,
        wc: res,
      });

      const response = await fetch("/api/create-good", {
        method: "POST",
        body: JSON.stringify({
          image,
          data: text,
          proof: res.proof,
          nullifier_hash: res.nullifier_hash,
          merkle_root: res.merkle_root,
          verification_level: res.verification_level,
          action: "public-good-act",
          signal: JSON.stringify({ image, data: text }),
        }),
      });

      console.log("response", response);
    } catch (e) {
      console.log("Error", e);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form className="space-y-6 w-full max-w-md">
          <div className="space-y-2">
            <Label htmlFor="text-input">Text Input</Label>
            <Input
              id="text-input"
              placeholder="Enter your text here"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-input">Image Input</Label>
            <Input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const base64String = event.target?.result as string;
                    setImage(base64String);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <IDKitWidget
            app_id="app_staging_ba8f7d74a9bcc471a13ebb050024aeb5"
            action="public-good-act"
            signal={JSON.stringify({ image, data: text })}
            onSuccess={onSuccess}
            verification_level={VerificationLevel.Device}
          >
            {({ open }) => (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  open();
                }}
              >
                Verify with World ID
              </Button>
            )}
          </IDKitWidget>
        </form>
      </main>
    </div>
  );
}
