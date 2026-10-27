import { Navigate, Route, Routes } from 'react-router-dom';
import { Catalogo } from './paginas/Catalogo';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalogo" replace />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="*" element={<h1>Página não encontrada</h1>} />
    </Routes>
  );
}

export default App
