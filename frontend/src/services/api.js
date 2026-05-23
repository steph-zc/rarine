// URL base do backend — altere aqui se mudar de porta ou ambiente
const BASE_URL = 'http://localhost:8080/api'

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está em execução.')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.detail || err.message || err.error || err.title || `Erro ${res.status}`
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  clientes: {
    listar: () => request('/clients'),
    buscar: (id) => request(`/clients/${id}`),
    criar: (data) => request('/clients', { method: 'POST', body: JSON.stringify(data) }),
    editar: (id, data) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    inativar: (id) => request(`/clients/${id}/inactive`, { method: 'PATCH' }),
  },
  produtos: {
    listar: () => request('/products'),
    buscar: (id) => request(`/products/${id}`),
    criar: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    editar: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  cores: {
    listar: () => request('/embroidery-colors'),
    criar: (data) => request('/embroidery-colors', { method: 'POST', body: JSON.stringify(data) }),
    editar: (id, data) => request(`/embroidery-colors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  ordens: {
    listar: () => request('/orders'),
    buscar: (id) => request(`/orders/${id}`),
    criar: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    editar: (id, data) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    adicionarItem: (orderId, data) =>
      request(`/orders/${orderId}/items`, { method: 'POST', body: JSON.stringify(data) }),
    adicionarBordado: (orderId, itemId, data) =>
      request(`/orders/${orderId}/items/${itemId}/embroideries`, { method: 'POST', body: JSON.stringify(data) }),
    anexar: async (orderId, formData) => {
      let res
      try {
        res = await fetch(`${BASE_URL}/orders/${orderId}/attachments`, { method: 'POST', body: formData })
      } catch {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está em execução.')
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || err.message || err.error || `Erro ${res.status}`)
      }
      return res.json()
    },
  },
}
