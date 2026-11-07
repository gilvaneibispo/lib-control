import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { mensagemDeErro } from '../api/erros';
import { queryKeys } from '../api/queryKeys';
import { admin } from '../api/servicos';
import type {
  DetalheLeitor,
  Elegibilidade,
  Emprestimo,
  Leitor,
  Reserva,
} from '../api/tipos';
import { classes } from '../utilitarios/classes';
import {
  formatarData,
  formatarDataHora,
  formatarDiaSemana,
  textoPrazo,
} from '../utilitarios/formatadores';
import { mascararCpf } from '../utilitarios/mascaras';
import { Abas, type Aba } from './Abas';
import { Avatar } from './Avatar';
import { Campo } from './Campo';
import { Capa } from './Capa';
import { Carregando } from './Carregando';
import { EditarLeitorModal } from './EditarLeitorModal';
import { ErroCarregamento } from './ErroCarregamento';
import { Modal } from './Modal';
import { PainelPropriedades, type Propriedade } from './PainelPropriedades';
import { SeloStatus } from './SeloStatus';
import { useToast } from './toastContexto';

interface Props {
  id: number;
  aoFechar: () => void;
}

const esquemaMotivo = z.object({
  motivo: z
    .string()
    .trim()
    .min(3, 'Descreva o motivo (mín. 3 caracteres).')
    .max(255),
});

type DadosMotivo = z.infer<typeof esquemaMotivo>;

function elegibilidade(resumo: Elegibilidade | null) {
  const situacao = resumo?.elegivel
    ? (
      <span className="text-success">
        <i className="bi bi-check2-circle me-1" aria-hidden="true" />
        Elegível
      </span>
    )
    : (
      <span className="text-danger">
        <i className="bi bi-x-circle me-1" aria-hidden="true" />
        {resumo?.mensagem}
      </span>
    );

  return (
    <>
      {situacao}

      <div className="small text-body-secondary">
        {resumo?.itens_em_uso ?? 0} de {resumo?.limite ?? 0} itens em uso
      </div>
    </>
  );
}

function endereco(leitor: Leitor) {
  return (
    <>
      {leitor.rua}, {leitor.numero}
      {leitor.complemento && ` – ${leitor.complemento}`}

      <br />

      {leitor.bairro} · {leitor.cidade}/{leitor.uf} · {leitor.cep}
    </>
  );
}

function propriedades(detalhe: DetalheLeitor): Propriedade[] {
  const leitor = detalhe.data;

  const situacao = leitor.bloqueado
    ? 'bloqueado'
    : 'regular';

  const nascimento = leitor.data_nascimento
    ? `${leitor.data_nascimento}T12:00:00`
    : null;

  const cpf = leitor.cpf
    ? mascararCpf(leitor.cpf)
    : '—';

  const lista: Propriedade[] = [
    {
      rotulo: 'Situação',
      valor: <SeloStatus status={situacao} />,
    },
  ];

  if (leitor.bloqueado) {
    lista.push({
      rotulo: 'Bloqueio',
      valor: (
        <div className="alert alert-danger small mb-0 py-2" role="alert">
          <div className="fw-semibold">
            Desde {formatarDataHora(leitor.bloqueado_em)}
          </div>

          {leitor.motivo_bloqueio}
        </div>
      ),
    });
  }

  lista.push(
    {
      rotulo: 'Elegibilidade',
      valor: elegibilidade(detalhe.elegibilidade),
    },
    {
      rotulo: 'CPF',
      valor: <span className="font-monospace">{cpf}</span>,
    },
    {
      rotulo: 'Nascimento',
      valor: formatarData(nascimento),
    },
    {
      rotulo: 'Endereço',
      valor: endereco(leitor),
    },
    {
      rotulo: 'Cadastro',
      valor: formatarData(leitor.criado_em),
    },
  );

  return lista;
}

function periodoEmprestimo(emprestimo: Emprestimo): string {
  if (emprestimo.status === 'devolvido') {
    const inicio = formatarData(emprestimo.emprestado_em);
    const fim = formatarData(emprestimo.devolvido_em);

    return `${inicio} → ${fim}`;
  }

  const prazo = formatarDiaSemana(emprestimo.devolver_ate);
  const restante = textoPrazo(emprestimo.dias_restantes);

  return `até ${prazo} · ${restante}`;
}

function itemEmprestimo(emprestimo: Emprestimo) {
  const livro = emprestimo.exemplar?.livro;
  const titulo = livro?.titulo ?? '';

  return (
    <li key={emprestimo.id} className="d-flex align-items-center gap-2">
      <Capa mini url={livro?.capa_url} titulo={titulo} />

      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="text-truncate">{titulo}</div>

        <div className="small text-body-secondary">
          {periodoEmprestimo(emprestimo)}
        </div>
      </div>

      <SeloStatus status={emprestimo.status} />
    </li>
  );
}

function itemReserva(reserva: Reserva) {
  const titulo = reserva.livro?.titulo ?? '';

  return (
    <li key={reserva.id} className="d-flex align-items-center gap-2">
      <Capa mini url={reserva.livro?.capa_url} titulo={titulo} />

      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="text-truncate">{titulo}</div>

        <div className="small text-body-secondary">
          {formatarData(reserva.criada_em)} · expira {formatarDiaSemana(reserva.expira_em)}
        </div>
      </div>

      <SeloStatus status={reserva.status} />
    </li>
  );
}

const CLASSES_LISTA = classes(
  'list-unstyled',
  'm-0',
  'd-flex',
  'flex-column',
  'gap-2',
);

function emprestimos(lista: Emprestimo[]) {
  if (lista.length === 0) {
    return <p className="small text-body-secondary m-0">Nenhum empréstimo.</p>;
  }

  return <ul className={CLASSES_LISTA}>{lista.map(itemEmprestimo)}</ul>;
}

function reservas(lista: Reserva[]) {
  if (lista.length === 0) {
    return <p className="small text-body-secondary m-0">Nenhuma reserva.</p>;
  }

  return <ul className={CLASSES_LISTA}>{lista.map(itemReserva)}</ul>;
}

export function LeitorPainel({ id, aoFechar }: Props) {
  const qc = useQueryClient();
  const toast = useToast();

  const [aba, setAba] = useState('emprestimos');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.leitores.detalhe(id),
    queryFn: () => admin.usuario(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState,
  } = useForm<DadosMotivo>({
    resolver: zodResolver(esquemaMotivo),
    defaultValues: { motivo: '' },
  });

  const bloqueado = data?.data.bloqueado ?? false;

  const alternar = useMutation({
    mutationFn: ({ motivo }: DadosMotivo) => {
      if (bloqueado) return admin.desbloquear(id, motivo);

      return admin.bloquear(id, motivo);
    },

    onSuccess: (leitor: Leitor) => {
      const mensagem = leitor.bloqueado
        ? 'Leitor bloqueado.'
        : 'Leitor desbloqueado.';

      toast.sucesso(mensagem);

      setModalAberto(false);

      reset();

      qc.invalidateQueries({ queryKey: queryKeys.leitores.todos });
      qc.invalidateQueries({ queryKey: queryKeys.painel });
      qc.invalidateQueries({ queryKey: queryKeys.reservas.todas });
      qc.invalidateQueries({ queryKey: queryKeys.emprestimos.todos });
    },

    onError: (erro) => toast.erro(mensagemDeErro(erro)),
  });

  function fecharModal() {
    setModalAberto(false);
  }

  const confirmar = handleSubmit((dados) => alternar.mutate(dados));

  if (isLoading) return <Carregando />;

  if (error || !data) return <ErroCarregamento erro={error} aoTentar={refetch} />;

  const leitor = data.data;
  const erroMotivo = formState.errors.motivo?.message;

  const abas: Aba[] = [
    { valor: 'emprestimos', rotulo: `Empréstimos (${data.emprestimos.length})` },
    { valor: 'reservas', rotulo: `Reservas (${data.reservas.length})` },
  ];

  const historico = (aba === 'emprestimos')
    ? emprestimos(data.emprestimos)
    : reservas(data.reservas);

  const rodape = (
    <>
      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={() => setEditando(true)}
      >
        <i className="bi bi-pencil me-1" aria-hidden="true" />
        Editar
      </button>

      <button
        type="button"
        className={classes(
          'btn',
          bloqueado ? 'btn-secondary' : 'btn-danger',
        )}
        onClick={() => setModalAberto(true)}
      >
        <i
          className={classes(
            'bi',
            bloqueado ? 'bi-unlock' : 'bi-slash-circle',
            'me-1',
          )}
          aria-hidden="true"
        />
        {bloqueado ? 'Desbloquear' : 'Bloquear'}
      </button>
    </>
  );

  const tituloModal = bloqueado
    ? 'Desbloquear leitor'
    : 'Bloquear leitor';

  const descricaoModal = bloqueado
    ? 'O leitor volta a poder reservar e pegar empréstimos (se não houver atraso).'
    : 'O leitor não poderá reservar nem pegar empréstimos. Reservas ativas continuam até expirar.';

  return (
    <>
      <div className="d-flex flex-column gap-4">
        <PainelPropriedades
          midia={<Avatar nome={leitor.nome} url={leitor.foto_url} grande />}
          titulo={leitor.nome}
          subtitulo={leitor.email}
          propriedades={propriedades(data)}
          rodape={rodape}
          aoFechar={aoFechar}
        />

        <section aria-label="Histórico">
          <Abas abas={abas} ativa={aba} aoMudar={setAba} />

          {historico}
        </section>
      </div>

      <Modal
        aberto={modalAberto}
        aoFechar={fecharModal}
        titulo={tituloModal}
        descricao={descricaoModal}
        bloqueado={alternar.isPending}
        rodape={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={alternar.isPending}
              onClick={fecharModal}
            >
              Cancelar
            </button>

            <button
              type="button"
              className={classes(
                'btn',
                bloqueado ? 'btn-primary' : 'btn-danger',
              )}
              disabled={alternar.isPending}
              onClick={confirmar}
            >
              {alternar.isPending && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
              )}
              {bloqueado ? 'Desbloquear' : 'Bloquear'}
            </button>
          </>
        }
      >
        <Campo rotulo="Motivo" htmlFor="motivo" erro={erroMotivo}>
          <textarea
            id="motivo"
            className={classes(
              'form-control',
              erroMotivo && 'is-invalid',
            )}
            rows={3}
            {...register('motivo')}
          />
        </Campo>
      </Modal>

      <EditarLeitorModal
        leitor={editando ? leitor : null}
        aoFechar={() => setEditando(false)}
      />
    </>
  );
}
