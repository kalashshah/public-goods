// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

struct AttestationPayload {
    bytes32 schemaId;
    uint64 expirationDate;
    bytes subject;
    bytes attestationData;
}

struct Score {
    uint32 score;
}

interface IAttestationRegistry {
    function attest(
        AttestationPayload memory attestationPayload,
        bytes[] memory validationPayload
    ) external payable;
}

contract Green {
    mapping(bytes32 => uint32) public message;
    mapping(address => bytes32) public addressMap;

    event FunctionRequest(bytes32 messageId, string url);

    function contribute(string memory url, string memory description) external {
        bytes32 messageId = keccak256(abi.encodePacked(url, description));
        addressMap[msg.sender] = messageId;
        emit FunctionRequest(messageId, url);
    }

    function fulfillRequest(bytes32 messageId, uint32 response) external {
        message[messageId] = response;
        uint64 currentTimestamp = uint64(block.timestamp);
        uint64 hundredYearsInSeconds = 100 * 365 days;
        uint64 expirationDate = currentTimestamp + hundredYearsInSeconds;
        AttestationPayload memory payload = AttestationPayload(
            0x5673f4088699862e7487279d32ec3908d61f843dc3703dc56b8bbab4028c2b12,
            expirationDate,
            abi.encode(msg.sender),
            abi.encode(Score(response))
        );
        IAttestationRegistry(0x837Db0B64766C1B65f9e3cE6b593B2C49eD1DC6B).attest(
            payload,
            new bytes[](0)
        );
    }
}
