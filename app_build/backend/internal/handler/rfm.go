package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"gurubatik-backend/internal/model"
)

type RFMHandler struct {
	db           *gorm.DB
	mlServiceURL string
}

func NewRFMHandler(db *gorm.DB, mlServiceURL string) *RFMHandler {
	return &RFMHandler{db: db, mlServiceURL: mlServiceURL}
}

// ─── Hitung RFM dari database ──────────────────────────────────────
// Menggunakan raw SQL dengan window functions untuk scoring quintile
func (h *RFMHandler) Calculate(c *fiber.Ctx) error {
	// Hapus hasil sebelumnya
	h.db.Exec("DELETE FROM rfm_scores")

	// Kalkulasi RFM mentah + quintile scoring dengan PostgreSQL
	rfmSQL := `
	WITH reference_date AS (
		SELECT MAX(transaction_date) AS ref_date FROM transactions
	),
	rfm_raw AS (
		SELECT
			c.id          AS customer_id,
			c.name        AS customer_name,
			c.email,
			(SELECT ref_date FROM reference_date)::date - MAX(t.transaction_date) AS recency,
			COUNT(t.id)   AS frequency,
			SUM(t.amount) AS monetary
		FROM customers c
		INNER JOIN transactions t ON t.customer_id = c.id
		GROUP BY c.id, c.name, c.email
	),
	rfm_scored AS (
		SELECT
			customer_id,
			recency,
			frequency,
			monetary,
			-- R score: recency lebih kecil = lebih bagus
			NTILE(5) OVER (ORDER BY recency DESC) AS r_score,
			NTILE(5) OVER (ORDER BY frequency ASC) AS f_score,
			NTILE(5) OVER (ORDER BY monetary ASC)  AS m_score
		FROM rfm_raw
	)
	INSERT INTO rfm_scores 
		(customer_id, recency, frequency, monetary, r_score, f_score, m_score, rfm_total, segment_label, calculated_at)
	SELECT
		customer_id,
		recency,
		frequency,
		monetary,
		r_score,
		f_score,
		m_score,
		(r_score + f_score + m_score) AS rfm_total,
		CASE
			WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
			WHEN r_score >= 3 AND f_score >= 3                  THEN 'Loyal Customers'
			WHEN r_score >= 4 AND f_score <= 2                  THEN 'Potential Loyalists'
			WHEN r_score >= 3 AND f_score <= 2 AND m_score >= 3 THEN 'Recent Customers'
			WHEN r_score <= 2 AND f_score >= 3 AND m_score >= 3 THEN 'At Risk'
			WHEN r_score <= 2 AND f_score <= 2 AND m_score >= 3 THEN 'Can''t Lose Them'
			WHEN r_score <= 2 AND f_score <= 2                  THEN 'Hibernating'
			ELSE 'Need Attention'
		END AS segment_label,
		NOW()
	FROM rfm_scored
	RETURNING customer_id`

	if err := h.db.Exec(rfmSQL).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghitung RFM: " + err.Error(),
		})
	}

	// Ambil hasil yang baru dihitung
	var results []model.RFMWithCustomer
	h.db.Raw(`
		SELECT
			r.customer_id,
			c.name  AS customer_name,
			c.email,
			r.recency,
			r.frequency,
			r.monetary,
			r.r_score,
			r.f_score,
			r.m_score,
			r.rfm_total,
			r.segment_label
		FROM rfm_scores r
		JOIN customers c ON c.id = r.customer_id
		ORDER BY r.rfm_total DESC
	`).Scan(&results)

	// Hitung summary per segment
	type SegmentSummary struct {
		Segment string `json:"segment"`
		Count   int    `json:"count"`
	}
	var segments []SegmentSummary
	h.db.Raw(`
		SELECT segment_label AS segment, COUNT(*) AS count
		FROM rfm_scores
		GROUP BY segment_label
		ORDER BY count DESC
	`).Scan(&segments)

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("RFM berhasil dihitung untuk %d pelanggan", len(results)),
		"data": fiber.Map{
			"results":         results,
			"segment_summary": segments,
			"calculated_at":   time.Now(),
		},
	})
}

// ─── Ambil hasil RFM terakhir ──────────────────────────────────────
func (h *RFMHandler) GetResults(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	segment := c.Query("segment", "")
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	query := h.db.Raw(`
		SELECT
			r.customer_id,
			c.name  AS customer_name,
			c.email,
			r.recency,
			r.frequency,
			r.monetary,
			r.r_score,
			r.f_score,
			r.m_score,
			r.rfm_total,
			r.segment_label
		FROM rfm_scores r
		JOIN customers c ON c.id = r.customer_id
		WHERE ($1 = '' OR r.segment_label = $1)
		ORDER BY r.rfm_total DESC
		LIMIT $2 OFFSET $3
	`, segment, limit, offset)

	var results []model.RFMWithCustomer
	query.Scan(&results)

	var total int64
	countQuery := h.db.Model(&model.RFMScore{})
	if segment != "" {
		countQuery = countQuery.Where("segment_label = ?", segment)
	}
	countQuery.Count(&total)

	// Summary per segment
	type SegmentSummary struct {
		Segment string `json:"segment"`
		Count   int    `json:"count"`
	}
	var segments []SegmentSummary
	h.db.Raw(`
		SELECT segment_label AS segment, COUNT(*) AS count
		FROM rfm_scores
		GROUP BY segment_label
		ORDER BY count DESC
	`).Scan(&segments)

	// Rata-rata RFM
	type RFMStats struct {
		AvgRecency   float64 `json:"avg_recency"`
		AvgFrequency float64 `json:"avg_frequency"`
		AvgMonetary  float64 `json:"avg_monetary"`
	}
	var stats RFMStats
	h.db.Raw(`
		SELECT 
			ROUND(AVG(recency)::numeric, 1) AS avg_recency,
			ROUND(AVG(frequency)::numeric, 1) AS avg_frequency,
			ROUND(AVG(monetary)::numeric, 0) AS avg_monetary
		FROM rfm_scores
	`).Scan(&stats)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"results":         results,
			"total":           total,
			"page":            page,
			"limit":           limit,
			"segment_summary": segments,
			"stats":           stats,
		},
	})
}

// ─── Trigger K-Means ke ML service ────────────────────────────────
func (h *RFMHandler) RunKMeans(c *fiber.Ctx) error {
	type KMeansRequest struct {
		K int `json:"k"`
	}
	var req KMeansRequest
	if err := c.BodyParser(&req); err != nil || req.K < 2 {
		req.K = 3 // default
	}
	if req.K > 10 {
		req.K = 10
	}

	// Ambil data RFM dari DB untuk dikirim ke ML service
	var rfmData []map[string]interface{}
	h.db.Raw(`
		SELECT
			r.customer_id,
			c.name  AS customer_name,
			c.email,
			r.recency::float,
			r.frequency::float,
			r.monetary::float
		FROM rfm_scores r
		JOIN customers c ON c.id = r.customer_id
		ORDER BY r.customer_id
	`).Scan(&rfmData)

	if len(rfmData) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Belum ada data RFM. Jalankan kalkulasi RFM terlebih dahulu.",
		})
	}

	// Kirim ke ML service
	payload := map[string]interface{}{
		"k":        req.K,
		"rfm_data": rfmData,
	}
	body, _ := json.Marshal(payload)

	resp, err := http.Post(
		h.mlServiceURL+"/ml/clustering/kmeans",
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "ML service tidak dapat dijangkau: " + err.Error(),
		})
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "ML service error: " + string(respBody),
		})
	}

	var mlResult map[string]interface{}
	json.Unmarshal(respBody, &mlResult)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "K-Means clustering selesai",
		"data":    mlResult,
	})
}

// ─── Ambil hasil clustering terakhir ──────────────────────────────
func (h *RFMHandler) GetClusterResults(c *fiber.Ctx) error {
	runID := c.Query("run_id", "")

	// Jika tidak ada run_id, ambil run terakhir
	if runID == "" {
		var lastRun model.ClusterRun
		if err := h.db.Order("created_at DESC").First(&lastRun).Error; err != nil {
			return c.JSON(fiber.Map{
				"success": true,
				"data":    fiber.Map{"results": []interface{}{}, "run": nil},
			})
		}
		runID = lastRun.ID.String()
	}

	var results []model.ClusterResultWithCustomer
	h.db.Raw(`
		SELECT
			cr.customer_id,
			c.name   AS customer_name,
			c.email,
			cr.cluster_label,
			cr.cluster_name,
			cr.priority_level,
			cr.pca_x,
			cr.pca_y,
			COALESCE(r.recency, 0)   AS recency,
			COALESCE(r.frequency, 0) AS frequency,
			COALESCE(r.monetary, 0)  AS monetary
		FROM cluster_results cr
		JOIN customers c ON c.id = cr.customer_id
		LEFT JOIN rfm_scores r ON r.customer_id = cr.customer_id
		WHERE cr.run_id = ?
		ORDER BY cr.priority_level, cr.cluster_label
	`, runID).Scan(&results)

	var run model.ClusterRun
	h.db.Where("id = ?", runID).First(&run)

	// Summary per cluster
	type ClusterSummary struct {
		ClusterLabel  int     `json:"cluster_label"`
		ClusterName   string  `json:"cluster_name"`
		PriorityLevel string  `json:"priority_level"`
		Count         int     `json:"count"`
		AvgRecency    float64 `json:"avg_recency"`
		AvgFrequency  float64 `json:"avg_frequency"`
		AvgMonetary   float64 `json:"avg_monetary"`
	}
	var summary []ClusterSummary
	h.db.Raw(`
		SELECT
			cr.cluster_label,
			cr.cluster_name,
			cr.priority_level,
			COUNT(*) AS count,
			ROUND(AVG(r.recency)::numeric, 1)   AS avg_recency,
			ROUND(AVG(r.frequency)::numeric, 1) AS avg_frequency,
			ROUND(AVG(r.monetary)::numeric, 0)  AS avg_monetary
		FROM cluster_results cr
		LEFT JOIN rfm_scores r ON r.customer_id = cr.customer_id
		WHERE cr.run_id = ?
		GROUP BY cr.cluster_label, cr.cluster_name, cr.priority_level
		ORDER BY cr.cluster_label
	`, runID).Scan(&summary)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"run":     run,
			"results": results,
			"summary": summary,
		},
	})
}
