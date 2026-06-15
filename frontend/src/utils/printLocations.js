// Locais de estampa — mesmos valores do enum PrintLocation do backend
export const PRINT_LOCAIS = [
  { val: 'FRONT_LARGE',  label: 'Frente grande' },
  { val: 'FRONT_SMALL',  label: 'Frente pequena' },
  { val: 'BACK_LARGE',   label: 'Costas grande' },
  { val: 'BACK_SMALL',   label: 'Costas pequena' },
  { val: 'SLEEVE_RIGHT', label: 'Manga direita' },
  { val: 'SLEEVE_LEFT',  label: 'Manga esquerda' },
]

const MAPA = Object.fromEntries(PRINT_LOCAIS.map(l => [l.val, l.label]))

/** Converte um valor de PrintLocation para o rótulo em português. */
export function labelEstampa(val) {
  return MAPA[val] || val
}

/** Junta uma lista de locais de estampa em texto: "Frente grande, Costas grande". */
export function listaEstampa(locais) {
  if (!locais || locais.length === 0) return ''
  return locais.map(labelEstampa).join(', ')
}

/** Mapeia um local de aplicação do produto (frente/costas/manga + tamanho/lado) para o local de estampa do item. */
function mapearLocalProduto(l) {
  const loc = (l.location || '').toLowerCase()
  const size = (l.size || '').toLowerCase()
  if (loc === 'frente') return size === 'pequeno' ? 'FRONT_SMALL' : 'FRONT_LARGE'
  if (loc === 'costas' || loc === 'costa') return size === 'pequeno' ? 'BACK_SMALL' : 'BACK_LARGE'
  if (loc === 'manga') return size === 'esquerda' ? 'SLEEVE_LEFT' : 'SLEEVE_RIGHT'
  return null
}

/**
 * Converte os locais de aplicação de bordado/estampa do produto em estampas do item
 * (uma por local, sem cores ainda — o usuário escolhe as cores depois).
 */
export function estampasDoProduto(applicationLocations) {
  const vistos = new Set()
  const estampas = []
  for (const l of applicationLocations || []) {
    const val = mapearLocalProduto(l)
    if (val && !vistos.has(val)) {
      vistos.add(val)
      estampas.push({ location: val, colorIds: [], descricao: '' })
    }
  }
  return estampas
}
