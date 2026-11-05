import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import './estilos/index.scss'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './componentes/ToastProvider'

function deveRepetir(falhas: number, erro: unknown): boolean {
  const status = isAxiosError(erro)
    ? erro.response?.status
    : undefined;

  const erroDoCliente = status !== undefined && status < 500;

  if (erroDoCliente) return false;

  return falhas < 2;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: deveRepetir,
    },
  },
})

const raiz = document.getElementById('root')!

createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter basename="/admin">
          <App />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
)
