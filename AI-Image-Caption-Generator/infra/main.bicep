/*
Bicep skeleton to create Azure AI Vision resource and (optionally) a Key Vault.
This template is a starting point. You'll still need to create:
- Static Web App (via portal or GitHub Action)
- Function App (connect to the repo's /api)
Use this file with: az deployment group create -g <rg> -f main.bicep
*/
param location string = resourceGroup().location
param visionName string
param keyVaultName string

resource vision 'Microsoft.CognitiveServices/accounts@2021-10-01' = {
  name: visionName
  location: location
  sku: {
    name: 'S0'
  }
  kind: 'CognitiveServices'
  properties: {
    publicNetworkAccess: 'Enabled'
  }
}

resource kv 'Microsoft.KeyVault/vaults@2021-10-01' = if (!empty(keyVaultName)) {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
    enabledForDeployment: false
    enabledForTemplateDeployment: false
    enabledForDiskEncryption: false
  }
}

output visionEndpoint string = vision.properties.endpoint