import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CadastrarClientes() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cpf: '',
    cnpj: '',
    estadoCivil: '',
    nacionalidade: '',
    sexo: '',
    dataNascimento: '',
    uf: '',
    municipio: '',
    pais: '',
    numero: '',
    cep: '',
    endereco: '',
    complemento: '',
    bairro: '',
    telefone: '',
    celular: '',
    email1: '',
    email2: '',
    nomeContato: '',
    codigo: '',
    grupo: '',
    dataUltimaVenda: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Dados do cliente:', form)
    alert('Cliente cadastrado com sucesso!')
  }

  const estadosCivis = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']
  const sexos = ['Masculino', 'Feminino', 'Outro']
  const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '2px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: '2px solid #555',
            borderRadius: '8px',
            padding: '6px 14px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: '600',
            color: '#333'
          }}
        >
          <i className="bi bi-arrow-left fs-4"></i>
          Voltar
        </button>

        <h2 style={{ margin: 0, fontWeight: '700', letterSpacing: '2px', fontSize: '22px' }}>
          CADASTRO DE CLIENTES
        </h2>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" style={{
            background: 'none', border: '2px solid #555', borderRadius: '8px',
            padding: '6px 14px', cursor: 'pointer', display: 'flex',
            flexDirection: 'column', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: '#333'
          }}>
            <i className="bi bi-question-circle fs-4"></i>
            Ajuda
          </button>
          <button type="button" style={{
            background: 'none', border: '2px solid #555', borderRadius: '8px',
            padding: '6px 14px', cursor: 'pointer', display: 'flex',
            flexDirection: 'column', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: '#333'
          }}>
            <i className="bi bi-gear fs-4"></i>
            Conf
          </button>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '16px' }}>

        {/* Painel principal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          backgroundColor: '#d4d4d4',
          border: '2px solid #aaa',
          borderRadius: '6px',
          padding: '14px',
          marginBottom: '12px'
        }}>

          {/* Coluna Esquerda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            <Field label="Cliente / Razão Social *">
              <input name="razaoSocial" value={form.razaoSocial} onChange={handleChange} style={inputStyle} required />
            </Field>

            <Field label="Nome fantasia">
              <input name="nomeFantasia" value={form.nomeFantasia} onChange={handleChange} style={inputStyle} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Field label="CPF">
                <input name="cpf" value={form.cpf} onChange={handleChange} style={inputStyle} placeholder="000.000.000-00" />
              </Field>
              <Field label="CNPJ">
                <input name="cnpj" value={form.cnpj} onChange={handleChange} style={inputStyle} placeholder="00.000.000/0001-00" />
              </Field>
            </div>

            <Field label="Estado civil">
              <select name="estadoCivil" value={form.estadoCivil} onChange={handleChange} style={inputStyle}>
                <option value="">Selecione</option>
                {estadosCivis.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <Field label="Nacionalidade">
                <input name="nacionalidade" value={form.nacionalidade} onChange={handleChange} style={inputStyle} />
              </Field>
              <Field label="Sexo">
                <select name="sexo" value={form.sexo} onChange={handleChange} style={inputStyle}>
                  <option value="">-</option>
                  {sexos.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Data de nasc.">
                <input type="date" name="dataNascimento" value={form.dataNascimento} onChange={handleChange} style={inputStyle} />
              </Field>
            </div>

          </div>

          {/* Coluna Direita */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <Field label="UF *">
                <select name="uf" value={form.uf} onChange={handleChange} style={inputStyle} required>
                  <option value="">↓</option>
                  {ufs.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
              <Field label="Município *">
                <input name="municipio" value={form.municipio} onChange={handleChange} style={inputStyle} required />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 130px', gap: '10px' }}>
              <Field label="País">
                <input name="pais" value={form.pais} onChange={handleChange} style={inputStyle} />
              </Field>
              <Field label="Número">
                <input name="numero" value={form.numero} onChange={handleChange} style={inputStyle} />
              </Field>
              <Field label="CEP *">
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input name="cep" value={form.cep} onChange={handleChange} style={{ ...inputStyle, flex: 1 }} required />
                  <button type="button" style={iconBtnStyle} title="Buscar CEP">
                    <i className="bi bi-geo-alt"></i>
                  </button>
                </div>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Field label="Endereço">
                <input name="endereco" value={form.endereco} onChange={handleChange} style={inputStyle} />
              </Field>
              <Field label="Complemento">
                <input name="complemento" value={form.complemento} onChange={handleChange} style={inputStyle} />
              </Field>
            </div>

            <Field label="Bairro">
              <div style={{ display: 'flex', gap: '4px' }}>
                <input name="bairro" value={form.bairro} onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
                <button type="button" style={iconBtnStyle} title="Buscar bairro">
                  <i className="bi bi-geo-alt"></i>
                </button>
              </div>
            </Field>

            {/* Contato */}
            <div style={{
              border: '1px solid #aaa',
              borderRadius: '4px',
              padding: '10px',
              backgroundColor: '#cacaca'
            }}>
              <small style={{ fontWeight: '600', color: '#444' }}>Contato</small>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <Field label="Telefone">
                  <input name="telefone" value={form.telefone} onChange={handleChange} style={inputStyle} />
                </Field>
                <Field label="Celular">
                  <input name="celular" value={form.celular} onChange={handleChange} style={inputStyle} />
                </Field>
              </div>

              <div style={{ marginTop: '6px' }}>
                <Field label="E-mail 1">
                  <input type="email" name="email1" value={form.email1} onChange={handleChange} style={inputStyle} />
                </Field>
              </div>

              <div style={{ marginTop: '6px' }}>
                <Field label="E-mail 2">
                  <input type="email" name="email2" value={form.email2} onChange={handleChange} style={inputStyle} />
                </Field>
              </div>

              <div style={{ marginTop: '6px' }}>
                <Field label="Nome do contato">
                  <input name="nomeContato" value={form.nomeContato} onChange={handleChange} style={inputStyle} />
                </Field>
              </div>
            </div>

          </div>

        </div>

        {/* Rodapé do formulário */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          backgroundColor: '#d4d4d4',
          border: '2px solid #aaa',
          borderRadius: '6px',
          padding: '14px',
          marginBottom: '16px'
        }}>

          <Field label="Código / Grupo">
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input name="codigo" value={form.codigo} onChange={handleChange}
                style={{ ...inputStyle, width: '70px' }} />
              <button type="button" style={iconBtnStyle}>
                <i className="bi bi-search"></i>
              </button>
              <input name="grupo" value={form.grupo} onChange={handleChange}
                style={{ ...inputStyle, flex: 1 }} />
            </div>
          </Field>

          <Field label="Data da última venda para o cliente">
            <input type="date" name="dataUltimaVenda" value={form.dataUltimaVenda}
              onChange={handleChange} style={inputStyle} />
          </Field>

        </div>

        {/* Botão salvar */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            style={{
              backgroundColor: '#3a7bd5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 40px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              letterSpacing: '1px'
            }}
          >
            <i className="bi bi-check-circle me-2"></i>
            Salvar Cliente
          </button>
        </div>

      </form>

    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '4px 8px',
  border: '1px solid #999',
  borderRadius: '3px',
  fontSize: '14px',
  backgroundColor: '#fff',
  boxSizing: 'border-box',
}

const iconBtnStyle = {
  background: '#bbb',
  border: '1px solid #999',
  borderRadius: '3px',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: '14px',
  flexShrink: 0,
}

export default CadastrarClientes
