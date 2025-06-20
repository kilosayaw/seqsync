#!/bin/zsh

# --- FFmpeg Audio Conversion Script ---
# This script converts all .wav files in a source directory to a standard
# 16-bit, 44.1kHz mono PCM format, ideal for web audio.

# Define the source and destination directories relative to where the script is run.
SOURCE_DIR="kits/tr808"
DEST_DIR="fixed-sounds/tr808"

# Check if the source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory '$SOURCE_DIR' not found."
    echo "Please make sure you are in the '/public/assets/sounds/' directory before running this script."
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null
then
    echo "Error: ffmpeg command could not be found."
    echo "Please install FFmpeg first (e.g., 'brew install ffmpeg') and try again."
    exit 1
fi

# Create the destination directory
mkdir -p "$DEST_DIR"
echo "Created destination directory at '$DEST_DIR'."

# Find and process all .wav files
find "$SOURCE_DIR" -name "*.wav" | while read f; do
    FILENAME=$(basename "$f")
    
    echo "Processing: $FILENAME"
    
    # Use FFmpeg to re-encode the file.
    # -y: Overwrites output files without asking.
    # -loglevel error: Suppresses all output except for fatal errors.
    ffmpeg -i "$f" -acodec pcm_s16le -ar 44100 -ac 1 "$DEST_DIR/$FILENAME" -y -loglevel error
    
    # Check if the last command (ffmpeg) failed
    if [ $? -ne 0 ]; then
        echo "  -> FAILED to process $FILENAME. Check for errors above."
    fi
done

echo ""
echo "---"
echo "✅ All sounds have been processed."
echo "The standardized files are in the '$DEST_DIR' directory."