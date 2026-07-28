package handler

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gurubatik-backend/internal/model"
)

type AgendaHandler struct {
	db *gorm.DB
}

func NewAgendaHandler(db *gorm.DB) *AgendaHandler {
	return &AgendaHandler{db: db}
}

func (h *AgendaHandler) List(c *fiber.Ctx) error {
	var agendas []model.Agenda
	h.db.Order("id ASC").Find(&agendas)
	return c.JSON(fiber.Map{"success": true, "data": agendas})
}

func (h *AgendaHandler) GetOne(c *fiber.Ctx) error {
	id := c.Params("id")
	var agenda model.Agenda
	if err := h.db.First(&agenda, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Agenda tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": agenda})
}

func (h *AgendaHandler) Create(c *fiber.Ctx) error {
	var req model.CreateAgendaRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Input tidak valid"})
	}

	agenda := model.Agenda{
		Day:         req.Day,
		Date:        req.Date,
		Time:        req.Time,
		EndTime:     req.EndTime,
		Title:       req.Title,
		Category:    req.Category,
		Description: req.Description,
		Location:    req.Location,
		ImageURL:    req.ImageURL,
	}
	if err := h.db.Create(&agenda).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan agenda"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": agenda})
}

func (h *AgendaHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var agenda model.Agenda
	if err := h.db.First(&agenda, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Agenda tidak ditemukan"})
	}

	var req model.UpdateAgendaRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Input tidak valid"})
	}

	agenda.Day = req.Day
	agenda.Date = req.Date
	agenda.Time = req.Time
	agenda.EndTime = req.EndTime
	agenda.Title = req.Title
	agenda.Category = req.Category
	agenda.Description = req.Description
	agenda.Location = req.Location
	agenda.ImageURL = req.ImageURL

	if err := h.db.Save(&agenda).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal update agenda"})
	}

	return c.JSON(fiber.Map{"success": true, "data": agenda})
}

func (h *AgendaHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.db.Delete(&model.Agenda{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal hapus agenda"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Agenda berhasil dihapus"})
}
