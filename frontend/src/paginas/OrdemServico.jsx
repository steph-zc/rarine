import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { api } from '../services/api'
import { hexFromCor, stripHexFromName } from '../utils/corBordado'
import { embroideryFormToApi, orderInfoToApi } from '../utils/orderMappers'

const STATUS_LABEL = { Pedido: 'Pedido', Producao: 'Produção', Pronto: 'Pronto', Entregue: 'Entregue' }
const STATUS_CLASS  = { Pedido: 'badge-open', Producao: 'badge-progress', Pronto: 'badge-done', Entregue: 'badge-inativo' }
const LOCAIS = ['frente', 'costas', 'manga']

// Gola / Tecido com iniciais maiúsculas
const GOLAS   = [{ val: 'redonda', label: 'Redonda' }, { val: 'polo', label: 'Polo' }, { val: 'V', label: 'V' }, { val: 'canoa', label: 'Canoa' }]
const TECIDOS = [{ val: 'algodão', label: 'Algodão' }, { val: 'dry', label: 'Dry' }, { val: 'cross', label: 'Cross' }, { val: 'PV', label: 'PV' }]
const TAMANHOS = ['P', 'M', 'G', 'GG', 'G1']

function OrdemServico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ordem, setOrdem] = useState(null)
  const [produtos, setProdutos] = useState([])
  const [cores, setCores] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [salvando, setSalvando] = useState(false)

  // Edição inline de prazo/observações
  const [editandoInfo, setEditandoInfo] = useState(false)
  const [infoForm, setInfoForm] = useState({ deadline: '', notes: '' })
  const [salvandoInfo, setSalvandoInfo] = useState(false)

  // Item form — inclui gola e tecido por item (caso de uso: "Definir características por item")
  const itemInicial = { productId: '', color: '', size: '', collar: '', fabric: '', quantity: 1, notes: '' }
  const [itemForm, setItemForm] = useState(itemInicial)

  const embInicial = { itemId: '', local: 'frente', descricao: '', colorIds: [] }
  const [embForm, setEmbForm] = useState(embInicial)

  const [anexoFile, setAnexoFile] = useState(null)
  const [descAnexo, setDescAnexo] = useState('')

  const carregar = useCallback(() => {
    setLoading(true)
    Promise.all([api.ordens.buscar(id), api.produtos.listar(), api.cores.listar()])
      .then(([ord, prods, cors]) => {
        setOrdem(ord)
        setProdutos(prods)
        setCores(cors)
        setInfoForm({ deadline: ord.deadline || '', notes: ord.notes || '' })
      })
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  const salvarInfo = async () => {
    setSalvandoInfo(true)
    try {
      await api.ordens.editar(id, orderInfoToApi(ordem, infoForm))
      setEditandoInfo(false)
      carregar()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvandoInfo(false) }
  }

  const handleProdutoChange = (produtoId) => {
    const prod = produtos.find(p => String(p.id) === String(produtoId))
    setItemForm(f => ({
      ...f,
      productId: produtoId,
      color:  prod?.baseColor || prod?.corBase || '',
      collar: prod?.collar    || prod?.gola    || '',
      fabric: prod?.fabric    || prod?.tecido  || '',
    }))
  }

  const adicionarItem = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try {
      await api.ordens.adicionarItem(id, {
        ...itemForm,
        productId: Number(itemForm.productId),
        quantity: Number(itemForm.quantity),
      })
      setItemForm(itemInicial)
      carregar()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  const adicionarBordado = async (e) => {
    e.preventDefault()
    if (embForm.colorIds.length === 0) return alert('Selecione ao menos uma cor')
    if (embForm.colorIds.length > 6) return alert('Máximo 6 cores por bordado')
    setSalvando(true)
    try {
      await api.ordens.adicionarBordado(id, embForm.itemId, embroideryFormToApi(embForm))
      setEmbForm(embInicial)
      carregar()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  const anexar = async () => {
    if (!anexoFile) return alert('Selecione um arquivo')
    setSalvando(true)
    try {
      const fd = new FormData()
      fd.append('file', anexoFile)
      if (descAnexo) fd.append('descricao', descAnexo)
      await api.ordens.anexar(id, fd)
      setAnexoFile(null)
      setDescAnexo('')
      carregar()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  if (loading) return <><Header /><p className="loading-text" style={{ padding: 24 }}>Carregando...</p></>
  if (erro)    return <><Header /><div className="alert-erro" style={{ margin: 24 }}>{erro}</div></>
  if (!ordem)  return null

  const statusKey = ordem.status
  const bloqueado = statusKey === 'Producao'

  return (
    <div>
      <Header />
      <div className="action-bar">
        <button className="action-bar-btn" onClick={() => navigate('/pedidos')}>
          <i className="bi bi-arrow-left"></i>
          Voltar
        </button>
      </div>

      <div className="page-content">
        <div className="row g-3">

          {/* ── Coluna esquerda ─────────────────────── */}
          <div className="col-md-7">

            {/* Informações da OS */}
            <div className="form-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h6 style={{ margin: 0, border: 0, padding: 0 }}>Informações</h6>
                {!editandoInfo && (
                  <button
                    className="btn-tabela btn-editar"
                    onClick={() => setEditandoInfo(true)}
                    style={{ fontSize: 11 }}
                  >
                    Editar
                  </button>
                )}
              </div>

              {!editandoInfo ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <InfoRow label="Cliente"      value={ordem.clientName || ordem.clienteNome} />
                  <InfoRow label="Status"       value={
                    <span className={`badge-status ${STATUS_CLASS[statusKey] || 'badge-open'}`}>
                      {STATUS_LABEL[statusKey] || statusKey}
                    </span>
                  } />
                  <InfoRow label="Prazo"        value={ordem.deadline || ordem.prazoEntrega || '—'} />
                  <InfoRow label="Observações"  value={ordem.notes || ordem.observacoes || '—'} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: '1' }}>
                    <label className="r-label">Prazo de Entrega</label>
                    <input
                      type="date"
                      className="r-input"
                      value={infoForm.deadline}
                      onChange={e => setInfoForm(f => ({ ...f, deadline: e.target.value }))}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="r-label">Observações</label>
                    <textarea
                      className="r-textarea"
                      rows={2}
                      value={infoForm.notes}
                      onChange={e => setInfoForm(f => ({ ...f, notes: e.target.value }))}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                    <button className="btn-primary-r" onClick={salvarInfo} disabled={salvandoInfo} style={{ fontSize: 12, padding: '7px 16px' }}>
                      {salvandoInfo ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button className="btn-secondary-r" onClick={() => setEditandoInfo(false)} style={{ fontSize: 12, padding: '7px 14px' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Adicionar item */}
            {!bloqueado && (
              <div className="form-card">
                <h6>Adicionar Item</h6>
                <form onSubmit={adicionarItem}>
                  <div style={{ marginBottom: 10 }}>
                    <label className="r-label">Produto *</label>
                    <select
                      className="r-select"
                      value={itemForm.productId}
                      onChange={e => handleProdutoChange(e.target.value)}
                      required
                    >
                      <option value="">Selecione</option>
                      {produtos.map(p => <option key={p.id} value={p.id}>{p.name || p.nome}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label className="r-label">Cor *</label>
                      <input className="r-input" value={itemForm.color} onChange={e => setItemForm(f => ({ ...f, color: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="r-label">Tamanho *</label>
                      <select
                        className="r-select"
                        value={itemForm.size}
                        onChange={e => setItemForm(f => ({ ...f, size: e.target.value }))}
                        required
                      >
                        <option value="">Selecione</option>
                        {TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="r-label">Quantidade *</label>
                      <input className="r-input" type="number" min={1} value={itemForm.quantity} onChange={e => setItemForm(f => ({ ...f, quantity: e.target.value }))} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label className="r-label">Gola</label>
                      <select className="r-select" value={itemForm.collar} onChange={e => setItemForm(f => ({ ...f, collar: e.target.value }))}>
                        <option value="">— padrão do produto —</option>
                        {GOLAS.map(g => <option key={g.val} value={g.val}>{g.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="r-label">Tecido</label>
                      <select className="r-select" value={itemForm.fabric} onChange={e => setItemForm(f => ({ ...f, fabric: e.target.value }))}>
                        <option value="">— padrão do produto —</option>
                        {TECIDOS.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label className="r-label">Observações</label>
                    <input className="r-input" value={itemForm.notes} onChange={e => setItemForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>

                  <button type="submit" className="btn-primary-r" disabled={salvando} style={{ fontSize: 13 }}>
                    + Adicionar Item
                  </button>
                </form>
              </div>
            )}

            {bloqueado && (
              <div className="alert-aviso">
                Edição de itens bloqueada — OS em produção.
              </div>
            )}

            {/* Lista de itens */}
            <div className="form-card">
              <h6>Itens ({ordem.items?.length || 0})</h6>
              {!ordem.items?.length && (
                <p className="text-muted">Nenhum item adicionado</p>
              )}
              {ordem.items?.map(item => (
                <div key={item.id} className="os-item-card">
                  <div className="os-item-title">
                    {item.productName || item.nomeProduto}
                  </div>
                  <div className="os-item-meta">
                    {item.quantity || item.quantidade}x · Tam: {item.size || item.tamanho} · Cor: {item.color || item.cor}
                    {(item.collar || item.gola) && ` · Gola: ${item.collar || item.gola}`}
                    {(item.fabric || item.tecido) && ` · Tecido: ${item.fabric || item.tecido}`}
                  </div>
                  {(item.notes || item.observacoes) && (
                    <div className="os-item-notes">
                      {item.notes || item.observacoes}
                    </div>
                  )}
                  {item.embroideries?.map(emb => (
                    <div key={emb.id} className="os-emb-line">
                      <i className="bi bi-scissors" />
                      <strong style={{ textTransform: 'capitalize' }}>{emb.local || emb.location}</strong>:&nbsp;
                      {emb.descricao || emb.description}
                      {emb.colors?.length > 0 && (
                        <span style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                          {emb.colors.map(c => (
                            <span key={c.id} title={stripHexFromName(c.name || c.nome)} style={{
                              display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
                              background: hexFromCor(c) || '#9ca3af',
                              border: '1px solid rgba(0,0,0,0.15)',
                            }} />
                          ))}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ── Coluna direita ───────────────────────── */}
          <div className="col-md-5">

            {/* Adicionar bordado */}
            {!bloqueado && (
              <div className="form-card">
                <h6>Adicionar Bordado</h6>
                <form onSubmit={adicionarBordado}>
                  <div style={{ marginBottom: 10 }}>
                    <label className="r-label">Item *</label>
                    <select className="r-select" value={embForm.itemId} onChange={e => setEmbForm(f => ({ ...f, itemId: e.target.value }))} required>
                      <option value="">Selecione o item</option>
                      {ordem.items?.map(i => (
                        <option key={i.id} value={i.id}>
                          {i.productName || i.nomeProduto} — {i.size || i.tamanho} {i.color || i.cor}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label className="r-label">Local *</label>
                    <select className="r-select" value={embForm.local} onChange={e => setEmbForm(f => ({ ...f, local: e.target.value }))}>
                      {LOCAIS.map(l => (
                        <option key={l} value={l} style={{ textTransform: 'capitalize' }}>
                          {l.charAt(0).toUpperCase() + l.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label className="r-label">Descrição</label>
                    <input className="r-input" value={embForm.descricao} onChange={e => setEmbForm(f => ({ ...f, descricao: e.target.value }))} />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label className="r-label">
                      Cores * <span className="label-hint">(Ctrl+clique, máx. 6)</span>
                    </label>
                    <select
                      className="r-select"
                      multiple
                      value={embForm.colorIds}
                      style={{ height: 100 }}
                      onChange={e => setEmbForm(f => ({ ...f, colorIds: Array.from(e.target.selectedOptions, o => o.value) }))}
                    >
                      {cores.map(c => (
                        <option key={c.id} value={c.id}>
                          {stripHexFromName(c.name || c.nome)} ({c.threadCode || c.codigoLinha})
                        </option>
                      ))}
                    </select>
                    {embForm.colorIds.length > 0 && (
                      <div className="color-chips">
                        {embForm.colorIds.map(cid => {
                          const cor = cores.find(c => String(c.id) === String(cid))
                          return cor ? (
                            <span key={cid} className="color-chip">
                              <span style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: hexFromCor(cor) || '#9ca3af',
                                border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0,
                              }} />
                              {stripHexFromName(cor.name || cor.nome)}
                            </span>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn-secondary-r" disabled={salvando} style={{ fontSize: 13 }}>
                    + Adicionar Bordado
                  </button>
                </form>
              </div>
            )}

            {/* Anexar arquivo */}
            <div className="form-card">
              <h6>Anexar Imagem / Arquivo</h6>
              <input
                type="file"
                className="r-input"
                style={{ paddingTop: 6 }}
                onChange={e => setAnexoFile(e.target.files[0])}
                accept="image/*,.pdf,.cdr,.dst"
              />
              <div style={{ marginTop: 10 }}>
                <label className="r-label">Descrição (opcional)</label>
                <input className="r-input" value={descAnexo} onChange={e => setDescAnexo(e.target.value)} />
              </div>
              <button
                className="btn-secondary-r"
                onClick={anexar}
                disabled={salvando || !anexoFile}
                style={{ marginTop: 10, fontSize: 13, width: '100%' }}
              >
                Enviar Arquivo
              </button>

              {ordem.attachments?.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p className="anexos-titulo">Anexados:</p>
                  {ordem.attachments.map(a => (
                    <div key={a.id} className="anexo-linha">
                      📎 {(a.caminho || a.filePath || '').split(/[/\\]/).pop()}
                      {(a.descricao || a.description) && (
                        <span className="anexo-desc"> — {a.descricao || a.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="info-row-label">{label}</div>
      <div className="info-row-value">{value}</div>
    </div>
  )
}

export default OrdemServico
