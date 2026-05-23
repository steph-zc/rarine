import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './paginas/Home'
import Clientes from './paginas/Clientes'
import Produtos from './paginas/Produtos'
import Pedidos from './paginas/Pedidos'
import Cores from './paginas/Cores'
import OrdemServico from './paginas/OrdemServico'
import CadastrarClientes from './paginas/CadastrarClientes'

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/clientes" element={<Clientes />} />

        <Route path="/produtos" element={<Produtos />} />

        <Route path="/pedidos" element={<Pedidos />} />

        <Route path="/cores" element={<Cores />} />

        <Route path="/ordem-servico" element={<OrdemServico />} />
        
        <Route path="/cadastrar-clientes" element={<CadastrarClientes />} />
        
      </Routes>

    </BrowserRouter>
  )
}

export default App