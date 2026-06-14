export function apenasDigitos(valor) {
  return (valor || '').replace(/\D/g, '')
}

/** Primeira letra maiúscula (ex.: "polo" -> "Polo", "algodão" -> "Algodão"). */
export function capitalizar(valor) {
  const s = (valor ?? '').toString().trim()
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** (00) 0 0000-0000 — celular com 11 dígitos; fixo com 10. */
export function formatarTelefone(valor) {
  const d = apenasDigitos(valor).slice(0, 11)
  if (!d) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  }
  return `(${d.slice(0, 2)}) ${d[2]} ${d.slice(3, 7)}-${d.slice(7, 11)}`
}

/** XX.XXX.XXX/XXXX-YY */
export function formatarCnpj(valor) {
  const d = apenasDigitos(valor).slice(0, 14)
  if (!d) return ''
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`
}
