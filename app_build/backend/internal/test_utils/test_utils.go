package test_utils

import (
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// MockGormDB struct to embed *gorm.DB and add mock capabilities
type MockGormDB struct {
	*gorm.DB
	Mock sqlmock.Sqlmock
}

// Helper function to create a new mock DB for testing
func NewMockDB(t *testing.T) (*MockGormDB, func()) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)

	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{})
	assert.NoError(t, err)

	return &MockGormDB{DB: gormDB, Mock: mock}, func() {
		db.Close()
	}
}
