import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'

import Home from './paginas/Home'
import Clientes from './paginas/Clientes'
import CadastrarClientes from './paginas/CadastrarClientes'
import Produtos from './paginas/Produtos'
import Pedidos from './paginas/Pedidos'
import Cores from './paginas/Cores'
import OrdemServico from './paginas/OrdemServico'

function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/cadastrar-clientes" element={<CadastrarClientes />} />
        <Route path="/cadastrar-clientes/:id" element={<CadastrarClientes />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/cores" element={<Cores />} />
        <Route path="/ordem-servico/:id" element={<OrdemServico />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
