# Performance Analysis of Novel Artificial Intelligence Approach for Marine Oil Spill Detection

# Abstract

Marine oil spills are destructive to oceans, coastlines, marine ecosystems, and the world economy. This research proposes a Vision Transformer (ViT)-based system for automatically detecting and classifying marine oil spills using satellite images. The proposed approach aims to distinguish oil spills from similar ocean surface features and support marine environmental monitoring.

# Introduction

Marine oil spills cause environmental damage, harm marine life, pollute coastlines, and affect communities that depend on the sea. Traditional detection techniques, including manual image examination and basic computer algorithms, can produce errors due to variations in weather, sea surface roughness, wind, and wave activity.

This research employs a Vision Transformer to detect marine oil spills directly from satellite imagery.

# Objectives

Detect marine oil spills using artificial intelligence.

Analyze satellite imagery to identify oil spill regions.

Apply Vision Transformer architecture for image feature extraction.

Distinguish oil spills from similar ocean surface features.

Evaluate the proposed system against existing models.

# Data Sources

The research uses satellite imagery from:

# Sentinel-1:
         Synthetic Aperture Radar (SAR) imagery.

# PlanetScope: 
           Optical satellite imagery.

# Proposed Methodology

The proposed Vision Transformer system follows these steps:

# Data Collection: 
           Collect satellite images from Sentinel-1 and PlanetScope.

# Data Preprocessing:
           Clean and prepare images before analysis.

# Patch Embedding: 
        Divide satellite images into smaller patches.

# Positional Encoding: 
        Integrate positional information into image patches.

# Transformer Encoder: 
        Extract useful features using the Transformer architecture.

# Classification Layer: 
        Determine the probability that an image contains an oil spill.

# Evaluation: 
        Assess the model's performance using evaluation metrics.

# Output:
        Present oil spill detection results, including confidence score, affected area, impact level, and recommendation action.

# Proposed ViT System

The proposed system uses the Transformer's self-attention mechanism to extract local and global spatial features from satellite images. The architecture processes image patches, integrates positional embeddings, generates features through Transformer encoder blocks, and performs classification.

# Results and Discussion

The paper compares the proposed Vision Transformer model with the following baseline models:

Convolutional Neural Network (CNN)

Hybrid Deep Learning (HDL)

Advanced Transformer Architecture (ATA)

Multi-scale Transformer Network (MSTN)

Dual Branch Transformer Network (DBTN)

Lightweight Swin Transformer (LST)

The paper reports that the proposed ViT model achieves a detection accuracy of 98.2% and outperforms the compared conventional and hybrid approaches.

The results also describe oil spill detection outputs containing confidence scores, affected areas, impact levels, and recommendation actions.

# Evaluation Metrics

The paper discusses the use of:

Accuracy

Intersection over Union (IoU)

# Conclusion

This study proposes a Vision Transformer-based framework for automatic marine oil spill detection using satellite imagery. The Transformer architecture uses its self-attention mechanism to extract local and global spatial features from marine environments. According to the experimental analysis reported in the paper, the proposed ViT model achieves a detection accuracy of 98.2% and performs better than the compared conventional and hybrid models in distinguishing oil spills from similar phenomena, including biological films and low-wind zones.

# Research Publication

# Paper Title: Performance Analysis of Novel Artificial Intelligence Approach for Marine Oil Spill Detection

# Conference: 2026 International Conference on AI-Driven Innovations & Applications (IC-AIDA)

# Publisher: IEEE

# DOI: 10.1109/IC-AIDA68291.2026.11564435

# IEEE Xplore: https://doi.org/10.1109/IC-AIDA68291.2026.11564435

# Author

# K. V. Sai Sreeja



Institution: Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology, Tamil Nadu, India.
