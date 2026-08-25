export type ConsultationOption = { value: string; label: string };

export type ConsultationField = {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "number" | "textarea" | "yes-no" | "checkbox" | "select" | "multi-checkbox";
  required?: boolean;
  completionRequired?: boolean;
  min?: number;
  max?: number;
  options?: ConsultationOption[];
};

export type ConsultationSection = { title: string; description?: string; fields: ConsultationField[] };
export type ConsultationTemplate = {
  slug: string;
  title: string;
  description: string;
  sourceFile: string;
  reviewRequired: boolean;
  version?: string;
  conditionalRequirements?: Array<{
    whenField: string;
    values: string[];
    requiredField: string;
    message: string;
  }>;
  completionBlockers?: Array<{ field: string; values: string[]; message: string }>;
  detailGroups?: Array<{ fields: string[]; requiredField: string; message: string }>;
  sections: ConsultationSection[];
};

const f = (id: string, label: string, type: ConsultationField["type"] = "yes-no", required = false): ConsultationField => ({ id, label, type, required });
const details = (extra: ConsultationField[] = []): ConsultationSection => ({
  title: "Client details",
  fields: [
    f("fullName", "Full name", "text", true), f("dateOfBirth", "Date of birth", "date", true),
    { id: "gender", label: "Gender", type: "select", options: ["Female", "Male", "Non-binary", "Prefer not to say"].map((value) => ({ value, label: value })) },
    f("contactNumber", "Contact number", "tel", true), f("email", "Email address", "email", true),
    f("address", "Address", "textarea"), f("emergencyContact", "Emergency contact", "text"),
    f("emergencyContactNumber", "Emergency contact number", "tel"),
    f("gpDetails", "GP name and address, if applicable", "textarea"),
    f("occupation", "Occupation", "text"), f("referralSource", "Where did you hear about us?", "text"), ...extra,
  ],
});
const practitioner = (extra: ConsultationField[] = []): ConsultationSection => ({
  title: "Practitioner details",
  fields: [
    f("practitionerName", "Practitioner name", "text", true), f("consultationDate", "Date of consultation", "date", true), ...extra,
    f("practitionerNotes", "Clinical notes and individual consent discussion", "textarea"),
    { ...f("practitionerDeclaration", "I confirm identity, capacity, suitability, consent, product/device checks, treatment record and aftercare have been completed", "checkbox"), completionRequired: true },
    { ...f("practitionerSignatureName", "Practitioner signature / confirmation name", "text"), completionRequired: true },
  ],
});
const score = (value: string, label: string): ConsultationOption => ({ value, label: `${value} — ${label}` });
const yesNo = (id: string, label: string) => f(id, label, "yes-no", true);
const options = (id: string, label: string, values: string[], required = false): ConsultationField => ({
  id, label, type: "multi-checkbox", required, options: values.map((value) => ({ value, label: value })),
});
const completion = (id: string, label: string, type: ConsultationField["type"] = "text"): ConsultationField => ({
  ...f(id, label, type), completionRequired: true,
});
const boundedNumber = (id: string, label: string, min: number, max: number): ConsultationField => ({
  ...f(id, label, "number"), min, max,
});
const comprehensiveMedicalScreen = (): ConsultationSection => ({
  title: "Comprehensive medical history and contraindications",
  description: "Answer every question. Give dates, diagnoses, medication names and relevant details in the notes field.",
  fields: [
    yesNo("tryingToConceive", "Trying to conceive?"), yesNo("pregnant", "Currently pregnant?"), yesNo("breastfeeding", "Currently breastfeeding?"),
    yesNo("hrtContraception", "Using HRT or hormonal contraception?"), yesNo("underMedicalCare", "Under the care of a GP, medical practitioner or healthcare specialist in the last year?"),
    yesNo("prescriptionMedication", "Using prescription medication, including oral or topical medication?"),
    yesNo("supplementsHerbal", "Using supplements or herbal remedies, including St John’s Wort?"),
    yesNo("antibiotics", "Currently taking antibiotics?"), yesNo("anticoagulants", "Taking anticoagulants, blood thinners, aspirin or anti-inflammatory medication?"),
    yesNo("steroidsImmunosuppression", "Using steroid medication or affected by immunosuppression?"),
    yesNo("retinoids", "Using retinoic acid, Retin-A or isotretinoin/Roaccutane, or used isotretinoin in the last 6 months?"),
    yesNo("photosensitisingMedication", "Taking photosensitising medication?"), yesNo("allergies", "Any known allergies or previous allergic reactions?"),
    yesNo("asthma", "Asthma?"), yesNo("diabetes", "Diabetes?"), yesNo("epilepsy", "Epilepsy or seizures?"),
    yesNo("cardiacDisease", "Cardiac disease or another heart condition?"), yesNo("kidneyLiverDisease", "Kidney or liver disease?"),
    yesNo("bloodDisorder", "Blood disorder, including a clotting disorder, HIV or hepatitis?"), yesNo("autoimmuneDisease", "Autoimmune disease?"),
    yesNo("anxietyMentalHealth", "Anxiety, depression, a diagnosed mental-health condition or severe procedure-related anxiety?"),
    yesNo("cancerRadiation", "Cancer, skin cancer, chemotherapy or radiation treatment, current or previous?"), yesNo("recentSurgery", "Recent surgery or planned surgery?"),
    yesNo("activeInfection", "Active bacterial, fungal, viral or herpetic infection, including cold sores?"),
    yesNo("inflammatorySkinCondition", "Active eczema, psoriasis, dermatitis, inflammatory dermatosis or another skin condition?"),
    yesNo("woundsBruising", "Open wounds, recent scar tissue, abrasions, cuts, bruising, sunburn, or unexplained pain/swelling in the treatment area?"),
    yesNo("healingScarring", "Impaired healing or a history of keloid or hypertrophic scarring?"),
    yesNo("oedema", "Medical oedema or significant swelling?"), yesNo("tattoosMoles", "Tattoos, permanent makeup or moles in the proposed treatment area?"),
    f("medicalHistoryDetails", "Details of every Yes answer, current medication and allergies (enter None known when applicable)", "textarea"),
  ],
});
const lifestyleAndSkin = (): ConsultationSection => ({
  title: "Lifestyle, skin and wellbeing",
  fields: [
    yesNo("smokesOrVapes", "Smoke or vape?"), f("smokingAmount", "Cigarettes/vaping frequency", "text"),
    yesNo("drinksAlcohol", "Drink alcohol?"), boundedNumber("alcoholUnits", "Approximate alcohol units per week", 0, 200),
    boundedNumber("workStress", "Work stress level (1–10)", 1, 10), boundedNumber("homeStress", "Home stress level (1–10)", 1, 10),
    f("morningSkincare", "Morning skincare routine and products", "textarea"), f("eveningSkincare", "Evening skincare routine and products", "textarea"),
    f("skinConcerns", "Specific skin concerns", "textarea"),
    options("skinCharacteristics", "Current skin characteristics", ["Normal", "Dry", "Oily", "Combination", "Sensitive", "Dehydrated", "Mature", "Congested", "Acne", "Erythema", "Pigmentation", "Scarring", "Broken capillaries", "Large/open pores", "Dark circles"]),
  ],
});
const referralDecision = (): ConsultationSection => ({
  title: "Suitability and referral decision",
  description: "Practitioner use only. Do not proceed until restrictions and referral requirements have been resolved.",
  fields: [
    { id: "suitabilityOutcome", label: "Consultation outcome", type: "select", required: true, options: ["Suitable to proceed", "Defer or restrict treatment", "Medical referral required", "Not suitable"].map((value) => ({ value, label: value })) },
    options("restrictionReasons", "Restrictions identified", ["Allergy", "Active illness or fever", "Anxiety", "Cuts/bruising/open wound", "Recent injectable or facial treatment", "Recent vaccination", "Herpes simplex", "Hypersensitive skin", "Scarring risk", "Other"]),
    options("referralReasons", "Medical referral considerations", ["Anticoagulant use", "Cardiac disease", "Diabetes", "Liver or kidney disease", "Medical oedema", "Prescribed medication", "Recent surgery", "Radiation treatment", "Undiagnosed pain or swelling", "Other"]),
    { id: "writtenPermission", label: "Written permission / additional consent", type: "select", options: ["Not required", "GP or specialist permission attached", "Additional informed consent recorded", "Pending"].map((value) => ({ value, label: value })) },
    f("clinicalDecisionNotes", "Clinical reasoning, restrictions, referral details and alternative options", "textarea", true),
  ],
});
const injectableDeclarations = (): ConsultationSection => ({
  title: "Pre-treatment declarations and informed consent",
  description: "Each statement must be discussed and confirmed before treatment.",
  fields: [
    f("ageEligibilityConfirmed", "The client’s identity and eligibility for cosmetic injectable treatment, including being aged 18 or over, have been confirmed", "checkbox", true),
    f("accurateMedicalInformation", "I have provided accurate and complete medical and consultation information", "checkbox", true),
    f("avoidTopicals", "I will avoid prescribed topical retinoids and salicylic acid for the advised period before treatment", "checkbox", true),
    f("noRecentConflictingTreatment", "I have disclosed injectables, peels, microneedling, laser/IPL and other facial treatments in the previous 14 days", "checkbox", true),
    f("noRecentIsotretinoin", "I confirm that I have not used isotretinoin/Roaccutane in the last 6 months", "checkbox", true),
    f("sunProtection", "I will avoid direct sun exposure and apply daily broad-spectrum sunscreen of at least SPF30", "checkbox", true),
    f("risksAlternatives", "The purpose, expected benefits, limitations, alternatives, material risks and possible complications have been explained", "checkbox", true),
    f("resultsNotGuaranteed", "I understand results vary, are not guaranteed and may require review, correction or further treatment", "checkbox", true),
    f("adverseEffects", "I understand possible adverse reactions and will contact the clinic promptly if I have concerns", "checkbox", true),
    f("questionsAnswered", "My questions have been answered and I have had sufficient time to make an informed decision", "checkbox", true),
    yesNo("clinicalPhotographyConsent", "Consent to before, during and after photographs for confidential clinical records?"),
    yesNo("marketingPhotographyConsent", "Optional consent to use agreed photographs for education or marketing?"),
    f("consentToTreatment", "I consent to the agreed treatment and will follow all pre-treatment and aftercare instructions", "checkbox", true),
  ],
});
const procedureRecord = (kind: "toxin" | "filler"): ConsultationSection => ({
  title: "Procedure record and aftercare",
  description: "Practitioner use only. Complete at the treatment appointment.",
  fields: [
    f("prescriber", "Prescriber / prescription reference, if applicable", "text"), completion("productName", "Product name"),
    completion("batchNumber", "Batch / lot number"), completion("expiryDate", "Expiry date", "date"),
    completion("areasTreated", "Areas treated, injection points, plane and dose/volume by area", "textarea"), completion("quantityUsed", kind === "toxin" ? "Total units and dilution used" : "Total volume used (ml)"),
    ...(kind === "toxin" ? [completion("diluentDetails", "Diluent, batch number and volume"), completion("reconstitutionDateTime", "Reconstitution date and time", "text"), completion("labelUse", "Licensed indication or off-label rationale", "textarea")] : []),
    ...(kind === "filler" ? [completion("anaestheticDetails", "Anaesthetic used, if any"), completion("needleCannulaDetails", "Needle/cannula type, size and lot where available"), completion("emergencyPlanDiscussed", "Emergency symptoms and clinic contact/escalation plan discussed", "checkbox")] : []),
    ...(kind === "filler" ? [options("treatmentMethod", "Treatment method", ["Needle", "Cannula"]), options("treatmentTechnique", "Technique", ["Threading", "Depot", "Fanning", "Bolus", "Cross-hatching", "Other"])] : []),
    completion("procedureObservations", "Procedure observations, immediate response, complications and actions", "textarea"),
    { ...yesNo("postProcedurePhoto", "Post-procedure photographs taken and uploaded to the clinical record?"), completionRequired: true },
    completion("aftercareGiven", "Aftercare, urgent warning signs and home-care advice given", "textarea"), completion("followUpDate", "Follow-up / review date", "date"),
  ],
});
const antiWrinkle: ConsultationTemplate = {
  slug: "anti-wrinkle", title: "Anti-Wrinkle Treatment Consultation", description: "Comprehensive medical assessment, treatment planning, informed consent and procedure record for botulinum toxin treatment.",
  sourceFile: "Anti-Wrinkle Treatment Consultation Form.pdf", reviewRequired: true,
  conditionalRequirements: [
    { whenField: "previousAntiWrinkle", values: ["Yes"], requiredField: "previousAntiWrinkleDetails", message: "Add previous botulinum toxin treatment details." },
    { whenField: "specialEvents", values: ["Yes"], requiredField: "specialEventDetails", message: "Add event or travel details." },
    { whenField: "suitabilityOutcome", values: ["Medical referral required", "Defer or restrict treatment", "Not suitable"], requiredField: "clinicalDecisionNotes", message: "Record the clinical decision and referral/restriction details." },
  ],
  detailGroups: [{ fields: ["tryingToConceive", "pregnant", "breastfeeding", "hrtContraception", "underMedicalCare", "prescriptionMedication", "supplementsHerbal", "antibiotics", "anticoagulants", "steroidsImmunosuppression", "retinoids", "photosensitisingMedication", "allergies", "asthma", "diabetes", "epilepsy", "cardiacDisease", "kidneyLiverDisease", "bloodDisorder", "autoimmuneDisease", "anxietyMentalHealth", "cancerRadiation", "recentSurgery", "activeInfection", "inflammatorySkinCondition", "woundsBruising", "healingScarring", "oedema", "tattoosMoles"], requiredField: "medicalHistoryDetails", message: "Explain every Yes answer in the medical-history details field." }],
  sections: [
    details(),
    { title: "Consultation goals and previous treatment", fields: [
      f("objectivesConcerns", "Objectives, concerns, expectations and desired outcome", "textarea", true), f("alternativesDiscussed", "Alternative treatment options discussed", "textarea", true),
      yesNo("previousAntiWrinkle", "Previous botulinum toxin or anti-wrinkle treatment?"), f("previousAntiWrinkleDetails", "Previous product, areas, dates, results and complications", "textarea"),
      yesNo("neuromuscularDisorder", "Neuromuscular disorder, including myasthenia gravis, Lambert-Eaton syndrome, ALS, facial palsy or swallowing difficulty?"),
      yesNo("specialEvents", "Special event or travel planned in the next 2 weeks?"), f("specialEventDetails", "Event or travel details", "textarea"),
    ]},
    comprehensiveMedicalScreen(), lifestyleAndSkin(), referralDecision(),
    { title: "Botulinum toxin treatment plan", fields: [
      options("treatmentAreas", "Proposed treatment areas", ["Frontalis / forehead", "Corrugator and procerus / frown lines", "Orbicularis oculi / crow’s feet", "Nasalis / bunny lines", "Masseter", "Mentalis / chin", "Platysma / neck", "Orbicularis oris / lip lines", "Depressor anguli oris", "Levator labii superioris", "Other"], true),
      f("otherTreatmentArea", "Other treatment area", "text"), f("treatmentPlanNotes", "Assessment, muscle activity, asymmetry, planned outcome and limitations", "textarea", true),
      f("toxinCommonRisks", "Common and material risks including pain/bruising, headache, asymmetry, brow/eyelid ptosis, dry eye or visual symptoms and local weakness have been discussed", "checkbox", true),
      f("toxinUrgentSymptoms", "Urgent symptoms of distant toxin spread, including swallowing, speech or breathing difficulty, and the emergency action required have been discussed", "checkbox", true),
    ]},
    injectableDeclarations(), procedureRecord("toxin"), practitioner(),
  ],
};

const dermalFillers: ConsultationTemplate = {
  slug: "dermal-fillers", title: "Dermal Fillers Consultation", description: "Comprehensive medical assessment, treatment planning, informed consent and procedure record for dermal fillers.",
  sourceFile: "Dermal Fillers Consultation Form.pdf", reviewRequired: true,
  conditionalRequirements: [
    { whenField: "previousFillers", values: ["Yes"], requiredField: "previousFillersDetails", message: "Add previous filler treatment details." },
    { whenField: "specialEvents", values: ["Yes"], requiredField: "specialEventDetails", message: "Add event or travel details." },
    { whenField: "suitabilityOutcome", values: ["Medical referral required", "Defer or restrict treatment", "Not suitable"], requiredField: "clinicalDecisionNotes", message: "Record the clinical decision and referral/restriction details." },
  ],
  detailGroups: [{ fields: ["tryingToConceive", "pregnant", "breastfeeding", "hrtContraception", "underMedicalCare", "prescriptionMedication", "supplementsHerbal", "antibiotics", "anticoagulants", "steroidsImmunosuppression", "retinoids", "photosensitisingMedication", "allergies", "asthma", "diabetes", "epilepsy", "cardiacDisease", "kidneyLiverDisease", "bloodDisorder", "autoimmuneDisease", "anxietyMentalHealth", "cancerRadiation", "recentSurgery", "activeInfection", "inflammatorySkinCondition", "woundsBruising", "healingScarring", "oedema", "tattoosMoles"], requiredField: "medicalHistoryDetails", message: "Explain every Yes answer in the medical-history details field." }],
  sections: [
    details(),
    { title: "Consultation goals and previous treatment", fields: [
      f("objectivesConcerns", "Objectives, concerns, expectations and desired outcome", "textarea", true), f("alternativesDiscussed", "Alternative treatment options discussed", "textarea", true),
      yesNo("previousFillers", "Previous dermal filler, cosmetic procedure or implant in the proposed area?"), f("previousFillersDetails", "Previous product, areas, dates, results and complications", "textarea"),
      yesNo("lidocaineHyaluronicAllergy", "Allergy or reaction to lidocaine, local anaesthetic, hyaluronic acid or dermal filler?"),
      yesNo("dentalWork", "Recent or planned dental work, dental procedure or oral infection?"),
      yesNo("specialEvents", "Special event or travel planned in the next 2 weeks?"), f("specialEventDetails", "Event or travel details", "textarea"),
    ]},
    comprehensiveMedicalScreen(), lifestyleAndSkin(), referralDecision(),
    { title: "Dermal filler treatment plan", fields: [
      options("fillerAreas", "Proposed treatment areas", ["Lips / lip line", "Cheeks / zygomatic area", "Nasolabial folds", "Marionette lines", "Perioral lines", "Chin", "Jawline", "Temples", "Tear trough", "Other"], true),
      f("otherFillerArea", "Other treatment area", "text"), f("treatmentPlanNotes", "Facial assessment, asymmetry, product/volume plan, expected outcome and limitations", "textarea", true),
      f("vascularRiskUnderstood", "Specific risks including vascular occlusion, tissue necrosis, visual disturbance/blindness and urgent treatment have been explained", "checkbox", true),
      f("fillerCommonDelayedRisks", "Common and delayed risks including pain, bruising, swelling, infection, asymmetry, under/over-correction, lumps/nodules, migration, delayed inflammation and cold-sore reactivation where relevant have been explained", "checkbox", true),
      f("dissolvingUnderstood", "Where the selected product is hyaluronic-acid filler, the possible need for hyaluronidase/dissolving, review or emergency referral has been explained", "checkbox", true),
    ]},
    injectableDeclarations(), procedureRecord("filler"), practitioner(),
  ],
};

const skinPeelMicroneedling: ConsultationTemplate = {
  slug: "skin-peel-microneedling", title: "Skin Peel and Microneedling Consultation", description: "Level 5-informed assessment, Fitzpatrick classification, patch testing, consent and procedure record for medium-depth peels and microneedling.",
  sourceFile: "L5 Consultation Form.pdf", reviewRequired: true,
  completionBlockers: [{ field: "patchTestResult", values: ["Positive — do not proceed", "Pending"], message: "Treatment cannot be completed while the patch test is positive or pending." }],
  conditionalRequirements: [
    { whenField: "procedureType", values: ["Medium-depth skin peel", "Combined protocol"], requiredField: "peelProduct", message: "Record the peel product, type and strength." },
    { whenField: "procedureType", values: ["Microneedling", "Combined protocol"], requiredField: "needleDevice", message: "Record the microneedling device, cartridge and depth by zone." },
  ],
  detailGroups: [{ fields: ["pregnantBreastfeeding", "hrtContraception", "underMedicalCare", "autoimmuneDisease", "prescriptionMedication", "antibiotics", "anticoagulants", "photosensitisingMedication", "retinoidsActives", "activeInfection", "bloodDisorder", "skinCancer", "dermatitisPsoriasis", "healingScarring", "kidneyOedema", "asthma", "mentalHealth", "burnsLesions", "recentTan"], requiredField: "medicalHistoryDetails", message: "Explain every Yes answer in the medical-history details field." }],
  sections: [
    details(),
    { title: "Consultation goals and skincare", fields: [
      f("objectivesConcerns", "Objectives, concerns, expectations and desired outcome", "textarea", true), f("alternativesDiscussed", "Alternative treatment options discussed", "textarea", true),
      f("morningSkincare", "Morning skincare routine, active ingredients and products", "textarea", true), f("eveningSkincare", "Evening skincare routine, active ingredients and products", "textarea", true),
      options("treatmentGoals", "Treatment goals", ["General skin rejuvenation", "Improved hydration", "Superficial blemishes", "Improved texture", "Scarring", "Pigmentation", "Other"], true),
    ]},
    { title: "Medical history and peel/microneedling contraindications", description: "Answer every question and explain all Yes answers below.", fields: [
      yesNo("pregnantBreastfeeding", "Pregnant, trying to conceive or breastfeeding?"), yesNo("hrtContraception", "Using HRT or hormonal contraception?"),
      yesNo("underMedicalCare", "Under the care of a medical practitioner or healthcare specialist in the last year?"), yesNo("autoimmuneDisease", "Autoimmune disease?"),
      yesNo("prescriptionMedication", "Using prescription medication, including topical medication or topical steroids?"), yesNo("antibiotics", "Currently taking antibiotics?"),
      yesNo("anticoagulants", "Taking anticoagulants, aspirin, blood thinners or anti-inflammatory medication?"), yesNo("photosensitisingMedication", "Taking photosensitising medication or St John’s Wort?"),
      yesNo("retinoidsActives", "Using retinoic acid, Retin-A, isotretinoin/Roaccutane, AHA/BHA, vitamin A derivatives or retinol?"),
      yesNo("activeInfection", "Active bacterial, fungal, viral or herpetic infection?"), yesNo("bloodDisorder", "Blood disorder, including HIV or hepatitis?"),
      yesNo("skinCancer", "Current or previous skin cancer, melanoma or suspicious lesion?"), yesNo("dermatitisPsoriasis", "Active atopic dermatitis, eczema, psoriasis or another inflammatory skin condition?"),
      yesNo("healingScarring", "Impaired healing or history of keloid/hypertrophic scarring?"), yesNo("kidneyOedema", "Kidney disease or medical oedema?"),
      yesNo("asthma", "Asthma?"), yesNo("mentalHealth", "Severe anxiety or diagnosed nervous/mental-health condition relevant to treatment?"),
      yesNo("burnsLesions", "Burns, open wounds, moles, tattoos or permanent makeup in the proposed area?"), yesNo("recentTan", "Sunburn, significant sun exposure, sunbed use or fake tan in the previous 14 days?"),
      f("medicalHistoryDetails", "Details of every Yes answer, medication, supplements, allergies and relevant dates", "textarea"),
      options("allergies", "Known allergies", ["Apples", "Aspirin / salicylic acid", "Citrus", "Grapes", "Milk", "Penicillin", "Cosmetic products", "Other", "None known"], true),
    ]},
    { title: "Skin classification and assessment", description: "Practitioner use only.", fields: [
      { id: "fitzpatrickType", label: "Fitzpatrick skin type", type: "select", required: true, options: ["I", "II", "III", "IV", "V", "VI"].map((value) => ({ value, label: `Type ${value}` })) },
      f("ethnicBackground", "Ethnic background relevant to skin assessment", "text"),
      options("skinCharacteristics", "Skin characteristics", ["Normal", "Combination", "Oily", "Sensitive", "Dehydrated", "Mature", "Acne", "Hyperpigmentation", "Hypopigmentation", "Broken capillaries", "Open/large pores", "Dark circles", "Erythema"], true),
      { id: "skinHealing", label: "Observed skin healing response", type: "select", options: ["Brown pigmentation", "Pink / fades to white", "Not yet assessed"].map((value) => ({ value, label: value })) },
      { id: "epidermalThickness", label: "Epidermal thickness", type: "select", options: ["Thin", "Medium", "Thick"].map((value) => ({ value, label: value })) },
      f("skinAssessmentNotes", "Skin assessment findings and treatment rationale", "textarea", true),
    ]},
    { title: "Patch test and recent procedures", description: "Follow the selected product's manufacturer instructions and the clinic's insurer-approved protocol.", fields: [
      yesNo("recentInjectables", "Botulinum toxin or dermal filler in the previous 14 days?"), yesNo("recentLaser", "Laser, IPL or light-based therapy in the previous 14 days?"),
      yesNo("recentDepilation", "Waxing, depilatory treatment or electrolysis in the previous 14 days?"), yesNo("recentMicrodermabrasion", "Microdermabrasion in the previous 14 days?"),
      yesNo("recentFacialSurgery", "Facial surgery in the previous 14 days?"), yesNo("recentPeelNeedling", "Skin peel or microneedling in the previous 14 days?"),
      f("patchTestDate", "Patch test date, where required", "date"), f("patchTestProductArea", "Patch-test product, strength and area", "textarea"),
      { id: "patchTestResult", label: "Patch-test decision/result", type: "select", required: true, options: ["Negative — suitable to proceed", "Positive — do not proceed", "Pending", "Not required under approved product protocol"].map((value) => ({ value, label: value })) },
      f("patchTestReaction", "Patch-test reaction or comments", "textarea"),
    ]},
    { title: "Pre-treatment declarations and consent", fields: [
      f("accurateInformation", "I have provided accurate medical and consultation information and disclosed all contraindications", "checkbox", true),
      f("preTreatmentRestrictions", "I understand the restrictions on injectables, peels, microneedling, laser/IPL, depilation, active skincare and topical medication before treatment", "checkbox", true),
      f("isotretinoinDeclaration", "I confirm I have not used isotretinoin/Roaccutane in the previous 6 months", "checkbox", true),
      f("sunProtection", "I will avoid sun/fake tan and use broad-spectrum sunscreen of at least SPF30 as advised", "checkbox", true),
      f("contraActions", "Expected reactions and risks including discomfort, erythema, peeling, breakout, infection, scarring and pigment change have been explained", "checkbox", true),
      f("resultsNotGuaranteed", "I understand results vary, are not guaranteed and may require a course of treatment", "checkbox", true),
      f("questionsAnswered", "Limitations, alternatives and complications have been discussed and my questions answered", "checkbox", true),
      yesNo("clinicalPhotographyConsent", "Consent to before, during and after photographs for confidential clinical records?"),
      yesNo("marketingPhotographyConsent", "Optional consent to use agreed photographs for education or marketing?"),
      f("consentToTreatment", "I consent to the agreed peel or microneedling treatment and will follow all aftercare instructions", "checkbox", true),
    ]},
    { title: "Procedure record and aftercare", description: "Practitioner use only. Complete at the treatment appointment.", fields: [
      { ...completion("procedureType", "Procedure", "select"), options: ["Medium-depth skin peel", "Microneedling", "Combined protocol"].map((value) => ({ value, label: value })) },
      completion("cleanserUsed", "Cleanser used"), completion("treatmentProductTraceability", "Peel/microneedling products, batch/lot and expiry", "textarea"),
      f("peelProduct", "Peel product, type and strength", "text"), f("peelApplication", "Application method, layers, end point and treatment area", "textarea"),
      f("peelTiming", "Peel duration and total treatment time", "text"), f("neutraliser", "Neutralising product, method and time", "textarea"),
      f("needleDevice", "Microneedling device, sterile cartridge lot, needle depth by zone and passes", "textarea"), f("anaestheticDetails", "Anaesthetic details, where used", "textarea"),
      completion("infectionControlCheck", "Skin preparation and infection-control checks completed", "checkbox"), completion("productsUsed", "Post-procedure products used and areas applied", "textarea"),
      completion("skinReaction", "Skin reaction, observations, complications and actions", "textarea"), { ...yesNo("postProcedurePhoto", "Post-procedure photograph taken and uploaded?"), completionRequired: true },
      completion("aftercareGiven", "Aftercare/home-care programme and products supplied", "textarea"), completion("followUpDate", "Follow-up / review date", "date"),
    ]},
    practitioner(),
  ],
};

const ivTherapy: ConsultationTemplate = {
  slug: "iv-therapy", title: "IV Therapy Consultation and Consent", description: "Patient suitability, blood pressure and administration record for IV therapy.",
  sourceFile: "IV Therapy Consultation and Consent Form.pdf", reviewRequired: true,
  conditionalRequirements: [
    { whenField: "knownAllergies", values: ["Yes"], requiredField: "allergyDetails", message: "Add allergy details." },
    { whenField: "medicationsSupplements", values: ["Yes"], requiredField: "medicationDetails", message: "Add medication and supplement details." },
  ],
  sections: [
    details(),
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
    { title: "Baseline observations and clinical decision", description: "Clinician use only. The automatic blood-pressure flag is advisory; use the clinic's approved observation and escalation protocol.", fields: [
      { ...boundedNumber("systolic", "Pre-treatment systolic (mmHg)", 40, 260), required: true }, { ...boundedNumber("diastolic", "Pre-treatment diastolic (mmHg)", 25, 160), required: true },
      { id: "bloodPressureClassification", label: "Blood pressure classification", type: "select", required: true, options: [
        { value: "normal", label: "Normal (90/60 to 120/80 mmHg)" }, { value: "elevated", label: "Elevated (121/81 to 129/84 mmHg)" },
        { value: "high", label: "High blood pressure (130/85 mmHg or above)" }, { value: "low", label: "Low blood pressure (below 90/60 mmHg)" },
      ]}, boundedNumber("baselinePulse", "Baseline pulse (bpm)", 25, 220), boundedNumber("baselineSpO2", "Baseline oxygen saturation (%)", 50, 100),
      f("observationDecision", "Clinician interpretation, suitability decision and escalation/override reason", "textarea", true),
    ]},
    { title: "IV therapy consent", fields: [
      f("accurateHistory", "Accurate and complete medical history and current health status provided", "checkbox", true),
      f("ivNatureRisks", "Nature, potential benefits and risks of IV therapy explained", "checkbox", true),
      f("questionsAnswered", "Opportunity to ask questions and satisfactory answers received", "checkbox", true),
      f("withdrawConsent", "Understands consent can be withdrawn at any time", "checkbox", true),
      f("reportReactions", "Agrees to immediately report adverse reactions or concerns", "checkbox", true),
      f("dataProtection", "Understands this form will be retained as a medical record under data protection law", "checkbox", true),
    ]},
    practitioner([
      completion("treatmentIndication", "Treatment indication and expected benefit", "textarea"), completion("treatmentAdministered", "Treatment administered"),
      completion("dosageIngredients", "Dose, ingredients and product-specific checks", "textarea"), completion("lotNumbers", "Batch/lot and expiry for each ingredient", "textarea"),
      completion("cannulaRecord", "Cannula size, insertion site, removal and site condition", "textarea"), completion("administrationSite", "Administration site"),
      completion("infusionTiming", "Infusion start/end time and rate"), completion("postObservations", "Post-treatment BP, pulse, SpO2 and condition", "textarea"),
      completion("observations", "Observations, adverse reactions, actions and escalation", "textarea"), completion("clinicianNameTitle", "Clinician name and title"),
    ]),
  ],
};

const mounjaro: ConsultationTemplate = {
  slug: "mounjaro", title: "Mounjaro (Tirzepatide) Consultation", description: "Prescriber-led suitability assessment, informed consent, monitoring plan and administration record for Mounjaro (tirzepatide).",
  sourceFile: "Mounjaro Consultation and Treatment Record.pdf", reviewRequired: true,
  version: "2026-08-23.1",
  conditionalRequirements: [
    { whenField: "pregnancyPotential", values: ["Yes"], requiredField: "contraceptionPlan", message: "Record the contraception and pregnancy-prevention discussion." },
    { whenField: "oralContraception", values: ["Yes"], requiredField: "contraceptionPlan", message: "Record the additional barrier or non-oral contraception plan." },
    { whenField: "diabetesMedication", values: ["Yes"], requiredField: "diabetesMedicationDetails", message: "Record diabetes medicines and the hypoglycaemia monitoring plan." },
    { whenField: "previousGlp1", values: ["Yes"], requiredField: "previousGlp1Details", message: "Record previous GLP-1/GIP treatment, response and adverse effects." },
    { whenField: "suitabilityOutcome", values: ["Medical referral required", "Defer or restrict treatment", "Not suitable"], requiredField: "clinicalDecisionNotes", message: "Record the clinical decision and referral/restriction details." },
  ],
  completionBlockers: [
    { field: "suitabilityOutcome", values: ["Medical referral required", "Defer or restrict treatment", "Not suitable"], message: "Mounjaro administration cannot be completed unless the client is suitable to proceed." },
    { field: "pregnantTryingBreastfeeding", values: ["Yes"], message: "Mounjaro administration cannot be completed during pregnancy, while trying to conceive or while breastfeeding." },
    { field: "acutePancreatitisSymptoms", values: ["Yes"], message: "Mounjaro administration cannot be completed while acute pancreatitis symptoms require urgent assessment." },
  ],
  sections: [
    details(),
    { title: "Treatment goals and baseline assessment", fields: [
      { ...boundedNumber("heightCm", "Height (cm)", 100, 250), required: true }, { ...boundedNumber("baselineWeightKg", "Baseline weight (kg)", 30, 400), required: true },
      { ...boundedNumber("baselineBmi", "Baseline BMI (kg/m2)", 10, 100), required: true }, boundedNumber("waistCm", "Waist circumference (cm)", 30, 250),
      f("treatmentIndication", "Licensed treatment indication and eligibility rationale", "textarea", true),
      f("weightRelatedConditions", "Weight-related conditions and relevant clinical measurements", "textarea", true),
      f("goalsExpectations", "Goals, expectations, previous weight-management approaches and agreed lifestyle support", "textarea", true),
    ]},
    { title: "Medical history and medicine review", description: "Answer every question and record relevant dates, diagnoses and medicine names.", fields: [
      yesNo("tirzepatideAllergy", "Allergy or previous hypersensitivity to tirzepatide or any Mounjaro ingredient?"),
      yesNo("pregnantTryingBreastfeeding", "Currently pregnant, trying to conceive or breastfeeding?"),
      yesNo("pregnancyPotential", "Able to become pregnant?"), yesNo("oralContraception", "Currently using oral contraception?"),
      f("contraceptionPlan", "Contraception discussion, additional protection and one-month washout plan", "textarea"),
      yesNo("previousGlp1", "Previous or current GLP-1/GIP medicine?"), f("previousGlp1Details", "Medicine, dose, last dose date, response, reason for stopping and adverse effects", "textarea"),
      yesNo("diabetes", "Diabetes or history of abnormal blood glucose?"), yesNo("diabetesMedication", "Using insulin, a sulfonylurea or another diabetes medicine?"),
      f("diabetesMedicationDetails", "Diabetes medicines, glucose/HbA1c information and hypoglycaemia monitoring or dose-adjustment plan", "textarea"),
      yesNo("pancreatitisHistory", "Previous pancreatitis or pancreatic disease?"), yesNo("acutePancreatitisSymptoms", "Current severe persistent abdominal pain, particularly radiating to the back, with or without nausea or vomiting?"),
      yesNo("gallbladderDisease", "Gallstones, gallbladder disease or previous gallbladder surgery?"), yesNo("severeGastrointestinalDisease", "Severe gastrointestinal disease, including severe gastroparesis?"),
      yesNo("kidneyDisease", "Kidney disease, impaired renal function or risk of dehydration?"), yesNo("liverDisease", "Liver disease?"),
      yesNo("eatingDisorder", "Current or previous eating disorder, disordered eating or significant nutritional concern?"),
      yesNo("mentalHealthRisk", "Mental-health condition, suicidal thoughts, self-harm risk or medicine misuse concern requiring assessment?"),
      yesNo("plannedProcedure", "Planned surgery, procedure, sedation or general anaesthetic?"),
      yesNo("otherMedication", "Taking any other prescribed, over-the-counter or herbal medicines?"),
      f("medicalMedicationDetails", "Details of every Yes answer, allergies, current medicines and relevant investigations", "textarea", true),
    ]},
    referralDecision(),
    { title: "Prescription, counselling and informed consent", fields: [
      f("prescriberName", "Prescriber name, professional registration and prescription reference", "textarea", true),
      { id: "plannedDose", label: "Planned starting/current dose", type: "select", required: true, options: ["2.5 mg", "5 mg", "7.5 mg", "10 mg", "12.5 mg", "15 mg"].map((value) => ({ value, label: value })) },
      f("doseSchedule", "Dose schedule, titration plan and review criteria", "textarea", true),
      f("licensedUseConfirmed", "Licensed indication, alternatives, expected benefits, limitations and the role of diet and physical activity have been discussed", "checkbox", true),
      f("commonEffectsDiscussed", "Common gastrointestinal effects, injection-site reactions, dehydration risk and practical management have been discussed", "checkbox", true),
      f("pancreatitisWarning", "Pancreatitis warning symptoms and the need to stop treatment and seek urgent medical help have been discussed", "checkbox", true),
      f("hypoglycaemiaWarning", "Hypoglycaemia risk and monitoring have been discussed where insulin or sulfonylureas are used", "checkbox", true),
      f("pregnancyContraceptionWarning", "Pregnancy, breastfeeding, contraception and tirzepatide washout advice have been discussed where relevant", "checkbox", true),
      f("procedureWarning", "The client will tell surgical and anaesthetic teams that they use tirzepatide before a procedure", "checkbox", true),
      f("storageSharpsTraining", "Storage, KwikPen use, weekly dosing, missed-dose instructions, site rotation and sharps disposal have been explained", "checkbox", true),
      f("questionsAnswered", "Questions have been answered and the client has had enough time to decide", "checkbox", true),
      f("consentToTreatment", "I consent to the agreed Mounjaro treatment and monitoring plan", "checkbox", true),
    ]},
    { title: "Administration and supply record", description: "Practitioner use only. Complete for a dose administered or supplied by the clinic.", fields: [
      completion("administrationDateTime", "Administration / supply date and time"),
      completion("doseGiven", "Dose administered or supplied"), completion("penPresentation", "Pen strength and presentation"),
      completion("batchNumber", "Batch / lot number"), completion("expiryDate", "Expiry date", "date"),
      completion("administrationRouteSite", "Route, injection site and site rotation record"),
      completion("administeredBy", "Administered by client/practitioner and practitioner name where applicable"),
      completion("preDoseChecks", "Identity, prescription, dose, product integrity, storage and expiry checks completed", "checkbox"),
      completion("currentWeightKg", "Current weight (kg)", "number"), f("currentBmi", "Current BMI (kg/m2)", "number"),
      completion("responseAndSideEffects", "Response, adherence, side effects, hydration/nutrition and relevant observations", "textarea"),
      completion("adverseEventAction", "Adverse events, actions, escalation and Yellow Card advice (enter None if none)", "textarea"),
      completion("nextDoseReview", "Next dose, review date and monitoring plan", "textarea"),
    ]},
    practitioner(),
  ],
};

const lemonBottle: ConsultationTemplate = {
  slug: "lemon-bottle", title: "Lemon Bottle Consultation", description: "Medical assessment and consent for Lemon Bottle fat dissolving treatment.",
  sourceFile: "Lemon Bottle Consultation Form.pdf", reviewRequired: true,
  conditionalRequirements: [
    { whenField: "previousFatDissolving", values: ["Yes"], requiredField: "previousTreatmentDetails", message: "Add previous treatment details." },
    { whenField: "soyLidocaineAllergy", values: ["Yes"], requiredField: "allergyDetails", message: "Add allergy details." },
    { whenField: "bloodThinnersAntiInflammatories", values: ["Yes"], requiredField: "medicationDetails", message: "Add medication details." },
    { whenField: "previousComplications", values: ["Yes"], requiredField: "complicationDetails", message: "Add previous complication details." },
  ],
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
    referralDecision(),
    { title: "Lemon Bottle consent", fields: [
      f("purposeBenefitsRisks", "The product's intended use, evidence, limitations, alternatives and insurer-approved risks including swelling, bruising, tenderness and infection have been explained without guaranteed claims", "checkbox", true),
      f("multipleSessions", "Variable results and possible need for several sessions understood", "checkbox", true),
      f("questionsAnswered", "Concerns discussed and questions answered", "checkbox", true), f("followAftercare", "Agrees to follow post-treatment care instructions", "checkbox", true),
      f("resultsVary", "Understands results may vary and may not meet initial expectations", "checkbox", true),
      yesNo("clinicalPhotographyConsent", "Consent to photographs for the confidential clinical record?"),
      yesNo("marketingPhotographyConsent", "Optional consent to agreed photographs for education or marketing?"),
      f("clientDeclaration", "Client confirms information is accurate and consents to treatment", "checkbox", true),
    ]},
    { title: "Procedure record and aftercare", description: "Practitioner use only. Complete at the treatment appointment.", fields: [
      completion("supplierProductVerification", "Supplier, product authenticity and packaging verification", "textarea"), completion("productIngredients", "Product name and ingredients"),
      completion("batchNumber", "Batch / lot number"), completion("expiryDate", "Expiry date", "date"), completion("quantityUsed", "Total amount used and amount by area"),
      completion("injectionRecord", "Treatment areas, injection points, needle/device and technique", "textarea"), completion("immediateReaction", "Immediate response, complications and actions", "textarea"),
      completion("aftercareGiven", "Aftercare, urgent warning signs and home-care advice", "textarea"), completion("followUpDate", "Follow-up / review date", "date"),
    ]},
    practitioner(),
  ],
};

const spmu: ConsultationTemplate = {
  slug: "spmu", title: "SPMU Consultation", description: "Informed consent and medical health assessment for semi-permanent makeup.",
  sourceFile: "SPM.pdf", reviewRequired: true,
  completionBlockers: [{ field: "patchTestResult", values: ["Positive — do not proceed", "Pending"], message: "SPMU cannot be completed while the patch test is positive or pending." }],
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
      f("avoidAntiInflammatories", "Understands prescribed medicines must not be stopped without advice from the appropriate prescriber; relevant anti-inflammatory use has been disclosed", "checkbox", true),
      f("avoidAlcohol", "Understands alcohol must be avoided for 2 days before treatment", "checkbox", true),
      f("avoidAspirin", "Aspirin, anticoagulants and bleeding risk have been disclosed and managed under the approved protocol without independent medication changes", "checkbox", true),
      f("avoidAntibuse", "Any medicine/alcohol interaction concerns have been reviewed with an appropriate clinician", "checkbox", true),
      f("surgeryAddress", "Surgery address", "textarea"), yesNo("metalAllergy", "Allergic reaction to metals?"), yesNo("pigmentAllergy", "Allergic reaction to pigments?"),
      yesNo("foodAllergy", "Food allergies?"), yesNo("lidocaineAllergy", "Lidocaine allergy?"), yesNo("glycerineAllergy", "Glycerine allergy?"),
      yesNo("antisepticAllergy", "Antiseptic allergy?"), f("localAnaestheticAllergies", "Local anaesthetic allergies", "textarea"), f("otherAllergies", "Other allergies", "textarea"),
      yesNo("dentalInjection", "Had a dental injection to numb gums?"), yesNo("dentalAntibiotics", "Receive antibiotics before dental procedures?"),
      yesNo("dentalInjectionReaction", "Difficulty breathing or rapid heartbeat with a dental injection?"), yesNo("chemoRadiation", "Chemotherapy or radiation therapy in the last year?"),
      yesNo("pregnant", "Currently pregnant?"), yesNo("breastfeeding", "Currently breastfeeding?"), yesNo("mriNext6Weeks", "Head MRI scheduled in the next 6 weeks?"),
      yesNo("futureFacialLaserIpl", "Laser or IPL on the face scheduled for the future?"), yesNo("givesBlood", "Do you give blood?"),
      yesNo("tattooSensitivity", "Sensitised reactions to tattoos or permanent makeup?"),
      yesNo("diabetes", "Diabetes?"), yesNo("anticoagulants", "Taking anticoagulants or affected by a bleeding disorder?"), yesNo("immunosuppression", "Immunosuppression or autoimmune disease?"),
      yesNo("activeSkinCondition", "Active infection, cold sore, lesion, eczema, psoriasis or dermatitis in the treatment area?"), yesNo("healingScarring", "Impaired healing or keloid/hypertrophic scarring?"),
    ]},
    { title: "Patch test and procedure record", description: "Practitioner use only. Follow pigment, anaesthetic, insurer and local infection-control requirements.", fields: [
      f("patchTestDate", "Patch-test date, where required", "date"), f("patchTestProducts", "Pigment/anaesthetic products patch tested", "textarea"),
      { ...completion("patchTestResult", "Patch-test result/decision", "select"), options: ["Negative — suitable to proceed", "Positive — do not proceed", "Pending", "Not required under approved protocol"].map((value) => ({ value, label: value })) },
      completion("approvedDesign", "Approved treatment area, mapped design and colour", "textarea"), completion("pigmentTraceability", "Pigment brand, colour, batch/lot and expiry", "textarea"),
      completion("anaestheticTraceability", "Anaesthetic product, batch/lot and expiry", "textarea"), completion("needleCartridgeTraceability", "Machine and sterile needle/cartridge lot", "textarea"),
      completion("infectionControlCheck", "Skin preparation and infection-control checks completed", "checkbox"), completion("techniqueRecord", "Technique, passes and treatment observations", "textarea"),
      completion("aftercareGiven", "Written aftercare and warning signs given", "textarea"), completion("topUpFollowUp", "Top-up/follow-up plan and date", "textarea"),
    ]},
    practitioner(),
  ],
};

const laserDevice: ConsultationTemplate = {
  slug: "laser-device", title: "Laser and Device Consultation", description: "Laser hair removal suitability, Fitzpatrick skin analysis and test patch record.",
  sourceFile: "dAb New Machine.pdf", reviewRequired: true,
  completionBlockers: [{ field: "result", values: ["Positive — do not proceed", "Pending"], message: "Laser treatment cannot be completed while the patch test is positive or pending." }],
  sections: [
    details([f("homeTelephone", "Home telephone", "tel"), f("areasToTreat", "Areas to be treated / hair removal", "textarea", true)]),
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
      ]}, f("fitzpatrickOverrideReason", "Clinician override reason, if the selected type differs from the calculated score", "textarea"), f("hairType", "Hair type", "text"),
    ]},
    { title: "Laser consent and consultation checklist", fields: [
      f("risksAccepted", "Laser hair removal risks explained and accepted", "checkbox", true), f("aftercareReceived", "Aftercare instructions received", "checkbox", true),
      f("patchTestWait", "The manufacturer, laser-protection and insurer-approved patch-test interval and booking restriction have been explained", "checkbox", true), f("eyeProtection", "Eye protection requirement understood", "checkbox", true),
      yesNo("clinicalPhotographyConsent", "Consent to treatment photographs for the confidential clinical record?"), yesNo("marketingPhotographyConsent", "Optional consent to agreed photographs for education or marketing?"), f("healthAssessmentCompleted", "Health assessment completed", "checkbox", true),
      f("treatmentProcessExplained", "Treatment process explained", "checkbox", true), f("hairGrowthCycleExplained", "Hair growth cycle explained", "checkbox", true),
      f("seriesMaintenanceExplained", "Treatment series and maintenance explained", "checkbox", true), f("variableResultsExplained", "Variability of results explained", "checkbox", true),
      f("sunPigmentationExplained", "Sun exposure and hyper/hypopigmentation explained", "checkbox", true), f("homeCareSideEffects", "Home care and side effects explained", "checkbox", true),
      f("clientAuthorisation", "Client authorises and consents to laser hair removal", "checkbox", true),
    ]},
    { title: "Test Patch Settings", description: "Practitioner use only.", fields: [
      completion("testPatchDate", "Test patch date", "date"), { ...completion("testPatchFitzpatrick", "Fitzpatrick setting", "select"), options: ["I", "II", "III", "IV", "V", "VI"].map((value) => ({ value, label: value })) },
      completion("testPatchArea", "Laser hair removal patch-test area"), completion("fluence", "Test-patch fluence"), completion("hz", "Test-patch HZ"), completion("pulse", "Test-patch pulse"),
      { ...completion("result", "Patch-test result", "select"), options: ["Negative — suitable to proceed", "Positive — do not proceed", "Pending"].map((value) => ({ value, label: value })) }, completion("shotsFired", "Test-patch shots fired", "number"), completion("practitionerEyewear", "Protective eyewear worn by practitioner", "checkbox"),
      completion("patientEyewear", "Protective eyewear worn by patient", "checkbox"), f("concernsComments", "Concerns and comments", "textarea"),
    ]},
    { title: "Laser treatment session record", description: "Complete for the actual treatment session, separately from test-patch settings.", fields: [
      completion("deviceDetails", "Device name, serial number, handpiece and wavelength/mode", "textarea"), completion("treatmentAreasSettings", "Treatment areas and area-by-area fluence, pulse, frequency and cooling", "textarea"),
      completion("treatmentShotCount", "Treatment shot count", "number"), completion("treatmentEndpoint", "Clinical endpoint, skin response and observations", "textarea"),
      completion("treatmentEyeProtection", "Client and practitioner eye protection confirmed", "checkbox"), completion("adverseEventRecord", "Adverse events, actions and escalation (enter None if none)", "textarea"),
      completion("aftercareGiven", "Aftercare, warning signs and sun precautions given", "textarea"), completion("nextSessionPlan", "Next-session plan and date", "textarea"),
    ]},
    practitioner(),
  ],
};

type TreatmentQuestion = { id: string; label: string };

const briefDetails = (): ConsultationSection => ({
  title: "Client details",
  fields: [
    f("fullName", "Full name", "text", true), f("dateOfBirth", "Date of birth", "date", true),
    f("contactNumber", "Contact number", "tel", true), f("email", "Email address", "email", true),
    f("occupation", "Occupation", "text"), f("referralSource", "Where did you hear about us?", "text"),
  ],
});

const focusedMedicalScreen = (profile: "skin" | "energy" | "injectable"): ConsultationSection => ({
  title: "Medical history and suitability screening",
  description: "Answer each relevant safety question and record details for every Yes answer.",
  fields: [
    yesNo("pregnantBreastfeeding", "Pregnant, trying to conceive or breastfeeding?"),
    yesNo("underMedicalCare", "Currently under medical care or awaiting investigation, surgery or treatment?"),
    yesNo("medication", "Using prescription, over-the-counter, topical or herbal medicine?"),
    yesNo("allergies", "Any known allergy or previous reaction to a medicine, product, latex, adhesive or anaesthetic?"),
    yesNo("bleedingRisk", "Bleeding/clotting disorder or use of anticoagulants, antiplatelets, aspirin or anti-inflammatory medicine?"),
    yesNo("diabetesHealing", "Diabetes, poor circulation, impaired healing or reduced sensation?"),
    yesNo("immuneCancer", "Autoimmune condition, immunosuppression, active cancer treatment or significant current illness?"),
    ...(profile === "energy" ? [
      yesNo("lightSensitiveCondition", "Photosensitive condition, seizure triggered by light, or medicine known to increase light sensitivity?"),
      yesNo("abnormalScarring", "History of keloid/hypertrophic scarring or significant pigment change after injury or treatment?"),
    ] : []),
    ...(profile === "injectable" ? [
      yesNo("needleReaction", "Needle phobia, fainting episode or previous injection/blood-draw complication?"),
      yesNo("activeSystemicInfection", "Current infection, fever, antibiotics for an active infection or feeling acutely unwell?"),
    ] : []),
    f("medicalHistoryDetails", "Details of every Yes answer, current medicines and allergies (enter None known when applicable)", "textarea", true),
  ],
});

const briefMedicalScreen = (): ConsultationSection => ({
  title: "Essential medical and suitability screening",
  description: "A short catch-all screen for information not covered by the service-specific questions below.",
  fields: [
    yesNo("otherRelevantHealthInformation", "Any other medical condition, medicine, allergy, pregnancy or recent treatment that could affect this service?"),
    f("medicalHistoryDetails", "Relevant details (enter None known when applicable)", "textarea", true),
  ],
});

const sharedGoals = (brief = false): ConsultationSection => ({
  title: "Goals and practitioner assessment",
  fields: brief ? [
    f("serviceRequested", "Service, area and requested result", "textarea", true),
    f("areaAssessment", "Relevant observations and agreed service plan", "textarea", true),
  ] : [
      f("clientGoals", "Main concern, desired outcome and expectations", "textarea", true),
      f("previousTreatment", "Relevant previous treatment and response", "textarea"),
      f("areaAssessment", "Treatment-area assessment, observations and classification", "textarea", true),
      f("treatmentPlan", "Proposed treatment, area, product/device and alternatives including no treatment", "textarea", true),
    ],
});

const sharedConsent = (title: string, risks: string, brief = false, photography = true): ConsultationSection => ({
  title: "Information discussed and informed consent",
  description: `Complete after discussing the agreed ${title} plan with the client.`,
  fields: brief ? [
    f("materialRisks", `Expected result, aftercare and relevant risks discussed: ${risks}`, "checkbox", true),
    f("accurateInformation", "The client confirms the information supplied is accurate and has asked any questions", "checkbox", true),
    f("resultsNotGuaranteed", "The client understands individual results and reactions vary", "checkbox", true),
    ...(photography ? [yesNo("clinicalPhotographyConsent", "Consent to photographs for the confidential service record?")] : []),
    f("consentToTreatment", `The client consents to the agreed ${title} service and understands consent may be withdrawn before it begins`, "checkbox", true),
  ] : [
    f("benefitsLimitations", "Expected benefits, limitations, likely sessions, costs, preparation and aftercare have been explained", "checkbox", true),
    f("materialRisks", `Material risks discussed: ${risks}`, "checkbox", true),
    f("alternativesUnderstood", "Alternatives, including postponing or having no treatment, have been discussed", "checkbox", true),
    f("resultsNotGuaranteed", "The client understands results vary and cannot be guaranteed", "checkbox", true),
    f("questionsAnswered", "The client had enough time to ask questions and decide without pressure", "checkbox", true),
    yesNo("clinicalPhotographyConsent", "Consent to photographs for the confidential clinical record?"),
    yesNo("marketingPhotographyConsent", "Optional consent to agreed anonymised photographs for education or marketing?"),
    f("consentToTreatment", `The client consents to the agreed ${title} treatment plan and understands consent may be withdrawn before treatment`, "checkbox", true),
  ],
});

const sharedTreatmentRecord = (injectable = false): ConsultationSection => ({
  title: "Treatment decision and session record",
  description: "Practitioner use only. Complete at the treatment appointment.",
  fields: [
    { id: "suitabilityOutcome", label: "Suitability decision", type: "select", required: true, options: ["Suitable to proceed", "Defer or restrict treatment", "Medical referral required", "Not suitable"].map((value) => ({ value, label: value })) },
    f("decisionNotes", "Clinical reasoning, restriction, referral or refusal details", "textarea"),
    completion("treatmentDate", "Treatment date", "date"), completion("areasTreated", "Area(s) treated", "textarea"),
    completion("productDevice", injectable ? "Medicine/product, lawful authorisation or prescription, and device/needle" : "Product/device and protocol"),
    completion("settingsDose", injectable ? "Dose, route, site and technique" : "Settings, intensity, duration and technique"),
    completion("batchExpiry", "Batch/lot and expiry, where applicable"),
    completion("endpointResponse", "Clinical endpoint, immediate response, adverse event and action taken", "textarea"),
    completion("aftercareFollowUp", "Aftercare supplied, warning signs and follow-up plan", "textarea"),
  ],
});

const briefTreatmentRecord = (slug: string): ConsultationSection => {
  const productTraceability = ["lash-brow-tint", "hair-colour", "ear-piercing"].includes(slug);
  return {
    title: "Service decision and record",
    description: "Practitioner use only. Record what was actually provided.",
    fields: [
      { id: "suitabilityOutcome", label: "Suitability decision", type: "select", required: true, options: ["Suitable to proceed", "Defer or restrict treatment", "Medical referral required", "Not suitable"].map((value) => ({ value, label: value })) },
      f("decisionNotes", "Complete only when treatment is changed, deferred, refused or referred", "textarea"),
      completion("treatmentDate", "Service date", "date"), completion("areasTreated", "Service and area(s) completed", "textarea"),
      completion("productDevice", "Products used and relevant technique", "textarea"),
      ...(productTraceability ? [completion("batchExpiry", "Product/jewellery identification, batch and expiry where applicable")] : []),
      completion("endpointResponse", "Client response, unexpected reaction and action taken", "textarea"),
      completion("aftercareFollowUp", "Aftercare supplied and follow-up required", "textarea"),
    ],
  };
};

function treatmentConsultation(config: {
  slug: string;
  title: string;
  description: string;
  detailed: boolean;
  injectable?: boolean;
  risks: string;
  questions: TreatmentQuestion[];
}): ConsultationTemplate {
  return {
    slug: config.slug,
    title: `${config.title} Consultation`,
    description: config.description,
    sourceFile: "Pink Clinic Consultation Forms.pdf",
    reviewRequired: true,
    version: "2026-08-25.1",
    conditionalRequirements: [{ whenField: "suitabilityOutcome", values: ["Medical referral required", "Defer or restrict treatment", "Not suitable"], requiredField: "decisionNotes", message: "Record the clinical decision and referral/restriction details." }],
    sections: [
      config.detailed ? details() : briefDetails(),
      config.detailed
        ? focusedMedicalScreen(config.injectable ? "injectable" : ["carbon-peel-facial", "tattoo-removal", "ipl-skin-rejuvenation", "morpheus8"].includes(config.slug) ? "energy" : "skin")
        : briefMedicalScreen(),
      sharedGoals(!config.detailed),
      { title: "Treatment-specific screening", description: "Answer every question and add relevant detail to the medical-history or assessment notes.", fields: config.questions.map((question) => yesNo(question.id, question.label)) },
      sharedConsent(config.title, config.risks, !config.detailed, config.slug === "facial"),
      config.detailed ? sharedTreatmentRecord(config.injectable) : briefTreatmentRecord(config.slug),
      practitioner(),
    ],
  };
}

const requestedTreatmentConsultations: ConsultationTemplate[] = [
  treatmentConsultation({ slug: "hydrafacial", title: "Hydrafacial", description: "Detailed skin assessment, contraindication screening, informed consent and treatment record for Hydrafacial.", detailed: true, risks: "temporary redness, tightness, sensitivity, dryness, irritation, breakout, allergic reaction, abrasion and aggravation of an existing skin condition.", questions: [
    { id: "inflamedSunburntSkin", label: "Active inflammation, sunburn, infection, open lesion or cold sore in the treatment area?" },
    { id: "recentResurfacing", label: "Recent peel, resurfacing, waxing, injectable or surgery in the treatment area?" },
    { id: "solutionSensitivity", label: "Known sensitivity to Hydrafacial solutions, exfoliating acids or proposed ingredients?" },
    { id: "retinoidUse", label: "Current or recent retinoid, isotretinoin or exfoliating-acid use affecting skin tolerance?" },
  ]}),
  treatmentConsultation({ slug: "carbon-peel-facial", title: "Carbon Peel Facial", description: "Detailed laser carbon peel suitability, light-sensitivity screening, consent and settings record.", detailed: true, risks: "heat, discomfort, redness, swelling, dryness, crusting, blistering, burns, infection, scarring, pigment change and eye injury if protection is not used.", questions: [
    { id: "recentTan", label: "Recent tanning, fake tan, sunburn or inability to avoid sun exposure?" }, { id: "activeFacialLesion", label: "Active acne infection, cold sore, open wound or suspicious lesion?" },
  ]}),
  treatmentConsultation({ slug: "tattoo-removal", title: "Tattoo Removal", description: "Detailed laser tattoo assessment, test-patch planning, informed consent and treatment settings record.", detailed: true, risks: "pain, redness, swelling, pinpoint bleeding, blistering, crusting, infection, textural change, scarring, pigment change, incomplete clearance, ink colour change and allergic reaction.", questions: [
    { id: "tattooRecorded", label: "Tattoo location, colours, age, type and previous removal attempts fully recorded?" }, { id: "tattooRecentTan", label: "Recent tanning, fake tan or sunburn?" },
    { id: "tattooSuspiciousLesion", label: "Tattoo overlies a mole, suspicious lesion or permanent cosmetic pigment requiring specialist assessment?" },
  ]}),
  treatmentConsultation({ slug: "ipl-skin-rejuvenation", title: "IPL Skin Rejuvenation", description: "Detailed IPL skin assessment, light-sensitivity screening, consent, test-patch and treatment record.", detailed: true, risks: "heat, stinging, redness, swelling, pigment darkening or crusting, blistering, burns, infection, scarring, pigment or hair change and eye injury if protection is not used.", questions: [
    { id: "iplRecentTan", label: "Recent tanning, fake tan, sunburn or planned strong sun exposure?" }, { id: "iplActiveLesion", label: "Active infection, cold sore, open wound or suspicious lesion?" },
    { id: "iplDeviceSuitability", label: "Skin type, hair/pigment target and treatment area suitable for the approved device protocol?" },
  ]}),
  treatmentConsultation({ slug: "microdermabrasion", title: "Microdermabrasion", description: "Detailed skin assessment, contraindication screening, consent and treatment record for microdermabrasion.", detailed: true, risks: "redness, tenderness, dryness, abrasion, bruising or petechiae, broken capillaries, pigment change, infection and aggravation of an existing skin condition.", questions: [
    { id: "fragileInflamedSkin", label: "Active rosacea flare, eczema, dermatitis, acne infection or fragile/couperose skin?" }, { id: "microOpenLesion", label: "Open lesion, cold sore, sunburn or recent facial surgery?" },
    { id: "microRecentTreatment", label: "Recent peel, resurfacing, waxing or injectable in the area?" }, { id: "microRetinoids", label: "Current or recent retinoid or exfoliating-acid use affecting skin tolerance?" },
  ]}),
  treatmentConsultation({ slug: "morpheus8", title: "Morpheus8", description: "Detailed radiofrequency microneedling assessment, contraindication screening, consent and device record.", detailed: true, risks: "pain, redness, swelling, bruising, pinpoint bleeding, crusting, burns, blistering, infection, scarring, pigment change, altered sensation, contour or fat-volume change and an unsatisfactory result.", questions: [
    { id: "implantedDevice", label: "Pacemaker, defibrillator or implanted electrical/metal device in or near the treatment area?" },
    { id: "morpheusActiveInfection", label: "Active infection, cold sore, open wound or inflammatory skin disease?" },
    { id: "morpheusRecentProcedure", label: "Recent isotretinoin, surgery, filler, threads or energy-based treatment?" }, { id: "morpheusScarring", label: "History of keloid scarring or significant pigment change?" },
  ]}),
  treatmentConsultation({ slug: "dermaplaning", title: "Dermaplaning", description: "Detailed skin assessment, blade-treatment suitability screening, consent and treatment record.", detailed: true, risks: "minor cuts, abrasion, redness, tenderness, dryness, breakout, infection, pigment change and aggravation of an existing skin condition.", questions: [
    { id: "dermaplaningInflammation", label: "Active inflamed acne, infection, cold sore, open wound or sunburn?" }, { id: "dermaplaningBleeding", label: "Bleeding disorder, anticoagulant use or fragile skin?" },
    { id: "dermaplaningRecentTreatment", label: "Recent peel, resurfacing, waxing or surgery in the area?" }, { id: "dermaplaningRetinoids", label: "Current or recent retinoid or exfoliating-acid use affecting skin tolerance?" },
  ]}),
  treatmentConsultation({ slug: "prp-hair-face", title: "PRP for Hair or Face", description: "Detailed blood-draw, PRP suitability, treatment planning, consent and traceability record.", detailed: true, injectable: true, risks: "blood-draw discomfort, fainting, bruising, bleeding, swelling, pain, infection, headache, temporary hair shedding, tissue or nerve injury, scarring, pigment change and limited or no improvement.", questions: [
    { id: "prpTreatmentPurpose", label: "Treatment purpose and area (hair/scalp, face/skin or other) recorded?" }, { id: "prpBloodDisorder", label: "Platelet disorder, anaemia or another abnormal blood-test result relevant to PRP?" },
    { id: "prpRecentProcedure", label: "Recent procedure, injectable or active inflammation in the treatment area?" },
  ]}),
  treatmentConsultation({ slug: "skin-eye-boosters", title: "Skin or Eye Boosters", description: "Detailed injectable booster assessment, eye-area screening, consent and product traceability record.", detailed: true, injectable: true, risks: "pain, redness, swelling, bruising, bleeding, infection, lumps or nodules, asymmetry, prolonged eye-area oedema, allergy, pigment change, tissue injury and rare vascular occlusion with possible skin loss or visual impairment.", questions: [
    { id: "boosterProductArea", label: "Proposed product and treatment area identified, with the eye area assessed separately?" },
    { id: "boosterInfection", label: "Active infection, cold sore, dental infection or inflammatory skin disease in or near the treatment area?" },
    { id: "boosterRecentInjectable", label: "Recent filler, threads, surgery or injectable treatment?" },
    { id: "boosterVascularHistory", label: "History of vascular complication, severe allergy, delayed nodules or prolonged oedema?" },
  ]}),
  treatmentConsultation({ slug: "intramuscular-injections", title: "Intramuscular Injections", description: "Medicine-specific assessment, lawful authorisation checks, informed consent and administration record for intramuscular injections.", detailed: true, injectable: true, risks: "pain, bleeding, bruising, swelling, infection, fainting, allergic reaction or anaphylaxis, nerve or blood-vessel injury, tissue damage and medicine-specific adverse effects.", questions: [
    { id: "imAuthorisation", label: "Medicine, indication and lawful authorisation or prescription verified?" }, { id: "imAllergy", label: "Previous reaction or specific allergy to the proposed medicine or its excipients?" },
    { id: "imMedicineChecks", label: "Correct person, medicine, dose, route, site, batch, expiry and storage verified?" },
  ]}),
  treatmentConsultation({ slug: "facial", title: "Facial", description: "Brief client consultation, skin suitability check, consent and treatment record for a facial.", detailed: false, risks: "temporary redness, sensitivity, irritation, breakout or allergic reaction.", questions: [
    { id: "facialActiveSkinIssue", label: "Active infection, cold sore, open wound, sunburn or inflamed skin?" }, { id: "facialProductSensitivity", label: "Allergy or sensitivity to skincare, fragrance or proposed ingredients?" }, { id: "facialRecentProcedure", label: "Recent peel, resurfacing, facial waxing or injectable?" },
  ]}),
  treatmentConsultation({ slug: "waxing-hot-waxing", title: "Waxing / Hot Waxing", description: "Brief waxing suitability, consent and treatment record.", detailed: false, risks: "pain, redness, bruising, skin lifting, burns, folliculitis, ingrown hairs, infection, pigment change or allergic reaction.", questions: [
    { id: "waxRetinoids", label: "Retinoid, exfoliating acid, recent peel/resurfacing or fragile skin?" }, { id: "waxSkinDamage", label: "Sunburn, infection, open wound, bruising or inflamed skin?" }, { id: "waxAllergy", label: "Allergy or sensitivity to wax, rosin, fragrance or aftercare product?" },
  ]}),
  treatmentConsultation({ slug: "pedicure-manicure", title: "Pedicure / Manicure", description: "Brief nail-service health screening, consent and treatment record.", detailed: false, risks: "cuts, soreness, infection, allergy, nail damage or aggravation of an existing nail or skin condition.", questions: [
    { id: "nailDiabetesCirculation", label: "Diabetes, poor circulation, neuropathy or reduced sensation?" }, { id: "nailInfection", label: "Fungal or bacterial infection, wart, open wound or inflamed skin or nail?" }, { id: "nailProductAllergy", label: "Allergy or sensitivity to polish, gel, acrylic, adhesive or acetone?" },
  ]}),
  treatmentConsultation({ slug: "lash-brow-tint", title: "Eyelash / Eyebrow Tint", description: "Brief tint patch-test, eye-health screening, consent and treatment record.", detailed: false, risks: "stinging, redness, swelling, dermatitis, chemical injury, eye irritation or severe allergic reaction.", questions: [
    { id: "tintPatchTest", label: "Patch test completed and acceptable under the current product instructions and clinic policy?" }, { id: "tintEyeCondition", label: "Eye infection, irritation, recent eye surgery or broken skin?" }, { id: "tintPreviousReaction", label: "Previous reaction to hair dye, tint, henna, black henna or PPD?" },
  ]}),
  treatmentConsultation({ slug: "hair-colour", title: "Hair Colour", description: "Brief hair-colour skin-alert testing, scalp screening, consent and service record.", detailed: false, risks: "scalp or skin irritation, severe allergic reaction, chemical burn, hair breakage, uneven or unexpected colour and damage to clothing or property.", questions: [
    { id: "colourAlertTest", label: "Skin alert and strand testing completed and acceptable under current product instructions and clinic policy?" }, { id: "colourScalpCondition", label: "Scalp irritation, broken skin, infection or recent chemical service?" }, { id: "colourPreviousReaction", label: "Previous reaction to hair dye, bleach, henna, black henna or PPD?" },
  ]}),
  treatmentConsultation({ slug: "ear-piercing", title: "Ear Piercing", description: "Brief piercing eligibility, health screening, consent and procedure traceability record.", detailed: false, risks: "pain, bleeding, swelling, infection, embedding, migration or rejection, allergic reaction, scarring or keloid and asymmetry.", questions: [
    { id: "piercingAgeConsent", label: "Age, identity and guardian consent checked in line with clinic policy?" }, { id: "piercingAllergy", label: "Metal, latex, antiseptic or dressing allergy?" },
    { id: "piercingHealingRisk", label: "Bleeding disorder, anticoagulant use, poor healing or keloid history?" }, { id: "piercingSiteCondition", label: "Current illness, ear infection, dermatitis or damaged skin at the proposed site?" },
  ]}),
];

export const consultationTemplates: ConsultationTemplate[] = [antiWrinkle, dermalFillers, skinPeelMicroneedling, ivTherapy, mounjaro, lemonBottle, spmu, laserDevice, ...requestedTreatmentConsultations]
  .map((template) => ({ ...template, version: template.version || "2026-08-02.1" }));
export function getConsultationTemplate(slug: string) { return consultationTemplates.find((item) => item.slug === slug); }

export function validateConsultationAnswers(
  template: ConsultationTemplate,
  answers: Record<string, string | boolean | string[]>,
) {
  const status = String(answers.recordStatus || "draft");
  if (status === "draft") return [];
  const complete = status === "completed";
  const fields = template.sections.flatMap((section) => section.fields);
  const hasValue = (id: string) => {
    const value = answers[id];
    return Array.isArray(value) ? value.length > 0 : typeof value === "boolean" ? value : Boolean(String(value || "").trim());
  };
  const errors: string[] = [];
  for (const field of fields.filter((item) => item.required || (complete && item.completionRequired))) {
    if (!hasValue(field.id)) errors.push(`${field.label} is required.`);
  }
  if (!hasValue("signatureData")) errors.push("Customer signature is required.");
  if (answers.termsAgreement !== true) errors.push("Customer agreement is required.");
  for (const rule of template.conditionalRequirements || []) {
    if (rule.values.includes(String(answers[rule.whenField] || "")) && !hasValue(rule.requiredField)) errors.push(rule.message);
  }
  for (const group of template.detailGroups || []) {
    if (group.fields.some((id) => answers[id] === "Yes") && !hasValue(group.requiredField)) errors.push(group.message);
  }
  if (complete) {
    for (const blocker of template.completionBlockers || []) {
      if (blocker.values.includes(String(answers[blocker.field] || ""))) errors.push(blocker.message);
    }
  }
  const hasEmergencyName = hasValue("emergencyContact");
  const hasEmergencyNumber = hasValue("emergencyContactNumber");
  if (hasEmergencyName !== hasEmergencyNumber) errors.push("Emergency contact name and number must both be entered or both left blank.");
  return errors;
}
