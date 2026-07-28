package validator

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)

// Global validator instance
var Validate *validator.Validate

func init() {
	Validate = validator.New()
}

// Struct for custom validation error response
type ValidationErrorResponse struct {
	Field   string `json:"field"`
	Tag     string `json:"tag"`
	Message string `json:"message"`
}

// Convert validation errors to a more readable format
func ToValidationErrors(err error) []ValidationErrorResponse {
	var errors []ValidationErrorResponse
	for _, err := range err.(validator.ValidationErrors) {
		errors = append(errors, ValidationErrorResponse{
			Field:   err.Field(),
			Tag:     err.Tag(),
			Message: fmt.Sprintf("Field '%s' failed on the '%s' tag", err.Field(), err.Tag()), // Customizable message
		})
	}
	return errors
}
