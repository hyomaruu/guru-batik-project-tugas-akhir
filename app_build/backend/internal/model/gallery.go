package model

import (
	"time"
)

type Gallery struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Category  string    `gorm:"not null" json:"category"`
	Alt       string    `json:"alt"`
	Caption   string    `json:"caption"`
	Src       string    `gorm:"not null" json:"src"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Gallery) TableName() string { return "galleries" }

type CreateGalleryRequest struct {
	Category string `json:"category" validate:"required"`
	Alt      string `json:"alt"`
	Caption  string `json:"caption"`
	Src      string `json:"src" validate:"required"`
}

type UpdateGalleryRequest struct {
	Category string `json:"category"`
	Alt      string `json:"alt"`
	Caption  string `json:"caption"`
	Src      string `json:"src"`
}
