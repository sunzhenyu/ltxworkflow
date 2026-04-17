#!/bin/bash
# Download images and videos from URLs
# Usage: ./download-media.sh <url_file> <output_dir> <prefix>
# url_file: text file with one URL per line
# output_dir: directory to save files (e.g., public/images/resources/)
# prefix: filename prefix (e.g., tutorial-audio-)

if [ $# -lt 3 ]; then
    echo "Usage: ./download-media.sh <url_file> <output_dir> <prefix>"
    exit 1
fi

URL_FILE=$1
OUTPUT_DIR=$2
PREFIX=$3

mkdir -p "$OUTPUT_DIR"

counter=1
while IFS= read -r url; do
    # Skip empty lines
    [ -z "$url" ] && continue

    # Detect file extension
    ext="${url##*.}"
    ext="${ext%%\?*}"  # Remove query params

    # Default to jpg if no extension found
    if [[ ! "$ext" =~ ^(jpg|jpeg|png|gif|webp|mp4|webm|mov)$ ]]; then
        ext="jpg"
    fi

    output_file="${OUTPUT_DIR}/${PREFIX}${counter}.${ext}"

    echo "Downloading: $url"
    echo "  -> $output_file"

    curl -sL "$url" -o "$output_file"

    if [ $? -eq 0 ]; then
        echo "  ✓ Downloaded ($(du -h "$output_file" | cut -f1))"
    else
        echo "  ✗ Failed"
    fi

    ((counter++))
done < "$URL_FILE"

echo ""
echo "✓ Downloaded $((counter-1)) files to $OUTPUT_DIR"
ls -lh "$OUTPUT_DIR/${PREFIX}"*
