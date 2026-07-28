package handler

import (
	"encoding/csv"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"gurubatik-backend/internal/model"
	"gurubatik-backend/internal/validator" // ADDED
)

type CustomerHandler struct {
	db *gorm.DB
}

func NewCustomerHandler(db *gorm.DB) *CustomerHandler {
	return &CustomerHandler{db: db}
}

// ─── List pelanggan ────────────────────────────────────────────────
func (h *CustomerHandler) List(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	query := h.db.Model(&model.Customer{})
	if search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ? OR phone ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghitung data pelanggan: " + err.Error(),
		})
	}

	var customers []model.Customer
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&customers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data pelanggan: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"data":        customers,
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": int(math.Ceil(float64(total) / float64(limit))),
		},
	})
}

// ─── Create pelanggan ─────────────────────────────────────────────
func (h *CustomerHandler) Create(c *fiber.Ctx) error {
	var req model.CreateCustomerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format request tidak valid",
		})
	}

	// Validate the request body
	if err := validator.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Validasi gagal",
			"errors":  validator.ToValidationErrors(err),
		})
	}

	customer := model.Customer{
		Name:    req.Name,
		Email:   req.Email,
		Phone:   req.Phone,
		Address: req.Address,
	}

	if err := h.db.Create(&customer).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan pelanggan: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Pelanggan berhasil ditambahkan",
		"data":    customer,
	})
}

// ─── Get satu pelanggan ────────────────────────────────────────────
func (h *CustomerHandler) GetOne(c *fiber.Ctx) error {
	id := c.Params("id")
	var customer model.Customer
	if err := h.db.Preload("Transactions").First(&customer, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Pelanggan tidak ditemukan",
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": customer})
}

// ─── Update pelanggan ─────────────────────────────────────────────
func (h *CustomerHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var customer model.Customer
	if err := h.db.First(&customer, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Pelanggan tidak ditemukan",
		})
	}

	var req model.CreateCustomerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format request tidak valid",
		})
	}

	// Validate the request body
	if err := validator.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Validasi gagal",
			"errors":  validator.ToValidationErrors(err),
		})
	}

	h.db.Model(&customer).Updates(map[string]interface{}{
		"name":    req.Name,
		"email":   req.Email,
		"phone":   req.Phone,
		"address": req.Address,
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pelanggan berhasil diupdate",
		"data":    customer,
	})
}

// ─── Delete pelanggan ─────────────────────────────────────────────
func (h *CustomerHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	var customer model.Customer
	if err := h.db.First(&customer, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Pelanggan tidak ditemukan",
		})
	}
	h.db.Delete(&customer)
	return c.JSON(fiber.Map{"success": true, "message": "Pelanggan berhasil dihapus"})
}

// ─── Upload CSV pelanggan + transaksi ─────────────────────────────
// Format CSV: name,email,phone,address,transaction_date,amount,description
func (h *CustomerHandler) UploadCSV(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File CSV tidak ditemukan di request",
		})
	}

	f, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuka file",
		})
	}
	defer f.Close()

	reader := csv.NewReader(f)
	reader.TrimLeadingSpace = true
	records, err := reader.ReadAll()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membaca CSV: " + err.Error(),
		})
	}

	if len(records) < 2 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "CSV harus memiliki header dan minimal 1 baris data",
		})
	}

	// Skip header row
	rows := records[1:]
	inserted := 0
	skipped := 0
	var errors []string

	for i, row := range rows {
		if len(row) < 6 {
			errors = append(errors, "Baris "+strconv.Itoa(i+2)+": kolom tidak lengkap")
			skipped++
			continue
		}

		name := strings.TrimSpace(row[0])
		email := strings.TrimSpace(row[1])
		phone := strings.TrimSpace(row[2])
		address := strings.TrimSpace(row[3])
		txDateStr := strings.TrimSpace(row[4])
		amountStr := strings.TrimSpace(row[5])
		description := ""
		if len(row) > 6 {
			description = strings.TrimSpace(row[6])
		}

		if name == "" {
			errors = append(errors, "Baris "+strconv.Itoa(i+2)+": nama tidak boleh kosong")
			skipped++
			continue
		}

		amount, err := strconv.ParseFloat(amountStr, 64)
		if err != nil || amount <= 0 {
			errors = append(errors, "Baris "+strconv.Itoa(i+2)+": amount tidak valid")
			skipped++
			continue
		}

		txDate, err := time.Parse("2006-01-02", txDateStr)
		if err != nil {
			// Coba format Indonesia
			txDate, err = time.Parse("02/01/2006", txDateStr)
			if err != nil {
				errors = append(errors, "Baris "+strconv.Itoa(i+2)+": tanggal tidak valid (gunakan YYYY-MM-DD)")
				skipped++
				continue
			}
		}

		// Upsert pelanggan berdasarkan nama+email
		var customer model.Customer
		tx := h.db.Begin()

		result := tx.Where("name = ? AND email = ?", name, email).First(&customer)
		if result.Error != nil {
			// Buat pelanggan baru
			customer = model.Customer{
				Name:    name,
				Email:   email,
				Phone:   phone,
				Address: address,
			}
			if err := tx.Create(&customer).Error; err != nil {
				tx.Rollback()
				errors = append(errors, "Baris "+strconv.Itoa(i+2)+": gagal simpan pelanggan")
				skipped++
				continue
			}
		}

		// Tambah transaksi
		transaction := model.Transaction{
			CustomerID:      customer.ID,
			TransactionDate: txDate,
			Amount:          amount,
			Description:     description,
		}
		if err := tx.Create(&transaction).Error; err != nil {
			tx.Rollback()
			errors = append(errors, "Baris "+strconv.Itoa(i+2)+": gagal simpan transaksi")
			skipped++
			continue
		}

		tx.Commit()
		inserted++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Upload CSV selesai",
		"data": fiber.Map{
			"total_rows": len(rows),
			"inserted":   inserted,
			"skipped":    skipped,
			"errors":     errors,
		},
	})
}

// ─── List transaksi pelanggan ─────────────────────────────────────
func (h *CustomerHandler) ListTransactions(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	var total int64
	h.db.Model(&model.Transaction{}).Count(&total)

	var transactions []model.Transaction
	h.db.Preload("Customer").Order("transaction_date DESC").
		Offset(offset).Limit(limit).Find(&transactions)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"data":        transactions,
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": int(math.Ceil(float64(total) / float64(limit))),
		},
	})
}

// ─── Tambah transaksi manual ──────────────────────────────────────
func (h *CustomerHandler) AddTransaction(c *fiber.Ctx) error {
	var req model.CreateTransactionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format request tidak valid",
		})
	}

	// Validate the request body
	if err := validator.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Validasi gagal",
			"errors":  validator.ToValidationErrors(err),
		})
	}

	txDate, _ := time.Parse("2006-01-02", req.TransactionDate) // No error check needed, validator ensured format

	// Pastikan customer ada
	var customer model.Customer
	if err := h.db.First(&customer, req.CustomerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Pelanggan tidak ditemukan",
		})
	}

	transaction := model.Transaction{
		CustomerID:      req.CustomerID,
		TransactionDate: txDate,
		Amount:          req.Amount,
		Description:     req.Description,
	}

	if err := h.db.Create(&transaction).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan transaksi",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Transaksi berhasil ditambahkan",
		"data":    transaction,
	})
}

// ─── Update transaksi manual ──────────────────────────────────────
func (h *CustomerHandler) UpdateTransaction(c *fiber.Ctx) error {
	id := c.Params("id")
	var transaction model.Transaction

	if err := h.db.First(&transaction, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Transaksi tidak ditemukan",
		})
	}

	var req model.CreateTransactionRequest // Reusing the struct, CustomerID can be ignored or updated
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format request tidak valid",
		})
	}

	// Validate the request body
	if err := validator.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Validasi gagal",
			"errors":  validator.ToValidationErrors(err),
		})
	}

	txDate, _ := time.Parse("2006-01-02", req.TransactionDate) // No error check needed, validator ensured format

	// Update fields
	h.db.Model(&transaction).Updates(map[string]interface{}{
		"transaction_date": txDate,
		"amount":           req.Amount,
		"description":      req.Description,
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Transaksi berhasil diperbarui",
		"data":    transaction,
	})
}

// ─── Stats overview untuk dashboard ──────────────────────────────
func (h *CustomerHandler) Stats(c *fiber.Ctx) error {
	var totalCustomers int64
	h.db.Model(&model.Customer{}).Count(&totalCustomers)

	var totalTransactions int64
	h.db.Model(&model.Transaction{}).Count(&totalTransactions)

	var totalRevenue float64
	h.db.Model(&model.Transaction{}).Select("COALESCE(SUM(amount), 0)").Scan(&totalRevenue)

	var avgTransaction float64
	if totalTransactions > 0 {
		avgTransaction = totalRevenue / float64(totalTransactions)
	}

	// Transaksi per bulan (6 bulan terakhir)
	type MonthlyData struct {
		Month   string  `json:"month"`
		Revenue float64 `json:"revenue"`
		Count   int64   `json:"count"`
	}
	var monthly []MonthlyData
	h.db.Raw(`
		SELECT 
			TO_CHAR(transaction_date, 'YYYY-MM') as month,
			SUM(amount) as revenue,
			COUNT(*) as count
		FROM transactions
		WHERE transaction_date >= CURRENT_DATE - INTERVAL '6 months'
		GROUP BY month
		ORDER BY month ASC
	`).Scan(&monthly)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total_customers":    totalCustomers,
			"total_transactions": totalTransactions,
			"total_revenue":      totalRevenue,
			"avg_transaction":    avgTransaction,
			"monthly_data":       monthly,
		},
	})
}
