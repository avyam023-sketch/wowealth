# Wowealth Website

## Files for Netlify Deployment

### HTML Pages:
- `index.html` - Home page with contact form
- `contact.html` - Contact page with form
- `services.html` - Services page
- `about.html` - About page
- `why-us.html` - Why Us page

### Assets:
- `assets/` - Video files and thumbnails
- `Wowealth logo.png` - Logo file
- `hero section image.png` - Hero image
- `contact us hero image.png` - Contact page hero
- `co founder 1.jpg`, `co founder 2.jpg`, `co founder image 3.jpg` - Founder images
- `wowealth hero video.mp4` - Hero video

### Google Apps Script:
- `google-apps-script.js` - Script for Google Sheets integration (not needed for Netlify, but keep for reference)

## Deployment

1. Upload entire folder to Netlify
2. All files are ready for deployment
3. Forms are configured to submit to Google Sheets

## Important Notes

- Make sure Google Apps Script is updated and deployed separately
- Forms use POST method to submit data
- Google Script URL is configured in `index.html` and `contact.html`



