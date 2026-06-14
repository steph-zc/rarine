import { hexFromCor, stripHexFromName } from '../utils/corBordado'
import { capitalizar } from '../utils/formatacao'
import { labelEstampa } from '../utils/printLocations'

/** Cartão de exibição de um item do pedido (características + estampa/bordado). */
function OrderItemCard({ item }) {
  return (
    <div className="os-item-card">
      <div className="os-item-title">{item.productName || item.nomeProduto}</div>
      <div className="os-item-meta">
        {[
          (item.color || item.cor) && `Cor: ${capitalizar(item.color || item.cor)}`,
          (item.collar || item.gola) && `Gola: ${capitalizar(item.collar || item.gola)}`,
          item.manga && `Manga: ${capitalizar(item.manga)}`,
          (item.fabric || item.tecido) && `Tecido: ${capitalizar(item.fabric || item.tecido)}`,
        ].filter(Boolean).join(' · ')}
      </div>

      {item.embroideries?.map(emb => (
        <div key={emb.id} className="os-emb-line">
          <i className="bi bi-palette-fill" />
          <strong>{labelEstampa(emb.local || emb.location)}</strong>
          {(emb.description || emb.descricao) && <span>: {emb.description || emb.descricao}</span>}
          {emb.colors?.length > 0 && (
            <span style={{ display: 'flex', gap: 4, marginLeft: 6, flexWrap: 'wrap' }}>
              {emb.colors.map(c => (
                <span
                  key={c.id}
                  title={stripHexFromName(c.name || c.nome)}
                  style={{
                    display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
                    background: hexFromCor(c) || '#9ca3af',
                    border: '1px solid rgba(0,0,0,0.15)',
                  }}
                />
              ))}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default OrderItemCard
