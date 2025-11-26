import { PluginConfig } from '../types';

export const generateBuildGradle = (config: PluginConfig) => `
plugins {
    id("com.android.library")
    kotlin("android")
    id("com.lagradost.cloudstream3.gradle.cloudstream-extension")
}

cloudstream {
    // metadata
    name = "${config.pluginName}"
    label = "${config.pluginName}"
    description = "${config.description}"
    authors = listOf("${config.author}")
    recommends = listOf("app.cloudstream3.android")
    
    // technical
    versionCode = 1
    versionName = "1.0.0"
}

android {
    namespace = "com.${config.author.toLowerCase().replace(/[^a-z0-9]/g, '')}.${config.pluginName.toLowerCase()}"
    defaultConfig {
        minSdk = 21
        compileSdk = 33
    }
}

dependencies {
    implementation(repositories.cloudstream)
    implementation("org.jsoup:jsoup:1.15.3")
}
`;

export const generateWorkflows = (config: PluginConfig) => `
name: Build CloudStream Plugin

on:
  push:
    branches: [ "master", "main" ]
  pull_request:
    branches: [ "master", "main" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Grant execute permission for gradlew
        run: chmod +x gradlew
        
      - name: Build with Gradle
        run: ./gradlew make
        
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: ${config.pluginName}-extension
          path: "**/*.cs3"
`;

export const generateReadme = (config: PluginConfig) => `
# ${config.pluginName} CloudStream Provider

This is a CloudStream 3 extension for [${config.siteUrl}](${config.siteUrl}).

## Installation

1. Open CloudStream.
2. Go to Settings > Extensions > Add Repository.
3. Name: ${config.repoName}
4. URL: https://raw.githubusercontent.com/${config.author}/${config.repoName}/master/repo.json
`;
