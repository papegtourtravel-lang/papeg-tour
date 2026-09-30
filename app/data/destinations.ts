export type Destination = {
  slug: string;
  name: string;
  category: string;
  location: string;
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  highlights: string[];
  bestFor: string[];
  duration: string;
  access: string;
};

export const destinations: Destination[] = [
  {
    slug: "gua-lokale",
    name: "Gua Lokale",
    category: "Nature • Cave",
    location: "Abutpuk, Usilimo, Jayawijaya",
    image: "/images/destinations/gua-lokale-1.jpeg",
    gallery: [
      "/images/destinations/gua-lokale-1.jpeg",
      "/images/destinations/gua-lokale-2.jpeg",
      "/images/destinations/gua-lokale-3.jpeg",
    ],
    shortDescription:
      "A mysterious limestone cave surrounded by the highland landscape of the Baliem Valley.",
    description:
      "Gua Lokale is a limestone cave in Kampung Abutpuk, Usilimo, surrounded by the highland landscape and pine forest of Jayawijaya. The cave offers an atmospheric underground experience featuring natural rock formations and local stories connected with the site.",
    highlights: [
      "Limestone cave",
      "Stalactites and stalagmites",
      "Pine forest surroundings",
      "Underground exploration",
      "Local stories and heritage",
    ],
    bestFor: [
      "Adventure",
      "Photography",
      "Nature lovers",
      "Cultural exploration",
    ],
    duration: "Half day",
    access:
      "Road access from Wamena to Usilimo, followed by local access to the cave area.",
  },

  {
    slug: "gua-kontilola",
    name: "Gua Kontilola",
    category: "Nature • Cave • Adventure",
    location: "Isaima, Usilimo, Jayawijaya",
    image: "/images/destinations/gua-kontilola-1.jpeg",
    gallery: [
      "/images/destinations/gua-kontilola-1.jpeg",
      "/images/destinations/gua-kontilola-2.jpg",
    ],
    shortDescription:
      "A remarkable limestone cave offering an underground adventure combined with natural and cultural heritage.",
    description:
      "Gua Kontilola is a remarkable limestone cave in Kampung Isaima, Usilimo. Its underground environment combines dramatic geological formations with elements of local heritage, making it an interesting destination for travelers seeking nature and adventure experiences.",
    highlights: [
      "Limestone cave",
      "Stalactites and stalagmites",
      "Rock art",
      "Underground exploration",
      "Highland landscape",
    ],
    bestFor: [
      "Adventure",
      "Photography",
      "Nature lovers",
      "Exploration",
    ],
    duration: "Half day",
    access:
      "Road access from Wamena toward Usilimo and local access to the cave area.",
  },

  {
    slug: "kopi-waga-waga",
    name: "Waga-Waga Coffee Experience",
    category: "Coffee • Agro Tourism",
    location: "Waga-Waga, Jayawijaya",
    image: "/images/destinations/kopi-waga-waga-1.jpeg",
gallery: [
  "/images/destinations/kopi-waga-waga-1.jpeg",
],
    shortDescription:
      "Discover highland coffee farming and local coffee production in the Baliem Valley.",
    description:
      "The Waga-Waga Coffee Experience introduces travelers to highland coffee cultivation and local coffee production in Jayawijaya. Visitors can discover the relationship between agriculture, local communities and the highland environment.",
    highlights: [
      "Highland coffee",
      "Coffee farming",
      "Local processing",
      "Coffee tasting",
      "Community interaction",
    ],
    bestFor: [
      "Coffee lovers",
      "Agro tourism",
      "Photography",
      "Community experiences",
    ],
    duration: "Half day",
    access:
      "Road access from Wamena to the Waga-Waga area.",
  },

  {
    slug: "anemayugi-yali-mabel",
    name: "Anemayugi – Yali Mabel Cultural Village",
    category: "Cultural Heritage",
    location: "Anemayugi, Jayawijaya",
    image: "/images/destinations/anemayugi-1.jpeg",
    gallery: [
      "/images/destinations/anemayugi-1.jpeg",
      "/images/destinations/anemayugi-2.webp",
      "/images/destinations/anemayugi-3.jfif",
    ],
    shortDescription:
      "A living cultural experience introducing travelers to Hubula traditions, community life and traditional architecture.",
    description:
      "Anemayugi – Yali Mabel Cultural Village offers travelers an opportunity to encounter living Hubula traditions and community life. Traditional architecture, cultural activities and interaction with local communities form an important part of the experience.",
    highlights: [
      "Hubula culture",
      "Traditional honai",
      "Bakar batu",
      "Traditional dance",
      "Community interaction",
    ],
    bestFor: [
      "Cultural tourism",
      "Photography",
      "Community interaction",
      "Traditional experiences",
    ],
    duration: "Half day to full day",
    access:
      "Road access from Wamena toward the Anemayugi area.",
  },

  {
    slug: "mumi-yiwika",
    name: "Mumi Yiwika",
    category: "Cultural Heritage • History",
    location: "Yiwika, Kurulu, Jayawijaya",
    image: "/images/destinations/mumi-yiwika-1.jpg",
    gallery: [
      "/images/destinations/mumi-yiwika-1.jpg",
      "/images/destinations/mumi-yiwika-2.jpg",
      "/images/destinations/mumi-yiwika-3.jpeg",
    ],
    shortDescription:
      "An ancestral heritage site connected with traditional mummification and the cultural history of the Baliem Valley.",
    description:
      "Mumi Yiwika is an ancestral heritage destination in Kampung Yiwika, Kurulu. The site provides an opportunity to learn about traditional mummification practices and the cultural traditions surrounding ancestral heritage in the Baliem Valley.",
    highlights: [
      "Ancient cultural heritage",
      "Traditional mummification",
      "Ancestral traditions",
      "Local history",
      "Cultural experience",
    ],
    bestFor: [
      "Cultural tourism",
      "History",
      "Photography",
      "Heritage exploration",
    ],
    duration: "Half day",
    access:
      "Road access from Wamena toward Kurulu and Kampung Yiwika.",
  },

  {
    slug: "kampung-budaya-lodama",
    name: "Lodama Cultural Village",
    category: "Cultural Heritage • Traditional Village",
    location: "Obia, Kurulu, Jayawijaya",
    image: "/images/destinations/lodam-1.jpeg",
    gallery: [
      "/images/destinations/lodam-1.jpeg",
      "/images/destinations/lodam-2.jpeg",
      "/images/destinations/lodama-3.jpeg",
    ],
    shortDescription:
      "A community-based cultural destination offering an introduction to living Dani traditions in the Baliem Valley.",
    description:
      "Lodama Cultural Village in Kampung Obia, Kurulu, offers travelers an introduction to traditional village life and living Dani cultural traditions. The destination provides opportunities for cultural encounters and community-based experiences.",
    highlights: [
      "Dani culture",
      "Traditional village",
      "Traditional arts",
      "Cultural performances",
      "Community interaction",
    ],
    bestFor: [
      "Cultural tourism",
      "Photography",
      "Traditional arts",
      "Community experiences",
    ],
    duration: "Half day to full day",
    access:
      "Road access from Wamena toward Kurulu and Kampung Obia.",
  },

  {
    slug: "guest-house-suroba",
    name: "Suroba Guest House",
    category: "Accommodation • Cultural Route",
    location: "Suroba, Jayawijaya",
    image: "/images/destinations/suroba-1.jpeg",
    gallery: [
      "/images/destinations/suroba-1.jpeg",
      "/images/destinations/suroba-2.jpeg",
      "/images/destinations/suroba-3.jpeg",
    ],
    shortDescription:
      "A local guest house experience for travelers exploring the cultural and trekking routes of the Baliem Valley.",
    description:
      "Suroba Guest House can serve as a local accommodation and stopping point for travelers exploring cultural and trekking routes around the Baliem Valley. It provides a more community-oriented way to experience the highland countryside.",
    highlights: [
      "Local accommodation",
      "Baliem Valley trekking",
      "Cultural routes",
      "Highland countryside",
      "Community experience",
    ],
    bestFor: [
      "Trekking",
      "Cultural journeys",
      "Slow travel",
      "Community experiences",
    ],
    duration: "Overnight stay",
    access:
      "Access by road and local trekking routes depending on the itinerary.",
  },

  {
    slug: "pasir-putih",
    name: "Pasir Putih",
    category: "Nature • Scenic Landscape",
    location: "Aikima, Pisugi, Jayawijaya",
    image: "/images/destinations/pasir-putih-1.jpeg",
    gallery: [
      "/images/destinations/pasir-putih-1.jpeg",
      "/images/destinations/pasir-putih-2.jpeg",
      "/images/destinations/pasir-putih-3.jpeg",
    ],
    shortDescription:
      "A unique white-sand landscape in the highlands, surrounded by green mountains and scenic views.",
    description:
      "Pasir Putih in Aikima, Pisugi, presents a distinctive white-sand landscape within the mountainous environment of Jayawijaya. The combination of unusual terrain and surrounding green hills creates an attractive setting for sightseeing and photography.",
    highlights: [
      "White-sand landscape",
      "Mountain scenery",
      "Photography",
      "Scenic viewpoint",
      "Community tourism",
    ],
    bestFor: [
      "Photography",
      "Nature",
      "Scenic exploration",
      "Family trips",
    ],
    duration: "Half day",
    access:
      "Road access from Wamena toward Aikima and Pisugi.",
  },

  {
    slug: "mumi-aikima",
    name: "Mumi Aikima",
    category: "Cultural Heritage • History",
    location: "Aikima, Jayawijaya",
    image: "/images/destinations/mumi-aikima-1.jpg",
    gallery: [
      "/images/destinations/mumi-aikima-1.jpg",
      "/images/destinations/mumi-aikima-2.jpg",
      "/images/destinations/mumi-aikima-3.jpg",
    ],
    shortDescription:
      "An important cultural heritage site representing traditional ancestral preservation in the Baliem Valley.",
    description:
      "Mumi Aikima is a significant cultural heritage destination in the Baliem Valley. The site provides visitors with an opportunity to learn about ancestral preservation traditions and the cultural history associated with the highland communities of Jayawijaya.",
    highlights: [
      "Cultural heritage",
      "Traditional mummification",
      "Ancestral traditions",
      "Local history",
      "Cultural exploration",
    ],
    bestFor: [
      "Cultural tourism",
      "History",
      "Heritage",
      "Photography",
    ],
    duration: "Half day",
    access:
      "Road access from Wamena toward Aikima.",
  },

  {
    slug: "kumugima",
    name: "Kumugima Cultural & Agro Tourism Village",
    category: "Culture • Agro Tourism",
    location: "Kumugima, Jayawijaya",
    image: "/images/destinations/kumugima-1.jpeg",
    gallery: [
      "/images/destinations/kumugima-1.jpeg",
      "/images/destinations/kumugima-2.jpeg",
      "/images/destinations/kumugima-3.jpeg",
    ],
    shortDescription:
      "A community-based destination combining traditional culture, highland agriculture and local coffee experiences.",
    description:
      "Kumugima combines cultural experiences with highland agriculture and community-based tourism. Visitors can discover traditional village life while learning about local agricultural activities, including coffee and pineapple cultivation.",
    highlights: [
      "Traditional honai",
      "Bakar batu",
      "Traditional dance",
      "Highland agriculture",
      "Local coffee",
      "Pineapple cultivation",
    ],
    bestFor: [
      "Cultural tourism",
      "Agro tourism",
      "Photography",
      "Community experiences",
    ],
    duration: "Half day to full day",
    access:
      "Road access from Wamena toward the Kumugima area.",
  },

  {
    slug: "hutan-kota-isakusa",
    name: "Isakusa Urban Forest",
    category: "Nature • Community Tourism",
    location: "Isakusa, Hubikosi, Jayawijaya",
    image: "/images/destinations/isakusa-1.jpeg",
    gallery: [
      "/images/destinations/isakusa-1.jpeg",
      "/images/destinations/isakusa-2.jpeg",
    ],
    shortDescription:
      "A peaceful highland pine forest offering recreation, photography and community-based tourism experiences.",
    description:
      "Isakusa Urban Forest is a highland pine forest destination in Kampung Isakusa, Hubikosi. The area offers a peaceful natural setting for recreation, photography and community activities surrounded by the distinctive landscape of the Papua Highlands.",
    highlights: [
      "Pine forest",
      "Highland nature",
      "Family recreation",
      "Photography",
      "Community events",
    ],
    bestFor: [
      "Nature",
      "Photography",
      "Family recreation",
      "Community events",
    ],
    duration: "Half day",
    access:
      "Road access from Wamena toward Kampung Isakusa.",
  },
];