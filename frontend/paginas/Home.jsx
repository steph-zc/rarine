import Header from '../components/Header'
import MenuCard from '../components/MenuCard'

import '../styles/home.css'

function Home() {
  return (
    <div className="home-container">

      <Header />

      <div className="container mt-5">

        <div className="row justify-content-center">

          <MenuCard
            titulo="CLIENTES"
            icone="bi bi-people-fill"
            rota="/clientes"
          />

          <MenuCard
            titulo="CADASTRAR CLIENTE"
            icone="bi bi-person-plus"
            rota="/cadastrar-clientes"  // ✅ Corrigido: era "/clientes-clientes"
          />

          <MenuCard
            titulo="PRODUTOS"
            icone="bi bi-box-seam"
            rota="/produtos"
          />

          <MenuCard
            titulo="CADASTRAR PEDIDO"
            icone="bi bi-journal-check"
            rota="/pedidos"
          />

          <MenuCard
            titulo="CADASTRAR CORES"
            icone="bi bi-palette"
            rota="/cores"
          />

          <MenuCard
            titulo="ORDEM DE SERVIÇO"
            icone="bi bi-clipboard-check"
            rota="/ordem-servico"
          />

        </div>

      </div>

    </div>
  )
}

export default Home
