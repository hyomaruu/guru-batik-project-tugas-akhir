package main

import (
	"fmt"
	"log"

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

	var users []model.AdminUser
	if err := db.Find(&users).Error; err != nil {
		log.Fatalf("Failed to query: %v", err)
	}

	fmt.Printf("Ditemukan %d admin_users di database:\n", len(users))
	for _, u := range users {
		fmt.Printf("- Email: %s\n  Password Hash: %s\n", u.Email, u.Password)
	}
}
