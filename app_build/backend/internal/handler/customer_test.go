package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"

	"gurubatik-backend/internal/model"
	"gurubatik-backend/internal/test_utils"
)

// TestListCustomers tests the List handler for customers
func TestListCustomers(t *testing.T) {
	t.Run("success with default pagination and no search", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Get("/customers", handler.List)

		// Expected customers
		customers := []model.Customer{
			{ID: 1, Name: "Customer 1", Email: "c1@example.com", Phone: "111", Address: "Addr 1", CreatedAt: time.Now(), UpdatedAt: time.Now()},
			{ID: 2, Name: "Customer 2", Email: "c2@example.com", Phone: "222", Address: "Addr 2", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		}
		totalCustomers := int64(2)

		// Mock DB expectations for Count and Find
		mockDB.Mock.ExpectQuery(`SELECT count\(\*\) FROM "customers"`).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(totalCustomers))
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "customers" ORDER BY created_at DESC LIMIT \$1`).
			WithArgs(10).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "email", "phone", "address", "created_at", "updated_at"}).
				AddRow(customers[0].ID, customers[0].Name, customers[0].Email, customers[0].Phone, customers[0].Address, customers[0].CreatedAt, customers[0].UpdatedAt).
				AddRow(customers[1].ID, customers[1].Name, customers[1].Email, customers[1].Phone, customers[1].Address, customers[1].CreatedAt, customers[1].UpdatedAt))

		req := httptest.NewRequest(http.MethodGet, "/customers", nil)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)

		assert.True(t, res["success"].(bool))
		data := res["data"].(map[string]interface{})
		assert.Equal(t, float64(totalCustomers), data["total"].(float64))
		assert.Equal(t, float64(1), data["page"].(float64))
		assert.Equal(t, float64(10), data["limit"].(float64))
		assert.Equal(t, float64(1), data["total_pages"].(float64))
	})

	t.Run("success with custom pagination and search", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Get("/customers", handler.List)

		// Expected customer
		customer := model.Customer{ID: 3, Name: "Search Customer", Email: "search@example.com", Phone: "333", Address: "Search Addr", CreatedAt: time.Now(), UpdatedAt: time.Now()}
		totalCustomers := int64(1)

		// Mock DB expectations for Count and Find with search query
		mockDB.Mock.ExpectQuery(`SELECT count\(\*\) FROM "customers" WHERE name ILIKE \$1 OR email ILIKE \$2 OR phone ILIKE \$3`).
			WithArgs("%Search%", "%Search%", "%Search%").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(totalCustomers))
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "customers" WHERE name ILIKE \$1 OR email ILIKE \$2 OR phone ILIKE \$3 ORDER BY created_at DESC LIMIT \$4 OFFSET \$5`).
			WithArgs("%Search%", "%Search%", "%Search%", 5, 5).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "email", "phone", "address", "created_at", "updated_at"}).
				AddRow(customer.ID, customer.Name, customer.Email, customer.Phone, customer.Address, customer.CreatedAt, customer.UpdatedAt))

		req := httptest.NewRequest(http.MethodGet, "/customers?page=2&limit=5&search=Search", nil)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)

		assert.True(t, res["success"].(bool))
		data := res["data"].(map[string]interface{})
		assert.Equal(t, float64(totalCustomers), data["total"].(float64))
		assert.Equal(t, float64(2), data["page"].(float64))
		assert.Equal(t, float64(5), data["limit"].(float64))
		assert.Equal(t, float64(1), data["total_pages"].(float64))
	})

	t.Run("no customers found", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Get("/customers", handler.List)

		totalCustomers := int64(0)

		mockDB.Mock.ExpectQuery(`SELECT count\(\*\) FROM "customers"`).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(totalCustomers))
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "customers" ORDER BY created_at DESC LIMIT \$1`).
			WithArgs(10).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "email", "phone", "address", "created_at", "updated_at"}))

		req := httptest.NewRequest(http.MethodGet, "/customers", nil)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)

		assert.True(t, res["success"].(bool))
		data := res["data"].(map[string]interface{})
		assert.Empty(t, data["data"])
		assert.Equal(t, float64(0), data["total"].(float64))
		assert.Equal(t, float64(0), data["total_pages"].(float64))
	})

	t.Run("database error during count", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Get("/customers", handler.List)

		mockDB.Mock.ExpectQuery(`SELECT count\(\*\) FROM "customers"`).
			WillReturnError(errors.New("db count error"))

		req := httptest.NewRequest(http.MethodGet, "/customers", nil)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
	})
}

func TestCreateCustomer(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Post("/customers", handler.Create)

		mockDB.Mock.ExpectBegin()
		mockDB.Mock.ExpectQuery(`INSERT INTO "customers"`).
			WithArgs("New Customer", "new@example.com", "081234567890", "Addr New", sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mockDB.Mock.ExpectCommit()

		reqBody, _ := json.Marshal(model.CreateCustomerRequest{
			Name:    "New Customer",
			Email:   "new@example.com",
			Phone:   "081234567890",
			Address: "Addr New",
		})
		req := httptest.NewRequest(http.MethodPost, "/customers", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.True(t, res["success"].(bool))
	})

	t.Run("invalid request body (malformed json)", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Post("/customers", handler.Create)

		req := httptest.NewRequest(http.MethodPost, "/customers", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Format request tidak valid", res["message"])
	})

	t.Run("invalid input (validation error)", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Post("/customers", handler.Create)

		reqBody, _ := json.Marshal(model.CreateCustomerRequest{
			Name:  "A", // Too short
			Email: "invalid-email",
			Phone: "123", // Too short
		})
		req := httptest.NewRequest(http.MethodPost, "/customers", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Validasi gagal", res["message"])
		assert.NotNil(t, res["errors"])
		errors := res["errors"].([]interface{})
		assert.Len(t, errors, 3) // name, email, phone
	})

	t.Run("database error", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Post("/customers", handler.Create)

		mockDB.Mock.ExpectBegin()
		mockDB.Mock.ExpectQuery(`INSERT INTO "customers"`).
			WillReturnError(errors.New("db insert error"))
		mockDB.Mock.ExpectRollback()

		reqBody, _ := json.Marshal(model.CreateCustomerRequest{
			Name: "Fail Customer",
		})
		req := httptest.NewRequest(http.MethodPost, "/customers", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Gagal menyimpan pelanggan: db insert error", res["message"])
	})
}

func TestGetOneCustomer(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Get("/customers/:id", handler.GetOne)

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "customers" WHERE "customers"\."id" = \$1 ORDER BY "customers"\."id" LIMIT \$2`).
			WithArgs("1", 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "email"}).AddRow(1, "Customer 1", "c1@example.com"))

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "transactions" WHERE "transactions"\."customer_id" = \$1`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "customer_id", "amount"}).AddRow(10, 1, 50000.0))

		req := httptest.NewRequest(http.MethodGet, "/customers/1", nil)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("not found", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Get("/customers/:id", handler.GetOne)

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "customers" WHERE "customers"\."id" = \$1 ORDER BY "customers"\."id" LIMIT \$2`).
			WithArgs("99", 1).
			WillReturnError(gorm.ErrRecordNotFound)

		req := httptest.NewRequest(http.MethodGet, "/customers/99", nil)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

func TestUpdateCustomer(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Put("/customers/:id", handler.Update)

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "customers" WHERE "customers"\."id" = \$1 ORDER BY "customers"\."id" LIMIT \$2`).
			WithArgs("1", 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "email"}).AddRow(1, "Old Name", "old@example.com"))

		mockDB.Mock.ExpectBegin()
		mockDB.Mock.ExpectExec(`UPDATE "customers" SET`).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mockDB.Mock.ExpectCommit()

		reqBody, _ := json.Marshal(model.CreateCustomerRequest{
			Name:  "Updated Name",
			Email: "updated@example.com",
			Phone: "081234567890",
		})
		req := httptest.NewRequest(http.MethodPut, "/customers/1", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("invalid input (validation error)", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Put("/customers/:id", handler.Update)

		// Expect to find the customer first
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "customers" WHERE "customers"\."id" = \$1 ORDER BY "customers"\."id" LIMIT \$2`).
			WithArgs("1", 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).AddRow(1, "Existing Customer"))

		reqBody, _ := json.Marshal(model.CreateCustomerRequest{
			Name:  "", // Missing name
			Email: "bad",
		})
		req := httptest.NewRequest(http.MethodPut, "/customers/1", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Validasi gagal", res["message"])
		assert.NotNil(t, res["errors"])
	})
}

func TestDeleteCustomer(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Delete("/customers/:id", handler.Delete)

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "customers" WHERE "customers"\."id" = \$1 ORDER BY "customers"\."id" LIMIT \$2`).
			WithArgs("1", 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).AddRow(1, "Customer 1"))

		mockDB.Mock.ExpectBegin()
		mockDB.Mock.ExpectExec(`DELETE FROM "customers" WHERE "customers"\."id" = \$1`).
			WithArgs(1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mockDB.Mock.ExpectCommit()

		req := httptest.NewRequest(http.MethodDelete, "/customers/1", nil)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})
}

func TestStats(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Get("/stats", handler.Stats)

		mockDB.Mock.ExpectQuery(`SELECT count\(\*\) FROM "customers"`).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(50))

		mockDB.Mock.ExpectQuery(`SELECT count\(\*\) FROM "transactions"`).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(100))

		mockDB.Mock.ExpectQuery(`SELECT COALESCE\(SUM\(amount\), 0\) FROM "transactions"`).
			WillReturnRows(sqlmock.NewRows([]string{"sum"}).AddRow(25000000.0))

		mockDB.Mock.ExpectQuery(`SELECT TO_CHAR\(transaction_date, 'YYYY-MM'\) as month, SUM\(amount\) as revenue, COUNT\(\*\) as count FROM transactions WHERE transaction_date >= CURRENT_DATE - INTERVAL '6 months' GROUP BY month ORDER BY month ASC`).
			WillReturnRows(sqlmock.NewRows([]string{"month", "revenue", "count"}).
				AddRow("2026-06", 15000000.0, 60).
				AddRow("2026-07", 10000000.0, 40))

		req := httptest.NewRequest(http.MethodGet, "/stats", nil)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.True(t, res["success"].(bool))

		data := res["data"].(map[string]interface{})
		assert.Equal(t, float64(50), data["total_customers"].(float64))
		assert.Equal(t, float64(100), data["total_transactions"].(float64))
		assert.Equal(t, float64(25000000.0), data["total_revenue"].(float64))
		assert.Equal(t, float64(250000), data["avg_transaction"].(float64))
	})
}

func TestListTransactions(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Get("/transactions", handler.ListTransactions)

		mockDB.Mock.ExpectQuery(`SELECT count\(\*\) FROM "transactions"`).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(2))

		// Preload Customer query usually happens separately or as a join, GORM does separate query for preloading belongsTo/hasMany.
		// Query 1: Find transactions
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "transactions" ORDER BY transaction_date DESC LIMIT \$1`).
			WithArgs(10).
			WillReturnRows(sqlmock.NewRows([]string{"id", "customer_id", "amount", "description"}).
				AddRow(1, 101, 15000.0, "Tx 1").
				AddRow(2, 102, 25000.0, "Tx 2"))

		// Query 2: Preload Customers
		mockDB.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "customers" WHERE "customers"."id" IN ($1,$2)`)).
			WithArgs(101, 102).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).
				AddRow(101, "Customer 101").
				AddRow(102, "Customer 102"))

		req := httptest.NewRequest(http.MethodGet, "/transactions", nil)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})
}

func TestAddTransaction(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Post("/transactions", handler.AddTransaction)

		// First: find customer
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "customers" WHERE "customers"\."id" = \$1 ORDER BY "customers"\."id" LIMIT \$2`).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).AddRow(1, "Customer 1"))

		// Second: insert transaction
		mockDB.Mock.ExpectBegin()
		mockDB.Mock.ExpectQuery(`INSERT INTO "transactions"`).
			WithArgs(1, sqlmock.AnyArg(), 50000.0, "Desc 1", sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mockDB.Mock.ExpectCommit()

		reqBody, _ := json.Marshal(model.CreateTransactionRequest{
			CustomerID:      1,
			TransactionDate: "2026-07-25",
			Amount:          50000.0,
			Description:     "Desc 1",
		})
		req := httptest.NewRequest(http.MethodPost, "/transactions", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusCreated, resp.StatusCode)
	})

	t.Run("invalid input (validation error)", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Post("/transactions", handler.AddTransaction)

		// No mock ExpectQuery for customer find, because validation should fail first

		reqBody, _ := json.Marshal(model.CreateTransactionRequest{
			CustomerID:      0, // Invalid: required
			TransactionDate: "invalid-date",
			Amount:          -10.0, // Invalid: gt=0
		})
		req := httptest.NewRequest(http.MethodPost, "/transactions", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Validasi gagal", res["message"])
		assert.NotNil(t, res["errors"])
		errors := res["errors"].([]interface{})
		assert.Len(t, errors, 3) // customer_id, transaction_date, amount
	})
}

func TestUpdateTransaction(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Put("/transactions/:id", handler.UpdateTransaction)

		// First: find transaction
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "transactions" WHERE "transactions"\."id" = \$1 ORDER BY "transactions"\."id" LIMIT \$2`).
			WithArgs("1", 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "customer_id", "amount", "description"}).AddRow(1, 101, 10000.0, "Old Tx"))

		// Second: update transaction
		mockDB.Mock.ExpectBegin()
		mockDB.Mock.ExpectExec(`UPDATE "transactions" SET`).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mockDB.Mock.ExpectCommit()

		reqBody, _ := json.Marshal(model.CreateTransactionRequest{
			CustomerID:      101, // This field is ignored in handler update logic but must be present in struct
			TransactionDate: "2026-07-26",
			Amount:          15000.0,
			Description:     "New Tx",
		})
		req := httptest.NewRequest(http.MethodPut, "/transactions/1", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("invalid input (validation error)", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewCustomerHandler(mockDB.DB)
		app.Put("/transactions/:id", handler.UpdateTransaction)

		// Expect to find the transaction first
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "transactions" WHERE "transactions"\."id" = \$1 ORDER BY "transactions"\."id" LIMIT \$2`).
			WithArgs("1", 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "customer_id", "amount", "description"}).AddRow(1, 101, 10000.0, "Old Tx"))

		reqBody, _ := json.Marshal(model.CreateTransactionRequest{
			CustomerID:      101,
			TransactionDate: "bad-date",
			Amount:          0.0, // Invalid: gt=0
		})
		req := httptest.NewRequest(http.MethodPut, "/transactions/1", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Validasi gagal", res["message"])
		assert.NotNil(t, res["errors"])
		errors := res["errors"].([]interface{})
		assert.Len(t, errors, 2) // transaction_date, amount
	})
}
