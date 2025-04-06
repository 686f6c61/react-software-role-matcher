import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { parseCSVData, determineProfessionalLevel, fetchCSVData } from './utils';
import { CSVData, ProfessionalLevel, ProfessionalRole, RoleMatcherProps } from './types';
import './styles.css';

const RoleMatcher: React.FC<RoleMatcherProps> = ({
  csvData,
  csvUrl,
  onLevelDetermined,
  className = ''
}) => {
  const [data, setData] = useState<CSVData | null>(null);
  const [selectedRole, setSelectedRole] = useState<ProfessionalRole | null>(null);
  const [yearsExperience, setYearsExperience] = useState<number | ''>('');
  const [level, setLevel] = useState<ProfessionalLevel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load CSV data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let csvText = '';
        
        if (csvData) {
          csvText = csvData;
        } else if (csvUrl) {
          csvText = await fetchCSVData(csvUrl);
        } else {
          throw new Error('Either csvData or csvUrl must be provided');
        }
        
        const parsedData = parseCSVData(csvText);
        setData(parsedData);
      } catch (err) {
        setError('Error loading CSV data: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [csvData, csvUrl]);

  // Format roles for react-select
  const roleOptions = useMemo(() => {
    if (!data) return [];
    
    return data.roles.map(role => ({
      value: role,
      label: role.role,
      category: role.category
    }));
  }, [data]);

  // Handle role selection
  const handleRoleChange = (selected: any) => {
    setSelectedRole(selected?.value || null);
    
    // Reset years and level when role changes
    setYearsExperience('');
    setLevel(null);
  };

  // Handle years of experience input
  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '') {
      setYearsExperience('');
      setLevel(null);
    } else {
      const numValue = parseInt(value, 10);
      
      if (!isNaN(numValue) && numValue >= 0) {
        setYearsExperience(numValue);
        
        // Determine professional level based on years and selected role
        if (data) {
          const newLevel = determineProfessionalLevel(numValue, data, selectedRole);
          setLevel(newLevel);
          
          // Call the callback if provided
          if (onLevelDetermined) {
            onLevelDetermined(newLevel);
          }
        }
      }
    }
  };

  // Group options by category
  const groupedOptions = useMemo(() => {
    if (!data) return [];
    
    const categories = Object.keys(data.categories);
    
    return categories.map(category => ({
      label: category,
      options: roleOptions.filter(option => option.category === category)
    }));
  }, [data, roleOptions]);

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-2">{error}</div>;
  }

  return (
    <div className={`role-matcher ${className}`}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buscador de roles profesionales
        </label>
        <Select
          className="role-select"
          classNamePrefix="role-select"
          options={groupedOptions}
          onChange={handleRoleChange}
          placeholder="Escribe para buscar..."
          isClearable
          isSearchable
          styles={{
            container: (provided) => ({
              ...provided,
              maxWidth: '350px',
              width: '100%'
            }),
            menu: (provided) => ({
              ...provided,
              maxWidth: '350px'
            })
          }}
        />
      </div>
      
      {selectedRole && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ¿Cuántos años llevas siendo {selectedRole.role}?
          </label>
          <input
            type="number"
            min="0"
            value={yearsExperience}
            onChange={handleYearsChange}
            className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Introduce años de experiencia"
            style={{ maxWidth: '350px', width: '100%' }}
          />
        </div>
      )}
      
      {level && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nivel profesional: <span className="font-bold text-indigo-600">{level.level}</span>
          </h3>
          <div className="text-sm text-gray-600 mb-2">
            Años de experiencia: {level.minExperience}-{level.maxExperience}
          </div>
          <div className="mt-3">
            <h4 className="text-md font-medium text-gray-800 mb-1">Habilidades esperadas:</h4>
            <p className="text-gray-700 whitespace-pre-line">{level.skills}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleMatcher;
