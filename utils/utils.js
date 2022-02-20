module.exports.convertToBN = function(web3, amount, decimals) {
  var a = new web3.utils.BN(amount);
  var b = new web3.utils.BN(10).pow(new web3.utils.BN(decimals));
  c = a.mul(b)
  return c
};
