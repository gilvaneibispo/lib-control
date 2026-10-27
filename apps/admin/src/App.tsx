import { Route, Routes } from 'react-router-dom';
import { Admin } from './paginas/Admin';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Admin />} />
      <Route path="*" element={<h1>Página não encontrada</h1>} />
    </Routes>
  );
}

export default App
