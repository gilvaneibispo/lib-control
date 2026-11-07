<?php

namespace App\Enums;

enum CodigoErro: string
{
    case LeitorBloqueado = 'LEITOR_BLOQUEADO';
    case EmprestimoAtrasado = 'EMPRESTIMO_ATRASADO';
    case LimiteAtingido = 'LIMITE_ATINGIDO';
    case LivroJaComLeitor = 'LIVRO_JA_COM_LEITOR';
    case SemExemplarDisponivel = 'SEM_EXEMPLAR_DISPONIVEL';

    case ReservaNaoAtiva = 'RESERVA_NAO_ATIVA';
    case ExemplarIndisponivel = 'EXEMPLAR_INDISPONIVEL';
    case ExemplarEmUso = 'EXEMPLAR_EM_USO';
    case ExemplarComHistorico = 'EXEMPLAR_COM_HISTORICO';
    case EmprestimoJaDevolvido = 'EMPRESTIMO_JA_DEVOLVIDO';
    case LeitorJaBloqueado = 'LEITOR_JA_BLOQUEADO';
    case LeitorNaoBloqueado = 'LEITOR_NAO_BLOQUEADO';
    case UsuarioNaoLeitor = 'USUARIO_NAO_LEITOR';

    case CredenciaisInvalidas = 'CREDENCIAIS_INVALIDAS';
    case PapelIncompativel = 'PAPEL_INCOMPATIVEL';

    public function mensagem(): string
    {
        return match ($this) {
            self::LeitorBloqueado => 'Leitor bloqueado.',
            self::EmprestimoAtrasado => 'Leitor possui empréstimo em atraso.',
            self::LimiteAtingido => 'Limite de reservas e empréstimos simultâneos atingido.',
            self::LivroJaComLeitor => 'Leitor já possui reserva ou empréstimo deste livro.',
            self::SemExemplarDisponivel => 'Não há exemplar disponível deste livro.',
            self::ReservaNaoAtiva => 'A reserva não está ativa.',
            self::ExemplarIndisponivel => 'O exemplar não está disponível.',
            self::ExemplarEmUso => 'O exemplar está reservado ou emprestado.',
            self::ExemplarComHistorico => 'O exemplar tem histórico de reservas ou empréstimos; marque-o como indisponível.',
            self::EmprestimoJaDevolvido => 'O empréstimo já foi devolvido.',
            self::LeitorJaBloqueado => 'O leitor já está bloqueado.',
            self::LeitorNaoBloqueado => 'O leitor não está bloqueado.',
            self::UsuarioNaoLeitor => 'O usuário informado não é um leitor.',
            self::CredenciaisInvalidas => 'E-mail ou senha incorretos.',
            self::PapelIncompativel => 'Este usuário não tem acesso a este aplicativo.',
        };
    }
}
