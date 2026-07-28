package model

import (
	"time"
)

type Article struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Title       string     `gorm:"not null" json:"title"`
	Slug        string     `gorm:"uniqueIndex;not null" json:"slug"`
	Content     string     `gorm:"type:text;not null" json:"content"`
	Excerpt     string     `json:"excerpt"`
	Category    string     `gorm:"default:Umum" json:"category"`
	Thumbnail   string     `json:"thumbnail"`
	IsPublished bool       `gorm:"default:false" json:"is_published"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (Article) TableName() string { return "articles" }

// ─── Request / Response DTOs ─────────────────────────────────────────

type CreateArticleRequest struct {
	Title       string `json:"title" validate:"required,min=3,max=255"`
	Content     string `json:"content" validate:"required"`
	Excerpt     string `json:"excerpt"`
	Category    string `json:"category"`
	Thumbnail   string `json:"thumbnail"`
	IsPublished bool   `json:"is_published"`
}

type UpdateArticleRequest struct {
	Title       string `json:"title"`
	Content     string `json:"content"`
	Excerpt     string `json:"excerpt"`
	Category    string `json:"category"`
	Thumbnail   string `json:"thumbnail"`
	IsPublished *bool  `json:"is_published"`
}

type ArticleListResponse struct {
	Data       []Article `json:"data"`
	Total      int64     `json:"total"`
	Page       int       `json:"page"`
	Limit      int       `json:"limit"`
	TotalPages int       `json:"total_pages"`
}
