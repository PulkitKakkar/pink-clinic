export type LearnerMaterial = { id: string; title: string; storageKey: string };
export type LearnerAssignment = {
  id: string;
  title: string;
  instructions: string;
  briefStorageKey?: string;
};
export type LearnerCourse = {
  id: string;
  title: string;
  level: string;
  materials: LearnerMaterial[];
  assignments: LearnerAssignment[];
};

// Course books and assignment briefs are deliberately fixed in code. The
// current facial materials are clearly labelled demonstrations and must be
// replaced when Pink supplies the approved VTCT documents.
export const learnerCourses: LearnerCourse[] = [
  [
    "level-2-nvq-diploma-in-beauty-therapy-general",
    "VTCT Level 2 NVQ Diploma in Beauty Therapy General",
    "Level 2",
  ],
  [
    "level-3-nvq-diploma-in-beauty-therapy-general",
    "VTCT Level 3 NVQ Diploma in Beauty Therapy General",
    "Level 3",
  ],
  [
    "level-4-certificate-in-micropigmentation",
    "VTCT Level 4 Certificate in Micropigmentation",
    "Level 4",
  ],
  [
    "vtct-skills-level-2-award-in-facial-massage-and-skin-care",
    "VTCT Skills Level 2 Award in Facial Massage and Skin Care",
    "Level 2",
  ],
  [
    "vtct-skills-level-3-award-in-anatomical-and-pysiological-knowledge-of-body-systems",
    "VTCT Skills Level 3 Award in Anatomical and Physiological Knowledge of Body Systems",
    "Level 3",
  ],
  [
    "level-4-diploma-in-advanced-beauty-therapy",
    "VTCT Skills Level 4 Certificate in Laser and Intense Pulsed Light (IPL) Treatments",
    "Level 4",
  ],
].map(([id, title, level]) => {
  if (id === "vtct-skills-level-2-award-in-facial-massage-and-skin-care") {
    return {
      id,
      title,
      level,
      materials: [
        {
          id: "demo-level-2-facial-course-book",
          title: "Demo Course Workbook",
          storageKey:
            "learner-materials/demo/demo-level-2-facial-course-book.pdf",
        },
      ],
      assignments: [
        {
          id: "demo-facial-consultation-plan",
          title: "Demo Assignment 1: Consultation and Treatment Plan",
          instructions:
            "Demonstration only — not official VTCT material. Download the brief, then submit your written answer and/or PDF or Word evidence through the portal.",
          briefStorageKey:
            "learner-materials/demo/demo-assignment-consultation-plan.pdf",
        },
        {
          id: "demo-facial-hygiene-safety",
          title: "Demo Assignment 2: Hygiene and Safety",
          instructions:
            "Demonstration only — not official VTCT material. Download the brief, then submit your written answer and/or PDF or Word evidence through the portal.",
          briefStorageKey:
            "learner-materials/demo/demo-assignment-hygiene-safety.pdf",
        },
      ],
    };
  }
  return { id, title, level, materials: [], assignments: [] };
});

export function getLearnerCourse(id: string) {
  return learnerCourses.find((course) => course.id === id);
}
export function getLearnerAssignment(id: string) {
  return learnerCourses
    .flatMap((course) =>
      course.assignments.map((assignment) => ({ course, assignment })),
    )
    .find((entry) => entry.assignment.id === id);
}
