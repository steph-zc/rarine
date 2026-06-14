import { useState } from 'react'
import { formatarTelefone, formatarCnpj, capitalizar } from '../utils/formatacao'
import { labelEstampa } from '../utils/printLocations'
import { api } from '../services/api'

const STATUS_LABEL = { PEDIDO: 'Pedido', PRODUCAO: 'Em Produção', PRONTO: 'Pronto', ENTREGUE: 'Entregue' }

function estampaItem(item) {
  if (!item.embroideries?.length) return null
  return item.embroideries.map(e => labelEstampa(e.local || e.location)).join(', ')
}

/** Campo de texto livre para o preço do pedido (lançado/consultado no perfil do cliente). */
function PrecoEditor({ orderId, initial, onSaved }) {
  const [valor, setValor] = useState(initial || '')
  const [salvando, setSalvando] = useState(false)
  const original = initial || ''

  const salvar = async () => {
    if (valor === original) return
    setSalvando(true)
    try {
      await api.ordens.atualizarPreco(orderId, valor)
      onSaved && onSaved(orderId, valor)
    } catch (e) {
      alert('Erro ao salvar preço: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <input
      className="r-input"
      style={{ maxWidth: 130, padding: '4px 8px', fontSize: 13 }}
      value={valor}
      placeholder="Preço"
      disabled={salvando}
      onChange={e => setValor(e.target.value)}
      onBlur={salvar}
      onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
    />
  )
}

function Campo({ label, value }) {
  if (!value) return null
  return (
    <div>
      <div className="info-row-label">{label}</div>
      <div className="info-row-value">{value}</div>
    </div>
  )
}

/**
 * Janela (modal) com todas as informações de um cliente: dados pessoais,
 * itens comprados, preço de cada pedido (texto livre, editável) e histórico.
 *
 * Props: cliente, pedidos (filtrados deste cliente, do mais recente ao mais antigo),
 * carregando, onClose, onAbrirPedido(id), onPrecoSalvo(id, preco).
 */
function ClienteDetalhe({ cliente, pedidos = [], carregando = false, onClose, onAbrirPedido, onPrecoSalvo }) {
  if (!cliente) return null
  const pj = cliente.type === 'PJ'
  const ultimo = pedidos[0] || null
  const anteriores = pedidos.slice(1)
  const abrir = (id) => onAbrirPedido && onAbrirPedido(id)
  const anexos = pedidos.flatMap(o =>
    (o.attachments || []).map(a => ({
      ...a,
      pedidoId: o.id,
      nome: (a.filePath || a.caminho || '').split(/[/\\]/).pop(),
    }))
  )

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box" style={{ maxWidth: 760, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <span className="modal-titulo">
            <i className="bi bi-person-vcard" style={{ marginRight: 6 }} />
            {cliente.name} — {pj ? 'Pessoa Jurídica' : 'Pessoa Física'}
          </span>
          <button className="modal-fechar" onClick={onClose} type="button">×</button>
        </div>

        {/* ── Dados pessoais ─────────────────────────── */}
        <div className="form-card">
          <h6>Dados pessoais</h6>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {pj ? (
              <>
                <Campo label="Razão social" value={cliente.razaoSocial || cliente.name} />
                <Campo label="Nome fantasia" value={cliente.tradeName} />
                <Campo label="CNPJ" value={(cliente.cnpj || cliente.document) ? formatarCnpj(cliente.cnpj || cliente.document) : null} />
                <Campo label="Inscrição estadual" value={cliente.stateRegistration} />
                <Campo label="Telefone" value={cliente.phone ? formatarTelefone(cliente.phone) : null} />
                <Campo label="Email" value={cliente.email} />
                <Campo label="Cidade" value={cliente.city} />
                <Campo label="Responsável" value={cliente.responsibleName} />
                <Campo label="Tel. responsável" value={cliente.responsiblePhone ? formatarTelefone(cliente.responsiblePhone) : null} />
              </>
            ) : (
              <>
                <Campo label="Nome" value={cliente.name} />
                <Campo label="Telefone" value={cliente.phone ? formatarTelefone(cliente.phone) : null} />
                <Campo label="Email" value={cliente.email} />
                <Campo label="Cidade" value={cliente.city} />
                <Campo label="Escola" value={cliente.school} />
                <Campo label="Nome do filho(a)" value={cliente.childName} />
              </>
            )}
            <Campo label="Situação" value={cliente.active ? 'Ativo' : 'Inativo'} />
          </div>
        </div>

        {/* ── Último pedido: itens comprados + preço ── */}
        <div className="form-card">
          <h6>Último pedido — itens e preço</h6>
          {carregando && <p className="loading-text">Carregando histórico...</p>}
          {!carregando && !ultimo && <p className="text-muted">Este cliente ainda não possui pedidos.</p>}
          {!carregando && ultimo && (
            <>
              <div className="os-item-meta" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span>
                  Pedido #{ultimo.id}
                  {ultimo.deadline && ` · Prazo: ${ultimo.deadline}`}
                  {ultimo.status && ` · ${STATUS_LABEL[ultimo.status] || ultimo.status}`}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <strong style={{ fontSize: 12 }}>Preço:</strong>
                  <PrecoEditor orderId={ultimo.id} initial={ultimo.price} onSaved={onPrecoSalvo} />
                </span>
                <button className="btn-tabela btn-ver" onClick={() => abrir(ultimo.id)}>
                  <i className="bi bi-box-arrow-up-right"></i> Abrir pedido
                </button>
              </div>
              {!ultimo.items?.length && <p className="text-muted">Pedido sem itens.</p>}
              {ultimo.items?.length > 0 && (
                <div className="r-table-wrap">
                  <table className="r-table">
                    <thead>
                      <tr><th>Item</th><th>Cor</th></tr>
                    </thead>
                    <tbody>
                      {ultimo.items.map(it => (
                        <tr key={it.id}>
                          <td style={{ fontWeight: 600 }}>
                            {it.productName}
                            {estampaItem(it) && (
                              <div style={{ fontSize: 11, color: '#6b7280' }}>
                                Estampa/bordado: {estampaItem(it)}
                              </div>
                            )}
                          </td>
                          <td>{capitalizar(it.color) || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Histórico de pedidos anteriores ─────────── */}
        {!carregando && anteriores.length > 0 && (
          <div className="form-card">
            <h6>Histórico de pedidos ({anteriores.length})</h6>
            <div className="r-table-wrap">
              <table className="r-table">
                <thead>
                  <tr><th>Nº</th><th>Prazo</th><th>Status</th><th>Itens</th><th>Preço</th><th></th></tr>
                </thead>
                <tbody>
                  {anteriores.map(o => (
                    <tr key={o.id}>
                      <td style={{ color: '#6b7280', fontSize: 12 }}>#{o.id}</td>
                      <td>{o.deadline || '—'}</td>
                      <td>{STATUS_LABEL[o.status] || o.status}</td>
                      <td>{o.items?.length || 0}</td>
                      <td><PrecoEditor orderId={o.id} initial={o.price} onSaved={onPrecoSalvo} /></td>
                      <td>
                        <button className="btn-tabela btn-ver" onClick={() => abrir(o.id)}>
                          Abrir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Arquivos anexados (repositório do cliente) ── */}
        {!carregando && anexos.length > 0 && (
          <div className="form-card">
            <h6>Arquivos anexados ({anexos.length})</h6>
            {anexos.map(a => (
              <div key={`${a.pedidoId}-${a.id}`} className="anexo-linha">
                📎 {a.nome}
                {(a.description || a.descricao) && (
                  <span className="anexo-desc"> — {a.description || a.descricao}</span>
                )}
                <button
                  className="btn-tabela btn-ver"
                  style={{ marginLeft: 8 }}
                  onClick={() => abrir(a.pedidoId)}
                >
                  Pedido #{a.pedidoId}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClienteDetalhe
