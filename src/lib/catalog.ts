export interface CatalogGame {
  slug: string;
  title: string;
  genre: string;
  platforms: string[];
}

// Lista local temporária. Com a IGDB, isto vira searchGames(termo).
export const catalog: CatalogGame[] = [
  { slug: "hades-ii", title: "Hades II", genre: "Roguelike / Ação", platforms: ["PC", "PlayStation 5"] },
  { slug: "elden-ring", title: "Elden Ring", genre: "RPG de Ação", platforms: ["PC", "PlayStation 5"] },
  { slug: "hollow-knight-silksong", title: "Hollow Knight: Silksong", genre: "Metroidvania", platforms: ["PC", "Nintendo Switch"] },
  { slug: "balatro", title: "Balatro", genre: "Roguelike / Cartas", platforms: ["PC", "Nintendo Switch"] },
];

// Ignora maiúsculas e acentos: "acao" encontra "Ação"
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Sem termo, devolve o catálogo inteiro
export function searchCatalog(term: string): CatalogGame[] {
  const clean = normalize(term.trim());
  if (!clean) return catalog;
  return catalog.filter((game) => normalize(`${game.title} ${game.genre}`).includes(clean));
}