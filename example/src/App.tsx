import React, { useState, useEffect } from 'react';
import { RoleMatcher, ProfessionalLevel } from 'csv-role-matcher';

const App: React.FC = () => {
  const [csvData, setCsvData] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ProfessionalLevel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load the CSV file
    const loadCSV = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/roles_profesionales_npm_format.csv');
        const data = await response.text();
        setCsvData(data);
      } catch (error) {
        console.error('Error loading CSV:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCSV();
  }, []);

  const handleLevelDetermined = (level: ProfessionalLevel | null) => {
    setSelectedLevel(level);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            React Role Matcher
          </h1>
          
          <p className="text-gray-600 mb-8">
            Selecciona tu categoría profesional, rol y años de experiencia para descubrir tu nivel y las habilidades que deberías tener según los estándares de la industria.
          </p>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando datos...</p>
            </div>
          ) : csvData ? (
            <RoleMatcher 
              csvData={csvData}
              onLevelDetermined={handleLevelDetermined}
              className="mb-6"
            />
          ) : (
            <div className="text-center py-8 text-red-500">
              Error al cargar los datos. Por favor, intenta de nuevo.
            </div>
          )}
          
          {selectedLevel && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Nivel seleccionado: <span className="font-bold text-indigo-600">{selectedLevel.level}</span>
              </h2>
              <p className="text-sm text-gray-500">
                Este nivel corresponde a profesionales con {selectedLevel.minExperience}-{selectedLevel.maxExperience} años de experiencia.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center">
            <span>React Role Matcher - Modifica y disfruta</span>
            <a href="https://github.com/686f6c61/react-software-role-matcher" target="_blank" rel="noopener noreferrer" className="ml-2 hover:text-gray-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </p>

        </div>
      </div>
    </div>
  );
};

export default App;
