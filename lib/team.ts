export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  level: string;
  experience: string;
  expertise: string[];
  bio: string;
  image?: string;
  portrait?: { zoom: number; top: number; width?: number };
};

export const founder: TeamMember = {
  slug: "chandni",
  name: "Chandni",
  role: "Founder & Director · Teacher & Assessor",
  level: "Level 7",
  experience: "18+ years",
  expertise: ["Advanced treatments", "Academy education", "Teaching & assessment"],
  bio: "Chandni brings over 18 years of experience to Pink Beauty. As founder and director, she is always exploring new treatments to bring to the clinic. A Level 7 practitioner, teacher and assessor, she also guides the academy, sharing her knowledge and supporting the next generation of beauty professionals.",
  image: "/images/photoshoot/founder-reception-hero.jpg",
};

// Crops align eye lines and face scale within the 4:5 cards; top is a percentage of card height.
// Portrait identities confirmed by the team on 25 October 2026.
export const teamMembers: TeamMember[] = [
  {
    image: "/gallery/photos/8J4A1228.jpg",
    portrait: { zoom: 1.17, top: -11 },
    slug: "alisha", name: "Alisha", role: "Laser & Beauty Practitioner",
    level: "Level 4", experience: "7 years",
    expertise: ["Laser treatments", "Customer care", "Trained by Pink"],
    bio: "A natural talent, trained by Pink. Alisha combines seven years of experience with a warm approach to customer care, helping clients feel welcome and at ease throughout their laser and beauty appointments.",
  },
  {
    image: "/gallery/photos/8J4A1288.jpg",
    portrait: { zoom: 1.05, top: 0 },
    slug: "harpreet", name: "Harpreet", role: "Facial Specialist",
    level: "Level 4", experience: "10 years",
    expertise: ["Facials", "Personalised skincare"],
    bio: "With ten years of experience, Harpreet specialises in facials. She brings a considered, personal approach to each treatment, taking time to understand your skin and what you want from your visit.",
  },
  {
    image: "/gallery/photos/8J4A1298.jpg",
    portrait: { zoom: 1, top: -2 },
    slug: "vilma", name: "Vilma", role: "Facial Specialist",
    level: "Level 4", experience: "13 years",
    expertise: ["Facials", "Professional treatment standards"],
    bio: "Vilma brings 13 years of experience and a focus on professional standards to her facial treatments. Her attention to technique and detail makes thoughtful skin care central to every appointment.",
  },
  {
    image: "/gallery/photos/8J4A1281.jpg",
    portrait: { zoom: 1.16, top: -8.5 },
    slug: "blanch", name: "Blanch", role: "Hair Specialist",
    level: "Level 4", experience: "25+ years",
    expertise: ["Hair", "International experience"],
    bio: "With over 25 years of experience working internationally, Blanch brings a global perspective to hair. Her extensive experience informs a personal approach to helping each client find their look.",
  },
  {
    portrait: { zoom: 1, top: -1.5, width: 900 },
    slug: "humera", name: "Humera", role: "Skin & Aesthetics Practitioner",
    level: "Level 4", experience: "25+ years",
    expertise: ["Injectables", "Skin health"],
    bio: "Humera has over 25 years of experience and a passion for skin health. Her experience includes injectable treatments, with an approach centred on understanding each client’s skin and individual goals.",
    image: "/images/team/humera.webp",
  },
  {
    image: "/gallery/photos/8J4A1206.jpg",
    portrait: { zoom: 1.2, top: -9.5 },
    slug: "shaheen", name: "Shaheen", role: "Facial & Massage Specialist",
    level: "Level 4", experience: "18+ years",
    expertise: ["Facials", "Massage techniques", "Lymphatic drainage massage"],
    bio: "Shaheen brings over 18 years of experience to facials and massage. Known for her massage techniques, including lymphatic drainage massage, she combines skilled hands with a thoughtful approach to each treatment.",
  },
];
