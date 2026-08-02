# Consultation Forms Audit

Date: 2 August 2026

## Scope

This review covers all seven digital consultation templates, their 497 configured fields, required-field behaviour, rendered controls, source-PDF links, consent structure, and treatment-specific record keeping. It compares the implementation with the clinic's supplied PDFs/DOCX references and current UK safety and consent guidance.

This is a product and record-structure audit, not approval to use the wording clinically. Final contraindications, medicine-specific warnings, emergency protocols and consent wording should be approved by the clinic's prescriber or medical lead and insurer.

## Automated test result

All tests pass. The automated checks now verify:

- every template has unique field IDs;
- every select and multi-checkbox field has a non-empty, duplicate-free option set;
- all 497 configured fields render into their digital form;
- the signature, clinic-terms consent and optional marketing consent controls render on every form;
- every template links to an existing, valid PDF source;
- the comprehensive injectable safety fields and filler-specific vascular-risk fields remain present.

## Cross-form findings

### High priority

1. Add a **Draft / Ready for treatment / Completed** workflow. At present a consultation can be saved without a customer signature, while treatment-only fields are intentionally optional so the initial consultation can be saved. Finalisation should require the signature, practitioner confirmation, clinical consent and the relevant procedure record without preventing draft saves.
2. Add conditional validation. A Yes answer should require an explanation; an Other selection should require details; a referral outcome should require referral evidence; and a positive or pending patch test should prevent treatment finalisation.
3. Record the exact consent discussion rather than relying only on checkboxes. GMC guidance treats a form as a prompt and record, not a substitute for dialogue tailored to the client.
4. Add immutable consent and procedure timestamps. A single synchronised consultation date is not sufficient for an initial consultation, later consent confirmation, treatment and follow-up.
5. Review the common client-details block. Emergency contact name is optional while the number is mandatory; this is inconsistent. Make both optional or make both conditionally required. Consider whether collecting gender is necessary for every treatment and whether a clinically specific question is preferable where relevant.

### Medium priority

1. Add numeric constraints and units: stress scores should accept only 1–10; alcohol units should be non-negative; blood-pressure and dose fields should have sensible bounds while still permitting clinician override with reasons.
2. Add an explicit “None known / Not applicable” choice where a required free-text answer currently forces staff to type “None”.
3. Add versioning for template wording so historic records show the exact consent version agreed at the time.
4. Keep clinical photography consent separate from marketing consent in every form. This is already correct for injectables, peels/microneedling and SPMU, but not Lemon Bottle or laser/device.
5. Add a final practitioner declaration confirming identity, capacity, suitability, product/device checks, consent and aftercare—not merely a practitioner name and notes field.

## Form-by-form report

### Anti-Wrinkle Treatment — 91 fields

**Keep:** comprehensive medical screen, neuromuscular questions, treatment-area map, suitability/referral decision, age verification, product/batch/expiry, units/dilution, separate photography permissions and follow-up.

**Add:** explicit discussion of common and material toxin effects (pain/bruising, headache, asymmetry, brow or eyelid ptosis, dry eye/visual symptoms and local weakness) plus urgent symptoms of distant toxin spread such as swallowing, speech or breathing difficulty. Record brand, prescribed dose, diluent and diluent batch, reconstitution date/time, exact units per injection point, prescription/prescriber reference and whether the use is on-label or off-label.

**Change/remove:** do not present the same fixed pre-treatment skincare restrictions as universally applicable to every toxin patient; make them practitioner/product specific. Do not finalise without proof-of-age check and a signed treatment decision.

### Dermal Fillers — 96 fields

**Keep:** comprehensive medical history, dental/oral-health prompt, detailed areas, vascular occlusion/necrosis/visual-loss consent, dissolving discussion, referral decision, product traceability, technique and follow-up.

**Add:** common and delayed risks such as pain, bleeding/bruising, oedema, infection, asymmetry, under/over-correction, lumps/nodules, migration, delayed inflammatory reaction and herpetic reactivation where relevant. Record anaesthetic, needle/cannula type and lot where available, exact volume by area, injection-plane/technique notes, emergency-plan discussion and any complication-management action.

**Change/remove:** “hyaluronidase/dissolving” must be conditional on the actual filler type; not every filler is dissolvable with hyaluronidase. Keep photography marketing permission optional and independent.

### Skin Peel and Microneedling — 77 fields

**Keep:** skincare/active-product history, Fitzpatrick classification, skin assessment, recent-procedure screen, patch test, pigment/scarring risks, treatment goals, procedure fields and aftercare.

**Add:** product brand, batch and expiry; microneedling device and sterile cartridge lot; anaesthetic details; treatment parameters/passes; infection-control confirmation; and a separate record for peel layers/end point or microneedling depth by facial/body zone.

**Change/remove:** patch testing should follow the selected product's manufacturer instructions, insurer protocol and clinical assessment rather than an inflexible rule across every peel and microneedling treatment. “Apples, grapes, citrus and milk” should remain only when clinically relevant to the exact product ingredients; otherwise replace them with product/ingredient allergy screening.

### IV Therapy — 44 fields

**Keep:** allergies, medication/supplement list, cardiovascular/kidney/liver/diabetes screen, pregnancy/breastfeeding, blood pressure, ingredients/dose, lot numbers, administration site and observations.

**Add:** treatment indication and expected benefit, product-specific contraindications, full baseline observations where clinically required, cannula size/site, infusion start/end time and rate, individual ingredient batch/expiry, post-treatment observations, cannula removal/site condition, adverse-reaction actions and escalation details.

**Change/remove:** the current hard-coded blood-pressure classification thresholds require clinical review and should not by themselves determine suitability. Use the clinic's approved observation/escalation protocol and record the clinician's decision. Ensure claims about IV therapy benefits match the authorised product evidence and clinic governance.

### Lemon Bottle — 42 fields

**Keep:** pregnancy, allergy, medicines, kidney/liver, autoimmune, cardiac, diabetes, skin/scarring and treatment-expectation questions.

**Add:** a full procedure record—supplier/product verification, ingredients, batch/lot, expiry, amount per area, injection points/technique, device/needle details, immediate reaction, complication management, aftercare and follow-up. Add explicit suitability/referral outcome and separate clinical/marketing photography permissions.

**Change/remove:** avoid unsupported efficacy, ingredient or “fat dissolving” claims in consent text. The medical lead and insurer should approve product-specific contraindications, intended use, emergency arrangements and wording before release.

### SPMU — 53 fields

**Keep:** design/colour approval, correction-history questions, allergy screening, MRI/laser prompts, internal vs marketing photography consent and client expectations.

**Add:** broader medical screen for diabetes, anticoagulants, healing/scarring, active skin infection/lesions, immune suppression and blood-borne infection risks; patch-test product/date/result; pigment brand/colour/batch/expiry; anaesthetic and needle/cartridge lot; exact treated area/technique; infection-control confirmation; aftercare and top-up/follow-up record.

**Change/remove:** the current original SPM PDF is very short and should not be treated as the complete clinical authority. Remove or rewrite blanket instructions to stop medicines such as aspirin unless directed by an appropriate prescriber; the form should not tell clients to alter prescribed medicine independently.

### Laser and Device — 94 fields

**Keep:** extensive medical and medication history, sun/tan/waxing questions, Fitzpatrick scoring, consent checklist, eye protection and test-patch settings.

**Add:** actual treatment-session record separate from the test patch: device name/serial, handpiece, wavelength/mode, area-by-area settings, cooling, shot count, endpoint/skin response, adverse events, aftercare and next-session plan. Add separate confidential clinical-photography and optional marketing permissions.

**Change/remove:** reconcile the source PDF's contradictory patch-test wording (“required” versus “client discretion”). The digital form should follow the clinic's laser protection adviser/local rules, manufacturer instructions and insurer-approved patch-test interval. Make calculated Fitzpatrick scores advisory, with a recorded clinician override reason.

## Recommended implementation order

1. Draft/final/completed state and signature/finalisation rules.
2. Conditional validation and contraindication escalation.
3. Treatment traceability fields for Lemon Bottle, SPMU, laser/device, peel/microneedling and IV therapy.
4. Treatment-specific material-risk wording for toxin and filler.
5. Photography-consent separation and common client-details cleanup.
6. Numeric constraints, wording/version audit trail and clinician sign-off.

## Guidance checked

- GMC, *Decision making and consent* and *Recording decisions*.
- GOV.UK, *Botulinum toxin and cosmetic fillers for under 18s*.
- Electronic Medicines Compendium, current BOTOX Summary of Product Characteristics.
- UK Government review of cosmetic-intervention regulation and dermal-filler risks.
- UKHSA tattooing/body-piercing infection-prevention guidance.
- GOV.UK guidance on safe use of lasers, intense light sources and LEDs.
