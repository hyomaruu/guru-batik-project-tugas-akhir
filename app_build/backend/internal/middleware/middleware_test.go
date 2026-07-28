package middleware

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

const testJWTSecret = "test-secret"

func TestJWTProtected(t *testing.T) {
	app := fiber.New()
	app.Use(JWTProtected(testJWTSecret))
	app.Get("/protected", func(c *fiber.Ctx) error {
		return c.SendString(fmt.Sprintf("User ID: %d, Username: %s", c.Locals("userID").(uint), c.Locals("username").(string)))
	})

	t.Run("valid token", func(t *testing.T) {
		claims := Claims{
			UserID:   1,
			Username: "testuser",
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
				IssuedAt:  jwt.NewNumericDate(time.Now()),
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		signedToken, _ := token.SignedString([]byte(testJWTSecret))

		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+signedToken)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "User ID: 1, Username: testuser")
	})

	t.Run("missing token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Token tidak ditemukan", res["message"])
	})

	t.Run("invalid token format", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "InvalidTokenFormat")
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Format token tidak valid", res["message"])
	})

	t.Run("expired token", func(t *testing.T) {
		claims := Claims{
			UserID:   1,
			Username: "testuser",
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)), // Expired an hour ago
				IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		signedToken, _ := token.SignedString([]byte(testJWTSecret))

		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+signedToken)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Token tidak valid atau sudah expired", res["message"])
	})

	t.Run("invalid signing method", func(t *testing.T) {
		claims := Claims{
			UserID:   1,
			Username: "testuser",
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
				IssuedAt:  jwt.NewNumericDate(time.Now()),
			},
		}
		// Sign with a different method (e.g., none, or RS256 if not expected)
		token := jwt.NewWithClaims(jwt.SigningMethodNone, claims)
		signedToken, _ := token.SignedString(jwt.UnsafeAllowNoneSignatureType)

		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+signedToken)
		resp, _ := app.Test(req)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
		var res map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&res)
		assert.False(t, res["success"].(bool))
		assert.Equal(t, "Token tidak valid atau sudah expired", res["message"])
	})
}
