package services

import (
	"context"

	"github.com/ilyasakin/ilyasakin.github.io/internal/models"
)

type LocalProvider struct{}

func NewLocalProvider() *LocalProvider { return &LocalProvider{} }

func (p *LocalProvider) GetPosts(ctx context.Context) ([]*models.BlogPost, error) {
	return []*models.BlogPost{}, nil
}

func (p *LocalProvider) GetPost(ctx context.Context, slug string) (*models.BlogPost, error) {
	return nil, nil
}
