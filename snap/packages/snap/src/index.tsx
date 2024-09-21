import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { Box, Heading, Text, Bold } from '@metamask/snaps-sdk/jsx';
import { ethers } from 'ethers'

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.linea.build")
  const abi = [
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
  const contract = new ethers.Contract("0x435663d1c28718FA9f23698de8373fC5AB423818",
    abi, provider)
  const attestations = await contract.getAttestations()
  switch (request.method) {
    case 'see_leaderboard':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: (
            <Box>
              <Heading>Leaderboard</Heading>
              {attestations.map((attestation: unknown, index: number) => (
                <Text key={index.toString()}>
                  {attestation.user + ' --> '}
                  <Bold>
                    {attestation.score.toString()}
                  </Bold>
                </Text>
              ))
              }
            </Box>
          ),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};