export type ConcernDecisionGuide = {
  causes: string[];
  maySuit: string[];
  discussFirst: string[];
  treatmentCourse: string;
  commonEffects: string[];
  preparation: string[];
  aftercare: string[];
  medicalAdvice: string;
  faqs: { question: string; answer: string }[];
  sources: { label: string; url: string }[];
};

const cosmeticSources = [
  {
    label: "NHS: Before you have a cosmetic procedure",
    url: "https://www.nhs.uk/tests-and-treatments/cosmetic-procedures/advice/before-you-have-a-cosmetic-procedure/",
  },
  {
    label: "NHS: Choosing a cosmetic practitioner",
    url: "https://www.nhs.uk/tests-and-treatments/cosmetic-procedures/advice/choosing-who-will-do-your-procedure/",
  },
  {
    label: "ASA: Cosmetic interventions guidance",
    url: "https://www.asa.org.uk/advice-online/cosmetic-interventions.html",
  },
];

export const concernDecisionGuides: Record<string, ConcernDecisionGuide> = {
  "lines-wrinkles": {
    causes: [
      "Repeated facial movement and expression",
      "Natural changes in collagen, elasticity and skin hydration",
      "Sun exposure, smoking and other lifestyle factors",
    ],
    maySuit: [
      "Adults seeking a subtle, consultation-led refresh",
      "People with realistic expectations about temporary or gradual results",
      "Clients willing to follow preparation, review and aftercare guidance",
    ],
    discussFirst: [
      "Pregnancy or breastfeeding",
      "Neurological, muscular or swallowing conditions",
      "Medicines, allergies, previous injectables, infection or inflammation near the proposed area",
    ],
    treatmentCourse:
      "The most suitable option, appointment length, likely onset, review timing and maintenance vary by treatment. Prescription-only treatments require an appropriate prescriber consultation.",
    commonEffects: [
      "Temporary redness, tenderness, swelling or bruising may occur with injectable treatments",
      "Temporary asymmetry, headache or an unwanted effect can occur depending on the procedure",
      "Rare but serious complications require prompt assessment; your practitioner must explain treatment-specific warning signs",
    ],
    preparation: [
      "Share your full medical, medicine and treatment history",
      "Do not stop prescribed medicines unless your prescriber advises it",
      "Allow time to consider the treatment after consultation",
    ],
    aftercare: [
      "Follow the written instructions supplied for your exact treatment",
      "Attend any recommended review appointment",
      "Contact the clinic promptly about unexpected or worsening symptoms",
    ],
    medicalAdvice:
      "Call 999 for difficulty breathing or swallowing, severe weakness or rapidly developing serious symptoms after an injectable procedure. Seek prompt clinical advice for any reaction outside the effects discussed with you.",
    faqs: [
      {
        question: "Will I still look like myself?",
        answer:
          "That should be discussed as a treatment goal. Pink’s approach is to assess movement and balance and agree realistic, subtle outcomes before treatment.",
      },
      {
        question: "How long do results last?",
        answer:
          "Duration varies by treatment, product and individual response. Your practitioner should explain likely maintenance before you decide.",
      },
    ],
    sources: cosmeticSources,
  },
  pigmentation: {
    causes: [
      "Sun exposure and cumulative UV damage",
      "Changes following inflammation, blemishes or skin injury",
      "Hormonal influences and some medicines or health conditions",
    ],
    maySuit: [
      "People with an assessed cosmetic pigmentation concern",
      "Clients able to commit to sun protection and appropriate home care",
      "People with realistic expectations about gradual improvement and maintenance",
    ],
    discussFirst: [
      "A new, changing, bleeding, painful, itchy or unusual mark",
      "Pregnancy, breastfeeding, prescription skincare or photosensitising medicines",
      "Recent tanning, sunburn, active irritation, infection or another recent procedure",
    ],
    treatmentCourse:
      "Pigmentation often needs a staged plan and maintenance rather than a single appointment. The cause and skin type influence which products, peels, facials or device-led options may be appropriate.",
    commonEffects: [
      "Temporary redness, dryness, sensitivity, peeling or darkening may occur",
      "Post-inflammatory pigmentation can worsen if treatment or aftercare is unsuitable",
      "Results can recur without consistent sun protection and maintenance",
    ],
    preparation: [
      "Bring details of skincare, medicines and previous procedures",
      "Avoid unplanned tanning and follow the clinic’s product instructions",
      "Arrange medical assessment first for any suspicious or changing lesion",
    ],
    aftercare: [
      "Use the recommended broad-spectrum sun protection",
      "Avoid picking peeling or sensitised skin",
      "Introduce active products only as directed",
    ],
    medicalAdvice:
      "Pink does not diagnose skin cancer or medical pigmentation disorders. A changing mole or new unusual mark should be assessed by a GP before cosmetic treatment.",
    faqs: [
      {
        question: "Can pigmentation be removed permanently?",
        answer:
          "Not always. Cause, depth, hormones and sun exposure affect response and recurrence, so maintenance may be necessary.",
      },
      {
        question: "Why is assessment important?",
        answer:
          "Different types of pigmentation can look similar but need different management, and suspicious lesions require medical assessment.",
      },
    ],
    sources: [
      ...cosmeticSources,
      {
        label: "NHS: Moles and warning signs",
        url: "https://www.nhs.uk/conditions/moles/",
      },
    ],
  },
  "skin-boosters": {
    causes: [
      "Natural changes in hydration, collagen and elasticity",
      "Sun exposure, environment and lifestyle",
      "Skin-barrier disruption or an unsuitable skincare routine",
    ],
    maySuit: [
      "Adults seeking hydration, radiance or gradual skin-quality support",
      "People open to comparing facial, injectable and device-led routes",
      "Clients with realistic expectations about courses and maintenance",
    ],
    discussFirst: [
      "Pregnancy, breastfeeding, allergies or relevant medical conditions",
      "Active infection, irritation, cold sores or an inflammatory flare",
      "Recent procedures, injectables, prescription skincare or medicines affecting healing",
    ],
    treatmentCourse:
      "This guide covers several different routes—not every option is a skin booster. Facials may involve little downtime, while injectable or device-led rejuvenation can require a course, recovery time and maintenance.",
    commonEffects: [
      "Facials may cause temporary redness or sensitivity",
      "Injectables may cause swelling, bruising, tenderness or small temporary bumps",
      "Device-led treatments can involve redness, swelling, sensitivity or longer recovery depending on intensity",
    ],
    preparation: [
      "Choose the route only after discussing downtime and expected benefit",
      "Share all products, medicines and recent treatment history",
      "Follow treatment-specific instructions rather than generic online advice",
    ],
    aftercare: [
      "Protect sensitised skin from sun exposure",
      "Use only approved products until the skin has settled",
      "Contact Pink if recovery differs from what was explained",
    ],
    medicalAdvice:
      "Seek urgent help for severe pain, breathing difficulty, rapidly increasing swelling, visual symptoms or another serious reaction after an injectable treatment.",
    faqs: [
      {
        question: "Is a Hydrafacial a skin booster?",
        answer:
          "No. It is a non-injectable facial. This broader guide includes it as a hydration-focused alternative alongside injectable and device-led rejuvenation.",
      },
      {
        question: "Will one appointment be enough?",
        answer:
          "Some treatments give a short-term visible refresh; others are normally planned as a course. Pink will explain the likely timeline and maintenance.",
      },
    ],
    sources: cosmeticSources,
  },
  "acne-texture": {
    causes: [
      "Oil production, blocked follicles, bacteria and inflammation can contribute to acne",
      "Hormones, some medicines and individual skin behaviour",
      "Scarring or post-inflammatory colour change following breakouts or injury",
    ],
    maySuit: [
      "People with mild congestion or stable texture concerns suitable for cosmetic care",
      "Clients whose active acne is controlled before scar-focused procedures",
      "People able to follow a gradual skincare and sun-protection plan",
    ],
    discussFirst: [
      "Moderate, severe, painful, nodular or worsening acne",
      "Scarring, significant distress or pharmacy treatment that has not helped",
      "Prescription acne medicines, active infection, open skin or recent procedures",
    ],
    treatmentCourse:
      "Active acne, marks and true scars are different concerns. Cosmetic facials or devices do not replace medical acne treatment, and scar-focused work usually begins only when active inflammation is suitably controlled.",
    commonEffects: [
      "Temporary redness, dryness, sensitivity or purging-like changes may occur with some plans",
      "Peels and devices can cause peeling, swelling or post-inflammatory colour change",
      "Scars can improve in appearance but cannot be guaranteed to disappear",
    ],
    preparation: [
      "List all prescription and non-prescription acne products",
      "Do not combine new active products without guidance",
      "Seek GP or dermatology advice where acne is moderate, severe, painful or scarring",
    ],
    aftercare: [
      "Support the skin barrier and use recommended sun protection",
      "Do not pick blemishes, peeling skin or healing areas",
      "Report persistent irritation, infection or worsening acne",
    ],
    medicalAdvice:
      "See a GP for moderate or severe acne, risk of scarring, significant distress, or symptoms that have not responded to pharmacy treatment. Cosmetic treatment is not a substitute for medical acne care.",
    faqs: [
      {
        question: "Can a facial cure acne?",
        answer:
          "No. A facial may support some mild congestion, but acne is a medical skin condition and may need pharmacy, GP or dermatology treatment.",
      },
      {
        question: "Can acne scars be completely removed?",
        answer:
          "No result can be guaranteed and scars cannot always be removed. Suitable treatments may improve their appearance over time.",
      },
    ],
    sources: [
      ...cosmeticSources,
      {
        label: "NHS: Acne treatment",
        url: "https://www.nhs.uk/conditions/acne/treatment/",
      },
      { label: "NHS: Scars", url: "https://www.nhs.uk/conditions/scars/" },
    ],
  },
  "unwanted-hair": {
    causes: [
      "Normal genetic and hormonal variation",
      "Changes associated with life stage or some health conditions",
      "Some medicines can affect hair growth",
    ],
    maySuit: [
      "People seeking temporary removal through waxing or threading",
      "Clients whose hair and skin characteristics are suitable for laser reduction",
      "People able to follow a course and sun-exposure guidance",
    ],
    discussFirst: [
      "Sudden or unexplained changes in hair growth",
      "Pregnancy, relevant medicines, skin conditions or photosensitivity",
      "Recent tanning, sunburn, infection, irritation or tattoos in the treatment area",
    ],
    treatmentCourse:
      "Waxing and threading provide temporary removal. Laser aims for long-term reduction rather than guaranteed permanent removal and normally requires a patch test, multiple sessions and possible maintenance.",
    commonEffects: [
      "Temporary redness, tenderness or follicle irritation",
      "Laser can cause pigment change, blistering or burns if unsuitable or incorrectly delivered",
      "Waxing can irritate skin and occasionally cause lifting, bruising or ingrown hairs",
    ],
    preparation: [
      "Follow shaving and hair-removal instructions for the selected method",
      "Avoid tanning and disclose medicines or products that increase sensitivity",
      "Complete the required laser consultation and patch test",
    ],
    aftercare: [
      "Avoid heat, friction and irritating products for the advised period",
      "Use sun protection on exposed treated areas",
      "Do not pick irritated follicles or healing skin",
    ],
    medicalAdvice:
      "Seek medical advice for a sudden significant change in hair growth or symptoms suggesting an underlying hormonal or health concern. Seek prompt help for burns, blistering or signs of infection.",
    faqs: [
      {
        question: "Is laser hair removal permanent?",
        answer:
          "It is better described as long-term hair reduction. Response varies with hair colour, skin, hormones, area and adherence to the course.",
      },
      {
        question: "Why do I need a patch test?",
        answer:
          "It helps assess skin response and supports safer treatment settings before a full laser appointment.",
      },
    ],
    sources: cosmeticSources,
  },
  "body-contouring": {
    causes: [
      "Body shape and fat distribution vary naturally between people",
      "Genetics, age, hormones and lifestyle can influence appearance",
      "A cosmetic concern is not the same as a medical weight-management need",
    ],
    maySuit: [
      "Adults with a specific, assessed cosmetic goal",
      "People at a stable point who understand treatment limitations",
      "Clients willing to discuss alternatives and accept that no treatment may be recommended",
    ],
    discussFirst: [
      "Pregnancy, breastfeeding or significant medical conditions",
      "Medicines, allergies, infection, skin disease or previous procedures in the area",
      "Weight-loss expectations, body-image distress or a goal outside the treatment’s realistic capability",
    ],
    treatmentCourse:
      "Non-surgical body procedures are not weight-loss treatments. The method, number of sessions, downtime, evidence, maintenance and possible complications must be explained for the exact option offered.",
    commonEffects: [
      "Pain, tenderness, swelling, bruising, redness or temporary altered sensation may occur",
      "Injectable or device-led treatments can have treatment-specific complications",
      "Change may be limited, uneven or absent and results cannot be guaranteed",
    ],
    preparation: [
      "Share complete health, medicine and previous-procedure information",
      "Ask what product or device will be used and what evidence supports it",
      "Take time after consultation and avoid pressure-led decisions",
    ],
    aftercare: [
      "Follow the exact written guidance supplied",
      "Know how and when the clinic can be contacted about complications",
      "Seek assessment for severe, worsening or unexpected symptoms",
    ],
    medicalAdvice:
      "Body-contouring services do not diagnose or treat obesity or another health condition. Speak to a GP for medical weight-management concerns or unexplained changes in your body.",
    faqs: [
      {
        question: "Is body contouring a weight-loss treatment?",
        answer:
          "No. It is intended for assessed cosmetic goals in specific areas and should not be presented as a substitute for medical weight management.",
      },
      {
        question: "How much change should I expect?",
        answer:
          "That depends on the exact procedure and individual response. Pink should explain realistic limitations and alternatives before consent.",
      },
    ],
    sources: cosmeticSources,
  },
};

export const concernGuidanceReviewed = "31 July 2026";
