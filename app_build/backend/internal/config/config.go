package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL  string
	JWTSecret    string
	MLServiceURL string
	Port         string
}

func Load() *Config {
	// Load .env jika ada (untuk dev lokal)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cfg := &Config{
		DatabaseURL:  getEnv("DATABASE_URL", "postgres://gurubatik:gurubatik_secret@localhost:5432/gurubatik?sslmode=disable"),
		JWTSecret:    getEnv("JWT_SECRET", "super_secret_jwt_key"),
		MLServiceURL: getEnv("ML_SERVICE_URL", "http://localhost:8000"),
		Port:         getEnv("PORT", "8080"),
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
