import { apenasDigitos } from './formatacao'

/** Telefone BR: 10 ou 11 dígitos (com DDD). */
export function validarTelefone(valor) {
  const digits = apenasDigitos(valor)
  return digits.length === 10 || digits.length === 11
}

/** CNPJ: 14 dígitos com dígitos verificadores válidos. */
export function validarCnpj(valor) {
  const cnpj = apenasDigitos(valor)
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const calcDigito = (base, pesos) => {
    let soma = 0
    for (let i = 0; i < pesos.length; i++) {
      soma += Number(base[i]) * pesos[i]
    }
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const base = cnpj.slice(0, 12)
  const d1 = calcDigito(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calcDigito(base + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return cnpj === base + String(d1) + String(d2)
}

/** E-mail simples. */
export function validarEmail(valor) {
  const v = (valor || '').trim()
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function mensagemTelefoneInvalido() {
  return 'Informe um telefone válido no formato (00) 0 0000-0000.'
}

export function mensagemCnpjInvalido() {
  return 'Informe um CNPJ válido no formato XX.XXX.XXX/XXXX-YY.'
}

export function mensagemEmailInvalido() {
  return 'Informe um e-mail válido.'
}
