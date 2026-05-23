import { Link } from 'react-router-dom'

function MenuCard({ titulo, icone, rota }) {
  return (
    <div className="col-md-4 mb-4">
      <Link to={rota} style={{ textDecoration: 'none' }}>
        <div className="menu-card">
          <div className="menu-card-icon">
            <i className={icone}></i>
          </div>
          <span className="menu-card-titulo">{titulo}</span>
        </div>
      </Link>
    </div>
  )
}

export default MenuCard
