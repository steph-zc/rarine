import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import EstampaSelector from '../components/EstampaSelector'
import OrderItemCard from '../components/OrderItemCard'
import { api } from '../services/api'
import { estampasDoProduto } from '../utils/printLocations'

const STATUS_CLASS  = { PEDIDO: 'badge-open', PRODUCAO: 'badge-progress', PRONTO: 'badge-done', ENTREGUE: 'badge-inativo' }
const STATUS_OPTIONS = [
  { val: 'PEDIDO',   label: 'Pedido' },
  { val: 'PRODUCAO', label: 'Em Produção' },
  { val: 'PRONTO',   label: 'Pronto' },
  { val: 'ENTREGUE', label: 'Entregue' },
]

function diasParaPrazo(deadline) {
  if (!deadline) return null
  const hoje = new Date(); hoje.setHours(0,0,0,0)
  const prazo = new Date(deadline + 'T00:00:00')
  return Math.round((prazo - hoje) / (1000 * 60 * 60 * 24))
}

// RN04.01: prazo sugerido = +15 dias úteis a partir de hoje (editável)
function prazoSugerido() {
  const d = new Date(); d.setHours(0, 0, 0, 0)
  let restantes = 15
  while (restantes > 0) {
    d.setDate(d.getDate() + 1)
    const dia = d.getDay()
    if (dia !== 0 && dia !== 6) restantes--
  }
  // Formata em data local (evita o deslocamento de fuso do toISOString/UTC)
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

const GOLAS   = [{ val: 'redonda', label: 'Redonda' }, { val: 'polo', label: 'Polo' }, { val: 'V', label: 'V' }, { val: 'canoa', label: 'Canoa' }]
const TECIDOS = [{ val: 'algodão', label: 'Algodão' }, { val: 'dry', label: 'Dry' }, { val: 'cross', label: 'Cross' }, { val: 'PV', label: 'PV' }, { val: 'nylon leve', label: 'Nylon Leve' }, { val: 'nylon pesado', label: 'Nylon Pesado' }]
const MANGAS  = [{ val: 'manga curta', label: 'Manga curta' }, { val: 'manga longa', label: 'Manga longa' }, { val: 'raglan', label: 'Raglan' }, { val: 'cavada', label: 'Cavada' }]

const itemInicial = { productId: '', color: '', collar: '', manga: '', fabric: '', hasPrint: false, estampas: [] }

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
    const temBordado = !!(prod?.hasEmbroidery || prod?.hasPrint)
    const estampas = temBordado ? estampasDoProduto(prod?.applicationLocations) : []
    setItemForm(f => ({
      ...f,
      productId: produtoId,
      color:   prod?.baseColor  || prod?.corBase  || '',
      collar:  prod?.collar     || prod?.gola      || '',
      manga:   prod?.model      || prod?.modelo    || '',
      fabric:  prod?.fabric     || prod?.tecido    || '',
      hasPrint: temBordado,
      estampas,
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
        productId: Number(itemForm.productId),
        color:     itemForm.color || null,
        collar:    itemForm.collar || null,
        manga:     itemForm.manga || null,
        fabric:    itemForm.fabric || null,
        hasPrint:  itemForm.hasPrint,
        estampas:  itemForm.hasPrint
          ? itemForm.estampas.map(es => ({ location: es.location, description: es.descricao?.trim() || null, colorIds: es.colorIds.map(Number) }))
          : [],
      })
      setItemForm(itemInicial)
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
      if (descAnexo) fd.append('description', descAnexo)
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
    setAnexoFile(null)
    setDescAnexo('')
  }

  // ── Render ───────────────────────────────────────────
  return (
    <div>
      <Header />

      <div className="action-bar">
        <button
          className="action-bar-btn"
          onClick={() => { setForm({ clientId: '', deadline: prazoSugerido(), notes: '' }); setEtapa('criar') }}
        >
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

                      <div style={{ marginBottom: 10 }}>
                        <label className="r-label">Cor *</label>
                        <input
                          className="r-input"
                          value={itemForm.color}
                          onChange={e => setItemForm(f => ({ ...f, color: e.target.value }))}
                          required
                          placeholder="Ex: Branco"
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label className="r-label">Gola</label>
                          <select
                            className="r-select"
                            value={itemForm.collar}
                            onChange={e => setItemForm(f => ({ ...f, collar: e.target.value }))}
                          >
                            <option value="">— padrão —</option>
                            {GOLAS.map(g => <option key={g.val} value={g.val}>{g.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="r-label">Manga</label>
                          <select
                            className="r-select"
                            value={itemForm.manga}
                            onChange={e => setItemForm(f => ({ ...f, manga: e.target.value }))}
                          >
                            <option value="">— padrão —</option>
                            {MANGAS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="r-label">Tecido</label>
                          <select
                            className="r-select"
                            value={itemForm.fabric}
                            onChange={e => setItemForm(f => ({ ...f, fabric: e.target.value }))}
                          >
                            <option value="">— padrão —</option>
                            {TECIDOS.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <label className="r-checkbox">
                          <input
                            type="checkbox"
                            checked={itemForm.hasPrint}
                            onChange={e => setItemForm(f => ({ ...f, hasPrint: e.target.checked, estampas: e.target.checked ? f.estampas : [] }))}
                          />
                          Tem estampa / bordado
                        </label>
                        {itemForm.hasPrint && (
                          <EstampaSelector
                            cores={cores}
                            estampas={itemForm.estampas}
                            onChange={est => setItemForm(f => ({ ...f, estampas: est }))}
                          />
                        )}
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
                      <OrderItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>

                {/* ── Coluna direita ───────────────────── */}
                <div className="col-md-5">

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
                  const concluido = o.status === 'ENTREGUE'
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
                      <button
                        className="btn-tabela btn-ficha"
                        onClick={() => window.open(api.ordens.relatorioUrl(o.id), '_blank')}
                        title="Gerar ficha técnica em PDF"
                      >
                        <i className="bi bi-file-earmark-pdf"></i> Ficha técnica
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
