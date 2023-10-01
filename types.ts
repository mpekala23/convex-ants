export interface Room {
  name: string;
  players: string[];
  state: "lobby" | "answering" | "betting" | "results";
  question: {
    text: string;
    answer: number;
  };
  answers: { author: string; value: number }[];
  bets: { better: string; bettingOn: string; amount: number }[];
  done: string[];
  scoreboard: { player: string; score: number }[];
}

// NOTE: For a "real" app, redux is probably? the way to go, but I'm lazy
// Also redux sucks
export interface LocalState {
  username: string;
  roomName: string;
}

export interface Failable {
  status: "ok" | "error";
  message?: string;
}

export interface BetGroup {
  value: number;
  authors: string[];
  betters: { [key: string]: number | null };
  isCorrect: boolean;
}
