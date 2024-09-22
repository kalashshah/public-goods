/* eslint-disable @typescript-eslint/no-require-imports */
const ethers = require("ethers");
const OpenAI = require("openai");

const PRIVATE_KEY =
  "409c54bed0f17d8a9913e5df2c61ff2fb39d8b3883ee8b9314f52b46c0413c80";
const contractAddress = "0x435663d1c28718FA9f23698de8373fC5AB423818";
const contractABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "url",
        type: "string",
      },
    ],
    name: "FunctionRequest",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "addressMap",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "attestations",
    outputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "score",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "url",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
    ],
    name: "contribute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
      {
        internalType: "uint32",
        name: "score",
        type: "uint32",
      },
    ],
    name: "fulfillRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAttestations",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "uint32",
            name: "score",
            type: "uint32",
          },
        ],
        internalType: "struct AddedAttestation[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "message",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userScore",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const providerUrl = "https://rpc.sepolia.linea.build";

const provider = new ethers.JsonRpcProvider(providerUrl);
const contract = new ethers.Contract(contractAddress, contractABI, provider);

async function eventHandler(messageId: string, url: string) {
  try {
    console.log("Event received:", messageId, url);
    const client = new OpenAI({
      baseURL: "https://llama.us.gaianet.network/v1",
      apiKey: "",
    });

    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are the judge of a social good event, give response in this json form { isPublicGood: boolean, score: number } by taking a look at the image provided and the score should vary between 0 and 100 depending on its scale and impact. Don't return anything else, just the json.",
        },
        { role: "user", content: url },
      ],
      model: "Meta-Llama-3-8B-Instruct-Q5_K_M",
      temperature: 0.7,
      max_tokens: 500,
    });

    const jsonData = response?.choices[0]?.message?.content;
    if (!jsonData) return;
    const parsedResponse = JSON.parse(jsonData);
    if (parsedResponse?.isPublicGood && parsedResponse?.score > 0) {
      const privateKey = PRIVATE_KEY;
      const wallet = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = contract.connect(wallet);
      const tx = await contractWithSigner.fulfillRequest(
        messageId,
        parsedResponse.score,
        {
          gasLimit: 500000,
        }
      );
      await tx.wait();
      console.log(
        `Request fulfilled for messageId: ${messageId} with score: ${parsedResponse.score}`
      );
    }
  } catch (error) {
    console.log("error", error);
  }
}

contract.on("FunctionRequest", eventHandler);

console.log("Event listener started for contract at address:", contractAddress);
