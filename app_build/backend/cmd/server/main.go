package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"gurubatik-backend/internal/config"
	"gurubatik-backend/internal/database"
	"gurubatik-backend/internal/handler"
	"gurubatik-backend/internal/middleware"
	"gurubatik-backend/internal/model"
)

func main() {
	cfg := config.Load()
	db := database.Connect(cfg.DatabaseURL)

	// Auto-migrate new CMS models
	db.AutoMigrate(&model.Gallery{}, &model.Agenda{})

	app := fiber.New(fiber.Config{
		AppName:      "Guru Batik API v1.0",
		ErrorHandler: errorHandler,
	})

	// ─── Global Middleware ──────────────────────────────────────────
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} ${method} ${path} (${latency})\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// ─── Handlers ──────────────────────────────────────────────────
	authH := handler.NewAuthHandler(db, cfg.JWTSecret)
	articleH := handler.NewArticleHandler(db)
	customerH := handler.NewCustomerHandler(db)
	rfmH := handler.NewRFMHandler(db, cfg.MLServiceURL)
	uploadH := handler.NewUploadHandler()
	galleryH := handler.NewGalleryHandler(db)
	agendaH := handler.NewAgendaHandler(db)

	// ─── Static Routes ─────────────────────────────────────────────
	// Melayani folder "uploads" agar bisa diakses lewat browser
	app.Static("/uploads", "./uploads")

	// ─── Public Routes ─────────────────────────────────────────────
	api := app.Group("/api/v1")

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "Guru Batik API"})
	})

	// Artikel publik
	pub := api.Group("/articles")
	pub.Get("/", articleH.ListPublished)
	pub.Get("/categories", articleH.GetCategories)
	pub.Get("/:slug", articleH.GetBySlug)

	// Galeri & Agenda publik
	api.Get("/gallery", galleryH.List)
	api.Get("/agenda", agendaH.List)

	// ─── Admin Auth ─────────────────────────────────────────────────
	auth := api.Group("/admin/auth")
	auth.Post("/login", authH.Login)

	// ─── Protected Admin Routes ─────────────────────────────────────
	admin := api.Group("/admin", middleware.JWTProtected(cfg.JWTSecret))

	// Whoami & Profile Update
	admin.Get("/me", authH.Me)
	admin.Put("/me", authH.UpdateProfile)

	// Image Upload
	admin.Post("/upload", uploadH.UploadImage)

	// Manajemen artikel
	adminArticles := admin.Group("/articles")
	adminArticles.Get("/", articleH.AdminList)
	adminArticles.Post("/", articleH.Create)
	adminArticles.Get("/:id", articleH.GetOne)
	adminArticles.Put("/:id", articleH.Update)
	adminArticles.Delete("/:id", articleH.Delete)

	// Manajemen pelanggan
	adminCustomers := admin.Group("/customers")
	adminCustomers.Get("/", customerH.List)
	adminCustomers.Post("/", customerH.Create)
	adminCustomers.Get("/stats", customerH.Stats)
	adminCustomers.Post("/upload-csv", customerH.UploadCSV)
	adminCustomers.Get("/:id", customerH.GetOne)
	adminCustomers.Put("/:id", customerH.Update)
	adminCustomers.Delete("/:id", customerH.Delete)

	// Manajemen Galeri
	adminGallery := admin.Group("/gallery")
	adminGallery.Get("/", galleryH.List)
	adminGallery.Post("/", galleryH.Create)
	adminGallery.Get("/:id", galleryH.GetOne)
	adminGallery.Put("/:id", galleryH.Update)
	adminGallery.Delete("/:id", galleryH.Delete)

	// Manajemen Agenda
	adminAgenda := admin.Group("/agenda")
	adminAgenda.Get("/", agendaH.List)
	adminAgenda.Post("/", agendaH.Create)
	adminAgenda.Get("/:id", agendaH.GetOne)
	adminAgenda.Put("/:id", agendaH.Update)
	adminAgenda.Delete("/:id", agendaH.Delete)

	// Transaksi
	adminTx := admin.Group("/transactions")
	adminTx.Get("/", customerH.ListTransactions)
	adminTx.Post("/", customerH.AddTransaction)
	adminTx.Put("/:id", customerH.UpdateTransaction)

	// RFM & Clustering
	adminRFM := admin.Group("/rfm")
	adminRFM.Post("/calculate", rfmH.Calculate)
	adminRFM.Get("/results", rfmH.GetResults)
	adminRFM.Post("/kmeans", rfmH.RunKMeans)
	adminRFM.Get("/cluster-results", rfmH.GetClusterResults)

	// ─── Start Server ───────────────────────────────────────────────
	log.Printf("🚀 Guru Batik API running on :%s", cfg.Port)
	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

func errorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}
	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"message": err.Error(),
	})
}
