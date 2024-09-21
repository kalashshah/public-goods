import { ethers } from "ethers";
import OpenAI from "openai";

const contractAddress = "0xF3C05f8f1271868E925535c5731A53d310C7c4f5";
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
        internalType: "uint256",
        name: "response",
        type: "uint256",
      },
    ],
    name: "fulfillRequest",
    outputs: [],
    stateMutability: "nonpayable",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
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
}

contract.on("FunctionRequest", eventHandler);

console.log("Event listener started for contract at address:", contractAddress);
