import { CSVData, ProfessionalLevel, ProfessionalRole } from './types';
/**
 * Parses the CSV data and extracts categories, roles, and professional levels
 */
export declare const parseCSVData: (csvText: string) => CSVData;
/**
 * Determines the professional level based on years of experience and role
 */
export declare const determineProfessionalLevel: (years: number, data: CSVData, role: ProfessionalRole | null) => ProfessionalLevel | null;
/**
 * Fetches CSV data from a URL
 */
export declare const fetchCSVData: (url: string) => Promise<string>;
