import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const HOME_PATH = '/'

const NAV_ITEMS = [
  {
    id: 'clientes',
    label: 'Clientes',
    path: '/clientes',
    match: (p) => p === '/clientes' || p.startsWith('/cadastrar-clientes'),
    icon: 'bi-people-fill',
  },
  {
    id: 'produtos',
    label: 'Produtos',
    path: '/produtos',
    match: (p) => p.startsWith('/produtos'),
    icon: 'bi-box-seam',
  },
  {
    id: 'pedidos',
    label: 'Pedidos',
    path: '/pedidos',
    match: (p) => p.startsWith('/pedidos') || p.startsWith('/ordem-servico'),
    icon: 'bi-journal-check',
  },
  {
    id: 'cores',
    label: 'Cores de Bordado',
    path: '/cores',
    match: (p) => p.startsWith('/cores'),
    icon: 'bi-palette',
  },
]

function Brand() {
  return (
    <>
      <span className="app-header-brand-name">Rarine</span>
      <span className="app-header-brand-sub">CONFECÇÕES</span>
    </>
  )
}

function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <button
      type="button"
      className="app-header-theme"
      onClick={toggleTheme}
      title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
    >
      <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}`} />
      <span>{isDark ? 'Claro' : 'Escuro'}</span>
    </button>
  )
}

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const isHome = location.pathname === HOME_PATH
  const pathname = location.pathname

  const goHome = () => navigate(HOME_PATH)

  if (isHome) {
    return (
      <header className="app-header app-header--home">
        <div className="app-header-inner app-header-inner--home">
          <div
            className="app-header-brand app-header-brand--center"
            onClick={goHome}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && goHome()}
          >
            <Brand />
          </div>
          <div className="app-header-actions app-header-actions--overlay">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="app-header">
      <div className="app-header-inner app-header-inner--with-nav">
        <div
          className="app-header-brand"
          onClick={goHome}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && goHome()}
        >
          <Brand />
        </div>

        <nav className="app-header-nav" aria-label="Navegação principal">
          <button type="button" className="app-nav-link" onClick={goHome}>
            <i className="bi bi-house-fill" aria-hidden />
            Home
          </button>

          {NAV_ITEMS.map(item => {
            const active = item.match(pathname)
            return (
              <button
                key={item.id}
                type="button"
                className={`app-nav-link${active ? ' app-nav-link--active' : ''}`}
                onClick={() => navigate(item.path)}
                aria-current={active ? 'page' : undefined}
              >
                <i className={`bi ${item.icon}`} aria-hidden />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="app-header-actions">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </div>
    </header>
  )
}

export default Header
