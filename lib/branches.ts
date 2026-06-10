export type Branch = {
  id: string;
  slug: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  note: string;
};

export const branches: Branch[] = [
  {
    id: "reading-west-street",
    slug: "reading-west-st",
    name: "Reading West Street",
    address: "4-5 West Street, Reading RG1 1TT",
    phone: "0118 962 7111",
    image: "/images/west-street.jpg",
    note: "Central Reading salon",
  },
  {
    id: "reading-watlington-street",
    slug: "reading-watlington-st",
    name: "Reading Watlington Street",
    address: "25 Watlington Street, Reading RG1 4EN",
    phone: "0118 962 7111",
    image: "/images/watlington.jpg",
    note: "Advanced clinic and academy",
  },
];

export function getBranchBySlug(slug: string) {
  return branches.find((branch) => branch.slug === slug);
}

export function getBranchById(id: string) {
  return branches.find((branch) => branch.id === id);
}
