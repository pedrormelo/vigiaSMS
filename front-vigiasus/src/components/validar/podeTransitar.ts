import { StatusContexto } from "@/components/validar/typesDados";

export function podeTransitar(
  atual: StatusContexto,
  proximo: StatusContexto
): boolean {
  switch (atual) {
    case StatusContexto.AguardandoGerente:
      return proximo === StatusContexto.AguardandoDiretor || proximo === StatusContexto.Indeferido;
    case StatusContexto.AguardandoDiretor:
      return proximo === StatusContexto.Publicado || proximo === StatusContexto.Indeferido;
    default:
      return false;
  }
}
