---
category: doc
tags: [tutorial, textalic]
---

## Install & Configuration

### Set up jekyll

Before anything, make sure you have set up jekyll correctly. See [the official jekyll doc](https://jekyllrb.com/docs/).

### Clone this repo

Clone this repo into to your local machine, then `cd` to the root directory of your local copy. Here is an overview of the project's file structure:

```console
jekyll-theme-textalic
├── 404.html                    # 404 page
├── Gemfile
├── LICENCE
├── _config.yml                 # Main config
├── _data
│   └── me.yml                  # Personal info config
├── _demo_series                # A demo series, add series into series folder
│   └── demo_series_post_1.md
├── _includes
├── _layouts
├── _posts
│   └── 2019-12-25-Intro.md     # Add new post here
├── _sass
├── about                       # About page
├── assets                      # images, fonts, css, js...
│   ├── img
│   │   ├── me.png              # Replace with your own, showed in /about page
├── favicon.ico                 # Replace with your own
├── feed.xml
├── index.html
├── resume
│   └── index.md                # You may write your resume here. linked in /about page
├── search.json
├── series
└── tag
```

### Install gems

Run the following to install required gems defined in `Gemfile`:

```
$ bundle install
```

### Customization

Edit `_config.yml` and `_data/me.yml` to tweek the site configuration to your need. See corresponding file's comments for details.

You also should replace the `/favicon.ico` and `/assets/img/me.png` file with your own.

### Run locally

Run `bundle exec serve --watch` to run it locally.