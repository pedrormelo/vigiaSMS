// src/components/validar/podeTransitar.ts

import { StatusContexto } from "@/components/validar/typesDados";

export function podeTransitar(
  atual: StatusContexto,
  proximo: StatusContexto
): boolean {
  switch (atual) {
    // O caso para AguardandoAnalise não é mais necessário.

    case StatusContexto.AguardandoGerente:
      // A partir daqui, pode ser aprovado para o Diretor ou devolvido para Correção.
      return proximo === StatusContexto.AguardandoDiretor || proximo === StatusContexto.AguardandoCorrecao;

    case StatusContexto.AguardandoDiretor:
      // A partir daqui, pode ser Publicado ou devolvido para Correção.
      // A transição para Indeferido como estado final foi removida deste ponto.
      return proximo === StatusContexto.Publicado || proximo === StatusContexto.AguardandoCorrecao;

    case StatusContexto.AguardandoCorrecao:
      // Após o membro corrigir, ele reenvia e o ciclo recomeça no Gerente.
      return proximo === StatusContexto.AguardandoGerente;

    default:
      // Estados finais (Publicado, Indeferido) não podem transitar para nenhum outro.
      return false;
  }
}