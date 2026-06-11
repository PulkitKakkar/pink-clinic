export type ConsultationOption = { value: string; label: string };

export type ConsultationField = {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "number" | "textarea" | "yes-no" | "checkbox" | "select" | "multi-checkbox";
  required?: boolean;
  options?: ConsultationOption[];
};

export type ConsultationSection = { title: string; description?: string; fields: ConsultationField[] };
export type ConsultationTemplate = {
  slug: string;
  title: string;
  description: string;
  sourceFile: string;
  reviewRequired: boolean;
  sections: ConsultationSection[];
};

const f = (id: string, label: string, type: ConsultationField["type"] = "yes-no", required = false): ConsultationField => ({ id, label, type, required });
const details = (extra: ConsultationField[] = []): ConsultationSection => ({
  title: "Client details",
  fields: [
    f("fullName", "Full name", "text", true), f("dateOfBirth", "Date of birth", "date", true),
    f("contactNumber", "Contact number", "tel", true), f("email", "Email address", "email", true),
    f("address", "Address", "textarea"), f("emergencyContact", "Emergency contact", "text"),
    f("gpDetails", "GP name and address, if applicable", "textarea"), ...extra,
  ],
});
const practitioner = (extra: ConsultationField[] = []): ConsultationSection => ({
  title: "Practitioner details",
  fields: [f("practitionerName", "Practitioner name", "text", true), f("consultationDate", "Date of consultation", "date", true), ...extra, f("practitionerNotes", "Notes", "textarea")],
});
const score = (value: string, label: string): ConsultationOption => ({ value, label: `${value} — ${label}` });
const yesNo = (id: string, label: string) => f(id, label, "yes-no", true);
const options = (id: string, label: string, values: string[], required = false): ConsultationField => ({
  id, label, type: "multi-checkbox", required, options: values.map((value) => ({ value, label: value })),
});
const signature = (title = "Client declaration and sign-off"): ConsultationSection => ({
  title,
  fields: [
    f("clientSignatureName", "Client / patient signature name", "text", true),
    f("clientSignatureDate", "Client / patient signature date", "date", true),
  ],
});

const antiWrinkle: ConsultationTemplate = {
  slug: "anti-wrinkle", title: "Anti-Wrinkle Treatment Consultation", description: "Medical assessment and consent for anti-wrinkle treatments.",
  sourceFile: "Anti-Wrinkle Treatment Consultation Form.pdf", reviewRequired: true,
  sections: [
    details(),
    { title: "Anti-wrinkle medical history", fields: [
      yesNo("pregnantBreastfeeding", "Currently pregnant or breastfeeding?"),
      yesNo("previousAntiWrinkle", "Had previous anti-wrinkle treatments?"), f("previousAntiWrinkleDetails", "Previous treatment details", "textarea"),
      yesNo("knownAllergies", "Any known allergies?"), f("allergyDetails", "Allergy details", "textarea"),
      yesNo("medicationBloodThinners", "Taking medication or blood thinners?"), f("medicationDetails", "Medication list", "textarea"),
      yesNo("neurologicalDisorders", "Neurological disorders, including Myasthenia Gravis or ALS?"),
      yesNo("heartConditions", "Heart conditions?"), yesNo("autoimmuneDisease", "Autoimmune disease?"),
      yesNo("skinConditions", "Skin conditions such as eczema or psoriasis?"), f("otherMedicalConcerns", "Other medical concerns", "textarea"),
    ]},
    { title: "Lifestyle, treatment areas and expectations", fields: [
      yesNo("smokeAlcohol", "Smoke or consume alcohol regularly?"), yesNo("specialEvents", "Special events planned in the next 2 weeks?"),
      f("specialEventDetails", "Special event details", "textarea"), options("treatmentAreas", "Areas to treat", ["Forehead", "Frown lines", "Crow's feet", "Other"], true),
      f("otherTreatmentArea", "Other treatment area", "text"), f("expectations", "Treatment expectations", "textarea", true),
    ]},
    { title: "Treatment and photography consent", fields: [
      f("natureRisksUnderstood", "Nature, purpose, benefits, risks and alternatives have been explained and questions answered", "checkbox", true),
      f("variableResultsUnderstood", "Variable results and the possible need for multiple sessions are understood", "checkbox", true),
      f("sideEffectsAftercareUnderstood", "Potential side effects and post-treatment care are understood", "checkbox", true),
      yesNo("photographyAdvertisingConsent", "Consent to photographs and their use for advertising/social media?"),
      f("clientDeclaration", "Client confirms information is accurate and consents to treatment", "checkbox", true),
    ]},
    signature(),
    practitioner(),
  ],
};

const dermalFillers: ConsultationTemplate = {
  slug: "dermal-fillers", title: "Dermal Fillers Consultation", description: "Medical assessment and consent for dermal fillers.",
  sourceFile: "Dermal Fillers Consultation Form.pdf", reviewRequired: true,
  sections: [
    details(),
    { title: "Dermal filler medical history", fields: [
      yesNo("pregnantBreastfeeding", "Currently pregnant or breastfeeding?"), yesNo("previousFillers", "Previous fillers or cosmetic procedures?"),
      f("previousFillersDetails", "Previous procedure details", "textarea"), yesNo("lidocaineHyaluronicAllergy", "Allergy to lidocaine, hyaluronic acid, or any other substance?"),
      f("allergyDetails", "Allergy details", "textarea"), yesNo("medications", "Taking blood thinners, immunosuppressants, or other medication?"),
      f("medicationDetails", "Medication list", "textarea"), yesNo("autoimmuneDisorders", "Autoimmune disorders?"), yesNo("heartConditions", "Heart conditions?"),
      yesNo("diabetes", "Diabetes?"), yesNo("skinConditions", "Skin conditions such as eczema or psoriasis?"), f("otherConditions", "Other conditions", "textarea"),
    ]},
    { title: "Treatment plan and expectations", fields: [
      yesNo("smokeAlcohol", "Smoke or consume alcohol regularly?"), yesNo("specialEvents", "Special events planned in the next 2 weeks?"),
      f("specialEventDetails", "Special event details", "textarea"), options("fillerAreas", "Areas considered for filler treatment", ["Lips", "Cheeks", "Nasolabial folds", "Jawline", "Other"], true),
      f("otherFillerArea", "Other filler area", "text"),
      yesNo("previousComplications", "Previously experienced complications from cosmetic treatments?"), f("complicationDetails", "Complication details", "textarea"),
      f("expectations", "Treatment expectations", "textarea", true),
    ]},
    { title: "Dermal filler consent", fields: [
      f("risksUnderstood", "Benefits and risks including bruising, swelling, infection and asymmetry are understood", "checkbox", true),
      f("temporaryEffects", "Temporary effects, generally lasting 6–18 months, are understood", "checkbox", true),
      f("questionsAnswered", "Concerns have been discussed and questions answered", "checkbox", true),
      f("variableResults", "Variable results and possible multiple sessions are understood", "checkbox", true),
      f("postCare", "Post-treatment care instructions will be followed", "checkbox", true),
      yesNo("photographyAdvertisingConsent", "Consent to photographs and their use for advertising/social media?"),
      f("clientDeclaration", "Client confirms information is accurate and consents to treatment", "checkbox", true),
    ]},
    signature(),
    practitioner(),
  ],
};

const ivTherapy: ConsultationTemplate = {
  slug: "iv-therapy", title: "IV Therapy Consultation and Consent", description: "Patient suitability, blood pressure and administration record for IV therapy.",
  sourceFile: "IV Therapy Consultation and Consent Form.pdf", reviewRequired: true,
  sections: [
    details([f("emergencyContactNumber", "Emergency contact number", "tel", true)]),
    { title: "IV therapy medical history", fields: [
      yesNo("knownAllergies", "Known allergies?"), f("allergyDetails", "Allergy details", "textarea"),
      yesNo("medicationsSupplements", "Currently taking medications or supplements?"), f("medicationDetails", "Medication and supplement list", "textarea"),
      yesNo("cardiovascularDisease", "Cardiovascular disease?"), yesNo("kidneyDisease", "Kidney disease?"), yesNo("liverDisease", "Liver disease?"),
      yesNo("diabetes", "Diabetes?"), yesNo("hypertension", "Hypertension / high blood pressure?"), yesNo("hypotension", "Hypotension / low blood pressure?"),
      f("otherSignificantConditions", "Other significant medical conditions", "textarea"),
      yesNo("feverInfection", "Recently experienced fever or infection?"), yesNo("unexplainedWeightLoss", "Recently experienced unexplained weight loss?"),
      yesNo("persistentNauseaVomiting", "Recently experienced persistent nausea or vomiting?"), f("otherSymptoms", "Other concerning symptoms", "textarea"),
      yesNo("pregnant", "Currently pregnant?"), yesNo("breastfeeding", "Currently breastfeeding?"),
    ]},
    { title: "Blood pressure assessment", description: "Clinician use only. Treatment may be postponed or modified if readings fall outside a safe range.", fields: [
      f("systolic", "Pre-treatment systolic (mmHg)", "number", true), f("diastolic", "Pre-treatment diastolic (mmHg)", "number", true),
      { id: "bloodPressureClassification", label: "Blood pressure classification", type: "select", required: true, options: [
        { value: "normal", label: "Normal (90/60 to 120/80 mmHg)" }, { value: "elevated", label: "Elevated (121/81 to 129/84 mmHg)" },
        { value: "high", label: "High blood pressure (130/85 mmHg or above)" }, { value: "low", label: "Low blood pressure (below 90/60 mmHg)" },
      ]},
    ]},
    { title: "IV therapy consent", fields: [
      f("accurateHistory", "Accurate and complete medical history and current health status provided", "checkbox", true),
      f("ivNatureRisks", "Nature, potential benefits and risks of IV therapy explained", "checkbox", true),
      f("questionsAnswered", "Opportunity to ask questions and satisfactory answers received", "checkbox", true),
      f("withdrawConsent", "Understands consent can be withdrawn at any time", "checkbox", true),
      f("reportReactions", "Agrees to immediately report adverse reactions or concerns", "checkbox", true),
      f("dataProtection", "Understands this form will be retained as a medical record under data protection law", "checkbox", true),
    ]},
    { title: "Patient and clinician consent sign-off", fields: [
      f("patientSignatureName", "Patient signature name", "text", true), f("patientSignatureDate", "Patient signature date", "date", true),
      f("clinicianSignatureName", "Clinician signature name", "text", true), f("clinicianSignatureDate", "Clinician signature date", "date", true),
    ]},
    practitioner([
      f("treatmentAdministered", "Treatment administered", "text"), f("dosageIngredients", "Dosage and ingredients", "textarea"),
      f("lotNumbers", "Lot numbers", "text"), f("administrationSite", "Administration site", "text"), f("observations", "Observations", "textarea"),
      f("clinicianNameTitle", "Clinician name and title", "text"), f("clinicUseSignature", "Clinic-use signature name", "text"), f("clinicUseSignatureDate", "Clinic-use signature date", "date"),
    ]),
  ],
};

const lemonBottle: ConsultationTemplate = {
  slug: "lemon-bottle", title: "Lemon Bottle Consultation", description: "Medical assessment and consent for Lemon Bottle fat dissolving treatment.",
  sourceFile: "Lemon Bottle Consultation Form.pdf", reviewRequired: true,
  sections: [
    details(),
    { title: "Lemon Bottle medical history", fields: [
      yesNo("pregnantBreastfeeding", "Currently pregnant or breastfeeding?"), yesNo("previousFatDissolving", "Previous fat dissolving treatments?"),
      f("previousTreatmentDetails", "Previous treatment details", "textarea"), yesNo("soyLidocaineAllergy", "Known allergies, including soy or lidocaine?"),
      f("allergyDetails", "Allergy details", "textarea"), yesNo("bloodThinnersAntiInflammatories", "Taking blood thinners, anti-inflammatory drugs, or other medication?"),
      f("medicationDetails", "Medication list", "textarea"), yesNo("liverKidneyDisease", "Liver or kidney disease?"), yesNo("autoimmuneDisorders", "Autoimmune disorders?"),
      yesNo("heartConditions", "Heart conditions?"), yesNo("diabetes", "Diabetes?"), yesNo("skinConditions", "Skin conditions such as eczema or psoriasis?"),
      f("otherMedicalConditions", "Other medical conditions", "textarea"), yesNo("majorSurgery12Months", "Major surgery in the past 12 months?"),
      yesNo("keloidScarring", "History of keloid or hypertrophic scarring?"),
    ]},
    { title: "Lifestyle and fat dissolving plan", fields: [
      yesNo("smokeAlcohol", "Smoke or consume alcohol regularly?"), yesNo("specialEvents", "Special events planned in the next 2 weeks?"),
      f("specialEventDetails", "Special event details", "textarea"), options("treatmentAreas", "Areas considered for fat dissolving treatment", ["Chin", "Abdomen", "Thighs", "Arms", "Flanks", "Other"], true),
      f("otherTreatmentArea", "Other treatment area", "text"),
      yesNo("previousComplications", "Previously experienced complications from cosmetic treatments?"), f("complicationDetails", "Complication details", "textarea"),
      f("expectations", "Expectations for fat dissolving treatment", "textarea", true),
    ]},
    { title: "Lemon Bottle consent", fields: [
      f("purposeBenefitsRisks", "Purpose, benefits and risks including swelling, bruising, tenderness and infection explained", "checkbox", true),
      f("multipleSessions", "Variable results and possible need for several sessions understood", "checkbox", true),
      f("questionsAnswered", "Concerns discussed and questions answered", "checkbox", true), f("followAftercare", "Agrees to follow post-treatment care instructions", "checkbox", true),
      f("resultsVary", "Understands results may vary and may not meet initial expectations", "checkbox", true),
      yesNo("photographyAdvertisingConsent", "Consent to photographs and their use for advertising/social media?"),
      f("clientDeclaration", "Client confirms information is accurate and consents to treatment", "checkbox", true),
    ]},
    signature(),
    practitioner(),
  ],
};

const spmu: ConsultationTemplate = {
  slug: "spmu", title: "SPMU Consultation", description: "Informed consent and medical health assessment for semi-permanent makeup.",
  sourceFile: "SPM.pdf", reviewRequired: true,
  sections: [
    details([f("city", "City", "text"), f("countyState", "County / state", "text"), f("postcode", "Postcode", "text"), f("homePhone", "Home phone", "tel")]),
    { title: "Semi-permanent makeup informed consent", fields: [
      f("allergyRisk", "Known allergies disclosed and possible pigment, dye or topical reaction risk accepted", "checkbox", true),
      f("aftercareComplications", "Responsibility for complications if post-procedure instructions are not followed accepted", "checkbox", true),
      f("uniqueSkinReaction", "Understands individual skin reaction cannot be predicted", "checkbox", true),
      yesNo("previousMicropigmentation", "Previous micropigmentation on the same area by another practitioner?"),
      f("correctionRisks", "Additional risks and costs of correcting another practitioner's work understood", "checkbox"),
      f("longLastingChange", "Understands the procedure may create a long-lasting change in appearance", "checkbox", true),
      f("futureProcedures", "Understands future laser, surgery, implants or injections may alter the result", "checkbox", true),
      yesNo("observerConsent", "Consent to authorised observers for education or assistance?"),
      f("designColourApproval", "Accepts responsibility for approving the design and colour", "checkbox", true),
      yesNo("internalPhotoConsent", "Consent to before and after photographs for internal documentation?"),
      yesNo("marketingPhotoConsent", "Optional consent to non-identifying before and after photographs for marketing?"),
      f("questionsAnswered", "All questions answered to full satisfaction", "checkbox", true),
    ]},
    { title: "SPMU medical health form", fields: [
      yesNo("over18", "Are you 18 years or over?"), f("medicationsLast6Months", "Medications taken in the last 6 months", "textarea"),
      f("avoidAntiInflammatories", "Understands anti-inflammatories must be avoided for 2 days before treatment", "checkbox", true),
      f("avoidAlcohol", "Understands alcohol must be avoided for 2 days before treatment", "checkbox", true),
      f("avoidAspirin", "Understands aspirin must be avoided for 2 days before treatment", "checkbox", true),
      f("avoidAntibuse", "Understands Antabuse must be avoided for 2 days before treatment", "checkbox", true),
      f("surgeryAddress", "Surgery address", "textarea"), yesNo("metalAllergy", "Allergic reaction to metals?"), yesNo("pigmentAllergy", "Allergic reaction to pigments?"),
      yesNo("foodAllergy", "Food allergies?"), yesNo("lidocaineAllergy", "Lidocaine allergy?"), yesNo("glycerineAllergy", "Glycerine allergy?"),
      yesNo("antisepticAllergy", "Antiseptic allergy?"), f("localAnaestheticAllergies", "Local anaesthetic allergies", "textarea"), f("otherAllergies", "Other allergies", "textarea"),
      yesNo("dentalInjection", "Had a dental injection to numb gums?"), yesNo("dentalAntibiotics", "Receive antibiotics before dental procedures?"),
      yesNo("dentalInjectionReaction", "Difficulty breathing or rapid heartbeat with a dental injection?"), yesNo("chemoRadiation", "Chemotherapy or radiation therapy in the last year?"),
      yesNo("pregnant", "Currently pregnant?"), yesNo("breastfeeding", "Currently breastfeeding?"), yesNo("mriNext6Weeks", "Head MRI scheduled in the next 6 weeks?"),
      yesNo("futureFacialLaserIpl", "Laser or IPL on the face scheduled for the future?"), yesNo("givesBlood", "Do you give blood?"),
      yesNo("tattooSensitivity", "Sensitised reactions to tattoos or permanent makeup?"),
    ]},
    signature(),
    practitioner(),
  ],
};

const laserDevice: ConsultationTemplate = {
  slug: "laser-device", title: "Laser and Device Consultation", description: "Laser hair removal suitability, Fitzpatrick skin analysis and test patch record.",
  sourceFile: "dAb New Machine.pdf", reviewRequired: true,
  sections: [
    details([f("occupation", "Occupation", "text"), f("homeTelephone", "Home telephone", "tel"), f("referralSource", "How did you hear about us?", "text"), f("areasToTreat", "Areas to be treated / hair removal", "textarea", true)]),
    { title: "Laser medical background", fields: [
      yesNo("underDoctorCare", "Currently under a doctor's care?"), f("doctorCareDetails", "Doctor care details", "textarea"),
      yesNo("hormoneMedication", "Taking hormone medication?"), f("hormoneMedicationDetails", "Hormone medication details", "textarea"),
      yesNo("otherMedication", "Taking prescription, non-prescription, topical or herbal medication?"), f("otherMedicationDetails", "Medication details", "textarea"),
      yesNo("recentSurgery", "Had surgery within the last 6 months?"), f("surgeryDetails", "Surgery details", "textarea"),
      yesNo("sensitiveProducts", "Sensitive to soaps or lotions?"), yesNo("skinIrritation", "Does skin become blotchy, red or irritated easily?"),
      yesNo("recentSunExposure", "Significant sun exposure in the last 6 weeks?"), yesNo("recentWaxing", "Waxed treatment areas within the last month?"),
      yesNo("sunbedsSelfTan", "Uses sun beds or self-tanning products?"), yesNo("tattoosPermanentMakeup", "Tattoos or permanent makeup in treatment areas?"),
      yesNo("pregnantTrying", "Pregnant or trying to conceive?"), yesNo("previousLaserHairRemoval", "Previous laser hair removal?"), f("previousLaserDetails", "When and where?", "textarea"),
      yesNo("roaccutane", "Used Roaccutane?"), yesNo("otherCosmeticProcedure", "Had another cosmetic procedure?"), f("cosmeticProcedureDetails", "Procedure details", "textarea"),
    ]},
    { title: "Conditions and contraindications", fields: [
      yesNo("skinCancer", "Skin cancer?"), yesNo("highBloodPressure", "High blood pressure?"), yesNo("polycysticOvaries", "Polycystic ovaries?"),
      yesNo("coldSores", "Cold sores?"), yesNo("haemophilia", "Haemophilia?"), yesNo("menopause", "Menopause?"), yesNo("epilepsy", "Epilepsy?"),
      yesNo("keloid", "Keloid scarring?"), yesNo("antiInflammatoryDrugs", "Taking anti-inflammatory drugs?"), yesNo("irregularPeriods", "Irregular periods?"),
      yesNo("cancer", "Cancer?"), yesNo("heartProblems", "Heart problems?"), yesNo("birthControlPill", "Taking birth control pill?"), yesNo("diabetes", "Diabetes?"),
      yesNo("anticoagulant", "Taking anticoagulants?"), yesNo("thyroid", "Thyroid condition?"), yesNo("aspirin", "Taking aspirin?"),
      f("conditionExplanations", "Condition explanations and dates", "textarea"),
    ]},
    { title: "Skin Type Analysis — Genetic Disposition", description: "Enter the score matching the client's natural characteristics.", fields: [
      { id: "eyeColourScore", label: "Colour of eyes", type: "select", required: true, options: [score("0", "Light blue, grey or green"), score("1", "Blue, grey or green"), score("2", "Blue"), score("3", "Dark brown"), score("4", "Brownish black")] },
      { id: "naturalHairColourScore", label: "Natural hair colour", type: "select", required: true, options: [score("0", "Sandy red"), score("1", "Blond"), score("2", "Chestnut / dark blond"), score("3", "Dark brown"), score("4", "Black")] },
      { id: "unexposedSkinColourScore", label: "Skin colour on non-exposed areas", type: "select", required: true, options: [score("0", "Reddish"), score("1", "Very pale"), score("2", "Pale with beige tint"), score("3", "Light brown"), score("4", "Dark brown")] },
      { id: "frecklesScore", label: "Freckles on unexposed areas", type: "select", required: true, options: [score("0", "Many"), score("1", "Several"), score("2", "Few"), score("3", "Incidental"), score("4", "None")] },
      f("geneticDispositionScore", "Genetic Disposition score", "number", true),
    ]},
    { title: "Skin Type Analysis — Reaction to Sun Exposure", fields: [
      { id: "sunReactionScore", label: "Skin reaction if in the sun too long", type: "select", required: true, options: [score("0", "Painful redness, blistering, peeling"), score("1", "Blistering followed by peeling"), score("2", "Burns, sometimes followed by peeling"), score("3", "Rare burns"), score("4", "Never had burns")] },
      { id: "tanDegreeScore", label: "Degree of tan", type: "select", required: true, options: [score("0", "Hardly or not at all"), score("1", "Light colour tan"), score("2", "Reasonable tan"), score("3", "Tan very easily"), score("4", "Turn dark brown quickly")] },
      { id: "brownWithinHoursScore", label: "Turn brown within several hours after sun exposure", type: "select", required: true, options: [score("0", "Never"), score("1", "Seldom"), score("2", "Sometimes"), score("3", "Often"), score("4", "Always")] },
      { id: "faceSunReactionScore", label: "Face reaction to the sun", type: "select", required: true, options: [score("0", "Very sensitive"), score("1", "Sensitive"), score("2", "Normal"), score("3", "Very resistant"), score("4", "Never had a problem")] },
      f("sunExposureReactionScore", "Reaction to Sun Exposure score", "number", true),
    ]},
    { title: "Skin Type Analysis — Tanning Habits and Result", fields: [
      { id: "lastTanScore", label: "When did the treatment area last receive a tan?", type: "select", required: true, options: [score("0", "More than 3 months ago"), score("1", "2–3 months ago"), score("2", "1–2 months ago"), score("3", "Less than a month ago"), score("4", "Less than 2 weeks ago")] },
      { id: "sunExposureFrequencyScore", label: "How often is the treatment area exposed to the sun?", type: "select", required: true, options: [score("0", "Never"), score("1", "Hardly ever"), score("2", "Sometimes"), score("3", "Often"), score("4", "Always")] },
      f("tanningHabitsScore", "Tanning Habits score", "number", true), f("skinTypeTotalScore", "Skin Type total score", "number", true),
      { id: "fitzpatrickType", label: "Fitzpatrick skin type", type: "select", required: true, options: [
        { value: "I", label: "Type I — total score 0–7" }, { value: "II", label: "Type II — total score 8–16" }, { value: "III", label: "Type III — total score 17–24" },
        { value: "IV", label: "Type IV — total score 25–30" }, { value: "V", label: "Type V — total score 31–35" }, { value: "VI", label: "Type VI — total score 36–40" },
      ]}, f("hairType", "Hair type", "text"),
    ]},
    { title: "Laser consent and consultation checklist", fields: [
      f("risksAccepted", "Laser hair removal risks explained and accepted", "checkbox", true), f("aftercareReceived", "Aftercare instructions received", "checkbox", true),
      f("patchTestWait", "Patch test requirement and 72-hour waiting period understood", "checkbox", true), f("eyeProtection", "Eye protection requirement understood", "checkbox", true),
      yesNo("photographyConsent", "Consent to treatment photography?"), f("healthAssessmentCompleted", "Health assessment completed", "checkbox", true),
      f("treatmentProcessExplained", "Treatment process explained", "checkbox", true), f("hairGrowthCycleExplained", "Hair growth cycle explained", "checkbox", true),
      f("seriesMaintenanceExplained", "Treatment series and maintenance explained", "checkbox", true), f("variableResultsExplained", "Variability of results explained", "checkbox", true),
      f("sunPigmentationExplained", "Sun exposure and hyper/hypopigmentation explained", "checkbox", true), f("homeCareSideEffects", "Home care and side effects explained", "checkbox", true),
      f("clientAuthorisation", "Client authorises and consents to laser hair removal", "checkbox", true),
    ]},
    signature("Client laser consent sign-off"),
    { title: "Test Patch Settings", description: "Practitioner use only.", fields: [
      f("testPatchDate", "Test patch date", "date", true), { id: "testPatchFitzpatrick", label: "Fitzpatrick setting", type: "select", options: ["I", "II", "III", "IV", "V", "VI"].map((value) => ({ value, label: value })) },
      f("testPatchArea", "Laser hair removal patch-test area", "text", true), f("fluence", "Fluence", "text"), f("hz", "HZ", "text"), f("pulse", "Pulse", "text"),
      f("result", "Result", "textarea"), f("shotsFired", "Shots fired", "number"), f("practitionerEyewear", "Protective eyewear worn by practitioner", "checkbox", true),
      f("patientEyewear", "Protective eyewear worn by patient", "checkbox", true), f("concernsComments", "Concerns and comments", "textarea"),
    ]},
    practitioner([f("practitionerSignatureName", "Practitioner signature name", "text", true), f("practitionerSignatureDate", "Practitioner signature date", "date", true)]),
  ],
};

export const consultationTemplates: ConsultationTemplate[] = [antiWrinkle, dermalFillers, ivTherapy, lemonBottle, spmu, laserDevice];
export function getConsultationTemplate(slug: string) { return consultationTemplates.find((item) => item.slug === slug); }
