import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { api } from '../services/api'
import { hexFromCor, stripHexFromName } from '../utils/corBordado'
import { embroideryFormToApi } from '../utils/orderMappers'

const STATUS_LABEL = { OPEN: 'Aberto', IN_PROGRESS: 'Em andamento', DONE: 'Concluído', CANCELLED: 'Cancelado' }
const STATUS_CLASS  = { OPEN: 'badge-open', IN_PROGRESS: 'badge-progress', DONE: 'badge-done', CANCELLED: 'badge-inativo' }
const STATUS_OPTIONS = [
  { val: 'OPEN',        label: 'Aberto' },
  { val: 'IN_PROGRESS', label: 'Em andamento' },
  { val: 'DONE',        label: 'Concluído' },
  { val: 'CANCELLED',   label: 'Cancelado' },
]

function diasParaPrazo(deadline) {
  if (!deadline) return null
  const hoje = new Date(); hoje.setHours(0,0,0,0)
  const prazo = new Date(deadline + 'T00:00:00')
  return Math.round((prazo - hoje) / (1000 * 60 * 60 * 24))
}

const GOLAS   = [{ val: 'redonda', label: 'Redonda' }, { val: 'polo', label: 'Polo' }, { val: 'V', label: 'V' }, { val: 'canoa', label: 'Canoa' }]
const TECIDOS = [{ val: 'algodão', label: 'Algodão' }, { val: 'dry', label: 'Dry' }, { val: 'cross', label: 'Cross' }, { val: 'PV', label: 'PV' }]
const TAMANHOS = ['P', 'M', 'G', 'GG', 'G1']
const LOCAIS  = ['frente', 'costas', 'manga']

const itemInicial = { productId: '', color: '', size: '', collar: '', fabric: '', quantity: 1, notes: '' }
const embInicial  = { itemId: '', local: 'frente', descricao: '', colorIds: [] }

function Pedidos() {
  const navigate = useNavigate()

  // ── Lista de pedidos ────────────────────────────────
  const [ordens, setOrdens]     = useState([])
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [cores, setCores]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [erro, setErro]         = useState(null)

  // ── Etapa 1: formulário de criação ─────────────────
  const [etapa, setEtapa]       = useState(null) // null | 'criar' | 'editar'
  const [salvando, setSalvando] = useState(false)
  const [form, setForm]         = useState({ clientId: '', deadline: '', notes: '' })

  // ── Etapa 2: pedido recém-criado (id) ──────────────
  const [ordemAtual, setOrdemAtual] = useState(null) // objeto ordem completo

  // ── Adicionar item ─────────────────────────────────
  const [itemForm, setItemForm] = useState(itemInicial)

  // ── Adicionar bordado ──────────────────────────────
  const [embForm, setEmbForm]   = useState(embInicial)

  // ── Anexo ──────────────────────────────────────────
  const [anexoFile, setAnexoFile]   = useState(null)
  const [descAnexo, setDescAnexo]   = useState('')

  // ────────────────────────────────────────────────────
  const carregarLista = () => {
    setLoading(true)
    Promise.all([api.ordens.listar(), api.clientes.listar()])
      .then(([ords, cls]) => {
        setOrdens([...ords].sort((a, b) => Number(b.id) - Number(a.id)))
        setClientes(cls)
      })
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }

  const mudarStatus = async (orderId, novoStatus) => {
    try {
      await api.ordens.atualizarStatus(orderId, novoStatus)
      carregarLista()
    } catch (e) { alert('Erro ao atualizar status: ' + e.message) }
  }

  const carregarOrdemAtual = (id) =>
    api.ordens.buscar(id).then(setOrdemAtual).catch(e => alert('Erro ao recarregar pedido: ' + e.message))

  useEffect(() => {
    carregarLista()
    api.produtos.listar().then(setProdutos).catch(() => {})
    api.cores.listar().then(setCores).catch(() => {})
  }, [])

  // ── Autopreenchimento ao selecionar produto ─────────
  const handleProdutoChange = (produtoId) => {
    const prod = produtos.find(p => String(p.id) === String(produtoId))
    setItemForm(f => ({
      ...f,
      productId: produtoId,
      color:   prod?.baseColor  || prod?.corBase  || '',
      collar:  prod?.collar     || prod?.gola      || '',
      fabric:  prod?.fabric     || prod?.tecido    || '',
    }))
  }

  // ── Criar pedido (etapa 1) ──────────────────────────
  const handleCriarPedido = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try {
      const nova = await api.ordens.criar({
        clientId: Number(form.clientId),
        deadline: form.deadline || null,
        notes:    form.notes    || null,
      })
      await carregarOrdemAtual(nova.id)
      setEtapa('editar')
      carregarLista()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  // ── Adicionar item ──────────────────────────────────
  const adicionarItem = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try {
      await api.ordens.adicionarItem(ordemAtual.id, {
        ...itemForm,
        productId: Number(itemForm.productId),
        quantity:  Number(itemForm.quantity),
      })
      setItemForm(itemInicial)
      await carregarOrdemAtual(ordemAtual.id)
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  // ── Adicionar bordado ────────────────────────────────
  const adicionarBordado = async (e) => {
    e.preventDefault()
    if (embForm.colorIds.length === 0) return alert('Selecione ao menos uma cor')
    if (embForm.colorIds.length > 6)  return alert('Máximo 6 cores por bordado')
    setSalvando(true)
    try {
      await api.ordens.adicionarBordado(ordemAtual.id, embForm.itemId, embroideryFormToApi(embForm))
      setEmbForm(embInicial)
      await carregarOrdemAtual(ordemAtual.id)
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  // ── Anexar arquivo ───────────────────────────────────
  const anexar = async () => {
    if (!anexoFile) return alert('Selecione um arquivo')
    setSalvando(true)
    try {
      const fd = new FormData()
      fd.append('file', anexoFile)
      if (descAnexo) fd.append('descricao', descAnexo)
      await api.ordens.anexar(ordemAtual.id, fd)
      setAnexoFile(null)
      setDescAnexo('')
      await carregarOrdemAtual(ordemAtual.id)
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  const fecharModal = () => {
    setEtapa(null)
    setOrdemAtual(null)
    setForm({ clientId: '', deadline: '', notes: '' })
    setItemForm(itemInicial)
    setEmbForm(embInicial)
    setAnexoFile(null)
    setDescAnexo('')
  }

  // ── Render ───────────────────────────────────────────
  return (
    <div>
      <Header />

      <div className="action-bar">
        <button className="action-bar-btn" onClick={() => setEtapa('criar')}>
          <i className="bi bi-journal-plus"></i>
          Novo Pedido
        </button>
      </div>

      {/* ══ MODAL ══════════════════════════════════════ */}
      {etapa && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) fecharModal() }}
        >
          <div
            className="modal-box"
            style={{ maxWidth: 860, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Cabeçalho */}
            <div className="modal-header">
              <span className="modal-titulo">
                {etapa === 'criar' ? 'Novo Pedido' : `Pedido #${ordemAtual?.id} — ${ordemAtual?.clientName || ''}`}
              </span>
              <button className="modal-fechar" onClick={fecharModal} type="button">×</button>
            </div>

            {/* ── Etapa 1: dados básicos ─────────────── */}
            {etapa === 'criar' && (
              <form onSubmit={handleCriarPedido}>
                <div style={{ marginBottom: 12 }}>
                  <label className="r-label">Cliente *</label>
                  <select
                    className="r-select"
                    value={form.clientId}
                    onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                    required
                  >
                    <option value="">Selecione</option>
                    {clientes.filter(c => c.active).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label className="r-label">Prazo de entrega</label>
                  <input
                    type="date"
                    className="r-input"
                    value={form.deadline}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="r-label">Observações</label>
                  <textarea
                    className="r-textarea"
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn-primary-r" disabled={salvando}>
                    {salvando ? 'Criando...' : 'Criar Pedido →'}
                  </button>
                  <button type="button" className="btn-secondary-r" onClick={fecharModal}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* ── Etapa 2: itens, bordados e anexos ──── */}
            {etapa === 'editar' && ordemAtual && (
              <div className="row g-3">

                {/* ── Coluna esquerda ─────────────────── */}
                <div className="col-md-7">

                  {/* Adicionar item */}
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
                          {produtos.map(p => (
                            <option key={p.id} value={p.id}>{p.name || p.nome}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label className="r-label">Cor *</label>
                          <input
                            className="r-input"
                            value={itemForm.color}
                            onChange={e => setItemForm(f => ({ ...f, color: e.target.value }))}
                            required
                            placeholder="Ex: Branco"
                          />
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
                          <input
                            className="r-input"
                            type="number"
                            min={1}
                            value={itemForm.quantity}
                            onChange={e => setItemForm(f => ({ ...f, quantity: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label className="r-label">Gola</label>
                          <select
                            className="r-select"
                            value={itemForm.collar}
                            onChange={e => setItemForm(f => ({ ...f, collar: e.target.value }))}
                          >
                            <option value="">— padrão do produto —</option>
                            {GOLAS.map(g => <option key={g.val} value={g.val}>{g.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="r-label">Tecido</label>
                          <select
                            className="r-select"
                            value={itemForm.fabric}
                            onChange={e => setItemForm(f => ({ ...f, fabric: e.target.value }))}
                          >
                            <option value="">— padrão do produto —</option>
                            {TECIDOS.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <label className="r-label">Observações</label>
                        <input
                          className="r-input"
                          value={itemForm.notes}
                          onChange={e => setItemForm(f => ({ ...f, notes: e.target.value }))}
                        />
                      </div>

                      <button type="submit" className="btn-primary-r" disabled={salvando} style={{ fontSize: 13 }}>
                        + Adicionar Item
                      </button>
                    </form>
                  </div>

                  {/* Lista de itens */}
                  <div className="form-card">
                    <h6>Itens ({ordemAtual.items?.length || 0})</h6>
                    {!ordemAtual.items?.length && (
                      <p className="text-muted">Nenhum item adicionado</p>
                    )}
                    {ordemAtual.items?.map(item => (
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
                          <div className="os-item-notes">{item.notes || item.observacoes}</div>
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

                {/* ── Coluna direita ───────────────────── */}
                <div className="col-md-5">

                  {/* Adicionar bordado */}
                  <div className="form-card">
                    <h6>Adicionar Bordado</h6>
                    <form onSubmit={adicionarBordado}>
                      <div style={{ marginBottom: 10 }}>
                        <label className="r-label">Item *</label>
                        <select
                          className="r-select"
                          value={embForm.itemId}
                          onChange={e => setEmbForm(f => ({ ...f, itemId: e.target.value }))}
                          required
                        >
                          <option value="">Selecione o item</option>
                          {ordemAtual.items?.map(i => (
                            <option key={i.id} value={i.id}>
                              {i.productName || i.nomeProduto} — {i.size || i.tamanho} {i.color || i.cor}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: 10 }}>
                        <label className="r-label">Local *</label>
                        <select
                          className="r-select"
                          value={embForm.local}
                          onChange={e => setEmbForm(f => ({ ...f, local: e.target.value }))}
                        >
                          {LOCAIS.map(l => (
                            <option key={l} value={l}>
                              {l.charAt(0).toUpperCase() + l.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: 10 }}>
                        <label className="r-label">Descrição</label>
                        <input
                          className="r-input"
                          value={embForm.descricao}
                          onChange={e => setEmbForm(f => ({ ...f, descricao: e.target.value }))}
                        />
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
                      <input
                        className="r-input"
                        value={descAnexo}
                        onChange={e => setDescAnexo(e.target.value)}
                      />
                    </div>
                    <button
                      className="btn-secondary-r"
                      onClick={anexar}
                      disabled={salvando || !anexoFile}
                      style={{ marginTop: 10, fontSize: 13, width: '100%' }}
                    >
                      Enviar Arquivo
                    </button>

                    {ordemAtual.attachments?.length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <p className="anexos-titulo">Anexados:</p>
                        {ordemAtual.attachments.map(a => (
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

                  {/* Botão de conclusão */}
                  <button
                    className="btn-primary-r"
                    onClick={() => { fecharModal(); navigate(`/ordem-servico/${ordemAtual.id}`) }}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    <i className="bi bi-check2-circle"></i> Concluir e ver detalhes
                  </button>
                  <button
                    className="btn-secondary-r"
                    onClick={fecharModal}
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    Fechar
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TABELA DE PEDIDOS ═══════════════════════════ */}
      <div className="page-content">
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
                {ordens.map(o => {
                  const concluido = o.status === 'DONE' || o.status === 'CANCELLED'
                  const dias = !concluido ? diasParaPrazo(o.deadline) : null
                  const alertaPrazo = dias !== null && dias >= 0 && dias <= 7
                  const prazoVencido = dias !== null && dias < 0
                  return (
                  <tr key={o.id}>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>#{o.id}</td>
                    <td style={{ fontWeight: 600 }}>{o.clientName}</td>
                    <td>
                      <select
                        className={`badge-status badge-select ${STATUS_CLASS[o.status] || 'badge-inativo'}`}
                        value={o.status}
                        onChange={e => mudarStatus(o.id, e.target.value)}
                        title="Alterar status"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.val} value={s.val}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {alertaPrazo && (
                          <span title={`Faltam ${dias} dia${dias !== 1 ? 's' : ''} para o prazo`}
                            style={{ fontSize: 15, lineHeight: 1 }}>🕐</span>
                        )}
                        {prazoVencido && (
                          <span title={`Prazo vencido há ${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? 's' : ''}`}
                            style={{ fontSize: 15, lineHeight: 1 }}>⚠️</span>
                        )}
                        <span style={{ color: concluido ? '#9ca3af' : prazoVencido ? '#fca5a5' : alertaPrazo ? '#fcd34d' : undefined, fontWeight: (alertaPrazo || prazoVencido) ? 600 : undefined }}>
                          {o.deadline || '—'}
                        </span>
                      </span>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.notes || '—'}
                    </td>
                    <td>
                      <button className="btn-tabela btn-ver" onClick={() => navigate(`/ordem-servico/${o.id}`)}>
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                  )
                })}
                {ordens.length === 0 && (
                  <tr>
                    <td colSpan={6} className="table-empty">Nenhum pedido criado</td>
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
