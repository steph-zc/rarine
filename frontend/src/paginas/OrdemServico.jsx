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
const TECIDOS = [{ val: 'algodão', label: 'Algodão' }, { val: 'dry', label: 'Dry' }, { val: 'cross', label: 'Cross' }, { val: 'PV', label: 'PV' }]
const MANGAS  = [{ val: 'manga curta', label: 'Manga curta' }, { val: 'manga longa', label: 'Manga longa' }, { val: 'raglan', label: 'Raglan' }, { val: 'cavada', label: 'Cavada' }]

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
