const LOCAL_PARA_API = {
  frente: 'FRONT',
  costas: 'BACK',
  manga: 'SLEEVE',
}

/** Payload para PUT /api/orders/:id */
export function orderInfoToApi(ordem, infoForm) {
  return {
    clientId: ordem.clientId,
    deadline: infoForm.deadline || null,
    notes: infoForm.notes?.trim() || null,
  }
}

/** Payload para POST .../embroideries */
export function embroideryFormToApi(form) {
  const local = (form.local || '').toLowerCase()
  const location = LOCAL_PARA_API[local] || form.local?.toUpperCase()
  return {
    location,
    description: form.descricao?.trim() || '',
    colorIds: form.colorIds.map(Number),
  }
}
