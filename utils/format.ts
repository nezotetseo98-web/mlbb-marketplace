export function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)
  } catch {
    return "$" + Number(n || 0).toFixed(2)
  }
}
