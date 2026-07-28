package handler

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"gurubatik-backend/internal/middleware"
	"gurubatik-backend/internal/model"
	"gurubatik-backend/internal/validator" // ADDED
)

type AuthHandler struct {
	db        *gorm.DB
	jwtSecret string
}

func NewAuthHandler(db *gorm.DB, jwtSecret string) *AuthHandler {
	return &AuthHandler{db: db, jwtSecret: jwtSecret}
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
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

	var user model.AdminUser
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Email atau password salah",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Email atau password salah",
		})
	}

	claims := middleware.Claims{
		UserID:   user.ID,
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(h.jwtSecret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat token",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Login berhasil",
		"data": fiber.Map{
			"token":    signed,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	username := c.Locals("username").(string)
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"id":       userID,
			"username": username,
		},
	})
}

type UpdateProfileRequest struct {
	Username string `json:"username" validate:"omitempty,min=3,max=50"`
	Password string `json:"password" validate:"omitempty,min=6"`
}

func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	
	var req UpdateProfileRequest
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

	var user model.AdminUser
	if err := h.db.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "User tidak ditemukan",
		})
	}

	// Update username
	if req.Username != "" {
		// Cek apakah username sudah dipakai orang lain
		var existingUser model.AdminUser
		if err := h.db.Where("username = ? AND id != ?", req.Username, userID).First(&existingUser).Error; err == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"success": false,
				"message": "Username sudah digunakan",
			})
		}
		user.Username = req.Username
	}

	// Update password jika diisi
	if req.Password != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Gagal mengenkripsi password",
			})
		}
		user.Password = string(hashed)
	}

	if err := h.db.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan profil",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Profil berhasil diperbarui",
		"data": fiber.Map{
			"id":       user.ID,
			"username": user.Username,
		},
	})
}
