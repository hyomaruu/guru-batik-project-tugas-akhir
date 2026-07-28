package main

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"gurubatik-backend/internal/config"
	"gurubatik-backend/internal/model"
)

func main() {
	cfg := config.Load()
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to db: %v", err)
	}

	password := "admin123"
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	if err := db.Model(&model.AdminUser{}).Where("email = ?", "admin@gurubatik.id").Update("password", string(hash)).Error; err != nil {
		log.Fatalf("Failed to update password: %v", err)
	}

	fmt.Println("✅ Password admin@gurubatik.id berhasil direset ke: admin123")
}
