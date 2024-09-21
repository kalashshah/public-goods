"use client";

import React from "react";
import { VeraxSdk } from "@verax-attestation-registry/verax-sdk";

const SCHEMA_ID =
  "0x5673f4088699862e7487279d32ec3908d61f843dc3703dc56b8bbab4028c2b12";
const PORTAL_ADDRESS = "0x837Db0B64766C1B65f9e3cE6b593B2C49eD1DC6B";

const Page = () => {
  const address = "0xACEe0D180d0118FD4F3027Ab801cc862520570d1";
  const veraxSdk = new VeraxSdk(
    VeraxSdk.DEFAULT_LINEA_SEPOLIA_FRONTEND,
    address,
    "0x409c54bed0f17d8a9913e5df2c61ff2fb39d8b3883ee8b9314f52b46c0413c80"
  );

  const SCHEMA = "(uint32 score)";

  const createSchema = async () => {
    try {
      const txHash = await veraxSdk.schema.create(
        "Green Republic",
        "This Schema is used for the Eth Singapore hackathon for Green republic",
        "https://ver.ax/tutorials",
        SCHEMA,
        true
      );
      console.log("Schema created: ", txHash);
    } catch (error) {
      console.error(error);
    }
  };

  const getSchemaId = async () => {
    const schemaId = await veraxSdk.schema.getIdFromSchemaString(SCHEMA);
    console.log("Schema id", schemaId);
    return schemaId;
  };

  const deployPortal = async () => {
    const txHash = await veraxSdk.portal.deployDefaultPortal(
      [],
      "Green Republic Portal",
      "This Portal is used for Green Republic",
      true,
      "Green Republic"
    );
    console.log("Portal deployed", txHash);
  };

  const doThis = async () => {
    await deployPortal();
  };

  return (
    <div>
      Page
      <button onClick={doThis}>Hello click this</button>
    </div>
  );
};

export default Page;
