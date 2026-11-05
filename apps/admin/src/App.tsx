import { Navigate, Route, Routes } from 'react-router-dom';
import { ExigeAdmin } from './componentes/ExigeAdmin';
import { Layout } from './componentes/Layout';
import { Entrar } from './paginas/Entrar';
import { LivroForm } from './paginas/LivroForm';
import { Livros } from './paginas/Livros';

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
        <Route index element={<Navigate to="/livros" replace />} />
        <Route path="/livros" element={<Livros />}>
          <Route path="novo" element={<LivroForm />} />
          <Route path=":id" element={<LivroForm />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App
