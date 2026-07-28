package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	dsn := "postgres://gurubatik:gurubatik_secret@localhost:5432/gurubatik?sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	tables, err := db.Migrator().GetTables()
	if err != nil {
		log.Fatalf("failed to get tables: %v", err)
	}

	f, err := os.Create("isi_database.md")
	if err != nil {
		log.Fatalf("failed to create file: %v", err)
	}
	defer f.Close()

	f.WriteString("# Isi Database Saat Ini\n\nBerikut adalah data yang ada di dalam database PostgreSQL Anda saat ini.\n\n")

	for _, table := range tables {
		f.WriteString(fmt.Sprintf("## Tabel: `%s`\n\n", table))

		var results []map[string]interface{}
		// batasi maksimal 50 baris per tabel agar tidak hang
		db.Table(table).Limit(50).Find(&results)

		if len(results) == 0 {
			f.WriteString("*Tidak ada data pada tabel ini.*\n\n")
			continue
		}

		// Get column names
		cols := []string{}
		for k := range results[0] {
			cols = append(cols, k)
		}

		// Write table header
		f.WriteString("| " + strings.Join(cols, " | ") + " |\n")
		f.WriteString("|")
		for range cols {
			f.WriteString("---|")
		}
		f.WriteString("\n")

		// Write rows
		for _, row := range results {
			f.WriteString("|")
			for _, c := range cols {
				val := fmt.Sprintf("%v", row[c])
				val = strings.ReplaceAll(val, "\n", " ")
				val = strings.ReplaceAll(val, "|", "\\|")
				// Truncate long text
				if len(val) > 50 {
					val = val[:47] + "..."
				}
				f.WriteString(fmt.Sprintf(" %s |", val))
			}
			f.WriteString("\n")
		}
		
		var count int64
		db.Table(table).Count(&count)
		if count > 50 {
			f.WriteString(fmt.Sprintf("\n*(Menampilkan 50 dari total %d baris)*\n", count))
		}
		f.WriteString("\n")
	}

	fmt.Println("Sukses membuat isi_database.md")
}
