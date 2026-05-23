import { Link } from 'react-router-dom'

function MenuCard({ titulo, icone, rota }) {
  return (
    <div className="col-md-4 mb-4">

      <Link
        to={rota}
        style={{
          textDecoration: 'none',
          color: 'black'
        }}
      >

        <div className="menu-card text-center p-5">

          <i className={`${icone} display-4 mb-3`}></i>

          <h4>{titulo}</h4>

        </div>

      </Link>

    </div>
  )
}

export default MenuCard