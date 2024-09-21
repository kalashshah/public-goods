import { ethers } from "hardhat";
async function deploy() {
  const contract = await ethers.deployContract("Green");
  console.log(contract.target);
}

deploy();
