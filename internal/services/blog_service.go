package services

import (
	"context"
	"sort"
	"sync"

	"github.com/ilyasakin/ilyasakin.github.io/internal/models"
)

type Provider interface {
	GetPosts(ctx context.Context) ([]*models.BlogPost, error)
	GetPost(ctx context.Context, slug string) (*models.BlogPost, error)
}

type BlogService struct {
	providers []Provider
	cache     struct {
		mu        sync.RWMutex
		posts     []*models.BlogPost
		populated bool
	}
}

func NewBlogService() *BlogService {
	return &BlogService{providers: []Provider{NewLocalProvider(), NewMediumProvider()}}
}

func (s *BlogService) GetAll(ctx context.Context) ([]*models.BlogPost, error) {
	s.cache.mu.RLock()
	if s.cache.populated && len(s.cache.posts) > 0 {
		posts := s.cache.posts
		s.cache.mu.RUnlock()
		return posts, nil
	}
	s.cache.mu.RUnlock()

	var (
		wg       sync.WaitGroup
		mu       sync.Mutex
		all      []*models.BlogPost
		firstErr error
	)
	wg.Add(len(s.providers))
	for _, p := range s.providers {
		provider := p
		go func() {
			defer wg.Done()
			posts, err := provider.GetPosts(ctx)
			if err != nil {
				if firstErr == nil {
					firstErr = err
				}
				return
			}
			mu.Lock()
			all = append(all, posts...)
			mu.Unlock()
		}()
	}
	wg.Wait()
	if firstErr != nil && len(all) == 0 {
		return nil, firstErr
	}
	sort.Slice(all, func(i, j int) bool { return all[i].PubDate.After(all[j].PubDate) })
	s.cache.mu.Lock()
	s.cache.posts = all
	s.cache.populated = true
	s.cache.mu.Unlock()
	return all, nil
}

func (s *BlogService) GetBySlug(ctx context.Context, slug string) (*models.BlogPost, error) {
	s.cache.mu.RLock()
	if s.cache.populated {
		for _, p := range s.cache.posts {
			if p != nil && p.Slug == slug {
				s.cache.mu.RUnlock()
				return p, nil
			}
		}
	}
	s.cache.mu.RUnlock()

	posts, err := s.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	for _, p := range posts {
		if p != nil && p.Slug == slug {
			return p, nil
		}
	}
	return nil, nil
}
