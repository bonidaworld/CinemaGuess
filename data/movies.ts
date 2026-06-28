export type Movie = {
  id: string;
  title: string;
  year: number;
  runtimeSeconds: number;
};

export const movies: Movie[] = [
  {
    id: "1",
    title: "The Fifth Element",
    year: 1997,
    runtimeSeconds: 7560,
  },
  {
    id: "2",
    title: "Die Hard",
    year: 1988,
    runtimeSeconds: 7920,
  },
  {
    id: "3",
    title: "Pulp Fiction",
    year: 1994,
    runtimeSeconds: 9240,
  },
  {
    id: "4",
    title: "Die Hard with a Vengeance",
    year: 1995,
    runtimeSeconds: 7680,
  },
  {
    id: "5",
    title: "Sin City",
    year: 2005,
    runtimeSeconds: 7440,
  },
  {
    id: "6",
    title: "Armageddon",
    year: 1998,
    runtimeSeconds: 9060,
  },
];
