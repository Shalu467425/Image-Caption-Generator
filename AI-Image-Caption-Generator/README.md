# Azure Caption Generator — React + Vite + Azure Static Web Apps + Azure Function

This repository contains a React (Vite) frontend and an Azure Function backend to generate image captions using **Azure AI Vision**. It also includes a Bicep skeleton to provision the Vision resource (and guidance for deploying Static Web Apps and Functions).

Features added in this variant:
- React + Vite frontend with upload, URL mode, thumbnail preview, caption history, and confidence display (if returned).
- Improved server-side validation and an optional placeholder for virus/malware scan before forwarding image to Azure Vision.
- Bicep skeleton to provision Azure AI Vision resource and hints for adding Key Vault and Function App.
- GitHub Actions workflow for Azure Static Web Apps deployment.

⚠️ Security note: Always store `VISION_KEY` in Azure Key Vault or Function App configuration — never commit secrets to repo.