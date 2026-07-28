package main

import (
	"fmt"
	"io/ioutil"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"gurubatik-backend/internal/config"
)

func main() {
	cfg := config.Load()
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to db: %v", err)
	}

	// Read and execute schema
	schema, err := ioutil.ReadFile("../../migrations/001_schema.sql")
	if err != nil {
		log.Fatalf("Failed to read schema: %v", err)
	}
	if err := db.Exec(string(schema)).Error; err != nil {
		log.Fatalf("Failed to execute schema: %v", err)
	}
	fmt.Println("✅ Schema created")

	// Read and execute seed
	seed, err := ioutil.ReadFile("../../migrations/002_seed.sql")
	if err != nil {
		log.Fatalf("Failed to read seed: %v", err)
	}
	if err := db.Exec(string(seed)).Error; err != nil {
		log.Fatalf("Failed to execute seed: %v", err)
	}
	fmt.Println("✅ Data seeded")
}
