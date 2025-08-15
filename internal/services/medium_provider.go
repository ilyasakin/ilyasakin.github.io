package services

import (
	"context"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/ilyasakin/ilyasakin.github.io/internal/models"
	"github.com/microcosm-cc/bluemonday"
	"github.com/mmcdole/gofeed"
)

type MediumProvider struct{}

func NewMediumProvider() *MediumProvider { return &MediumProvider{} }

func (p *MediumProvider) GetPosts(ctx context.Context) ([]*models.BlogPost, error) {
	parser := gofeed.NewParser()
	feed, err := parser.ParseURLWithContext("https://medium.com/feed/@ilyasakin", ctx)
	if err != nil {
		return nil, err
	}
	posts := make([]*models.BlogPost, 0, len(feed.Items))
	for _, it := range feed.Items {
		if it == nil {
			continue
		}
		content := it.Content
		if content == "" {
			content = it.Description
		}
		sanitized := sanitizeMediumHTML(content)
		preview := buildPreview(sanitized)
		posts = append(posts, &models.BlogPost{
			Title:   it.Title,
			Slug:    toKebabCase(it.Title),
			Link:    it.Link,
			PubDate: parsePubDate(it.PublishedParsed),
			Content: sanitized,
			Preview: preview,
			Source:  "medium",
		})
	}
	return posts, nil
}

func (p *MediumProvider) GetPost(ctx context.Context, slug string) (*models.BlogPost, error) {
	posts, err := p.GetPosts(ctx)
	if err != nil {
		return nil, err
	}
	for _, post := range posts {
		if post.Slug == slug {
			return post, nil
		}
	}
	return nil, nil
}

func parsePubDate(t *time.Time) time.Time {
	if t == nil {
		return time.Now()
	}
	return *t
}

func sanitizeMediumHTML(html string) string {
	// Remove tracking images
	re := regexp.MustCompile(`<img[^>]*post.clientViewed[^>]*>`)
	cleaned := re.ReplaceAllString(html, "")
	// Basic policy allowing common content tags
	policy := bluemonday.UGCPolicy()
	policy.AllowElements("figure", "figcaption")
	policy.AllowAttrs("src", "alt", "width", "height", "class").OnElements("img")
	return policy.Sanitize(cleaned)
}

func buildPreview(html string) string {
	// Work on a DOM to selectively remove figures and headers
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return ""
	}
	// Remove tracking images if any survived
	doc.Find("img").Each(func(_ int, s *goquery.Selection) {
		if src, exists := s.Attr("src"); exists && strings.Contains(src, "post.clientViewed") {
			s.Remove()
		}
	})
	// Remove figures and headers for preview text
	doc.Find("figure, h1, h2, h3, h4, h5, h6").Remove()
	text := strings.TrimSpace(doc.Text())
	if len(text) > 200 {
		text = text[:200] + "..."
	}
	return text
}

func toKebabCase(s string) string {
	s = strings.ToLower(s)
	s = strings.NewReplacer("(", " ", ")", " ").Replace(s)
	re := regexp.MustCompile(`[^a-z0-9]+`)
	s = re.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	return s
}
