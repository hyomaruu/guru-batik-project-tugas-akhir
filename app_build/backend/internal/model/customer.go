package model

import (
	"time"

	"github.com/google/uuid"
)

// ─── Customer ─────────────────────────────────────────────────────────

type Customer struct {
	ID           uint          `gorm:"primaryKey" json:"id"`
	Name         string        `gorm:"not null" json:"name"`
	Email        string        `json:"email"`
	Phone        string        `json:"phone"`
	Address      string        `json:"address"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
	Transactions []Transaction `gorm:"foreignKey:CustomerID" json:"transactions,omitempty"`
}

func (Customer) TableName() string { return "customers" }

type CreateCustomerRequest struct {
	Name    string `json:"name" validate:"required,min=2,max=255"`
	Email   string `json:"email" validate:"omitempty,email"`
	Phone   string `json:"phone" validate:"omitempty,numeric,min=10,max=15"`
	Address string `json:"address"`
}

// ─── Transaction ──────────────────────────────────────────────────────

type Transaction struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	CustomerID      uint      `gorm:"not null" json:"customer_id"`
	TransactionDate time.Time `gorm:"type:date;not null" json:"transaction_date"`
	Amount          float64   `gorm:"type:decimal(15,2);not null" json:"amount"`
	Description     string    `json:"description"`
	CreatedAt       time.Time `json:"created_at"`
	Customer        *Customer `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
}

func (Transaction) TableName() string { return "transactions" }

type CreateTransactionRequest struct {
	CustomerID      uint    `json:"customer_id" validate:"required"`
	TransactionDate string  `json:"transaction_date" validate:"required,datetime=2006-01-02"`
	Amount          float64 `json:"amount" validate:"required,gt=0"`
	Description     string  `json:"description"`
}

// ─── RFM Score ────────────────────────────────────────────────────────

type RFMScore struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	CustomerID   uint      `gorm:"not null" json:"customer_id"`
	Recency      int       `json:"recency"`
	Frequency    int       `json:"frequency"`
	Monetary     float64   `gorm:"type:decimal(15,2)" json:"monetary"`
	RScore       int       `json:"r_score"`
	FScore       int       `json:"f_score"`
	MScore       int       `json:"m_score"`
	RFMTotal     int       `json:"rfm_total"`
	SegmentLabel string    `json:"segment_label"`
	CalculatedAt time.Time `json:"calculated_at"`
	Customer     *Customer `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
}

func (RFMScore) TableName() string { return "rfm_scores" }

// RFM dengan detail pelanggan (untuk tampilan tabel)
type RFMWithCustomer struct {
	CustomerID   uint    `json:"customer_id"`
	CustomerName string  `json:"customer_name"`
	Email        string  `json:"email"`
	Recency      int     `json:"recency"`
	Frequency    int     `json:"frequency"`
	Monetary     float64 `json:"monetary"`
	RScore       int     `json:"r_score"`
	FScore       int     `json:"f_score"`
	MScore       int     `json:"m_score"`
	RFMTotal     int     `json:"rfm_total"`
	SegmentLabel string  `json:"segment_label"`
}

// ─── Cluster Result ───────────────────────────────────────────────────

type ClusterRun struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	KValue     int       `json:"k_value"`
	Inertia    float64   `json:"inertia"`
	Silhouette float64   `json:"silhouette"`
	CreatedAt  time.Time `json:"created_at"`
	CreatedBy  string    `gorm:"default:admin" json:"created_by"`
}

func (ClusterRun) TableName() string { return "cluster_runs" }

type ClusterResult struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	RunID         uuid.UUID `gorm:"type:uuid;not null" json:"run_id"`
	CustomerID    uint      `gorm:"not null" json:"customer_id"`
	ClusterLabel  int       `json:"cluster_label"`
	ClusterName   string    `json:"cluster_name"`
	PriorityLevel string    `json:"priority_level"`
	PcaX          float64   `json:"pca_x"`
	PcaY          float64   `json:"pca_y"`
	CreatedAt     time.Time `json:"created_at"`
	Customer      *Customer `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
}

func (ClusterResult) TableName() string { return "cluster_results" }

type ClusterResultWithCustomer struct {
	CustomerID    uint    `json:"customer_id"`
	CustomerName  string  `json:"customer_name"`
	Email         string  `json:"email"`
	ClusterLabel  int     `json:"cluster_label"`
	ClusterName   string  `json:"cluster_name"`
	PriorityLevel string  `json:"priority_level"`
	PcaX          float64 `json:"pca_x"`
	PcaY          float64 `json:"pca_y"`
	Recency       int     `json:"recency"`
	Frequency     int     `json:"frequency"`
	Monetary      float64 `json:"monetary"`
}
