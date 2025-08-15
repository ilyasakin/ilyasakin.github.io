package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/ilyasakin/ilyasakin.github.io/internal/handlers"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	mux := http.NewServeMux()

	// Static files: serve styles, js, and assets
	root := mustGetWd()
	staticDir := filepath.Join(root, "static")
	assetsDir := filepath.Join(root, "assets")

	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir(staticDir))))
	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir(assetsDir))))

	h := handlers.New()

	mux.HandleFunc("/", h.Home)
	mux.HandleFunc("/hx/blog", h.HXBlogList)
	mux.HandleFunc("/blog/", h.BlogPost)

	log.Printf("listening on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}

func mustGetWd() string {
	wd, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	return wd
}
