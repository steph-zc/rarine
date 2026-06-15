import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ClienteDetalhe from '../components/ClienteDetalhe'
import { api } from '../services/api'
import { formatarTelefone } from '../utils/formatacao'

function Clientes() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [pedidosCarregando, setPedidosCarregando] = useState(true)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [detalhe, setDetalhe] = useState(null)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    api.clientes.listar()
      .then(setClientes)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
    api.ordens.listar()
      .then(setPedidos)
      .catch(() => setPedidos([]))
      .finally(() => setPedidosCarregando(false))
  }, [])

  const pedidosDoCliente = (clienteId) =>
    pedidos
      .filter(o => o.clientId === clienteId)
      .sort((a, b) => Number(b.id) - Number(a.id))

  const handleInativar = async (id) => {
    if (!window.confirm('Deseja inativar este cliente?')) return
    try {
      await api.clientes.inativar(id)
      setClientes(prev => prev.map(c => c.id === id ? { ...c, active: false } : c))
    } catch (e) {
      alert('Erro ao inativar: ' + e.message)
    }
  }

  const handleReativar = async (id) => {
    if (!window.confirm('Deseja reativar este cliente?')) return
    try {
      await api.clientes.reativar(id)
      setClientes(prev => prev.map(c => c.id === id ? { ...c, active: true } : c))
    } catch (e) {
      alert('Erro ao reativar: ' + e.message)
    }
  }

  const clientesFiltrados = busca.trim()
    ? clientes.filter(c => (c.name || '').toLowerCase().includes(busca.toLowerCase()))
    : clientes

  return (
    <div>
      <Header />
      <div className="action-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <button className="action-bar-btn" onClick={() => navigate('/cadastrar-clientes')}>
          <i className="bi bi-person-plus"></i>
          Novo Cliente
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="bi bi-search" style={{ color: '#6b7280', fontSize: 14 }}></i>
          <input
            type="text"
            className="r-input"
            style={{ width: 220, padding: '6px 10px', fontSize: 13 }}
            placeholder="Buscar por nome..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="page-content">
        {loading && <p className="loading-text">Carregando...</p>}
        {erro && <div className="alert-erro">{erro}</div>}
        {!loading && !erro && (
          <div className="r-table-wrap">
            <table className="r-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Ativo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>#{c.id}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.type === 'PF' ? 'Pessoa Física' : c.type === 'PJ' ? 'Pessoa Jurídica' : c.type}</td>
                    <td>{c.phone ? formatarTelefone(c.phone) : '—'}</td>
                    <td>{c.email || '—'}</td>
                    <td>
                      <span className={`badge-status ${c.active ? 'badge-ativo' : 'badge-inativo'}`}>
                        {c.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-tabela btn-ver"
                        onClick={() => setDetalhe(c)}
                        title="Visualizar cliente"
                      >
                        <i className="bi bi-eye"></i> Ver
                      </button>
                      <button className="btn-tabela btn-editar" onClick={() => navigate(`/cadastrar-clientes/${c.id}`)}>
                        Editar
                      </button>
                      {c.active && (
                        <button className="btn-tabela btn-inativar" onClick={() => handleInativar(c.id)}>
                          Inativar
                        </button>
                      )}
                      {!c.active && (
                        <button
                          className="btn-tabela"
                          style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }}
                          onClick={() => handleReativar(c.id)}
                        >
                          Reativar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      {busca ? 'Nenhum cliente encontrado para essa busca' : 'Nenhum cliente cadastrado'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detalhe && (
        <ClienteDetalhe
          cliente={detalhe}
          pedidos={pedidosDoCliente(detalhe.id)}
          carregando={pedidosCarregando}
          onClose={() => setDetalhe(null)}
          onAbrirPedido={(pedidoId) => { setDetalhe(null); navigate(`/ordem-servico/${pedidoId}`) }}
          onItemPrecoSalvo={(pedidoId, itemId, preco) => setPedidos(prev => prev.map(o => o.id === pedidoId
            ? { ...o, items: (o.items || []).map(it => it.id === itemId ? { ...it, price: preco } : it) }
            : o
          ))}
        />
      )}
    </div>
  )
}

export default Clientes
