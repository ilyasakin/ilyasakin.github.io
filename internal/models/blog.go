package models

import "time"

type BlogPost struct {
	Title   string
	Slug    string
	Link    string
	PubDate time.Time
	Content string
	Preview string
	Source  string
}
