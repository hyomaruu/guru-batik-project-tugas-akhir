package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"gurubatik-backend/internal/model"
	"gurubatik-backend/internal/test_utils"
)

// Global JWT secret for testing
const testJWTSecret = "test-secret"

func TestLogin(t *testing.T) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	adminUser := model.AdminUser{
		ID:       1,
		Username: "admin",
		Email:    "admin@example.com",
		Password: string(hashedPassword),
	}

	t.Run("success login", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Post("/login", handler.Login)

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE email = \$1`).
			WithArgs(adminUser.Email, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "username", "email", "password"}).
				AddRow(adminUser.ID, adminUser.Username, adminUser.Email, adminUser.Password))

		reqBody, _ := json.Marshal(LoginRequest{
			Email:    adminUser.Email,
			Password: "password123",
		})
		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.True(t, res["success"].(bool))
		assert.Contains(t, res["data"].(map[string]interface{}), "token")
		assert.Equal(t, adminUser.Username, res["data"].(map[string]interface{})["username"])
	})

	t.Run("invalid request body (malformed json)", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Post("/login", handler.Login)

		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBufferString("invalid json"))
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

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Post("/login", handler.Login)

		reqBody, _ := json.Marshal(LoginRequest{
			Email:    "invalid-email", // Invalid format
			Password: "short",         // Too short
		})
		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(reqBody))
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
		assert.Len(t, errors, 2) // email, password
	})

	t.Run("user not found", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Post("/login", handler.Login)

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE email = \$1`).
			WithArgs("nonexistent@example.com", 1).
			WillReturnError(gorm.ErrRecordNotFound)

		reqBody, _ := json.Marshal(LoginRequest{
			Email:    "nonexistent@example.com",
			Password: "password123",
		})
		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("incorrect password", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Post("/login", handler.Login)

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE email = \$1`).
			WithArgs(adminUser.Email, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "username", "email", "password"}).
				AddRow(adminUser.ID, adminUser.Username, adminUser.Email, adminUser.Password))

		reqBody, _ := json.Marshal(LoginRequest{
			Email:    adminUser.Email,
			Password: "wrongpassword",
		})
		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("database error during user query", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Post("/login", handler.Login)

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE email = \$1`).
			WithArgs(adminUser.Email, 1).
			WillReturnError(errors.New("db query error"))

		reqBody, _ := json.Marshal(LoginRequest{
			Email:    adminUser.Email,
			Password: "password123",
		})
		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode) // Handler returns Unauthorized for DB errors in user query
	})
}

func TestMe(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		app := fiber.New()
		// No DB mock needed for Me, as it uses c.Locals
		handler := NewAuthHandler(nil, testJWTSecret) // Pass nil for DB as it's not used

		// Mock the JWTProtected middleware behavior by setting locals directly
		app.Get("/me", func(c *fiber.Ctx) error {
			c.Locals("userID", uint(1))
			c.Locals("username", "testuser")
			return handler.Me(c)
		})

		req := httptest.NewRequest(http.MethodGet, "/me", nil)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.True(t, res["success"].(bool))
		data := res["data"].(map[string]interface{})
		assert.Equal(t, float64(1), data["id"].(float64)) // JSON unmarshals uint to float64
		assert.Equal(t, "testuser", data["username"])
	})
}

func TestUpdateProfile(t *testing.T) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("oldpassword"), bcrypt.DefaultCost)
	adminUser := model.AdminUser{
		ID:       1,
		Username: "oldusername",
		Email:    "old@example.com",
		Password: string(hashedPassword),
	}

	t.Run("success update username only", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Put("/profile", func(c *fiber.Ctx) error {
			c.Locals("userID", adminUser.ID)
			return handler.UpdateProfile(c)
		})

		// Expect to find the user
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE "admin_users"\."id" = \$1 ORDER BY "admin_users"\."id" LIMIT \$2`).
			WithArgs(adminUser.ID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "username", "email", "password"}).
				AddRow(adminUser.ID, adminUser.Username, adminUser.Email, adminUser.Password))

		// Expect no existing user with new username (for conflict check)
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE username = \$1 AND id != \$2 ORDER BY "admin_users"\."id" LIMIT \$3`).
			WithArgs("newusername", adminUser.ID, 1).
			WillReturnError(gorm.ErrRecordNotFound) // Means no conflict

		// Expect to save the user
		mockDB.Mock.ExpectBegin()
		mockDB.Mock.ExpectExec(`UPDATE "admin_users" SET "username"=\$.+,"email"=\$.+,"password"=\$.+,"created_at"=\$.+,"updated_at"=\$.+ WHERE "id" = \$6`).
			WithArgs("newusername", adminUser.Email, string(adminUser.Password), sqlmock.AnyArg(), sqlmock.AnyArg(), adminUser.ID). // Expect all fields to be updated
			WillReturnResult(sqlmock.NewResult(1, 1))
		mockDB.Mock.ExpectCommit()

		reqBody, _ := json.Marshal(UpdateProfileRequest{
			Username: "newusername",
		})
		req := httptest.NewRequest(http.MethodPut, "/profile", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.True(t, res["success"].(bool))
		assert.Equal(t, "Profil berhasil diperbarui", res["message"])
		assert.Equal(t, "newusername", res["data"].(map[string]interface{})["username"])
	})

	t.Run("success update password only", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Put("/profile", func(c *fiber.Ctx) error {
			c.Locals("userID", adminUser.ID)
			return handler.UpdateProfile(c)
		})

		// Expect to find the user
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE "admin_users"\."id" = \$1 ORDER BY "admin_users"\."id" LIMIT \$2`).
			WithArgs(adminUser.ID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "username", "email", "password"}).
				AddRow(adminUser.ID, adminUser.Username, adminUser.Email, adminUser.Password))

		// Expect to save the user (password will be hashed, so check for password length >= bcrypt min length)
		mockDB.Mock.ExpectBegin()
		mockDB.Mock.ExpectExec(`UPDATE "admin_users" SET "username"=\$.+,"email"=\$.+,"password"=\$.+,"created_at"=\$.+,"updated_at"=\$.+ WHERE "id" = \$6`).
			WithArgs(adminUser.Username, adminUser.Email, sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), adminUser.ID). // Password is hashed, so AnyArg
			WillReturnResult(sqlmock.NewResult(1, 1))
		mockDB.Mock.ExpectCommit()

		reqBody, _ := json.Marshal(UpdateProfileRequest{
			Password: "newpassword",
		})
		req := httptest.NewRequest(http.MethodPut, "/profile", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.True(t, res["success"].(bool))
		assert.Equal(t, "Profil berhasil diperbarui", res["message"])
	})

	t.Run("invalid input (validation error)", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Put("/profile", func(c *fiber.Ctx) error {
			c.Locals("userID", adminUser.ID)
			return handler.UpdateProfile(c)
		})

		// Expect to find the user
		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE "admin_users"\."id" = \$1 ORDER BY "admin_users"\."id" LIMIT \$2`).
			WithArgs(adminUser.ID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "username", "email", "password"}).
				AddRow(adminUser.ID, adminUser.Username, adminUser.Email, adminUser.Password))

		reqBody, _ := json.Marshal(UpdateProfileRequest{
			Username: "s",    // Too short
			Password: "short", // Too short
		})
		req := httptest.NewRequest(http.MethodPut, "/profile", bytes.NewBuffer(reqBody))
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
		assert.Len(t, errors, 2) // username, password
	})


	t.Run("username already taken", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Put("/profile", func(c *fiber.Ctx) error {
			c.Locals("userID", adminUser.ID)
			return handler.UpdateProfile(c)
		})

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE "admin_users"\."id" = \$1 ORDER BY "admin_users"\."id" LIMIT \$2`).
			WithArgs(adminUser.ID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "username"}).AddRow(adminUser.ID, adminUser.Username))

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE username = \$1 AND id != \$2 ORDER BY "admin_users"\."id" LIMIT \$3`).
			WithArgs("takenusername", adminUser.ID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(2)) // Simulate user found

		reqBody, _ := json.Marshal(UpdateProfileRequest{
			Username: "takenusername",
		})
		req := httptest.NewRequest(http.MethodPut, "/profile", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusConflict, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Username sudah digunakan", res["message"])
	})

	t.Run("user not found from context", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Put("/profile", func(c *fiber.Ctx) error {
			c.Locals("userID", uint(99)) // Non-existent user
			return handler.UpdateProfile(c)
		})

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE "admin_users"\."id" = \$1 ORDER BY "admin_users"\."id" LIMIT \$2`).
			WithArgs(uint(99), 1).
			WillReturnError(gorm.ErrRecordNotFound)

		reqBody, _ := json.Marshal(UpdateProfileRequest{
			Username: "anyusername",
		})
		req := httptest.NewRequest(http.MethodPut, "/profile", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "User tidak ditemukan", res["message"])
	})

	t.Run("database error during user save", func(t *testing.T) {
		app := fiber.New()
		mockDB, closeDB := test_utils.NewMockDB(t)
		defer closeDB()

		handler := NewAuthHandler(mockDB.DB, testJWTSecret)
		app.Put("/profile", func(c *fiber.Ctx) error {
			c.Locals("userID", adminUser.ID)
			return handler.UpdateProfile(c)
		})

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE "admin_users"\."id" = \$1 ORDER BY "admin_users"\."id" LIMIT \$2`).
			WithArgs(adminUser.ID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "username", "email", "password"}).
				AddRow(adminUser.ID, adminUser.Username, adminUser.Email, adminUser.Password))

		mockDB.Mock.ExpectQuery(`SELECT \* FROM "admin_users" WHERE username = \$1 AND id != \$2 ORDER BY "admin_users"\."id" LIMIT \$3`).
			WithArgs("newusername", adminUser.ID, 1).
			WillReturnError(gorm.ErrRecordNotFound)

		mockDB.Mock.ExpectBegin()
		mockDB.Mock.ExpectExec(`UPDATE "admin_users" SET "username"=\$.+,"email"=\$.+,"password"=\$.+,"created_at"=\$.+,"updated_at"=\$.+ WHERE "id" = \$6`).
			WillReturnError(errors.New("db save error"))
		mockDB.Mock.ExpectRollback()

		reqBody, _ := json.Marshal(UpdateProfileRequest{
			Username: "newusername",
		})
		req := httptest.NewRequest(http.MethodPut, "/profile", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Gagal menyimpan profil", res["message"])
	})
}
