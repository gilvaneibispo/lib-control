import { Navigate, Route, Routes } from 'react-router-dom';
import { ExigeLeitor } from './componentes/ExigeLeitor';
import { Layout } from './componentes/Layout';
import { Catalogo } from './paginas/Catalogo';
import { CriarConta } from './paginas/CriarConta';
import { Entrar } from './paginas/Entrar';
import { LivroDetalhe } from './paginas/LivroDetalhe';
import { MeusEmprestimos } from './paginas/MeusEmprestimos';
import { MinhasReservas } from './paginas/MinhasReservas';
import { Perfil } from './paginas/Perfil';

function App() {

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/catalogo" replace />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/livros/:id" element={<LivroDetalhe />} />
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/criar-conta" element={<CriarConta />} />

        <Route
          path="/minhas-reservas"
          element={
            <ExigeLeitor>
              <MinhasReservas />
            </ExigeLeitor>
          }
        />

        <Route
          path="/meus-emprestimos"
          element={
            <ExigeLeitor>
              <MeusEmprestimos />
            </ExigeLeitor>
          }
        />

        <Route
          path="/perfil"
          element={
            <ExigeLeitor>
              <Perfil />
            </ExigeLeitor>
          }
        />

        <Route path="*" element={<h1>Página não encontrada</h1>} />
      </Route>
    </Routes>
  );
}

export default App
