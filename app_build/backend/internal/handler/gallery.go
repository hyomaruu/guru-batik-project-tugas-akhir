package handler

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gurubatik-backend/internal/model"
)

type GalleryHandler struct {
	db *gorm.DB
}

func NewGalleryHandler(db *gorm.DB) *GalleryHandler {
	return &GalleryHandler{db: db}
}

func (h *GalleryHandler) List(c *fiber.Ctx) error {
	var galleries []model.Gallery
	h.db.Order("id DESC").Find(&galleries)
	return c.JSON(fiber.Map{"success": true, "data": galleries})
}

func (h *GalleryHandler) GetOne(c *fiber.Ctx) error {
	id := c.Params("id")
	var gallery model.Gallery
	if err := h.db.First(&gallery, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Galeri tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": gallery})
}

func (h *GalleryHandler) Create(c *fiber.Ctx) error {
	var req model.CreateGalleryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Input tidak valid"})
	}

	gallery := model.Gallery{
		Category: req.Category,
		Alt:      req.Alt,
		Caption:  req.Caption,
		Src:      req.Src,
	}
	if err := h.db.Create(&gallery).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan galeri"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": gallery})
}

func (h *GalleryHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var gallery model.Gallery
	if err := h.db.First(&gallery, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Galeri tidak ditemukan"})
	}

	var req model.UpdateGalleryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Input tidak valid"})
	}

	if req.Category != "" {
		gallery.Category = req.Category
	}
	if req.Alt != "" {
		gallery.Alt = req.Alt
	}
	if req.Caption != "" {
		gallery.Caption = req.Caption
	}
	if req.Src != "" {
		gallery.Src = req.Src
	}

	if err := h.db.Save(&gallery).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal update galeri"})
	}

	return c.JSON(fiber.Map{"success": true, "data": gallery})
}

func (h *GalleryHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.db.Delete(&model.Gallery{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal hapus galeri"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Galeri berhasil dihapus"})
}
