export type Movie = {
  id: string;
  title: string;
  year: number;
  runtimeSeconds: number;
  frameImage: string;
  frameTimestampSeconds: number;
};

export const movies: Movie[] = [
 {
    id: "1",
    title: "The Fifth Element",
    year: 1997,
    runtimeSeconds: 7560,
    frameImage: "/frames/1_The Fifth Element.jpg",
    frameTimestampSeconds: 2725,
  },
  {
    id: "2",
    title: "Die Hard",
    year: 1988,
    runtimeSeconds: 7920,
    frameImage: "/frames/1_die_hard.jpg",
    frameTimestampSeconds: 3063,
  },
  {
    id: "3",
    title: "Pulp Fiction",
    year: 1994,
    runtimeSeconds: 9240,
    frameImage: "/frames/1_pulp_fiction.jpg",
    frameTimestampSeconds: 1448,
  },
  {
    id: "4",
    title: "Die Hard with a Vengeance",
    year: 1995,
    runtimeSeconds: 7680,
    frameImage: "/frames/1_Die_Hard_3.jpg",
    frameTimestampSeconds: 568,
  },
  {
    id: "5",
    title: "Sin City",
    year: 2005,
    runtimeSeconds: 7440,
    frameImage: "/frames/1_sin_city.jpg",
    frameTimestampSeconds: 332,
  },
  {
    id: "6",
    title: "Armageddon",
    year: 1998,
    runtimeSeconds: 9060,
    frameImage: "/frames/1_armaged.jpg",
    frameTimestampSeconds: 8083,
  }

];