# app_build/ml-service/app/routers/test_segmentation.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)

# Sample request payload
sample_request = {
    "k": 3,
    "rfm_data": [
        {"customer_id": 1, "customer_name": "A", "email": "a@ex.com", "recency": 10, "frequency": 5, "monetary": 1000},
        {"customer_id": 2, "customer_name": "B", "email": "b@ex.com", "recency": 20, "frequency": 3, "monetary": 500},
        {"customer_id": 3, "customer_name": "C", "email": "c@ex.com", "recency": 5, "frequency": 8, "monetary": 2000},
    ]
}

# Test K-Means endpoint
@patch('app.routers.segmentation._save_cluster_results')
@patch('app.routers.segmentation.run_kmeans')
def test_kmeans_clustering_success(mock_run_kmeans, mock_save):
    # Mock return value for run_kmeans
    mock_run_kmeans.return_value = {
        "run_id": "test-run-id",
        "k": 3,
        "inertia": 12.5,
        "silhouette": 0.65,
        "results": [
            {"customer_id": 1, "customer_name": "A", "email": "a@ex.com", "cluster_label": 0, "cluster_name": "Loyal", "priority_level": "HIGH", "pca_x": 1.0, "pca_y": 1.0, "recency": 10.0, "frequency": 5.0, "monetary": 1000.0}
        ],
        "summary": []
    }
    
    response = client.post("/ml/clustering/kmeans", json=sample_request)

    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "test-run-id" in res_data["data"]["run_id"]
    mock_save.assert_called_once()

def test_kmeans_clustering_not_enough_data():
    invalid_request = {
        "k": 5, # k is larger than data points
        "rfm_data": [
            {"customer_id": 1, "recency": 10, "frequency": 5, "monetary": 1000}
        ]
    }
    response = client.post("/ml/clustering/kmeans", json=invalid_request)
    assert response.status_code == 400
    assert "Jumlah data" in response.json()["detail"]

# Test Elbow endpoint
@patch('app.routers.segmentation.calculate_elbow')
def test_elbow_method_success(mock_calculate_elbow):
    mock_calculate_elbow.return_value = [
        {"k": 2, "inertia": 15.0, "silhouette": 0.5}
    ]
    
    response = client.post("/ml/clustering/elbow", json={
        "rfm_data": sample_request["rfm_data"],
        "max_k": 3
    })

    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert len(res_data["data"]) == 1
    assert res_data["data"][0]["k"] == 2