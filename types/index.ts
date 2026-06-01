interface Word {
  id: string;
  day: number;
  word_order: number;
  word: string;
  meaning: string;
  part_of_speech: string | null;
  example: string | null;
  created_at: string;
}
