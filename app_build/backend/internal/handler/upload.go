package handler

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

func (h *UploadHandler) UploadImage(c *fiber.Ctx) error {
	// Menerima file dari key "image"
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membaca file upload: " + err.Error(),
		})
	}

	// Validasi ekstensi
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" && ext != ".svg" && ext != ".gif" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format file tidak didukung (gunakan JPG, PNG, WebP, SVG, atau GIF)",
		})
	}

	// Buat direktori uploads jika belum ada
	uploadDir := "./uploads/images"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat direktori upload: " + err.Error(),
		})
	}

	// Buat nama file unik (timestamp_namabebas.ext)
	// Kita bersihkan nama aslinya dari spasi agar URL rapi
	cleanName := strings.ReplaceAll(file.Filename, " ", "_")
	newFilename := fmt.Sprintf("%d_%s", time.Now().Unix(), cleanName)
	savePath := filepath.Join(uploadDir, newFilename)

	// Simpan file
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan file: " + err.Error(),
		})
	}

	// Bangun URL lokal
	// Host bisa diambil dari koneksi (c.BaseURL()),
	// namun untuk konsistensi pada REST API yang bisa diakses dari frontend terpisah (localhost:3000),
	// URL absolut direkomendasikan jika kita ingin frontend langsung memakainya di src.
	// Jika baseUrl dari fiber adalah localhost:8080, kita gunakan itu.
	fileUrl := fmt.Sprintf("%s/uploads/images/%s", c.BaseURL(), newFilename)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "File berhasil diunggah",
		"data": fiber.Map{
			"url": fileUrl,
		},
	})
}
