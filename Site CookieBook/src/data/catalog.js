// src/data/catalog.js

// ✅ Imports images (depuis: src/assets/illustration/)
import imgBestSeller from "../assets/illustration/best-seller.png";
import imgCaramel from "../assets/illustration/caramel.png";
import imgClassique from "../assets/illustration/classique.png";
import imgAvoine from "../assets/illustration/avoine.png";
import imgCoeurCoulant from "../assets/illustration/coeur-coulant.png";
import imgDoubleChocolat from "../assets/illustration/Double chocolat.png";
import imgEditionLimitee from "../assets/illustration/edition-limite.png";
import imgKinder from "../assets/illustration/kinder.png";
import imgLotus from "../assets/illustration/lotus.png";
import imgMacadamia from "../assets/illustration/macadamia.png";
import imgNutella from "../assets/illustration/nutella.png";
import imgPepiteChoco from "../assets/illustration/pepite de chocolat.png";
import imgPistache from "../assets/illustration/pistache.png";
import imgRedVelvet from "../assets/illustration/red velvet.png";
import imgSansGluten from "../assets/illustration/choco.png";
import imgVanille from "../assets/illustration/vanille.png";
import imgVegan from "../assets/illustration/vegan.png";
// ✅ Extras (option ajout d’un ingrédient)
export const EXTRAS = [
  { id: "choco", label: "Extra chocolat", price: 0.75 },
  { id: "caramel", label: "Coulis caramel", price: 0.8 },
  { id: "pistache", label: "Pistaches", price: 1.1 },
  { id: "noix", label: "Topping noix", price: 0.9 },
];

// ✅ Cookies seulement, en catégories
export const CATEGORIES = [
  {
    id: "classiques",
    name: "Classiques",
    description: "Les indispensables, simples et efficaces.",
    heroEmoji: "🍪",
    image: imgClassique,
    choicesIntro: "Choisis ton cookie classique puis personnalise ta boîte.",
    type: "boxQuantity",
    boxSizes: [
      { label: "Boîte de 4", items: 4, priceMultiplier: 1.0 },
      { label: "Boîte de 6", items: 6, priceMultiplier: 0.99 },
      { label: "Boîte de 12", items: 12, priceMultiplier: 0.97 },
    ],
    products: [
      { id: "pepites", name: "Pépites de chocolat", price: 3.4, image: imgPepiteChoco },
      { id: "vanille", name: "Vanille", price: 3.2, image: imgVanille },
      { id: "doublechoco", name: "Double chocolat", price: 3.6, image: imgDoubleChocolat },
      { id: "macadamia", name: "Macadamia", price: 4.1, image: imgMacadamia },
    ],
  },

  {
    id: "coeur-coulant",
    name: "Cœur coulant",
    description: "Le centre fondant qui fait wow.",
    heroEmoji: "🍫",
    image: imgCoeurCoulant,
    choicesIntro: "Choisis un cœur coulant puis configure boîtes et extras.",
    type: "boxQuantity",
    boxSizes: [
      { label: "Boîte de 4", items: 4, priceMultiplier: 1.0 },
      { label: "Boîte de 6", items: 6, priceMultiplier: 0.99 },
      { label: "Boîte de 12", items: 12, priceMultiplier: 0.97 },
    ],
    products: [
      { id: "kinder", name: "Kinder coulant", price: 3.8, image: imgKinder },
      { id: "nutella", name: "Nutella coulant", price: 3.9, image: imgNutella },
      { id: "caramel", name: "Caramel beurre salé", price: 4.0, image: imgCaramel },
    ],
  },

  {
    id: "sans-gluten",
    name: "Sans gluten",
    description: "Même gourmandise, version sans gluten.",
    heroEmoji: "🌾🚫",
    image: imgSansGluten,
    choicesIntro: "Choisis un cookie sans gluten puis personnalise ta boîte.",
    type: "boxQuantity",
    boxSizes: [
      { label: "Boîte de 4", items: 4, priceMultiplier: 1.0 },
      { label: "Boîte de 6", items: 6, priceMultiplier: 0.99 },
      { label: "Boîte de 12", items: 12, priceMultiplier: 0.97 },
    ],
    products: [
      { id: "sg-choco", name: "Sans gluten choco", price: 3.9, image: imgSansGluten },
      { id: "sg-pistache", name: "Sans gluten pistache", price: 4.2, image: imgPistache },
    ],
  },

  {
    id: "vegan",
    name: "Vegan",
    description: "Sans produits animaux, 100% plaisir.",
    heroEmoji: "🌱",
    image: imgVegan,
    choicesIntro: "Choisis un cookie vegan puis personnalise ta boîte.",
    type: "boxQuantity",
    boxSizes: [
      { label: "Boîte de 4", items: 4, priceMultiplier: 1.0 },
      { label: "Boîte de 6", items: 6, priceMultiplier: 0.99 },
      { label: "Boîte de 12", items: 12, priceMultiplier: 0.97 },
    ],
    products: [
      { id: "v-choco", name: "Vegan chocolat", price: 3.8, image: imgDoubleChocolat },
      { id: "v-avoine", name: "Vegan avoine & pépites", price: 0.1, image: imgAvoine },
    ],
  },

  {
    id: "edition-limitee",
    name: "Édition limitée",
    description: "Saveurs saisonnières (dispo pour un temps).",
    heroEmoji: "✨",
    image: imgEditionLimitee,
    choicesIntro: "Choisis une édition limitée puis personnalise ta boîte.",
    type: "boxQuantity",
    boxSizes: [
      { label: "Boîte de 4", items: 4, priceMultiplier: 1.0 },
      { label: "Boîte de 6", items: 6, priceMultiplier: 0.99 },
      { label: "Boîte de 12", items: 12, priceMultiplier: 0.97 },
    ],
    products: [
      { id: "redvelvet", name: "Red Velvet", price: 4.2, image: imgRedVelvet },
      { id: "speculoos", name: "Spéculoos", price: 4.1, image: imgLotus },
    ],
  },

  {
    id: "best-sellers",
    name: "Best-sellers",
    description: "Les préférés de tout le monde.",
    heroEmoji: "⭐",
    image: imgBestSeller,
    choicesIntro: "Choisis un best-seller puis personnalise ta boîte.",
    type: "boxQuantity",
    boxSizes: [
      { label: "Boîte de 4", items: 4, priceMultiplier: 1.0 },
      { label: "Boîte de 6", items: 6, priceMultiplier: 0.99 },
      { label: "Boîte de 12", items: 12, priceMultiplier: 0.97 },
    ],
    products: [
      { id: "kinder", name: "Kinder coulant", price: 3.8, image: imgKinder },
      { id: "doublechoco", name: "Double chocolat", price: 3.6, image: imgDoubleChocolat },
      { id: "macadamia", name: "Macadamia", price: 4.1, image: imgMacadamia },
    ],
  },
];

// Helpers
export function getCategory(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId);
}

export function getProduct(categoryId, productId) {
  const cat = getCategory(categoryId);
  return cat?.products?.find((p) => p.id === productId);
}
