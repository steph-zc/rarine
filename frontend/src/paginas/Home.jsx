import Header from '../components/Header'
import MenuCard from '../components/MenuCard'
import '../styles/home.css'

function Home() {
  return (
    <div className="home-container">
      <Header />

      <div className="home-hero">
        <h1>Sistema de Gestão</h1>
        <p>Selecione uma opção para continuar</p>
      </div>

      <div className="container" style={{ maxWidth: 860 }}>
        <div className="row justify-content-center">
          <MenuCard titulo="Clientes"         icone="bi bi-people-fill"    rota="/clientes" />
          <MenuCard titulo="Produtos"          icone="bi bi-box-seam"       rota="/produtos" />
          <MenuCard titulo="Pedidos"           icone="bi bi-journal-check"  rota="/pedidos" />
          <MenuCard titulo="Cores de Bordado"  icone="bi bi-palette"        rota="/cores" />
        </div>
      </div>
    </div>
  )
}

export default Home
