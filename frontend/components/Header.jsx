function Header() {
  return (
    <header className="border-bottom bg-white">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center py-3">

          <div className="text-center px-4 border-end">
            <i className="bi bi-box-arrow-left fs-1"></i>
            <p className="m-0">Sair</p>
          </div>

          <div className="d-flex">

            <div className="text-center px-4 border-start">
              <i className="bi bi-question-circle fs-1"></i>
              <p className="m-0">Ajuda</p>
            </div>

            <div className="text-center px-4 border-start">
              <i className="bi bi-gear fs-1"></i>
              <p className="m-0">Conf</p>
            </div>

          </div>

        </div>
      </div>
    </header>
  )
}

export default Header