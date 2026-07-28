"""
FastAPI Router untuk endpoint segmentasi pelanggan.
Menerima data RFM dari Go backend dan menjalankan K-Means clustering.
"""
import os
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text

from app.services.kmeans import run_kmeans, calculate_elbow

router = APIRouter(tags=["Segmentation"])


# ─── Pydantic Models ──────────────────────────────────────────────────────

class RFMDataPoint(BaseModel):
    customer_id: int
    customer_name: str = ""
    email: str = ""
    recency: float
    frequency: float
    monetary: float


class KMeansRequest(BaseModel):
    k: int = Field(default=3, ge=2, le=10, description="Jumlah cluster (2-10)")
    rfm_data: List[RFMDataPoint]


class ElbowRequest(BaseModel):
    rfm_data: List[RFMDataPoint]
    max_k: int = Field(default=10, ge=2, le=15)


class ClusterResultItem(BaseModel):
    customer_id: int
    customer_name: str
    email: str
    cluster_label: int
    cluster_name: str
    priority_level: str
    pca_x: float
    pca_y: float
    recency: float
    frequency: float
    monetary: float


class ClusterSummaryItem(BaseModel):
    cluster_label: int
    cluster_name: str
    priority_level: str
    count: int
    avg_recency: float
    avg_frequency: float
    avg_monetary: float
    centroid: List[float]


class KMeansResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]


# ─── Endpoints ────────────────────────────────────────────────────────────

@router.post("/clustering/kmeans", response_model=KMeansResponse)
def kmeans_clustering(request: KMeansRequest):
    """
    Jalankan K-Means clustering pada data RFM yang dikirim dari Go backend.
    Hasil disimpan ke PostgreSQL oleh Go backend berdasarkan response ini.
    """
    if len(request.rfm_data) < request.k:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Jumlah data ({len(request.rfm_data)}) harus >= k ({request.k})",
        )

    # Convert pydantic models ke dict
    rfm_list = [item.model_dump() for item in request.rfm_data]

    try:
        result = run_kmeans(rfm_list, k=request.k)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Clustering gagal: {str(e)}",
        )

    # Simpan ke database langsung dari ML service
    _save_cluster_results(result)

    return KMeansResponse(
        success=True,
        message=f"K-Means clustering selesai dengan k={request.k}, silhouette={result['silhouette']:.3f}",
        data=result,
    )


@router.post("/clustering/elbow")
def elbow_method(request: ElbowRequest):
    """
    Hitung inertia dan silhouette score untuk berbagai nilai k.
    Berguna untuk menentukan k optimal (Elbow Method).
    """
    rfm_list = [item.model_dump() for item in request.rfm_data]

    try:
        elbow_data = calculate_elbow(rfm_list, max_k=request.max_k)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Elbow method gagal: {str(e)}",
        )

    return {
        "success": True,
        "data": elbow_data,
    }


# ─── Internal: Simpan hasil ke PostgreSQL ─────────────────────────────────

def _save_cluster_results(result: Dict[str, Any]):
    """Simpan hasil K-Means ke tabel cluster_runs dan cluster_results."""
    db_url = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://gurubatik:gurubatik_secret@localhost:5432/gurubatik",
    )
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            # Hapus hasil lama (opsional: bisa juga keep history)
            # Simpan metadata run
            conn.execute(text("""
                INSERT INTO cluster_runs (id, k_value, inertia, silhouette)
                VALUES (:id, :k, :inertia, :silhouette)
                ON CONFLICT (id) DO NOTHING
            """), {
                "id": result["run_id"],
                "k": result["k"],
                "inertia": result["inertia"],
                "silhouette": result["silhouette"],
            })

            # Simpan hasil per pelanggan
            for r in result["results"]:
                conn.execute(text("""
                    INSERT INTO cluster_results
                        (run_id, customer_id, cluster_label, cluster_name, priority_level, pca_x, pca_y)
                    VALUES
                        (:run_id, :customer_id, :cluster_label, :cluster_name, :priority_level, :pca_x, :pca_y)
                """), {
                    "run_id":        result["run_id"],
                    "customer_id":   r["customer_id"],
                    "cluster_label": r["cluster_label"],
                    "cluster_name":  r["cluster_name"],
                    "priority_level": r["priority_level"],
                    "pca_x":         r["pca_x"],
                    "pca_y":         r["pca_y"],
                })

            conn.commit()
    except Exception as e:
        # Log tapi jangan gagalkan response — Go backend tetap menerima hasil
        print(f"[WARN] Gagal simpan ke DB: {e}")
