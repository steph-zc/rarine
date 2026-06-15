import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import EstampaSelector from '../components/EstampaSelector'
import OrderItemCard from '../components/OrderItemCard'
import { api } from '../services/api'
import { orderInfoToApi } from '../utils/orderMappers'
import { estampasDoProduto } from '../utils/printLocations'

const STATUS_LABEL = { PEDIDO: 'Pedido', PRODUCAO: 'Em Produção', PRONTO: 'Pronto', ENTREGUE: 'Entregue' }
const STATUS_CLASS  = { PEDIDO: 'badge-open', PRODUCAO: 'badge-progress', PRONTO: 'badge-done', ENTREGUE: 'badge-inativo' }

// Gola / Tecido com iniciais maiúsculas
const GOLAS   = [{ val: 'redonda', label: 'Redonda' }, { val: 'polo', label: 'Polo' }, { val: 'V', label: 'V' }, { val: 'canoa', label: 'Canoa' }]
const TECIDOS = [{ val: 'algodão', label: 'Algodão' }, { val: 'dry', label: 'Dry' }, { val: 'cross', label: 'Cross' }, { val: 'PV', label: 'PV' }, { val: 'nylon leve', label: 'Nylon Leve' }, { val: 'nylon pesado', label: 'Nylon Pesado' }]
const MANGAS  = [{ val: 'manga curta', label: 'Manga curta' }, { val: 'manga longa', label: 'Manga longa' }, { val: 'raglan', label: 'Raglan' }, { val: 'cavada', label: 'Cavada' }]

// Detecta se o anexo é uma imagem (pelo tipo MIME ou extensão do arquivo)
const ehImagem = (a) => {
  const tipo = (a.fileType || a.tipo || '').toLowerCase()
  if (tipo.startsWith('image')) return true
  const nome = (a.filePath || a.caminho || '').toLowerCase()
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(nome)
}

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
  const itemInicial = { productId: '', color: '', collar: '', manga: '', fabric: '', hasPrint: false, estampas: [] }
  const [itemForm, setItemForm] = useState(itemInicial)

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
    const temBordado = !!(prod?.hasEmbroidery || prod?.hasPrint)
    const estampas = temBordado ? estampasDoProduto(prod?.applicationLocations) : []
    setItemForm(f => ({
      ...f,
      productId: produtoId,
      color:  prod?.baseColor || prod?.corBase || '',
      collar: prod?.collar    || prod?.gola    || '',
      manga:  prod?.model     || prod?.modelo  || '',
      fabric: prod?.fabric    || prod?.tecido  || '',
      hasPrint: temBordado,
      estampas,
    }))
  }

  const adicionarItem = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try {
      await api.ordens.adicionarItem(id, {
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
      carregar()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  const definirImagemFicha = async (attId) => {
    try {
      const updated = await api.ordens.definirImagemFicha(id, attId)
      setOrdem(updated)
    } catch (e) { alert('Erro: ' + e.message) }
  }

  const anexar = async () => {
    if (!anexoFile) return alert('Selecione um arquivo')
    setSalvando(true)
    try {
      const fd = new FormData()
      fd.append('file', anexoFile)
      if (descAnexo) fd.append('description', descAnexo)
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
  // RN04.03: edição de itens liberada apenas enquanto a OS está em "Pedido"
  const bloqueado = statusKey !== 'PEDIDO'

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

            {/* Itens — movido para o topo para visualização rápida */}
            <div className="form-card">
              <h6>Itens ({ordem.items?.length || 0})</h6>
              {!ordem.items?.length && (
                <p className="text-muted">Nenhum item adicionado</p>
              )}
              {ordem.items?.map(item => (
                <OrderItemCard key={item.id} item={item} />
              ))}
            </div>

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
                  <InfoRow label="Pedido"       value={`Nº ${String(ordem.id).padStart(3, '0')}`} />
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

                  <div style={{ marginBottom: 10 }}>
                    <label className="r-label">Cor *</label>
                    <input className="r-input" value={itemForm.color} onChange={e => setItemForm(f => ({ ...f, color: e.target.value }))} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label className="r-label">Gola</label>
                      <select className="r-select" value={itemForm.collar} onChange={e => setItemForm(f => ({ ...f, collar: e.target.value }))}>
                        <option value="">— padrão —</option>
                        {GOLAS.map(g => <option key={g.val} value={g.val}>{g.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="r-label">Manga</label>
                      <select className="r-select" value={itemForm.manga} onChange={e => setItemForm(f => ({ ...f, manga: e.target.value }))}>
                        <option value="">— padrão —</option>
                        {MANGAS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="r-label">Tecido</label>
                      <select className="r-select" value={itemForm.fabric} onChange={e => setItemForm(f => ({ ...f, fabric: e.target.value }))}>
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
            )}

            {bloqueado && (
              <div className="alert-aviso">
                Edição de itens bloqueada — a OS não está mais em "Pedido".
              </div>
            )}

          </div>

          {/* ── Coluna direita ───────────────────────── */}
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
                <div style={{ marginTop: 16 }}>
                  <p className="anexos-titulo" style={{ marginBottom: 2 }}>Arquivos anexados</p>
                  <p style={{ fontSize: 11, color: 'var(--cinza-texto)', margin: '0 0 10px' }}>
                    Marque uma imagem para usá-la na ficha técnica.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ordem.attachments.map(a => {
                      const nome = (a.caminho || a.filePath || '').split(/[/\\]/).pop()
                      const img = ehImagem(a)
                      const selecionada = a.id === ordem.imageAttachmentId
                      return (
                        <div
                          key={a.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 10px', borderRadius: 8,
                            border: selecionada ? '1px solid #10b981' : '1px solid var(--cinza-borda)',
                            background: selecionada ? 'rgba(16, 185, 129, 0.12)' : 'var(--branco)',
                          }}
                        >
                          <input
                            type="radio"
                            name="ficha-imagem"
                            checked={selecionada}
                            disabled={!img}
                            onChange={() => definirImagemFicha(a.id)}
                            title={img ? 'Usar esta imagem na ficha técnica' : 'Apenas imagens podem ser usadas na ficha'}
                            style={{ accentColor: 'var(--azul)', width: 16, height: 16, flexShrink: 0, cursor: img ? 'pointer' : 'not-allowed' }}
                          />
                          <span
                            style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                            onClick={() => window.open(api.ordens.fileUrl(id, a.id), '_blank')}
                            title="Clique para abrir"
                          >
                            <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--texto)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {img ? '🖼️' : '📎'} {nome}
                            </span>
                            {(a.descricao || a.description) && (
                              <span style={{ display: 'block', fontSize: 12, color: 'var(--texto-secundario)', fontWeight: 500 }}>
                                {a.descricao || a.description}
                              </span>
                            )}
                          </span>
                          {selecionada && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              ✓ Na ficha
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
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
