export default function formatAmount(val) {
  return val ? Number(val).toLocaleString('zh', {
    minimumFractionDigits: 2
  }) : '0.00';
}
