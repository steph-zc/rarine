import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { api } from '../services/api'
import { clientApiToForm, clientFormToApi } from '../utils/apiMappers'
import { formatarCnpj, formatarTelefone } from '../utils/formatacao'
import {
  validarCnpj,
  validarEmail,
  validarTelefone,
  mensagemCnpjInvalido,
  mensagemEmailInvalido,
  mensagemTelefoneInvalido,
} from '../utils/validacao'

const FORM_INICIAL = {
  nome: '', telefone: '', email: '', cidade: '',
  escola: '', nomeFilho: '',
  razaoSocial: '', nomeFantasia: '', cnpj: '',
  inscricaoEstadual: '', nomeResponsavel: '', telResponsavel: '',
}

const MASCARAS = {
  telefone: formatarTelefone,
  telResponsavel: formatarTelefone,
  cnpj: formatarCnpj,
}

function CadastrarClientes() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editando = !!id

  const [tipo, setTipo] = useState('PF')
  const [loading, setLoading] = useState(editando)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)

  useEffect(() => {
    if (!editando) return
    api.clientes.buscar(id)
      .then(c => {
        setTipo(c.type || 'PF')
        setForm(clientApiToForm(c))
      })
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [id, editando])

  const handleChange = (e) => {
    const { name, value } = e.target
    const formatar = MASCARAS[name]
    setForm(f => ({ ...f, [name]: formatar ? formatar(value) : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(null)

    if (!validarTelefone(form.telefone)) {
      setErro(mensagemTelefoneInvalido())
      return
    }
    if (!validarEmail(form.email)) {
      setErro(mensagemEmailInvalido())
      return
    }
    if (tipo === 'PJ') {
      if (!validarCnpj(form.cnpj)) {
        setErro(mensagemCnpjInvalido())
        return
      }
      if (!validarTelefone(form.telResponsavel)) {
        setErro('Informe um telefone válido para o responsável no formato (00) 0 0000-0000.')
        return
      }
    }

    setSalvando(true)
    try {
      const payload = clientFormToApi(tipo, form)
      if (editando) await api.clientes.editar(id, payload)
      else await api.clientes.criar(payload)
      navigate('/clientes')
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <><Header /><p className="loading-text page-loading">Carregando...</p></>

  return (
    <div className="page-shell">
      <Header />
      <div className="page-title-bar">{editando ? 'Editar Cliente' : 'Cadastro de Clientes'}</div>

      <div className="page-content page-content--narrow">
        {erro && <div className="alert-erro">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            <h6>Tipo de Cliente</h6>
            <div className="tipo-radio-group">
              {[['PF', 'Pessoa Física'], ['PJ', 'Pessoa Jurídica']].map(([val, label]) => (
                <label key={val} className={`tipo-radio${tipo === val ? ' tipo-radio--active' : ''}`}>
                  <input
                    type="radio"
                    name="tipo"
                    value={val}
                    checked={tipo === val}
                    onChange={() => setTipo(val)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-card">
            <h6>Contato</h6>
            <div className="form-grid-2">
              <Field label="Telefone *">
                <input
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  className="r-input"
                  placeholder="(00) 0 0000-0000"
                  required
                />
              </Field>
              <Field label="E-mail *">
                <input type="email" name="email" value={form.email} onChange={handleChange} className="r-input" required />
              </Field>
            </div>
          </div>

          {tipo === 'PF' && (
            <div className="form-card">
              <h6>Dados Pessoa Física</h6>
              <div className="form-grid-2">
                <Field label="Nome *">
                  <input name="nome" value={form.nome} onChange={handleChange} className="r-input" required />
                </Field>
                <Field label="Cidade *">
                  <input name="cidade" value={form.cidade} onChange={handleChange} className="r-input" required />
                </Field>
                <Field label="Escola">
                  <input name="escola" value={form.escola} onChange={handleChange} className="r-input" />
                </Field>
                <Field label="Nome do Filho(a)">
                  <input name="nomeFilho" value={form.nomeFilho} onChange={handleChange} className="r-input" />
                </Field>
              </div>
            </div>
          )}

          {tipo === 'PJ' && (
            <div className="form-card">
              <h6>Dados Pessoa Jurídica</h6>
              <div className="form-grid-2">
                <Field label="Razão Social *">
                  <input name="razaoSocial" value={form.razaoSocial} onChange={handleChange} className="r-input" required />
                </Field>
                <Field label="Nome Fantasia *">
                  <input name="nomeFantasia" value={form.nomeFantasia} onChange={handleChange} className="r-input" required />
                </Field>
                <Field label="CNPJ *">
                  <input
                    name="cnpj"
                    value={form.cnpj}
                    onChange={handleChange}
                    className="r-input"
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </Field>
                <Field label="Inscrição Estadual">
                  <input name="inscricaoEstadual" value={form.inscricaoEstadual} onChange={handleChange} className="r-input" />
                </Field>
                <Field label="Nome do Responsável *">
                  <input name="nomeResponsavel" value={form.nomeResponsavel} onChange={handleChange} className="r-input" required />
                </Field>
                <Field label="Telefone do Responsável *">
                  <input
                    name="telResponsavel"
                    value={form.telResponsavel}
                    onChange={handleChange}
                    className="r-input"
                    placeholder="(00) 0 0000-0000"
                    required
                  />
                </Field>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary-r" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" disabled={salvando} className="btn-primary-r btn-primary-r--wide">
              {salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="r-label">{label}</label>
      {children}
    </div>
  )
}

export default CadastrarClientes
