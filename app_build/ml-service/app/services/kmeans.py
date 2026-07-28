"""
K-Means Clustering Service untuk segmentasi pelanggan Guru Batik.

Input: data RFM yang sudah dinormalisasi
Output: label cluster, nama cluster, prioritas, koordinat PCA untuk scatter plot
"""
import uuid
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from typing import List, Dict, Any


# ─── Konstanta label cluster ──────────────────────────────────────────────
# Nama dan prioritas ditentukan berdasarkan karakteristik centroid cluster
PRIORITY_MAPPING = {0: "HIGH", 1: "MEDIUM", 2: "LOW"}


def assign_cluster_names_and_priority(
    df: pd.DataFrame,
    cluster_col: str = "cluster",
    k: int = 3,
) -> Dict[int, Dict[str, str]]:
    """
    Tentukan nama cluster dan prioritas promosi berdasarkan rata-rata RFM per cluster.
    Cluster dengan nilai RFM terbaik (recency rendah, frequency tinggi, monetary tinggi)
    mendapatkan prioritas HIGH.
    """
    # Buat skor komposit untuk setiap cluster
    # Recency: lebih rendah = lebih baik (skor dibalik)
    # Frequency dan Monetary: lebih tinggi = lebih baik
    cluster_stats = df.groupby(cluster_col).agg(
        avg_recency=("recency", "mean"),
        avg_frequency=("frequency", "mean"),
        avg_monetary=("monetary", "mean"),
    ).reset_index()

    # Normalisasi untuk scoring
    max_recency = cluster_stats["avg_recency"].max() or 1
    max_frequency = cluster_stats["avg_frequency"].max() or 1
    max_monetary = cluster_stats["avg_monetary"].max() or 1

    cluster_stats["composite_score"] = (
        (1 - cluster_stats["avg_recency"] / max_recency) * 0.35   # R: bobot 35%
        + (cluster_stats["avg_frequency"] / max_frequency) * 0.35  # F: bobot 35%
        + (cluster_stats["avg_monetary"] / max_monetary) * 0.30    # M: bobot 30%
    )

    # Sort berdasarkan composite score (tertinggi = prioritas pertama)
    cluster_stats = cluster_stats.sort_values("composite_score", ascending=False).reset_index(drop=True)

    # Assign nama dan prioritas
    name_templates = {
        0: ("Pelanggan Loyal", "HIGH"),    # skor tertinggi
        1: ("Pelanggan Potensial", "MEDIUM"),
        2: ("Pelanggan Pasif", "LOW"),
    }

    # Untuk k > 3, generate nama dinamis
    priority_levels = ["HIGH"] + ["MEDIUM"] * (k - 2) + ["LOW"]

    result: Dict[int, Dict[str, str]] = {}
    for rank, row in cluster_stats.iterrows():
        cluster_id = int(row[cluster_col])
        if k <= 3 and rank < 3:
            name, priority = name_templates[rank]
        else:
            priority = priority_levels[min(rank, len(priority_levels) - 1)]
            if priority == "HIGH":
                name = "Pelanggan Loyal"
            elif priority == "LOW":
                name = "Pelanggan Pasif"
            else:
                name = f"Pelanggan Menengah {rank}"
        result[cluster_id] = {"name": name, "priority": priority}

    return result


def run_kmeans(rfm_data: List[Dict[str, Any]], k: int = 3) -> Dict[str, Any]:
    """
    Jalankan K-Means clustering pada data RFM.

    Args:
        rfm_data: List dict dengan keys: customer_id, customer_name, email, recency, frequency, monetary
        k: Jumlah cluster (2-10)

    Returns:
        Dict dengan run_id, inertia, silhouette, results (per pelanggan), summary (per cluster)
    """
    if len(rfm_data) < k:
        raise ValueError(f"Jumlah data ({len(rfm_data)}) harus lebih besar dari k ({k})")

    df = pd.DataFrame(rfm_data)

    # Pastikan kolom numerik
    df["recency"] = pd.to_numeric(df["recency"], errors="coerce").fillna(0)
    df["frequency"] = pd.to_numeric(df["frequency"], errors="coerce").fillna(0)
    df["monetary"] = pd.to_numeric(df["monetary"], errors="coerce").fillna(0)

    # ─── Normalisasi fitur ──────────────────────────────────────────
    features = df[["recency", "frequency", "monetary"]].values
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    # ─── K-Means ───────────────────────────────────────────────────
    kmeans = KMeans(
        n_clusters=k,
        init="k-means++",       # Inisialisasi lebih cerdas
        n_init=10,              # Ulang 10x ambil yang terbaik
        max_iter=300,
        random_state=42,
        algorithm="lloyd",
    )
    cluster_labels = kmeans.fit_predict(features_scaled)
    df["cluster"] = cluster_labels

    # ─── Metrik kualitas ───────────────────────────────────────────
    inertia = float(kmeans.inertia_)
    silhouette = float(silhouette_score(features_scaled, cluster_labels)) if k > 1 else 0.0

    # ─── PCA untuk visualisasi 2D ──────────────────────────────────
    if len(features_scaled) >= 2:
        pca = PCA(n_components=2, random_state=42)
        coords_2d = pca.fit_transform(features_scaled)
        df["pca_x"] = coords_2d[:, 0]
        df["pca_y"] = coords_2d[:, 1]
    else:
        df["pca_x"] = 0.0
        df["pca_y"] = 0.0

    # ─── Assign nama dan prioritas ─────────────────────────────────
    cluster_meta = assign_cluster_names_and_priority(df, k=k)

    # ─── Format output ─────────────────────────────────────────────
    run_id = str(uuid.uuid4())
    results = []
    for _, row in df.iterrows():
        cid = int(row["cluster"])
        meta = cluster_meta.get(cid, {"name": f"Cluster {cid}", "priority": "MEDIUM"})
        results.append({
            "customer_id":    int(row["customer_id"]),
            "customer_name":  str(row.get("customer_name", "")),
            "email":          str(row.get("email", "")),
            "cluster_label":  cid,
            "cluster_name":   meta["name"],
            "priority_level": meta["priority"],
            "pca_x":          float(row["pca_x"]),
            "pca_y":          float(row["pca_y"]),
            "recency":        float(row["recency"]),
            "frequency":      float(row["frequency"]),
            "monetary":       float(row["monetary"]),
        })

    # ─── Summary per cluster ───────────────────────────────────────
    summary = []
    for cluster_id, meta in cluster_meta.items():
        cluster_df = df[df["cluster"] == cluster_id]
        summary.append({
            "cluster_label":  cluster_id,
            "cluster_name":   meta["name"],
            "priority_level": meta["priority"],
            "count":          int(len(cluster_df)),
            "avg_recency":    float(cluster_df["recency"].mean()),
            "avg_frequency":  float(cluster_df["frequency"].mean()),
            "avg_monetary":   float(cluster_df["monetary"].mean()),
            "centroid":       scaler.inverse_transform(
                                  kmeans.cluster_centers_[cluster_id].reshape(1, -1)
                              )[0].tolist(),
        })

    # Sort summary by priority
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    summary.sort(key=lambda x: priority_order.get(x["priority_level"], 99))

    return {
        "run_id":     run_id,
        "k":          k,
        "inertia":    inertia,
        "silhouette": silhouette,
        "results":    results,
        "summary":    summary,
    }


def calculate_elbow(rfm_data: List[Dict[str, Any]], max_k: int = 10) -> List[Dict[str, Any]]:
    """
    Hitung inertia untuk berbagai nilai k (Elbow Method).
    Berguna untuk memilih k yang optimal.
    """
    df = pd.DataFrame(rfm_data)
    features = df[["recency", "frequency", "monetary"]].values
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    elbow_data = []
    for k in range(2, min(max_k + 1, len(df))):
        km = KMeans(n_clusters=k, init="k-means++", n_init=10, random_state=42)
        km.fit(features_scaled)
        labels = km.labels_
        sil = float(silhouette_score(features_scaled, labels)) if k > 1 else 0.0
        elbow_data.append({
            "k":          k,
            "inertia":    float(km.inertia_),
            "silhouette": sil,
        })

    return elbow_data
