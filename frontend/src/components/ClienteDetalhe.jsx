import { useState } from 'react'
import { formatarTelefone, formatarCnpj, capitalizar } from '../utils/formatacao'
import { labelEstampa } from '../utils/printLocations'
import { api } from '../services/api'

const STATUS_LABEL = { PEDIDO: 'Pedido', PRODUCAO: 'Em Produção', PRONTO: 'Pronto', ENTREGUE: 'Entregue' }
const STATUS_CLASS  = { PEDIDO: 'badge-open', PRODUCAO: 'badge-progress', PRONTO: 'badge-done', ENTREGUE: 'badge-inativo' }

/** Campo de preço editável por item. */
function ItemPrecoEditor({ orderId, itemId, initial, onSaved, locked }) {
  const [valor, setValor] = useState(initial || '')
  const [salvando, setSalvando] = useState(false)
  const original = initial || ''

  const salvar = async () => {
    if (locked || valor === original) return
    setSalvando(true)
    try {
      await api.ordens.atualizarPrecoItem(orderId, itemId, valor)
      onSaved && onSaved(orderId, itemId, valor)
    } catch (e) {
      alert('Erro ao salvar preço: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <input
      className="r-input"
      style={{
        maxWidth: 120, padding: '4px 8px', fontSize: 13,
        ...(locked ? { background: 'var(--chip-bg)', color: 'var(--cinza-texto)', cursor: 'not-allowed' } : {}),
      }}
      value={valor}
      placeholder={locked ? '—' : 'Preço'}
      disabled={salvando || locked}
      onChange={e => setValor(e.target.value)}
      onBlur={salvar}
      onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
      title={locked ? 'Pedido entregue — preço não pode ser alterado' : undefined}
    />
  )
}

/** Tabela de itens de um pedido com preço editável por item. */
function ItensComPreco({ orderId, items, status, onItemPrecoSalvo }) {
  const locked = status === 'ENTREGUE'
  if (!items?.length) return <p className="text-muted">Pedido sem itens.</p>
  return (
    <div className="r-table-wrap">
      <table className="r-table">
        <thead>
          <tr><th>Item</th><th>Cor</th><th>Preço/peça</th></tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td style={{ fontWeight: 600 }}>
                {it.productName}
                {it.embroideries?.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--cinza-texto)' }}>
                    {it.embroideries.map(e => labelEstampa(e.location || e.local)).join(', ')}
                  </div>
                )}
              </td>
              <td>{capitalizar(it.color) || '—'}</td>
              <td>
                <ItemPrecoEditor
                  orderId={orderId}
                  itemId={it.id}
                  initial={it.price}
                  onSaved={onItemPrecoSalvo}
                  locked={locked}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Bloco visual padronizado de um pedido (usado no último pedido e no histórico). */
function PedidoBloco({ pedido, destaque = false, abrir, onItemPrecoSalvo }) {
  return (
    <div style={{
      border: '1px solid var(--cinza-borda)',
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      background: destaque ? 'var(--card-subtle)' : 'var(--branco)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--texto)' }}>
          Pedido Nº {String(pedido.id).padStart(3, '0')}
        </span>
        <span className={`badge-status ${STATUS_CLASS[pedido.status] || 'badge-open'}`}>
          {STATUS_LABEL[pedido.status] || pedido.status}
        </span>
        {pedido.deadline && (
          <span style={{ fontSize: 12, color: 'var(--cinza-texto)' }}>Prazo: {pedido.deadline}</span>
        )}
        <button className="btn-tabela btn-ver" style={{ marginLeft: 'auto' }} onClick={() => abrir(pedido.id)}>
          <i className="bi bi-box-arrow-up-right"></i> Abrir
        </button>
      </div>
      <ItensComPreco
        orderId={pedido.id}
        items={pedido.items}
        status={pedido.status}
        onItemPrecoSalvo={onItemPrecoSalvo}
      />
    </div>
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
 * itens do último pedido com preço por peça e histórico de pedidos anteriores.
 *
 * Props: cliente, pedidos (filtrados deste cliente, do mais recente ao mais antigo),
 * carregando, onClose, onAbrirPedido(id), onItemPrecoSalvo(orderId, itemId, preco).
 */
function ClienteDetalhe({ cliente, pedidos = [], carregando = false, onClose, onAbrirPedido, onItemPrecoSalvo }) {
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

        {/* ── Último pedido ─────────────────────────── */}
        <div className="form-card">
          <h6>Último pedido</h6>
          {carregando && <p className="loading-text">Carregando histórico...</p>}
          {!carregando && !ultimo && <p className="text-muted">Este cliente ainda não possui pedidos.</p>}
          {!carregando && ultimo && (
            <PedidoBloco pedido={ultimo} destaque abrir={abrir} onItemPrecoSalvo={onItemPrecoSalvo} />
          )}
        </div>

        {/* ── Histórico de pedidos anteriores ─────────── */}
        {!carregando && anteriores.length > 0 && (
          <div className="form-card">
            <h6>Histórico de pedidos ({anteriores.length})</h6>
            {anteriores.map(o => (
              <PedidoBloco key={o.id} pedido={o} abrir={abrir} onItemPrecoSalvo={onItemPrecoSalvo} />
            ))}
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
