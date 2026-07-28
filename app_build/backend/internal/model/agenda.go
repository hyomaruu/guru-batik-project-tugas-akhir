package model

import (
	"time"
)

type Agenda struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Day         string    `json:"day"`
	Date        string    `json:"date"`
	Time        string    `json:"time"`
	EndTime     string    `json:"end_time"`
	Title       string    `gorm:"not null" json:"title"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	ImageURL    string    `json:"image_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Agenda) TableName() string { return "agendas" }

type CreateAgendaRequest struct {
	Day         string `json:"day"`
	Date        string `json:"date"`
	Time        string `json:"time"`
	EndTime     string `json:"end_time"`
	Title       string `json:"title" validate:"required"`
	Category    string `json:"category"`
	Description string `json:"description"`
	Location    string `json:"location"`
	ImageURL    string `json:"image_url"`
}

type UpdateAgendaRequest struct {
	Day         string `json:"day"`
	Date        string `json:"date"`
	Time        string `json:"time"`
	EndTime     string `json:"end_time"`
	Title       string `json:"title"`
	Category    string `json:"category"`
	Description string `json:"description"`
	Location    string `json:"location"`
	ImageURL    string `json:"image_url"`
}
