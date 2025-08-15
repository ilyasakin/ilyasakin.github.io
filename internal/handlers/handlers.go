package handlers

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/ilyasakin/ilyasakin.github.io/internal/services"
)

type Handlers struct {
	svc      *services.BlogService
	baseTmpl *template.Template
}

func New() *Handlers {
	funcMap := template.FuncMap{
		"humanize": humanizeTime,
		"safeHTML": func(s string) template.HTML { return template.HTML(s) },
	}
	base := template.Must(template.New("base").Funcs(funcMap).ParseFiles(
		filepath.Join("internal", "templates", "layout.html"),
		filepath.Join("internal", "templates", "home.html"),
		filepath.Join("internal", "templates", "blog_list.html"),
		filepath.Join("internal", "templates", "blog_post.html"),
	))
	return &Handlers{svc: services.NewBlogService(), baseTmpl: base}
}

func (h *Handlers) Home(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	// HTMX partial render
	if r.Header.Get("HX-Request") == "true" {
		if err := h.baseTmpl.ExecuteTemplate(w, "home.html", map[string]any{}); err != nil {
			log.Println("render home (hx):", err)
		}
		return
	}
	if err := h.baseTmpl.ExecuteTemplate(w, "layout.html", map[string]any{"Page": "home"}); err != nil {
		log.Println("render home:", err)
	}
}

func (h *Handlers) HXBlogList(w http.ResponseWriter, r *http.Request) {
	posts, err := h.svc.GetAll(r.Context())
	if err != nil {
		http.Error(w, "failed to load posts", http.StatusInternalServerError)
		return
	}
	if err := h.baseTmpl.ExecuteTemplate(w, "blog_list.html", map[string]any{
		"Posts": posts,
	}); err != nil {
		log.Println("render blog list:", err)
	}
}

func (h *Handlers) BlogPost(w http.ResponseWriter, r *http.Request) {
	slug := strings.TrimPrefix(r.URL.Path, "/blog/")
	if slug == "" || strings.Contains(slug, "/") {
		http.NotFound(w, r)
		return
	}
	post, err := h.svc.GetBySlug(r.Context(), slug)
	if err != nil {
		http.Error(w, "failed to load post", http.StatusInternalServerError)
		return
	}
	if post == nil {
		http.NotFound(w, r)
		return
	}
	// If it's an HTMX request, only render the inner content to avoid flicker
	if r.Header.Get("HX-Request") == "true" {
		if err := h.baseTmpl.ExecuteTemplate(w, "blog_post.html", map[string]any{
			"Post": post,
		}); err != nil {
			log.Println("render post (hx):", err)
		}
		return
	}
	if err := h.baseTmpl.ExecuteTemplate(w, "layout.html", map[string]any{
		"Page": "post",
		"Post": post,
	}); err != nil {
		log.Println("render post:", err)
	}
}

func humanizeTime(t time.Time) string {
	d := time.Since(t)
	if d < time.Minute {
		return "just now"
	}
	if d < time.Hour {
		m := int(d.Minutes())
		if m == 1 {
			return "a minute ago"
		}
		return fmt.Sprintf("%d %s ago", m, pluralize(m, "minute"))
	}
	if d < 24*time.Hour {
		h := int(d.Hours())
		if h == 1 {
			return "an hour ago"
		}
		return fmt.Sprintf("%d %s ago", h, pluralize(h, "hour"))
	}
	if d < 30*24*time.Hour {
		days := int(d.Hours() / 24)
		if days == 1 {
			return "a day ago"
		}
		return fmt.Sprintf("%d %s ago", days, pluralize(days, "day"))
	}
	if d < 365*24*time.Hour {
		months := int(d.Hours() / (24 * 30))
		if months == 1 {
			return "a month ago"
		}
		return fmt.Sprintf("%d %s ago", months, pluralize(months, "month"))
	}
	years := int(d.Hours() / (24 * 365))
	if years == 1 {
		return "a year ago"
	}
	return fmt.Sprintf("%d %s ago", years, pluralize(years, "year"))
}

func pluralize(n int, unit string) string {
	if n == 1 {
		return unit
	}
	return unit + "s"
}
