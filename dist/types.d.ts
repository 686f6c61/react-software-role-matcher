export interface ProfessionalRole {
    category: string;
    role: string;
}
export interface ProfessionalLevel {
    level: string;
    minExperience: number;
    maxExperience: number;
    skills: string;
    category: string;
}
export interface CSVData {
    categories: Record<string, string[]>;
    roles: ProfessionalRole[];
    levels: Record<string, ProfessionalLevel[]>;
}
export interface RoleMatcherProps {
    csvData?: string;
    csvUrl?: string;
    onLevelDetermined?: (level: ProfessionalLevel | null) => void;
    className?: string;
}
