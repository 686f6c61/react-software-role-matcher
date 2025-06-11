import { parseCSVData } from './utils';

describe('parseCSVData', () => {
  it('parses categories, roles, and levels from CSV', () => {
    const csv = `Categor\u00eda,Roles Profesionales
Software Engineering,"Backend Developer, Frontend Developer"
Data,"Data Analyst, Data Scientist"

Categor\u00eda,Nivel Profesional,A\u00f1os de Experiencia,Habilidades Esperadas
Software Engineering,Junior Developer,0-2,Skill A
Software Engineering,Senior Developer,3-5,Skill B
Data,Junior Analyst,0-1,Skill C
Data,Senior Analyst,2-4,Skill D
`;

    const result = parseCSVData(csv);

    expect(Object.keys(result.categories)).toEqual([
      'Software Engineering',
      'Data'
    ]);
    expect(result.roles.length).toBe(4);
    expect(result.levels['Software Engineering'].length).toBe(2);
    expect(result.levels['Data'].length).toBe(2);
  });
});
