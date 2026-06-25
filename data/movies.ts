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
    id: "example-movie",
    title: "Example Movie",
    year: 2000,
    runtimeSeconds: 7200,
    frameImage: "/frames/Michael.webp",
    frameTimestampSeconds: 1800,
  },
];
