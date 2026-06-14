import { apenasDigitos, formatarCnpj, formatarTelefone } from './formatacao'

/** API → formulário de cadastro/edição. */
export function clientApiToForm(c) {
  const isPf = c.type === 'PF'
  const docDigits = apenasDigitos(c.document)
  const docIsPfLegacy = (c.document || '').startsWith('PF-')

  return {
    nome: isPf ? (c.name || '') : '',
    telefone: formatarTelefone(c.phone || (docIsPfLegacy ? docDigits : '')),
    email: c.email || '',
    cidade: c.city || '',
    escola: c.school || '',
    nomeFilho: c.childName || '',
    razaoSocial: !isPf ? (c.razaoSocial || c.name || '') : '',
    nomeFantasia: c.tradeName || '',
    cnpj: !isPf ? formatarCnpj(c.cnpj || (docIsPfLegacy ? '' : c.document)) : '',
    inscricaoEstadual: c.stateRegistration || '',
    nomeResponsavel: c.responsibleName || '',
    telResponsavel: formatarTelefone(c.responsiblePhone || ''),
  }
}

/** Formulário → DTO do backend. */
export function clientFormToApi(tipo, form) {
  const phone = apenasDigitos(form.telefone)
  const base = {
    type: tipo,
    email: form.email.trim(),
    phone,
    city: form.cidade?.trim() || null,
    school: form.escola?.trim() || null,
    childName: form.nomeFilho?.trim() || null,
    cnpj: null,
    razaoSocial: null,
    tradeName: null,
    stateRegistration: null,
    responsibleName: null,
    responsiblePhone: null,
  }

  if (tipo === 'PF') {
    return {
      ...base,
      name: form.nome.trim(),
      document: `PF-${phone}`,
    }
  }

  return {
    ...base,
    name: form.razaoSocial.trim(),
    document: apenasDigitos(form.cnpj),
    cnpj: apenasDigitos(form.cnpj) || null,
    razaoSocial: form.razaoSocial?.trim() || null,
    tradeName: form.nomeFantasia?.trim() || null,
    stateRegistration: form.inscricaoEstadual?.trim() || null,
    responsibleName: form.nomeResponsavel?.trim() || null,
    responsiblePhone: apenasDigitos(form.telResponsavel) || null,
  }
}

/** Mapeia o formulário de produto para o DTO do backend. */
export function productFormToApi(form) {
  const flag = !!form.hasEmbroideryOrPrint
  return {
    name: form.name.trim(),
    type: form.type?.trim() || 'camiseta',
    model: form.model || null,
    collar: form.collar || null,
    fabric: form.fabric || null,
    baseColor: form.baseColor || null,
    hasEmbroidery: flag,
    hasPrint: flag,
    applicationLocations: flag ? (form.applicationLocations || []) : [],
  }
}
