# Marina Cozzolino - Portfolio Website

This is a modern portfolio website showcasing data science projects, blog posts, and professional information with a dynamic day/night theme system.

## Features

- **Day/Night Theme Toggle** - Dynamic theme switching with persistent user preference
- **Vanta.js Background** - Interactive animated background with hero logo overlay
- **Responsive Design** - Mobile-first approach with 3xN grid layouts
- **Medium Blog Integration** - Automatic fetching of latest articles
- **Project Portfolio** - Filterable project showcase
- **Modern CSS** - Clean, maintainable stylesheets without preprocessors

## Theme System

The website uses a dual-theme system with separate CSS files for day and night modes:

### Night Theme (`night.css`)
```css
/* Color Palette */
Background: #29212c (raisin-black)
Text: #b5a3a8 (light gray)
Accent Primary: #fa2c56 (folly red)
Accent Secondary: #f95141 (tomato)
Card Background: #513a44 (dark purple)
```

### Day Theme (`day.css`)  
```css
/* Color Palette */
Background: #365472 (slate blue dark)
Secondary Background: #3F5771 (slate blue light)
Text: #FFFFFF (white)
Accent Primary: #5B3B3D (muted maroon)
Accent Secondary: #C6B9BB (pale rose)
```

### Theme Toggle Implementation
- JavaScript-based theme switching with localStorage persistence
- Seamless CSS file swapping without page reload
- Sun/moon icon toggle in navigation bar
- Automatic theme preference detection

## Fonts

The site uses a modern, legible sans-serif font stack for all text and headings:

```
font-family: 'Avenir Next', 'Avenir', 'Segoe UI', 'Inter', system-ui, sans-serif;
```

- **Avenir Next** (and **Avenir**): Preferred for its geometric, professional look and excellent readability.
- **Segoe UI**: Common on Windows systems, provides a clean and modern appearance.
- **Inter**: Popular web font designed for UI clarity and legibility.
- **system-ui**: Uses the default system sans-serif font for the user's OS for best performance and native feel.
- **sans-serif**: Ensures a fallback to a generic sans-serif font if none of the above are available.

This stack ensures the site looks clean, modern, and readable on all platforms and devices.

## Built with

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Animation**: Vanta.js with Three.js for interactive backgrounds  
- **Hosting**: GitHub Pages
- **Architecture**: Static site with dynamic theming

## Live Site

Visit the live website at: https://marinacozzolino.github.io

---

*Last updated: January 2025* 