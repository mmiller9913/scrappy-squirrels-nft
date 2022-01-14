require("@nomiclabs/hardhat-waffle");
require('dotenv').config({ path: '.env' });
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  solidity: "0.8.0",
  defaultNetwork: "rinkeby",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  }
};