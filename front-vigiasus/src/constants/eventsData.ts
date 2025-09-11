export interface Event {
  id: string;
  day: number;
  month: string;
  title: string;
  location: string;
}

export const events: Event[] = [
  {
    id: "1",
    day: 25,
    month: "Ago",
    title: "Reunião da Mesa Diretora",
    location: "Sede do Conselho Municipal",
  },
  {
    id: "2",
    day: 29,
    month: "Ago",
    title: "Reunião Ordinária",
    location: "Sede do Conselho Municipal",
  },
  {
    id: "3",
    day: 4,
    month: "Set",
    title: "Fiscalização em unidades",
    location: "Sede do Conselho Municipal",
  },
];