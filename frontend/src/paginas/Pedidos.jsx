import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { api } from '../services/api'

const STATUS_LABEL = { OPEN: 'Aberto', IN_PROGRESS: 'Em andamento', DONE: 'Concluído', CANCELLED: 'Cancelado', Pedido: 'Pedido', Producao: 'Produção', Pronto: 'Pronto', Entregue: 'Entregue' }
const STATUS_CLASS  = { OPEN: 'badge-open', IN_PROGRESS: 'badge-progress', DONE: 'badge-done', CANCELLED: 'badge-cancelled', Pedido: 'badge-open', Producao: 'badge-progress', Pronto: 'badge-done', Entregue: 'badge-inativo' }

function Pedidos() {
  const navigate = useNavigate()
  const [ordens, setOrdens] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ clientId: '', deadline: '', notes: '' })

  const carregar = () => {
    setLoading(true)
    Promise.all([api.ordens.listar(), api.clientes.listar()])
      .then(([ords, cls]) => {
        const ordenado = [...ords].sort((a, b) => Number(b.id) - Number(a.id))
        setOrdens(ordenado)
        setClientes(cls)
      })
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSalvando(true)
    try {
      await api.ordens.criar({ clientId: Number(form.clientId), deadline: form.deadline || null, notes: form.notes || null })
      setMostrarForm(false); setForm({ clientId: '', deadline: '', notes: '' }); carregar()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  return (
    <div>
      <Header />
      <div className="page-title-bar">Pedidos / Ordens de Serviço</div>

      <div className="action-bar">
        <button className="action-bar-btn" onClick={() => setMostrarForm(true)}>
          <i className="bi bi-journal-plus"></i>
          Novo Pedido
        </button>
      </div>

      <div className="page-content">

        {mostrarForm && (
          <div className="form-card" style={{ maxWidth: 500 }}>
            <h6>Criar Ordem de Serviço</h6>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label className="r-label">Cliente *</label>
                <select className="r-select" value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} required>
                  <option value="">Selecione</option>
                  {clientes.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="r-label">Prazo de entrega</label>
                <input type="date" className="r-input" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="r-label">Observações</label>
                <textarea className="r-textarea" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary-r" disabled={salvando}>{salvando ? 'Criando...' : 'Criar Pedido'}</button>
                <button type="button" className="btn-secondary-r" onClick={() => setMostrarForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {loading && <p className="loading-text">Carregando...</p>}
        {erro && <div className="alert-erro">{erro}</div>}
        {!loading && !erro && (
          <div className="r-table-wrap">
            <table className="r-table">
              <thead>
                <tr>
                  <th>Nº</th><th>Cliente</th><th>Status</th>
                  <th>Prazo</th><th>Observações</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordens.map(o => (
                  <tr key={o.id}>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>#{o.id}</td>
                    <td style={{ fontWeight: 600 }}>{o.clientName}</td>
                    <td>
                      <span className={`badge-status ${STATUS_CLASS[o.status] || 'badge-inativo'}`}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                    <td>{o.deadline || '—'}</td>
                    <td style={{ color: '#6b7280', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.notes || '—'}</td>
                    <td>
                      <button className="btn-tabela btn-ver" onClick={() => navigate(`/ordem-servico/${o.id}`)}>
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
                {ordens.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0', fontSize: 14 }}>
                      Nenhum pedido criado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pedidos
