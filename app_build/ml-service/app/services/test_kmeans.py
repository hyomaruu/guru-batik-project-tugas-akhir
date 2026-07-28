# app_build/ml-service/app/services/test_kmeans.py
import pytest
import pandas as pd
import numpy as np
from unittest.mock import patch, MagicMock

from app.services.kmeans import assign_cluster_names_and_priority, run_kmeans, calculate_elbow

# Sample data for testing
sample_rfm_data = [
    {"customer_id": 1, "recency": 10, "frequency": 5, "monetary": 1000},
    {"customer_id": 2, "recency": 20, "frequency": 3, "monetary": 500},
    {"customer_id": 3, "recency": 5, "frequency": 8, "monetary": 2000},
    {"customer_id": 4, "recency": 25, "frequency": 2, "monetary": 300},
    {"customer_id": 5, "recency": 8, "frequency": 6, "monetary": 1500},
    {"customer_id": 6, "recency": 30, "frequency": 1, "monetary": 100},
]

# Test assign_cluster_names_and_priority
def test_assign_cluster_names_and_priority_k3():
    df = pd.DataFrame(sample_rfm_data)
    df["cluster"] = [0, 1, 0, 1, 0, 1] # Example clusters for k=3
    
    # Mock composite scores to ensure predictable priority assignment
    with patch('app.services.kmeans.pd.DataFrame.groupby') as mock_groupby:
        mock_groupby.return_value.agg.return_value.reset_index.return_value = pd.DataFrame({
            "cluster": [0, 1],
            "avg_recency": [7.66, 25],
            "avg_frequency": [6.33, 2],
            "avg_monetary": [1500, 300],
            "composite_score": [0.8, 0.2] # Cluster 0 is high, Cluster 1 is low
        })
        
        result = assign_cluster_names_and_priority(df, k=3)

        assert result[0]["name"] == "Pelanggan Loyal"
        assert result[0]["priority"] == "HIGH"
        assert result[1]["name"] == "Pelanggan Potensial"
        assert result[1]["priority"] == "MEDIUM"

def test_assign_cluster_names_and_priority_dynamic_k():
    df = pd.DataFrame(sample_rfm_data)
    df["cluster"] = [0, 1, 2, 3, 4, 5] # Example clusters for k=6
    
    with patch('app.services.kmeans.pd.DataFrame.groupby') as mock_groupby:
        mock_groupby.return_value.agg.return_value.reset_index.return_value = pd.DataFrame({
            "cluster": [0, 1, 2, 3, 4, 5],
            "avg_recency": [5, 8, 10, 20, 25, 30],
            "avg_frequency": [8, 6, 5, 3, 2, 1],
            "avg_monetary": [2000, 1500, 1000, 500, 300, 100],
            "composite_score": [0.9, 0.8, 0.7, 0.5, 0.3, 0.1] # Scores ordered for simplicity
        })
        
        result = assign_cluster_names_and_priority(df, k=6)

        # Assuming HIGH, MEDIUM, MEDIUM, MEDIUM, MEDIUM, LOW pattern
        assert result[0]["name"] == "Pelanggan Loyal"
        assert result[0]["priority"] == "HIGH"
        assert result[5]["name"] == "Pelanggan Pasif"
        assert result[5]["priority"] == "LOW"
        assert result[1]["name"] == "Pelanggan Menengah 1" # Dynamic name for MEDIUM priority
        assert result[1]["priority"] == "MEDIUM"

# Test run_kmeans
def test_run_kmeans_success():
    k = 2
    result = run_kmeans(sample_rfm_data, k=k)

    assert "run_id" in result
    assert "inertia" in result
    assert "silhouette" in result
    assert len(result["results"]) == len(sample_rfm_data)
    assert len(result["summary"]) == k
    
    # Check if cluster labels, names, priorities, and PCA coords are present
    for item in result["results"]:
        assert "cluster_label" in item
        assert "cluster_name" in item
        assert "priority_level" in item
        assert "pca_x" in item
        assert "pca_y" in item

    # Check summary
    for summary_item in result["summary"]:
        assert "cluster_label" in summary_item
        assert "cluster_name" in summary_item
        assert "priority_level" in summary_item
        assert "count" in summary_item
        assert "avg_recency" in summary_item
        assert "avg_frequency" in summary_item
        assert "avg_monetary" in summary_item
        assert "centroid" in summary_item

def test_run_kmeans_not_enough_data():
    with pytest.raises(ValueError, match="Jumlah data .* harus lebih besar dari k"):
        run_kmeans(sample_rfm_data[:1], k=2)

def test_run_kmeans_k_equals_1_for_silhouette():
    # Silhouette score is undefined for k=1, function should handle it
    data_for_k1 = [{"customer_id": 1, "recency": 10, "frequency": 5, "monetary": 1000}]
    result = run_kmeans(data_for_k1, k=1)
    assert result["silhouette"] == 0.0 # Our function sets it to 0.0 for k=1

# Test calculate_elbow
def test_calculate_elbow_success():
    max_k = 3
    elbow_data = calculate_elbow(sample_rfm_data, max_k=max_k)

    assert len(elbow_data) == max_k - 1 # k from 2 to max_k
    for item in elbow_data:
        assert "k" in item
        assert "inertia" in item
        assert "silhouette" in item
        assert item["k"] >= 2
        assert item["k"] <= max_k

def test_calculate_elbow_not_enough_data():
    elbow_data = calculate_elbow(sample_rfm_data[:1], max_k=2)
    assert elbow_data == []