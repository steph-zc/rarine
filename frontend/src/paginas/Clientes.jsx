import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { api } from '../services/api'

function Clientes() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    api.clientes.listar()
      .then(setClientes)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleInativar = async (id) => {
    if (!window.confirm('Deseja inativar este cliente?')) return
    try {
      await api.clientes.inativar(id)
      setClientes(prev => prev.map(c => c.id === id ? { ...c, active: false } : c))
    } catch (e) {
      alert('Erro ao inativar: ' + e.message)
    }
  }

  return (
    <div>
      <Header />
      <div className="page-title-bar">Clientes</div>

      <div className="action-bar">
        <button className="action-bar-btn" onClick={() => navigate('/cadastrar-clientes')}>
          <i className="bi bi-person-plus"></i>
          Novo Cliente
        </button>
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
                {clientes.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>#{c.id}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.type === 'PF' ? 'Pessoa Física' : c.type === 'PJ' ? 'Pessoa Jurídica' : c.type}</td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.email || '—'}</td>
                    <td>
                      <span className={`badge-status ${c.active ? 'badge-ativo' : 'badge-inativo'}`}>
                        {c.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-tabela btn-editar" onClick={() => navigate(`/cadastrar-clientes/${c.id}`)}>
                        Editar
                      </button>
                      {c.active && (
                        <button className="btn-tabela btn-inativar" onClick={() => handleInativar(c.id)}>
                          Inativar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {clientes.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0', fontSize: 14 }}>
                      Nenhum cliente cadastrado
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

export default Clientes
