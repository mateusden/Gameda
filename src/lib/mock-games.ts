export type GameStatus = "Jogando" | "Quero jogar" | "Zerado" | "Pausado";

export interface LibraryGame {
  id: number;
  slug: string;
  title: string;
  platform: string;
  hours: string;
  status: GameStatus;
}

export const statusTabs: GameStatus[] = ["Jogando", "Quero jogar", "Zerado", "Pausado"];

export const libraryGames: LibraryGame[] = [
  { id: 1, slug: "hades-ii", title: "Hades II", platform: "PC", hours: "35h", status: "Jogando" },
  { id: 2, slug: "elden-ring", title: "Elden Ring", platform: "PlayStation 5", hours: "120h", status: "Zerado" },
  { id: 3, slug: "hollow-knight-silksong", title: "Silksong", platform: "PC", hours: "0h", status: "Quero jogar" },
  { id: 4, slug: "balatro", title: "Balatro", platform: "Nintendo Switch", hours: "18h", status: "Pausado" },
];