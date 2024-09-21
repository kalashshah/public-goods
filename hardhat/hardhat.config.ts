import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    linea: {
      url: "https://rpc.sepolia.linea.build",
      accounts: [
        "409c54bed0f17d8a9913e5df2c61ff2fb39d8b3883ee8b9314f52b46c0413c80",
      ],
    },
  },
};

export default config;
