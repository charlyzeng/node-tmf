function sum(a, b) {
  return a + b;
}

function mul(a, b) {
  return a * b;
}

Object.defineProperty(sum, 'mul', {
  value: mul,
});

module.exports = sum;
