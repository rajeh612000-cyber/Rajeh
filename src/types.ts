export type Word = { t: string; start: number; end: number };

export type Chunk = {
  index: number;
  text: string;
  start: number;
  end: number;
  startFrame: number;
  endFrame: number;
  highlight: number[]; // indices of words to highlight (yellow)
  words: Word[];
};

export type Scene = {
  id: string;
  theme: string;
  bg: "navyBlue" | "navyBlack";
  startChunk: number;
  endChunk: number;
  start: number;
  end: number;
};

export type Captions = {
  audio: string;
  duration: number;
  fps: number;
  speechStart: number;
  speechEnd: number;
  chunks: Chunk[];
  scenes: Scene[];
};
