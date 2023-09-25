export interface Room {
  name: string;
  players: string[];
  leader: string;
  question: string;
  answers: { author: string; value: number };
}
