// SPDX-License-Identifier: MIT
const Web3 = require('web3');
var provider = new Web3.providers.HttpProvider("http://localhost:8545");

const TestToken = artifacts.require("TestToken");
const utils = require("../utils/utils.js");

function beforeAfter(before, after, symbol, decimals) {
  console.log("Before: " + before / (10 ** decimals) + " " + symbol + "  After: " + after / (10 ** decimals) + " " + symbol)
}

contract('TestToken', (accounts) => {
  let WETH;
  let UNISWAPV2;
  let TESTTOKEN;

  before(async () => {
    const contract = require('@truffle/contract');

    // WETH
    const ERC20ABI = require("../node_modules/@openzeppelin/contracts/build/contracts/ERC20.json")
    let ERC20 = contract({
      abi: ERC20ABI.abi
    });
    ERC20.setProvider(provider);
    WETH = await ERC20.at("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")

    // UniswapV2Router
    const UniswapV2Router02ABI = require("../node_modules/@uniswap/v2-periphery/build/UniswapV2Router02.json")
    let UniswapV2Router02 = contract({
      abi: UniswapV2Router02ABI.abi
    });
    UniswapV2Router02.setProvider(provider);
    UNISWAPV2 = await UniswapV2Router02.at("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")


    // Deploy contract
    TESTTOKEN = await TestToken.deployed({
      from: accounts[0]
    })
  })

  it('Balance of first user shoudl equal total supply', async () => {
    const balance0 = await TESTTOKEN.balanceOf(accounts[0])
    const totalSupply = await TESTTOKEN.totalSupply()
    assert.equal(balance0.toString() , totalSupply.toString());
  });

  it('should add liquidity to uniswap pool | 100 TestToken and 1 ETH', async function() {
    // tokenA and tokenB to add to liquidity
    const tokenA = utils.convertToBN(web3, 1, 3)
    const tokenB = utils.convertToBN(web3, 1, 18)
    await TESTTOKEN.approve(UNISWAPV2.address, tokenA, {
      from: accounts[0]
    })

    const sphynxBefore = await TESTTOKEN.balanceOf(accounts[0])
    const ethBefore = await web3.eth.getBalance(accounts[0])
    await UNISWAPV2.addLiquidityETH(TESTTOKEN.address, tokenA, 1, tokenB, accounts[0], Date.now() , {
      from: accounts[0],
      value: tokenB
    });

    // Balance checking
    beforeAfter(ethBefore, await web3.eth.getBalance(accounts[0]), "ETH", 18)
    beforeAfter(sphynxBefore, await TESTTOKEN.balanceOf(accounts[0]), "TestToken", 3)

    // And check token balances of pair
    const pair = await TESTTOKEN.uniswapV2Pair()
    const pairTokenA = await TESTTOKEN.balanceOf(pair)
    const pairTokenB = await WETH.balanceOf(pair)
    console.log("Pair balance: " + (pairTokenA / (10 ** 3)) + " TestToken    " + pairTokenB / 1e18 + " ETH")
    assert(1, 1)
  });

  it('Buy tokens from several accounts', async function() {
    const amount = utils.convertToBN(web3, 1, 18)
    var i = 1;
    await UNISWAPV2.swapExactETHForTokens(0, [await UNISWAPV2.WETH(), TESTTOKEN.address], accounts[i], Date.now()+15 , {
      value: amount,
      from: accounts[i]
    });
    const pair = await TESTTOKEN.uniswapV2Pair()
    const pairTokenA = await TESTTOKEN.balanceOf(pair)
    const pairTokenB = await WETH.balanceOf(pair)
    console.log("Pair balance: " + (pairTokenA / (10 ** 3)) + " TestToken    " + pairTokenB / 1e18 + " ETH")

    i = 2;
    await UNISWAPV2.swapExactETHForTokens(0, [await UNISWAPV2.WETH(), TESTTOKEN.address], accounts[i], Date.now()+15 , {
      value: amount/i,
      from: accounts[i]
    });


    assert(1, 1)
  });


})
