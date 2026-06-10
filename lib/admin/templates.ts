export type ConsultationField = {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "textarea" | "yes-no" | "checkbox";
  required?: boolean;
};

export type ConsultationSection = {
  title: string;
  fields: ConsultationField[];
};

export type ConsultationTemplate = {
  slug: string;
  title: string;
  description: string;
  sourceFile: string;
  reviewRequired: boolean;
  sections: ConsultationSection[];
};

const clientDetails: ConsultationSection = {
  title: "Client details",
  fields: [
    { id: "fullName", label: "Full name", type: "text", required: true },
    { id: "dateOfBirth", label: "Date of birth", type: "date", required: true },
    { id: "contactNumber", label: "Contact number", type: "tel", required: true },
    { id: "email", label: "Email address", type: "email", required: true },
    { id: "address", label: "Address", type: "textarea" },
    { id: "emergencyContact", label: "Emergency contact name and number", type: "text" },
    { id: "gpDetails", label: "GP name and address, if applicable", type: "textarea" },
  ],
};

const commonMedical: ConsultationSection = {
  title: "Medical history",
  fields: [
    { id: "pregnantBreastfeeding", label: "Currently pregnant, trying to conceive, or breastfeeding?", type: "yes-no", required: true },
    { id: "allergies", label: "Known allergies and details", type: "textarea", required: true },
    { id: "medication", label: "Current medication, including blood thinners", type: "textarea", required: true },
    { id: "medicalConditions", label: "Medical conditions or other health concerns", type: "textarea", required: true },
    { id: "previousTreatments", label: "Previous relevant treatments and details", type: "textarea" },
  ],
};

const consent: ConsultationSection = {
  title: "Staff review and consent",
  fields: [
    { id: "treatmentArea", label: "Treatment area / treatment plan", type: "textarea", required: true },
    { id: "risksDiscussed", label: "Risks, alternatives, aftercare and expected results discussed", type: "checkbox", required: true },
    { id: "clientConsent", label: "Client consent confirmed by practitioner", type: "checkbox", required: true },
    { id: "practitionerName", label: "Practitioner name", type: "text", required: true },
    { id: "practitionerNotes", label: "Practitioner notes", type: "textarea" },
  ],
};

const template = (slug: string, title: string, description: string, sourceFile: string, specificFields: ConsultationField[] = []): ConsultationTemplate => ({
  slug, title, description, sourceFile, reviewRequired: true,
  sections: [clientDetails, commonMedical, ...(specificFields.length ? [{ title: "Treatment-specific assessment", fields: specificFields }] : []), consent],
});

export const consultationTemplates: ConsultationTemplate[] = [
  template("anti-wrinkle", "Anti-Wrinkle Treatment Consultation", "Medical assessment and consent for anti-wrinkle treatments.", "Anti-Wrinkle Treatment Consultation Form.pdf", [
    { id: "neurologicalConditions", label: "Neurological disorders, including Myasthenia Gravis or ALS", type: "yes-no", required: true },
    { id: "skinConditions", label: "Skin conditions in the treatment area", type: "yes-no", required: true },
  ]),
  template("dermal-fillers", "Dermal Fillers Consultation", "Medical assessment and consent for dermal fillers.", "Dermal Fillers Consultation Form.pdf", [
    { id: "lidocaineAllergy", label: "Allergy to lidocaine or hyaluronic acid", type: "yes-no", required: true },
    { id: "autoimmuneDisorders", label: "Autoimmune disorders", type: "yes-no", required: true },
  ]),
  template("iv-therapy", "IV Therapy Consultation and Consent", "Patient information, suitability review and consent for IV therapy.", "IV Therapy Consultation and Consent Form.pdf", [
    { id: "ivGoal", label: "Reason for IV therapy / treatment goal", type: "textarea", required: true },
    { id: "kidneyHeartConditions", label: "Kidney or heart conditions", type: "yes-no", required: true },
  ]),
  template("lemon-bottle", "Lemon Bottle Consultation", "Medical assessment and consent for Lemon Bottle treatment.", "Lemon Bottle Consultation Form.pdf"),
  template("spmu", "SPMU Consultation", "Consultation and consent for semi-permanent makeup.", "SPM.pdf", [
    { id: "desiredOutcome", label: "Desired result, colour and treatment area", type: "textarea", required: true },
    { id: "patchTest", label: "Patch test completed where required", type: "checkbox", required: true },
  ]),
  template("laser-device", "Laser and Device Consultation", "Client assessment for laser hair removal and device-led treatments.", "dAb New Machine.pdf", [
    { id: "areasToTreat", label: "Areas to be treated", type: "textarea", required: true },
    { id: "recentSunExposure", label: "Significant sun exposure in the last 6 weeks", type: "yes-no", required: true },
    { id: "tanningProducts", label: "Uses sun beds or self-tanning products", type: "yes-no", required: true },
    { id: "tattoos", label: "Tattoos or permanent makeup in treatment areas", type: "yes-no", required: true },
  ]),
];

export function getConsultationTemplate(slug: string) {
  return consultationTemplates.find((item) => item.slug === slug);
}
