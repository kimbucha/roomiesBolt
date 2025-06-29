#!/bin/bash

# Make sure we're in the project root
cd "$(dirname "$0")/.."

# Check if the AST output directory exists
if [ ! -d "ast-output-llm" ]; then
  echo "Error: AST output directory not found. Please run ./scripts/generate-ast-llm.sh or ./scripts/generate-ast-llm-optimized.sh first."
  exit 1
fi

# Function to display a file
display_file() {
  local file="$1"
  local title="$2"
  
  if [ -f "$file" ]; then
    echo "=== $title ==="
    echo ""
    cat "$file"
    echo ""
    echo "Press Enter to continue..."
    read
  else
    echo "File not found: $file"
    exit 1
  fi
}

# Main menu
while true; do
  clear
  echo "=== AST LLM Viewer ==="
  echo ""
  echo "Select a file to view:"
  echo "1. Codebase Summary"
  echo "2. Components"
  echo "3. Types"
  echo "4. Imports"
  echo "5. Directory Structure"
  echo "q. Quit"
  echo ""
  echo -n "Enter your choice: "
  read choice
  
  case "$choice" in
    1)
      display_file "ast-output-llm/codebase-summary.md" "Codebase Summary"
      ;;
    2)
      display_file "ast-output-llm/components.md" "Components"
      ;;
    3)
      display_file "ast-output-llm/types.md" "Types"
      ;;
    4)
      display_file "ast-output-llm/imports.md" "Imports"
      ;;
    5)
      display_file "ast-output-llm/directory-structure.md" "Directory Structure"
      ;;
    q|Q)
      echo "Exiting..."
      exit 0
      ;;
    *)
      echo "Invalid choice. Press Enter to continue..."
      read
      ;;
  esac
done
