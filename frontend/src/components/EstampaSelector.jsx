import SeletorCores from './SeletorCores'
import { PRINT_LOCAIS, labelEstampa } from '../utils/printLocations'

/**
 * Estampa/bordado unificado: escolha de um ou mais locais e, para cada local,
 * as cores que ele terá.
 *
 * Props:
 *  - cores: lista de cores disponíveis
 *  - estampas: array de { location, colorIds: string[] }
 *  - onChange: (estampas) => void
 */
function EstampaSelector({ cores = [], estampas = [], onChange }) {
  const ativo = (loc) => estampas.some(e => e.location === loc)

  const toggleLocal = (loc) => {
    if (ativo(loc)) onChange(estampas.filter(e => e.location !== loc))
    else onChange([...estampas, { location: loc, colorIds: [], descricao: '' }])
  }

  const setCores = (loc, ids) =>
    onChange(estampas.map(e => (e.location === loc ? { ...e, colorIds: ids } : e)))

  const setDescricao = (loc, texto) =>
    onChange(estampas.map(e => (e.location === loc ? { ...e, descricao: texto } : e)))

  return (
    <div>
      <div className="estampa-locais">
        {PRINT_LOCAIS.map(l => (
          <button
            type="button"
            key={l.val}
            className={`estampa-chip ${ativo(l.val) ? 'ativo' : ''}`}
            onClick={() => toggleLocal(l.val)}
          >
            {l.label}
          </button>
        ))}
      </div>

      {estampas.map(e => (
        <div key={e.location} className="estampa-bloco">
          <div className="estampa-bloco-titulo">
            <i className="bi bi-palette-fill" /> {labelEstampa(e.location)}
          </div>
          <input
            className="r-input"
            placeholder="Descrição (ex.: logo bordado, escudo…)"
            value={e.descricao || ''}
            onChange={ev => setDescricao(e.location, ev.target.value)}
            style={{ marginBottom: 8 }}
          />
          <SeletorCores
            cores={cores}
            selecionadas={e.colorIds}
            onChange={ids => setCores(e.location, ids)}
          />
        </div>
      ))}
    </div>
  )
}

export default EstampaSelector
