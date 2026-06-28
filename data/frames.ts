export type Frame = {
  id: string;
  movieId: string;
  image: string;
  frameTimestampSeconds: number;
};

export const frames: Frame[] = [
  {
    id: "frame-1",
    movieId: "1",
    image: "/frames/1_The_Fifth_Element.jpg",
    frameTimestampSeconds: 2725,
  },
  {
    id: "frame-2",
    movieId: "2",
    image: "/frames/1_die_hard.jpg",
    frameTimestampSeconds: 3063,
  },
  {
    id: "frame-3",
    movieId: "3",
    image: "/frames/1_pulp_fiction.jpg",
    frameTimestampSeconds: 1448,
  },
  {
    id: "frame-4",
    movieId: "4",
    image: "/frames/1_Die_Hard_3.jpg",
    frameTimestampSeconds: 568,
  },
  {
    id: "frame-5",
    movieId: "5",
    image: "/frames/1_sin_city.jpg",
    frameTimestampSeconds: 332,
  },
  {
    id: "frame-6",
    movieId: "6",
    image: "/frames/1_armaged.jpg",
    frameTimestampSeconds: 8083,
  },
];
