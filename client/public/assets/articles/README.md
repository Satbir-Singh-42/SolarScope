# Article Images Assets

This folder contains local images for the Articles page to reduce external dependencies and improve loading performance.

## Image Categories

### Technology Category
- `technology-1.jpg` - Solar panel installation/maintenance (87KB)
- `technology-2.jpg` - Solar technology closeup (46KB) 
- `technology-3.jpg` - Solar panel installation (duplicate of technology-1.jpg)
- `technology-4.jpg` - Modern solar building integration (134KB)

### Market Category
- `market-1.jpg` - Solar installation/market scene (duplicate of technology-2.jpg)
- `market-2.jpg` - Community solar installation (73KB)

### Policy Category
- `policy-1.jpg` - Government building/policy related (94KB)

### Environment Category
- `environment-1.jpg` - Environmental/green energy scene (duplicate of technology-1.jpg)

## Usage

These images are referenced in the articles data with paths like:
```javascript
imageUrl: "/assets/articles/technology-1.jpg"
```

The images are served statically from the public folder and provide consistent visual representation for each article category. Duplicate images are used for articles of the same category to maintain visual consistency while reducing storage requirements.

## Source
Original images sourced from Unsplash with appropriate licensing for web use.