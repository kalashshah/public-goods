// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Green {
    mapping(bytes32 => uint256) public message;
    mapping(address => bytes32) public addressMap;

    event FunctionRequest(bytes32 messageId, string url);

    function contribute(string memory url, string memory description) external {
        bytes32 messageId = keccak256(abi.encodePacked(url, description));
        addressMap[msg.sender] = messageId;
        emit FunctionRequest(messageId, url);
    }

    function fulfillRequest(bytes32 messageId, uint256 response) external {
        message[messageId] = response;
    }
}
