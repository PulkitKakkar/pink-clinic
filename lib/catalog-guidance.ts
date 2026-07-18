import type { CatalogItem } from "@/lib/catalog";

export type CatalogGuidance = {
  overview: string;
  prerequisites: string[];
  preparation: string[];
  aftercare: string[];
  suitabilityNote: string;
};

export function getCatalogGuidance(item: CatalogItem): CatalogGuidance {
  const text = `${item.title} ${item.tags.join(" ")}`.toLowerCase();

  if (item.kind === "product") return {
    overview: "Our team can help you understand how this product may fit into your existing routine and how to use it as directed.",
    prerequisites: ["Check the ingredient list for known sensitivities.", "Ask our team before combining it with active or prescription skincare.", "Follow the manufacturer’s age and usage guidance."],
    preparation: ["Read the packaging and supplied instructions before first use.", "Patch test where the manufacturer recommends it.", "Start only with the suggested amount and frequency."],
    aftercare: ["Stop using the product if irritation occurs and seek appropriate advice.", "Store and use the product exactly as directed.", "Contact the salon if you need help with your recommended routine."],
    suitabilityNote: "Product suitability varies. Packaging instructions and advice from an appropriately qualified professional take priority over this general guide.",
  };

  if (item.kind === "course") return {
    overview: "This course is designed to support practical learning in a structured academy environment, with requirements confirmed before enrolment.",
    prerequisites: ["Ask the academy to confirm required prior qualifications.", "Confirm the course date, duration and assessment format.", "Bring any documents or kit requested in your joining instructions."],
    preparation: ["Read the joining information supplied by the academy.", "Tell the educator about any accessibility or learning requirements.", "Arrive ready for both theory and supervised practical work where applicable."],
    aftercare: ["Retain your course notes and follow the taught protocols.", "Complete any required case studies or assessments.", "Contact the academy before offering a new treatment if you are unsure about insurance or qualification requirements."],
    suitabilityNote: "Course completion does not replace any licence, insurance or professional registration required for your intended work.",
  };

  if (/(injection|filler|anti wrinkle|iv drip|lemon bottle)/.test(text)) return {
    overview: "This is a consultation-led service. An appropriately qualified practitioner must assess suitability and explain the available options before treatment.",
    prerequisites: ["A consultation and health screening are required.", "Share relevant medical history, medicines, allergies, pregnancy or breastfeeding status.", "Treatment may be declined or postponed when it is not considered appropriate."],
    preparation: ["Follow only the personalised instructions supplied by your practitioner.", "Do not stop prescribed medication unless the prescriber tells you to.", "Allow time to discuss expected outcomes, alternatives and possible side effects."],
    aftercare: ["Follow the written aftercare supplied at your appointment.", "Contact the clinic if you have concerns or symptoms outside those discussed.", "Seek urgent medical help for any severe or rapidly worsening reaction."],
    suitabilityNote: "Information on this page is general and is not medical advice. No result can be guaranteed.",
  };

  if (/(laser|morpheus|microneed|peel|rejuvenation|hydrafacial|facial)/.test(text)) return {
    overview: "Your appointment begins with a suitability review so the practitioner can select an appropriate approach for your skin, goals and recent treatment history.",
    prerequisites: ["A consultation or patch test may be required.", "Tell us about skin conditions, medicines, allergies and recent procedures.", "Active irritation, infection or recent sun exposure may mean postponing treatment."],
    preparation: ["Follow the pre-treatment instructions supplied after consultation.", "Avoid introducing unfamiliar active skincare immediately before the appointment.", "Arrive with the treatment area clean where practical."],
    aftercare: ["Use the skincare and sun-protection advice supplied by your practitioner.", "Avoid picking, rubbing or using unapproved active products on a sensitised area.", "Contact the clinic if you are concerned about your recovery."],
    suitabilityNote: "Response, downtime and number of appointments vary by individual. Results are not guaranteed.",
  };

  if (/(piercing)/.test(text)) return {
    overview: "Piercing is carried out following an in-person suitability check, with jewellery and placement discussed before the service.",
    prerequisites: ["Bring valid identification and confirm any age or consent requirements.", "Tell the practitioner about allergies, healing concerns and relevant health conditions.", "The practitioner may decline a placement that is not suitable."],
    preparation: ["Eat and hydrate normally before your appointment.", "Keep the intended area clean and free from products where practical.", "Plan around activities that could disturb a new piercing."],
    aftercare: ["Follow the written cleaning and jewellery guidance supplied by the practitioner.", "Avoid unnecessary touching or changing jewellery before healing guidance allows.", "Seek advice promptly if you are concerned about infection or healing."],
    suitabilityNote: "Healing times vary by placement and individual. The practitioner’s written aftercare takes priority.",
  };

  return {
    overview: "Our team will confirm the service, preferred finish and suitability before starting, so your appointment can be tailored to you.",
    prerequisites: ["Tell us about allergies, sensitivities and relevant recent treatments.", "A patch test or consultation may be required for some services.", "Age, consent and suitability requirements will be confirmed when booking."],
    preparation: ["Follow any appointment instructions sent by the salon.", "Arrive with the relevant area clean where practical.", "Contact us before attending if you are unsure whether the service is suitable."],
    aftercare: ["Follow the personalised advice given at your appointment.", "Use only recommended products on a sensitive treatment area.", "Contact the salon if you have concerns after your service."],
    suitabilityNote: "This is general guidance. Your practitioner or therapist may give different instructions based on the service and your individual circumstances.",
  };
}
