/** Payload para PUT /api/orders/:id */
export function orderInfoToApi(ordem, infoForm) {
  return {
    clientId: ordem.clientId,
    deadline: infoForm.deadline || null,
    notes: infoForm.notes?.trim() || null,
  }
}
