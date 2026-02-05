#!/usr/bin/env bash

set -euo pipefail

echo "Post-creation setup starting..."

# Clean any existing .NET build artifacts to prevent permission issues
echo "Cleaning existing .NET build artifacts..."
find /workspace -type d \( -name "obj" -o -name "bin" \) -exec rm -rf {} + 2>/dev/null || true

echo "Post-creation setup complete!"
