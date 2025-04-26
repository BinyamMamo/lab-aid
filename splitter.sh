#!/bin/bash

INPUT_FILE="input.txt"
FILES_CREATED=()

# Check if file exists
if [ ! -f "$INPUT_FILE" ]; then
  echo "❌ File '$INPUT_FILE' not found."
  exit 1
fi

# Split contents into files
current_file=""
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ $line =~ ^//\ File:\ src/.* || $line =~ ^//\ src/.* ]]; then
    current_file="${line#// File: }"
    current_file="${current_file#// }"
    mkdir -p "$(dirname "$current_file")"
    > "$current_file"
    FILES_CREATED+=("$(realpath "$current_file")")
  elif [ -n "$current_file" ]; then
    echo "$line" >> "$current_file"
  fi
done < "$INPUT_FILE"

# Clear original file
> "$INPUT_FILE"
echo "✅ Done. Original file has been emptied."

# List all created files with full paths
echo -e "\n📄 Files created:"
for f in "${FILES_CREATED[@]}"; do
  code $f
  echo "$f"
done
