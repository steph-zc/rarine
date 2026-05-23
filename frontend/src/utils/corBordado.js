const HEX_SUFFIX_RE = /\s*\(#([0-9a-fA-F]{6})\)\s*$/i
const HEX_PLAIN_SUFFIX_RE = /\s+#([0-9a-fA-F]{6})\s*$/i

/** Extrai #rrggbb do final do nome (ex.: "Azul Royal (#3B82F6)"). */
export function extractHexFromName(name) {
  if (!name) return null
  const paren = name.match(HEX_SUFFIX_RE)
  if (paren) return `#${paren[1].toLowerCase()}`
  const plain = name.match(HEX_PLAIN_SUFFIX_RE)
  if (plain) return `#${plain[1].toLowerCase()}`
  return null
}

/** Remove o sufixo de hex do nome para exibição. */
export function stripHexFromName(name) {
  if (!name) return ''
  return name.replace(HEX_SUFFIX_RE, '').replace(HEX_PLAIN_SUFFIX_RE, '').trim()
}

/** Monta o nome persistido com hex embutido. */
export function nameWithHex(displayName, hex) {
  const base = stripHexFromName(displayName).trim()
  const raw = (hex || '#000000').replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return base
  return `${base} (#${raw.toUpperCase()})`
}

export function hexFromCor(cor) {
  return extractHexFromName(cor?.name) || cor?.hexColor || null
}
