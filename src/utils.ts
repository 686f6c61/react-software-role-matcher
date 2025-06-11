import Papa from 'papaparse';
import { CSVData, ProfessionalLevel, ProfessionalRole } from './types';

/**
 * Parses the CSV data and extracts categories, roles, and professional levels
 */
export const parseCSVData = (csvText: string): CSVData => {
  const result = Papa.parse(csvText, { header: false });
  const rows = result.data as string[][];
  
  const data: CSVData = {
    categories: {},
    roles: [],
    levels: {}
  };
  
  let parsingCategories = true;
  let parsingLevels = false;
  
  rows.forEach((row) => {
    // Skip empty rows
    if (row.length < 2 || !row[0]) return;
    
    // Check if this is the category header row
    if (row[0] === 'Categoría' && row[1] === 'Roles Profesionales') {
      parsingCategories = true;
      parsingLevels = false;
      return;
    }
    
    // Check if this is the levels header row
    if (row[0] === 'Categoría' && row[1] === 'Nivel Profesional') {
      parsingCategories = false;
      parsingLevels = true;
      return;
    }
    
    // Parse categories and roles
    if (parsingCategories && row[0] && row[1] && row[0] !== 'Categoría') {
      const category = row[0];
      
      // Parse roles for this category
      const roles = row[1].split(',').map(role => role.trim());
      data.categories[category] = roles;
      
      // Add each role to the roles array
      roles.forEach(role => {
        data.roles.push({
          category,
          role
        });
      });
    }
    
    // Parse levels
    if (parsingLevels && row.length >= 4 && row[0] !== 'Categoría') {
      const category = row[0];
      const level = row[1];
      const experienceRange = row[2].split('-');
      let minExperience = 0;
      let maxExperience = 99;
      
      // Handle ranges like "0-1", "2-4", "15+"
      if (experienceRange[0]) {
        minExperience = parseInt(experienceRange[0], 10) || 0;
      }
      
      if (experienceRange[1]) {
        if (experienceRange[1].includes('+')) {
          maxExperience = 99; // For "15+" type ranges
        } else {
          maxExperience = parseInt(experienceRange[1], 10) || 99;
        }
      }
      
      // Initialize the category in levels if it doesn't exist
      if (!data.levels[category]) {
        data.levels[category] = [];
      }
      
      data.levels[category].push({
        level,
        minExperience,
        maxExperience,
        skills: row[3],
        category
      });
    }
  });
  
  // Debug output to verify categories and levels
  console.log('Categories:', Object.keys(data.categories));
  console.log('Levels categories:', Object.keys(data.levels));
  console.log('Roles count:', data.roles.length);
  
  return data;
};

/**
 * Determines the professional level based on years of experience and role
 */
export const determineProfessionalLevel = (
  years: number,
  data: CSVData,
  role: ProfessionalRole | null
): ProfessionalLevel | null => {
  if (!role) return null;
  
  // Get the category of the selected role
  const category = role.category;
  const roleName = role.role;
  
  // Get the levels for this category
  const categoryLevels = data.levels[category] || [];
  
  // If no levels found for this category, try using Software Engineering as fallback
  // This handles cases where the category might not have specific levels defined
  const levelsToUse = categoryLevels.length > 0 ? 
    categoryLevels : 
    (data.levels['Software Engineering'] || []);
  
  // Filter the levels to only include those for the selected role
  const roleSpecificLevels = levelsToUse.filter(level => {
    // Check if the level title starts with the role name
    // This handles cases where the role name is a prefix of the level title
    return level.level.startsWith(roleName) || 
           // These special cases handle "Desarrollador", "Especialista Técnico", etc. mapping to specific roles
           (roleName === 'Backend Developer' && level.level === 'Desarrollador Junior') ||
           (roleName === 'Backend Developer' && level.level === 'Desarrollador Mid-level') ||
           (roleName === 'Backend Developer' && level.level === 'Desarrollador Senior') ||
           (roleName === 'Frontend Developer' && level.level === 'Desarrollador Junior') ||
           (roleName === 'Frontend Developer' && level.level === 'Desarrollador Mid-level') ||
           (roleName === 'Frontend Developer' && level.level === 'Desarrollador Senior') ||
           (roleName === 'Full-Stack Developer' && level.level === 'Desarrollador Junior') ||
           (roleName === 'Full-Stack Developer' && level.level === 'Desarrollador Mid-level') ||
           (roleName === 'Full-Stack Developer' && level.level === 'Desarrollador Senior');
  });
  
  // Find the appropriate level based on years of experience
  let matchingLevels = roleSpecificLevels.filter(
    level => years >= level.minExperience && years <= level.maxExperience
  );
  
  // If no matching levels found, try to find the most experienced level for this role
  if (matchingLevels.length === 0) {
    const roleSpecificLevels = levelsToUse.filter(level => {
      const levelRoleName = level.level.split(/\s+(Junior|Mid-level|Senior|Mid|Senior|Jr|Sr|Lead|Principal|Director|CTO|Chief)\b/i)[0].trim();
      return levelRoleName === roleName;
    });
    
    if (roleSpecificLevels.length > 0) {
      // Sort by max experience to find the most senior level
      roleSpecificLevels.sort((a, b) => b.maxExperience - a.maxExperience);
      
      // If the years is higher than all defined ranges, return the highest level
      const highestLevel = roleSpecificLevels[0];
      if (years > highestLevel.maxExperience) {
        matchingLevels = [highestLevel];
      }
    }
  }
  
  // Return the highest matching level (assuming they're ordered in the CSV)
  return matchingLevels.length > 0 ? matchingLevels[matchingLevels.length - 1] : null;
};

/**
 * Fetches CSV data from a URL
 */
export const fetchCSVData = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV data: ${response.status}`);
  }
  return await response.text();
};
