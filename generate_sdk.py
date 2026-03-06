#!/usr/bin/env python3
"""
generate_sdk.py — Generates a Python SDK from the running FastAPI backend
using the OpenAPI Generator CLI.

Usage:
    python generate_sdk.py

Prerequisites:
    - npm install -g @openapitools/openapi-generator-cli
    - Backend must be running on http://localhost:8000
"""
import subprocess
import sys
import os


def generate_sdk():
    print("=" * 60)
    print("  Healthcare Platform SDK Generator")
    print("=" * 60)

    output_dir = os.path.join(os.path.dirname(__file__), "health_sdk")
    openapi_url = "http://localhost:8000/openapi.json"

    cmd = [
        "openapi-generator-cli", "generate",
        "-i", openapi_url,
        "-g", "python",
        "-o", output_dir,
        "--package-name", "health_sdk",
    ]

    print(f"\nGenerating SDK from: {openapi_url}")
    print(f"Output directory:    {output_dir}\n")

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("ERROR: SDK generation failed.")
        print(result.stderr)
        sys.exit(1)

    print("✓ SDK generated successfully!\n")
    print("Example usage:")
    print("-" * 40)
    print("from health_sdk.api.doctors_api import DoctorsApi")
    print("from health_sdk import ApiClient")
    print()
    print("client = ApiClient()")
    print("api = DoctorsApi(client)")
    print("doctors = api.doctors_list()")
    print("print(doctors)")


if __name__ == "__main__":
    generate_sdk()
