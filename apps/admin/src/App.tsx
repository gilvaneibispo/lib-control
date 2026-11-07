import { Navigate, Route, Routes } from 'react-router-dom';
import { ExigeAdmin } from './componentes/ExigeAdmin';
import { Layout } from './componentes/Layout';
import { Emprestimos } from './paginas/Emprestimos';
import { Entrar } from './paginas/Entrar';
import { Leitores } from './paginas/Leitores';
import { LivroForm } from './paginas/LivroForm';
import { Livros } from './paginas/Livros';
import { Painel } from './paginas/Painel';
import { Reservas } from './paginas/Reservas';

function App() {

  return (
    <Routes>
      <Route path="/entrar" element={<Entrar />} />

      <Route
        element={
          <ExigeAdmin>
            <Layout />
          </ExigeAdmin>
        }
      >
        <Route index element={<Painel />} />
        <Route path="/livros" element={<Livros />}>
          <Route path="novo" element={<LivroForm />} />
          <Route path=":id" element={<LivroForm />} />
        </Route>

        <Route path="/reservas" element={<Reservas />} />
        <Route path="/emprestimos" element={<Emprestimos />} />
        <Route path="/leitores" element={<Leitores />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App
