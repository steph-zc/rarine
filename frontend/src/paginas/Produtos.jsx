import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { api } from '../services/api'
import { productFormToApi } from '../utils/apiMappers'

const MODELOS = [
  { val: 'manga curta', label: 'Manga Curta' },
  { val: 'manga longa', label: 'Manga Longa' },
  { val: 'raglan',      label: 'Raglan' },
  { val: 'cavada',      label: 'Cavada' },
]
const GOLAS = [
  { val: 'redonda', label: 'Redonda' },
  { val: 'polo',    label: 'Polo' },
  { val: 'V',       label: 'V' },
  { val: 'canoa',   label: 'Canoa' },
]
const TECIDOS = [
  { val: 'algodão', label: 'Algodão' },
  { val: 'dry',     label: 'Dry' },
  { val: 'cross',   label: 'Cross' },
  { val: 'PV',      label: 'PV' },
]
const TIPOS = [
  { val: 'camiseta', label: 'Camiseta' },
  { val: 'moletom',  label: 'Moletom' },
  { val: 'jaqueta',  label: 'Jaqueta' },
  { val: 'outro',    label: 'Outro' },
]

// Locais de aplicação de bordado/estampa (PRODUTO_LOCAL_APLICACAO)
const LOCAIS_APLICACAO = [
  { location: 'frente', size: 'pequeno', label: 'Frente pequeno' },
  { location: 'frente', size: 'grande',  label: 'Frente grande' },
  { location: 'costas', size: 'pequeno', label: 'Costas pequeno' },
  { location: 'costas', size: 'grande',  label: 'Costas grande' },
  { location: 'manga',  size: null,      label: 'Manga' },
]
const chaveLocal = (l) => `${l.location}-${l.size || ''}`
const rotuloLocal = (l) => {
  const achado = LOCAIS_APLICACAO.find(o => chaveLocal(o) === chaveLocal(l))
  if (achado) return achado.label
  return l.size ? `${l.location} ${l.size}` : l.location
}

const formInicial = { name: '', type: 'camiseta', model: '', collar: '', fabric: '', baseColor: '', hasEmbroideryOrPrint: false, applicationLocations: [] }

function Produtos() {
  const [produtos, setProdutos]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [erro, setErro]           = useState(null)
  const [modal, setModal]         = useState(null) // null | 'novo' | 'editar'
  const [editando, setEditando]   = useState(null)
  const [salvando, setSalvando]   = useState(false)
  const [form, setForm]           = useState(formInicial)

  const carregar = () => {
    setLoading(true)
    api.produtos.listar()
      .then(setProdutos)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setForm(formInicial)
    setEditando(null)
    setModal('novo')
  }

  const abrirEditar = (p) => {
    setForm({
      name: p.name || '',
      type: p.type || 'camiseta',
      model: p.model || '',
      collar: p.collar || '',
      fabric: p.fabric || '',
      baseColor: p.baseColor || '',
      hasEmbroideryOrPrint: p.hasEmbroidery || p.hasPrint || false,
      applicationLocations: (p.applicationLocations || []).map(l => ({ location: l.location, size: l.size ?? null })),
    })
    setEditando(p.id)
    setModal('editar')
  }

  const toggleLocalAplicacao = (opt) => {
    setForm(f => {
      const existe = f.applicationLocations.some(l => chaveLocal(l) === chaveLocal(opt))
      return {
        ...f,
        applicationLocations: existe
          ? f.applicationLocations.filter(l => chaveLocal(l) !== chaveLocal(opt))
          : [...f.applicationLocations, { location: opt.location, size: opt.size }],
      }
    })
  }

  const fecharModal = () => { setModal(null); setEditando(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try {
      const payload = productFormToApi(form)
      if (editando) await api.produtos.editar(editando, payload)
      else await api.produtos.criar(payload)
      fecharModal()
      carregar()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const labelTipo   = (val) => TIPOS.find(t => t.val === val)?.label   || val || '—'
  const labelModelo = (val) => MODELOS.find(m => m.val === val)?.label || val || '—'
  const labelGola   = (val) => GOLAS.find(g => g.val === val)?.label   || val || '—'
  const labelTecido = (val) => TECIDOS.find(t => t.val === val)?.label || val || '—'

  const FormularioProduto = (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="r-label">Nome *</label>
          <input className="r-input" value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>

        <div>
          <label className="r-label">Tipo *</label>
          <select className="r-select" value={form.type} onChange={e => set('type', e.target.value)} required>
            {TIPOS.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="r-label">Modelo *</label>
          <select className="r-select" value={form.model} onChange={e => set('model', e.target.value)} required>
            <option value="">Selecione</option>
            {MODELOS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
          </select>
        </div>

        <div>
          <label className="r-label">Gola *</label>
          <select className="r-select" value={form.collar} onChange={e => set('collar', e.target.value)} required>
            <option value="">Selecione</option>
            {GOLAS.map(g => <option key={g.val} value={g.val}>{g.label}</option>)}
          </select>
        </div>

        <div>
          <label className="r-label">Tecido *</label>
          <select className="r-select" value={form.fabric} onChange={e => set('fabric', e.target.value)} required>
            <option value="">Selecione</option>
            {TECIDOS.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="r-label">Cor Base *</label>
          <input className="r-input" value={form.baseColor} onChange={e => set('baseColor', e.target.value)} required />
        </div>

      </div>

      <div style={{ marginBottom: 20 }}>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.hasEmbroideryOrPrint}
            onChange={e => set('hasEmbroideryOrPrint', e.target.checked)}
            style={{ accentColor: 'var(--azul)', width: 15, height: 15 }}
          />
          Possui bordado / estampa
        </label>

        {form.hasEmbroideryOrPrint && (
          <div style={{ marginTop: 10 }}>
            <label className="r-label">Locais de aplicação</label>
            <div className="estampa-locais">
              {LOCAIS_APLICACAO.map(opt => {
                const ativo = form.applicationLocations.some(l => chaveLocal(l) === chaveLocal(opt))
                return (
                  <button
                    type="button"
                    key={chaveLocal(opt)}
                    className={`estampa-chip ${ativo ? 'ativo' : ''}`}
                    onClick={() => toggleLocalAplicacao(opt)}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn-primary-r" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" className="btn-secondary-r" onClick={fecharModal}>
          Cancelar
        </button>
      </div>
    </form>
  )

  return (
    <div>
      <Header />

      <div className="action-bar">
        <button className="action-bar-btn" onClick={abrirNovo}>
          <i className="bi bi-plus-lg"></i>
          Novo Produto
        </button>
      </div>

      {/* Modal flutuante — novo ou editar */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) fecharModal() }}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-titulo">
                {modal === 'editar' ? 'Editar Produto' : 'Novo Produto'}
              </span>
              <button className="modal-fechar" onClick={fecharModal} type="button">×</button>
            </div>
            {FormularioProduto}
          </div>
        </div>
      )}

      <div className="page-content">
        {loading && <p className="loading-text">Carregando...</p>}
        {erro && <div className="alert-erro">{erro}</div>}

        {!loading && !erro && (
          <div className="r-table-wrap">
            <table className="r-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Modelo</th>
                  <th>Gola</th>
                  <th>Tecido</th>
                  <th>Cor Base</th>
                  <th>Bordado/Estampa</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{labelTipo(p.type)}</td>
                    <td>{labelModelo(p.model)}</td>
                    <td>{labelGola(p.collar)}</td>
                    <td>{labelTecido(p.fabric)}</td>
                    <td>{p.baseColor || '—'}</td>
                    <td>
                      {(p.hasEmbroidery || p.hasPrint) ? (
                        <span style={{ color: '#065f46', fontWeight: 600 }}>
                          Sim
                          {p.applicationLocations?.length > 0 && (
                            <span style={{ color: '#6b7280', fontWeight: 400, fontSize: 12 }}>
                              {' — '}{p.applicationLocations.map(rotuloLocal).join(', ')}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      )}
                    </td>
                    <td>
                      <button className="btn-tabela btn-editar" onClick={() => abrirEditar(p)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {produtos.length === 0 && (
                  <tr>
                    <td colSpan={9} className="table-empty">Nenhum produto cadastrado</td>
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

export default Produtos
