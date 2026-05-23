import Header from '../components/Header'

function Clientes() {

  const clientes = [
    {
      id: 1,
      nome: 'João Silva',
      fantasia: 'JS Serviços',
      cpf: '123.456.789-00',
      cnpj: '12.345.678/0001-99',
      telefone: '(51) 99999-9999',
      celular: '(51) 98888-8888'
    },
    {
      id: 2,
      nome: 'Maria Souza',
      fantasia: 'MS Comércio',
      cpf: '987.654.321-00',
      cnpj: '98.765.432/0001-11',
      telefone: '(51) 97777-7777',
      celular: '(51) 96666-6666'
    }
  ]

  return (
    <div>

      <Header />

      <div className="bg-danger text-white px-3 py-1">
        Clientes
      </div>

      <div
        className="d-flex align-items-center gap-5 px-3 py-2"
        style={{ backgroundColor: '#9fc3ea' }}
      >

        <div className="text-center">
          <i className="bi bi-file-earmark-plus fs-1"></i>
          <p className="m-0">Novo - F4</p>
        </div>

        <div className="text-center">
          <i className="bi bi-pencil-square fs-1"></i>
          <p className="m-0">Editar - F5</p>
        </div>

        <div className="text-center">
          <i className="bi bi-trash fs-1"></i>
          <p className="m-0">Excluir - F6</p>
        </div>

        <div className="text-center">
          <i className="bi bi-arrow-left-right fs-1"></i>
          <p className="m-0">Transf. cad - F7</p>
        </div>

        <div className="text-center">
          <i className="bi bi-eye fs-1"></i>
          <p className="m-0">Visualizar - F9</p>
        </div>

      </div>

      <div className="container-fluid mt-3">

        <table className="table table-bordered table-striped">

          <thead className="table-secondary">
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Fantasia</th>
              <th>CPF</th>
              <th>CNPJ</th>
              <th>Telefone</th>
              <th>Celular</th>
            </tr>
          </thead>

          <tbody>

            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.fantasia}</td>
                <td>{cliente.cpf}</td>
                <td>{cliente.cnpj}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.celular}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Clientes