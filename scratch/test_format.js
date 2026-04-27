const amount = 1000;
const num = Number(amount) || 0;
const formatted = 'K' + num.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
console.log(formatted);
