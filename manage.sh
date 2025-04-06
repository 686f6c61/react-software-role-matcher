#!/bin/bash

# Script para gestionar la aplicación React Software Role Matcher
# Autor: 686f6c61
# Fecha: 2025-04-06

APP_DIR="/home/the00b/Escritorio/npm/software-companies-app"
PORT=3000
LOG_FILE="$APP_DIR/app.log"

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
  echo -e "${BLUE}React Software Role Matcher - Script de gestión${NC}"
  echo ""
  echo "Uso: ./manage.sh [comando]"
  echo ""
  echo "Comandos:"
  echo "  start       - Inicia la aplicación en modo desarrollo"
  echo "  stop        - Detiene todos los procesos de la aplicación"
  echo "  restart     - Reinicia la aplicación"
  echo "  status      - Muestra el estado de la aplicación"
  echo "  info        - Muestra información sobre la aplicación y el CSV"
  echo "  build       - Construye la aplicación para producción"
  echo "  help        - Muestra esta ayuda"
  echo ""
}

# Función para iniciar la aplicación
start_app() {
  echo -e "${BLUE}Iniciando React Software Role Matcher...${NC}"
  
  # Verificar si la aplicación ya está en ejecución
  if pgrep -f "vite.*$PORT" > /dev/null; then
    echo -e "${YELLOW}¡La aplicación ya está en ejecución en el puerto $PORT!${NC}"
    echo -e "Usa ${GREEN}./manage.sh status${NC} para ver más detalles."
    return 1
  fi
  
  # Verificar si node_modules existe
  if [ ! -d "$APP_DIR/node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias...${NC}"
    cd "$APP_DIR" && npm install
  fi
  
  # Iniciar la aplicación
  cd "$APP_DIR" && npm run dev > "$LOG_FILE" 2>&1 &
  
  # Esperar a que la aplicación esté lista
  echo -e "${YELLOW}Esperando a que la aplicación esté lista...${NC}"
  sleep 3
  
  # Verificar si la aplicación se inició correctamente
  if pgrep -f "vite.*$PORT" > /dev/null; then
    echo -e "${GREEN}¡Aplicación iniciada correctamente!${NC}"
    echo -e "Accede a la aplicación en: ${BLUE}http://localhost:$PORT${NC}"
    echo -e "Explorador de CSV en: ${BLUE}http://localhost:$PORT/csv${NC}"
    echo -e "Logs disponibles en: ${BLUE}$LOG_FILE${NC}"
  else
    echo -e "${RED}Error al iniciar la aplicación. Revisa los logs en $LOG_FILE${NC}"
    return 1
  fi
}

# Función para detener la aplicación
stop_app() {
  echo -e "${BLUE}Deteniendo React Software Role Matcher...${NC}"
  
  # Buscar procesos relacionados con la aplicación
  local pids=$(pgrep -f "vite.*$PORT")
  
  if [ -z "$pids" ]; then
    echo -e "${YELLOW}No se encontraron procesos de la aplicación en ejecución.${NC}"
    return 0
  fi
  
  # Matar los procesos
  echo -e "${YELLOW}Matando procesos: $pids${NC}"
  kill $pids
  
  # Verificar si los procesos se detuvieron
  sleep 2
  if pgrep -f "vite.*$PORT" > /dev/null; then
    echo -e "${RED}No se pudieron detener todos los procesos. Intentando con fuerza...${NC}"
    kill -9 $(pgrep -f "vite.*$PORT")
  fi
  
  echo -e "${GREEN}¡Aplicación detenida correctamente!${NC}"
}

# Función para reiniciar la aplicación
restart_app() {
  echo -e "${BLUE}Reiniciando React Software Role Matcher...${NC}"
  stop_app
  sleep 2
  start_app
}

# Función para mostrar el estado de la aplicación
status_app() {
  echo -e "${BLUE}Estado de React Software Role Matcher:${NC}"
  
  # Verificar si la aplicación está en ejecución
  local pids=$(pgrep -f "vite.*$PORT")
  
  if [ -z "$pids" ]; then
    echo -e "${YELLOW}Estado: ${RED}Detenida${NC}"
    return 0
  fi
  
  echo -e "${YELLOW}Estado: ${GREEN}En ejecución${NC}"
  echo -e "PID(s): ${BLUE}$pids${NC}"
  echo -e "Puerto: ${BLUE}$PORT${NC}"
  echo -e "URL: ${BLUE}http://localhost:$PORT${NC}"
  echo -e "Explorador de CSV: ${BLUE}http://localhost:$PORT/csv${NC}"
  echo -e "Tiempo de ejecución: ${BLUE}$(ps -o etime= -p $(echo $pids | awk '{print $1}'))${NC}"
  echo -e "Uso de memoria: ${BLUE}$(ps -o %mem= -p $(echo $pids | awk '{print $1}'))%${NC}"
  echo -e "Uso de CPU: ${BLUE}$(ps -o %cpu= -p $(echo $pids | awk '{print $1}'))%${NC}"
}

# Función para mostrar información sobre la aplicación y el CSV
info_app() {
  echo -e "${BLUE}Información de React Software Role Matcher:${NC}"
  
  # Información del proyecto
  echo -e "${YELLOW}Versión:${NC} $(grep '"version"' "$APP_DIR/package.json" | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')"
  
  # Información del CSV
  local csv_file="$APP_DIR/data/roles_profesionales_npm_format.csv"
  if [ -f "$csv_file" ]; then
    echo -e "${YELLOW}Archivo CSV:${NC} $csv_file"
    echo -e "${YELLOW}Tamaño del CSV:${NC} $(du -h "$csv_file" | cut -f1)"
    echo -e "${YELLOW}Líneas en el CSV:${NC} $(wc -l < "$csv_file")"
    
    # Contar categorías únicas
    echo -e "${YELLOW}Categorías en el CSV:${NC} $(grep -v "^$" "$csv_file" | cut -d',' -f1 | sort | uniq | wc -l)"
    
    # Mostrar primeras categorías
    echo -e "${YELLOW}Primeras categorías:${NC}"
    grep -v "^$" "$csv_file" | cut -d',' -f1 | sort | uniq | head -5 | sed 's/^/  - /'
  else
    echo -e "${RED}Archivo CSV no encontrado en $csv_file${NC}"
  fi
  
  # Información de dependencias
  echo -e "${YELLOW}Dependencias principales:${NC}"
  grep -A 10 '"dependencies"' "$APP_DIR/package.json" | grep -v "dependencies" | grep ":" | head -5 | sed 's/^/  - /' | sed 's/[",]//g'
}

# Función para construir la aplicación
build_app() {
  echo -e "${BLUE}Construyendo React Software Role Matcher para producción...${NC}"
  
  # Verificar si node_modules existe
  if [ ! -d "$APP_DIR/node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias...${NC}"
    cd "$APP_DIR" && npm install
  fi
  
  # Construir la aplicación
  cd "$APP_DIR" && npm run build
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}¡Aplicación construida correctamente!${NC}"
    echo -e "Los archivos de producción están en: ${BLUE}$APP_DIR/dist${NC}"
  else
    echo -e "${RED}Error al construir la aplicación.${NC}"
    return 1
  fi
}

# Procesar el comando
case "$1" in
  start)
    start_app
    ;;
  stop)
    stop_app
    ;;
  restart)
    restart_app
    ;;
  status)
    status_app
    ;;
  info)
    info_app
    ;;
  build)
    build_app
    ;;
  help|*)
    show_help
    ;;
esac

exit 0
