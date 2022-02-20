const TestToken = artifacts.require("TestToken");

module.exports = async function(deployer) {
  await deployer.deploy(TestToken, "TestToken","TEST", 10000 * 10 ** 3);
};
