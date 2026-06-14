import { useState } from 'react'
import { hexFromCor, stripHexFromName } from '../utils/corBordado'

/**
 * Seletor de cores intuitivo: campo de busca + grade de amostras clicáveis.
 * Clique numa cor para selecionar/desselecionar (múltipla seleção).
 *
 * Props:
 *  - cores: lista de cores disponíveis
 *  - selecionadas: array de ids (string ou number)
 *  - onChange: (idsString[]) => void
 *  - max: limite de alerta (consultivo)
 */
function SeletorCores({ cores = [], selecionadas = [], onChange, max = 6 }) {
  const [busca, setBusca] = useState('')
  const sel = selecionadas.map(String)

  const q = busca.trim().toLowerCase()
  const filtradas = !q
    ? cores
    : cores.filter(c => {
        const nome = stripHexFromName(c.name || c.nome || '').toLowerCase()
        const cod = (c.threadCode || c.codigoLinha || '').toLowerCase()
        return nome.includes(q) || cod.includes(q)
      })

  const toggle = (id) => {
    const s = String(id)
    onChange(sel.includes(s) ? sel.filter(x => x !== s) : [...sel, s])
  }

  return (
    <div className="seletor-cores">
      <input
        className="r-input"
        placeholder="Buscar cor ou código…"
        value={busca}
        onChange={e => setBusca(e.target.value)}
      />

      {sel.length > max && (
        <div className="cor-aviso">
          ⚠️ {sel.length} cores selecionadas — acima do limite de {max} do maquinário.
        </div>
      )}

      <div className="cores-grid">
        {filtradas.map(c => {
          const ativo = sel.includes(String(c.id))
          const nome = stripHexFromName(c.name || c.nome)
          return (
            <button
              type="button"
              key={c.id}
              className={`cor-opcao ${ativo ? 'ativo' : ''}`}
              onClick={() => toggle(c.id)}
              title={`${nome}${c.threadCode || c.codigoLinha ? ` (${c.threadCode || c.codigoLinha})` : ''}`}
            >
              <span
                className="cor-bolinha"
                style={{ background: hexFromCor(c) || '#9ca3af' }}
              />
              <span className="cor-nome">{nome}</span>
              {ativo && <i className="bi bi-check-lg cor-check" />}
            </button>
          )
        })}
        {filtradas.length === 0 && <div className="cor-vazio">Nenhuma cor encontrada</div>}
      </div>

      <div className="cor-contador">
        {sel.length} cor{sel.length !== 1 ? 'es' : ''} selecionada{sel.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

export default SeletorCores
