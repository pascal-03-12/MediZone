export type MedicationId = string;

export type UserId = string;

export type DosageForm =
    | "tablet"
    | "capsule"
    | "drops"
    | "spray"
    | "injection"
    | "cream"
    | "other";

export type Medication = {
    id: MedicationId;
    name: string;
    substance: string;
    dosageForm: DosageForm;
    strength?: string;
    standardDose: number;
    doseUnit: string;
    instructions: string;
    maxPerDay: number;
    minHoursBetween: number;
};

export type IntakeEntry = {
    id: string;
    medId: MedicationId;
    date: string;      
    dose: number;
    doseUnit: string;
    note?: string;
};