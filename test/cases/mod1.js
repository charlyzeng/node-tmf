function sum(a, b) {
  return a + b;
}

function mul(a, b) {
  return a * b;
}

sum.mul = mul;

module.exports = sum;
