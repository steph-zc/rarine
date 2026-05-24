import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import MenuCard from '../components/MenuCard'
import { api } from '../services/api'
import '../styles/home.css'

function diasParaPrazo(deadline) {
  if (!deadline) return null
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const prazo = new Date(deadline + 'T00:00:00')
  return Math.round((prazo - hoje) / (1000 * 60 * 60 * 24))
}

function Home() {
  const navigate = useNavigate()
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    api.ordens.listar()
      .then(ordens => {
        const ativos = ordens.filter(o => o.status !== 'DONE' && o.status !== 'CANCELLED')
        const urgentes = ativos
          .map(o => ({ ...o, dias: diasParaPrazo(o.deadline) }))
          .filter(o => o.dias !== null && o.dias >= 0 && o.dias <= 7)
          .sort((a, b) => a.dias - b.dias)
        setAlertas(urgentes)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="home-container">
      <Header />

      <div className="home-hero">
        <h1>Sistema de Gestão</h1>
        <p>Selecione uma opção para continuar</p>
      </div>

      {alertas.length > 0 && (
        <div className="container" style={{ maxWidth: 860, marginBottom: 24 }}>
          <div className="home-alertas">
            <div className="home-alertas-titulo">
              <span className="home-alertas-icone">🕐</span>
              Prazo próximo
            </div>
            {alertas.map(o => (
              <div
                key={o.id}
                className="home-alerta-item"
                onClick={() => navigate(`/ordem-servico/${o.id}`)}
                title="Clique para abrir o pedido"
              >
                <span className="home-alerta-cliente">{o.clientName}</span>
                <span className="home-alerta-sep">·</span>
                <span className="home-alerta-prazo">
                  {o.dias === 0
                    ? 'Prazo hoje'
                    : o.dias === 1
                    ? 'Falta 1 dia'
                    : `Faltam ${o.dias} dias`}
                </span>
                <span className="home-alerta-sep">·</span>
                <span className="home-alerta-data">{o.deadline}</span>
                <span className="home-alerta-seta">→</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
