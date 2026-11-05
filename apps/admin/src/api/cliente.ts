import axios, {
  isAxiosError,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

type ConfigComRetentativa = InternalAxiosRequestConfig & {
  _csrfRenovado?: boolean;
};

const METODOS_SEM_CSRF = ['get', 'head', 'options'];

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let csrfPronto: Promise<unknown> | null = null;

export function garantirCsrf(forcar = false): Promise<unknown> {
  if (csrfPronto && !forcar) return csrfPronto;

  const requisicao = axios.get('/sanctum/csrf-cookie', { withCredentials: true });

  csrfPronto = requisicao.catch((erro) => {
    csrfPronto = null;

    throw erro;
  });

  return csrfPronto;
}

api.interceptors.request.use(async (config) => {
  const metodo = config.method ?? 'get';
  const metodoMinusculo = metodo.toLowerCase();
  const precisaCsrf = !METODOS_SEM_CSRF.includes(metodoMinusculo);

  if (precisaCsrf) await garantirCsrf();

  return config;
});

api.interceptors.response.use(undefined, async (erro: AxiosError) => {
  const config = erro.config as ConfigComRetentativa | undefined;
  const csrfExpirado = isAxiosError(erro) && erro.response?.status === 419;

  if (!csrfExpirado || !config || config._csrfRenovado) throw erro;

  config._csrfRenovado = true;

  await garantirCsrf(true);

  return api.request(config);
});
