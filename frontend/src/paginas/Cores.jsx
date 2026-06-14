import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { api } from '../services/api'
import { extractHexFromName, stripHexFromName } from '../utils/corBordado'

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
}
function isLight(hex) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return true
  const { r, g, b } = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 128
}

const formInicial = { name: '', threadCode: '', hexColor: '#3b82f6' }

function Cores() {
  const [cores, setCores]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [erro, setErro]         = useState(null)
  const [modal, setModal]       = useState(null) // null | 'novo' | 'editar'
  const [editando, setEditando] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm]         = useState(formInicial)
  const [rgb, setRgb]           = useState({ r: 59, g: 130, b: 246 })

  const handleSlider = (canal, valor) => {
    const novoRgb = { ...rgb, [canal]: Number(valor) }
    setRgb(novoRgb)
    setForm(f => ({ ...f, hexColor: rgbToHex(novoRgb.r, novoRgb.g, novoRgb.b) }))
  }
  const handleHexInput = (hex) => {
    setForm(f => ({ ...f, hexColor: hex }))
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) setRgb(hexToRgb(hex))
  }

  const carregar = () => {
    setLoading(true)
    api.cores.listar()
      .then(setCores)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    const hex = '#3b82f6'
    setForm({ name: '', threadCode: '', hexColor: hex })
    setRgb(hexToRgb(hex))
    setEditando(null)
    setModal('novo')
  }

  const abrirEditar = (cor) => {
    const hex = cor.hexColor || extractHexFromName(cor.name) || '#3b82f6'
    setForm({ name: stripHexFromName(cor.name), threadCode: cor.threadCode, hexColor: hex })
    setRgb(hexToRgb(hex))
    setEditando(cor.id)
    setModal('editar')
  }

  const fecharModal = () => { setModal(null); setEditando(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // RN03.01: alerta consultivo de duplicidade (nome ou código) — não bloqueia
    const nomeNovo = form.name.trim().toLowerCase()
    const codigoNovo = form.threadCode.trim().toLowerCase()
    const duplicada = cores.find(c =>
      c.id !== editando && (
        stripHexFromName(c.name).trim().toLowerCase() === nomeNovo ||
        (c.threadCode || '').trim().toLowerCase() === codigoNovo
      )
    )
    if (duplicada) {
      const ok = window.confirm(
        `Já existe uma cor parecida cadastrada:\n\n` +
        `• ${stripHexFromName(duplicada.name)} (código ${duplicada.threadCode})\n\n` +
        `Deseja cadastrar mesmo assim?`
      )
      if (!ok) return
    }

    setSalvando(true)
    try {
      const payload = { name: form.name.trim(), threadCode: form.threadCode, hexColor: form.hexColor }
      if (editando) await api.cores.editar(editando, payload)
      else await api.cores.criar(payload)
      fecharModal()
      carregar()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  const handleExcluir = async (cor) => {
    if (!window.confirm(`Excluir a cor "${stripHexFromName(cor.name)}"?`)) return
    try {
      await api.cores.excluir(cor.id)
      carregar()
    } catch (e) { alert('Erro ao excluir: ' + e.message) }
  }

  const Formulario = (
    <form onSubmit={handleSubmit}>
      {/* Preview */}
      <div style={{
        background: form.hexColor, borderRadius: 10, height: 60, marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid rgba(0,0,0,0.08)', transition: 'background 0.1s',
      }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: isLight(form.hexColor) ? '#1a2233' : '#fff' }}>
          {form.name || 'Prévia da cor'}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label className="r-label">Nome *</label>
        <input className="r-input" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required placeholder="Ex: Azul Royal" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className="r-label">Código da Linha *</label>
        <input className="r-input" value={form.threadCode}
          onChange={e => setForm(f => ({ ...f, threadCode: e.target.value }))}
          required placeholder="Ex: 798" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label className="r-label">Cor</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          {[
            { canal: 'r', label: 'R', cor: '#ef4444' },
            { canal: 'g', label: 'G', cor: '#22c55e' },
            { canal: 'b', label: 'B', cor: '#3b82f6' },
          ].map(({ canal, label, cor }) => (
            <div key={canal} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 14, fontSize: 12, fontWeight: 700, color: cor, flexShrink: 0 }}>{label}</span>
              <input type="range" min={0} max={255} value={rgb[canal]}
                onChange={e => handleSlider(canal, e.target.value)}
                style={{ flex: 1, accentColor: cor, cursor: 'pointer' }} />
              <span style={{ width: 28, fontSize: 12, color: '#374151', textAlign: 'right', flexShrink: 0 }}>
                {rgb[canal]}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="color" value={form.hexColor} onChange={e => handleHexInput(e.target.value)}
            style={{ width: 40, height: 36, padding: 2, border: '1.5px solid var(--cinza-borda)', borderRadius: 6, cursor: 'pointer' }} />
          <input className="r-input"
            style={{ maxWidth: 110, fontFamily: 'monospace', textTransform: 'uppercase' }}
            value={form.hexColor} onChange={e => handleHexInput(e.target.value)}
            placeholder="#000000" maxLength={7} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn-primary-r" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" className="btn-secondary-r" onClick={fecharModal}>Cancelar</button>
      </div>
    </form>
  )

  return (
    <div>
      <Header />

      <div className="action-bar">
        <button className="action-bar-btn" onClick={abrirNovo}>
          <i className="bi bi-plus-lg"></i>
          Nova Cor
        </button>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) fecharModal() }}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-titulo">
                {modal === 'editar' ? 'Editar Cor' : 'Nova Cor de Bordado'}
              </span>
              <button className="modal-fechar" onClick={fecharModal} type="button">×</button>
            </div>
            {Formulario}
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
                  <th>#</th><th>Cor</th><th>Nome</th><th>Código da Linha</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cores.map(c => {
                  const hex = c.hexColor || extractHexFromName(c.name) || '#cbd5e1'
                  const nomeExibicao = stripHexFromName(c.name)
                  return (
                    <tr key={c.id}>
                      <td style={{ color: '#6b7280', fontSize: 12 }}>{c.id}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', width: 28, height: 28, borderRadius: 6,
                          background: hex, border: '1.5px solid rgba(0,0,0,0.10)',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.12)', verticalAlign: 'middle',
                        }} title={hex} />
                      </td>
                      <td style={{ fontWeight: 600 }}>{nomeExibicao}</td>
                      <td>
                        <code style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                          {c.threadCode}
                        </code>
                      </td>
                      <td>
                        <button className="btn-tabela btn-editar" onClick={() => abrirEditar(c)}>Editar</button>
                        <button className="btn-tabela btn-inativar" onClick={() => handleExcluir(c)}>Excluir</button>
                      </td>
                    </tr>
                  )
                })}
                {cores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="table-empty">Nenhuma cor cadastrada</td>
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

export default Cores
