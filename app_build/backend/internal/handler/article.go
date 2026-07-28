package handler

import (
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gosimple/slug"
	"gorm.io/gorm"

	"gurubatik-backend/internal/model"
)

type ArticleHandler struct {
	db *gorm.DB
}

func NewArticleHandler(db *gorm.DB) *ArticleHandler {
	return &ArticleHandler{db: db}
}

// ─── Public: List artikel yang dipublikasikan ──────────────────────
func (h *ArticleHandler) ListPublished(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "9"))
	category := c.Query("category", "")
	search := c.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 9
	}
	offset := (page - 1) * limit

	query := h.db.Model(&model.Article{}).Where("is_published = true")
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if search != "" {
		query = query.Where("title ILIKE ? OR excerpt ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var articles []model.Article
	query.Order("published_at DESC").Offset(offset).Limit(limit).Find(&articles)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"data":        articles,
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": int(math.Ceil(float64(total) / float64(limit))),
		},
	})
}

// ─── Public: Detail artikel by slug ───────────────────────────────
func (h *ArticleHandler) GetBySlug(c *fiber.Ctx) error {
	slugParam := c.Params("slug")
	var article model.Article
	if err := h.db.Where("slug = ? AND is_published = true", slugParam).First(&article).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Artikel tidak ditemukan",
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": article})
}

// ─── Public: Kategori yang tersedia ───────────────────────────────
func (h *ArticleHandler) GetCategories(c *fiber.Ctx) error {
	var categories []string
	h.db.Model(&model.Article{}).
		Where("is_published = true").
		Distinct("category").
		Pluck("category", &categories)
	return c.JSON(fiber.Map{"success": true, "data": categories})
}

// ─── Admin: List semua artikel ────────────────────────────────────
func (h *ArticleHandler) AdminList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	var total int64
	h.db.Model(&model.Article{}).Count(&total)

	var articles []model.Article
	h.db.Order("created_at DESC").Offset(offset).Limit(limit).Find(&articles)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"data":        articles,
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": int(math.Ceil(float64(total) / float64(limit))),
		},
	})
}

// ─── Admin: Create artikel ────────────────────────────────────────
func (h *ArticleHandler) Create(c *fiber.Ctx) error {
	var req model.CreateArticleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format request tidak valid",
		})
	}

	// Generate slug
	articleSlug := slug.Make(req.Title)
	// Pastikan slug unik
	var count int64
	h.db.Model(&model.Article{}).Where("slug LIKE ?", articleSlug+"%").Count(&count)
	if count > 0 {
		articleSlug = articleSlug + "-" + strconv.FormatInt(count, 10)
	}

	// Auto excerpt
	excerpt := req.Excerpt
	if excerpt == "" && len(req.Content) > 200 {
		// Strip HTML sederhana
		plain := strings.ReplaceAll(req.Content, "<", " <")
		plain = strings.Join(strings.Fields(plain), " ")
		if len(plain) > 200 {
			excerpt = plain[:200] + "..."
		}
	}

	article := model.Article{
		Title:       req.Title,
		Slug:        articleSlug,
		Content:     req.Content,
		Excerpt:     excerpt,
		Category:    req.Category,
		Thumbnail:   req.Thumbnail,
		IsPublished: req.IsPublished,
	}

	if req.IsPublished {
		now := time.Now()
		article.PublishedAt = &now
	}

	if err := h.db.Create(&article).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan artikel",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Artikel berhasil dibuat",
		"data":    article,
	})
}

// ─── Admin: Get satu artikel ──────────────────────────────────────
func (h *ArticleHandler) GetOne(c *fiber.Ctx) error {
	id := c.Params("id")
	var article model.Article
	if err := h.db.First(&article, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Artikel tidak ditemukan",
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": article})
}

// ─── Admin: Update artikel ────────────────────────────────────────
func (h *ArticleHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var article model.Article
	if err := h.db.First(&article, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Artikel tidak ditemukan",
		})
	}

	var req model.UpdateArticleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format request tidak valid",
		})
	}

	updates := map[string]interface{}{}
	if req.Title != "" {
		updates["title"] = req.Title
		updates["slug"] = slug.Make(req.Title)
	}
	if req.Content != "" {
		updates["content"] = req.Content
	}
	if req.Excerpt != "" {
		updates["excerpt"] = req.Excerpt
	}
	if req.Category != "" {
		updates["category"] = req.Category
	}
	if req.Thumbnail != "" {
		updates["thumbnail"] = req.Thumbnail
	}
	if req.IsPublished != nil {
		updates["is_published"] = *req.IsPublished
		if *req.IsPublished && article.PublishedAt == nil {
			now := time.Now()
			updates["published_at"] = now
		}
	}

	h.db.Model(&article).Updates(updates)
	h.db.First(&article, id)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Artikel berhasil diupdate",
		"data":    article,
	})
}

// ─── Admin: Delete artikel ────────────────────────────────────────
func (h *ArticleHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	var article model.Article
	if err := h.db.First(&article, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Artikel tidak ditemukan",
		})
	}

	h.db.Delete(&article)
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Artikel berhasil dihapus",
	})
}
