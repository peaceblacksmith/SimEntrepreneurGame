# Project Transfer Guide - KALGIRISIMCILIK Design

## What You Need to Transfer This Design

### 1. Files to Copy
- `design-template.tsx` - Reusable component template
- `design-extraction.md` - Complete design documentation

### 2. Required Dependencies
Install these packages in your new project:
```bash
npm install react react-dom typescript tailwindcss
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

For shadcn/ui components (recommended):
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card
```

### 3. Font Setup
Add to your HTML head or CSS:
```html
<link href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=Inter:wght@400;600&display=swap" rel="stylesheet">
```

### 4. Tailwind Configuration
Ensure your `tailwind.config.js` includes:
```js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'bowlby': ['Bowlby One', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'dark': '#1b1b1b',
        'cream': '#e3dfd6',
        'lime': '#cae304',
        'purple': '#aa95c7',
      }
    },
  },
  plugins: [],
}
```

### 5. Asset Requirements
You'll need to provide your own:
- Logo/brand graphics
- Hero image (1306x776px recommended)
- Social media icons (SVG format recommended)
- Contact information graphics or text

### 6. How to Use the Template

#### Basic Usage:
```tsx
import { DesignTemplate } from './design-template';

export const MyLandingPage = () => {
  return (
    <DesignTemplate
      brandName="MY COMPANY"
      navLabel="ABOUT"
      ctaText="GET STARTED"
      heroText="MY AMAZING\nPRODUCT"
      quoteText="Customer testimonial goes here"
      heroImage="/assets/my-hero-image.png"
      contactInfo={
        <div className="text-right text-black">
          <div>hello@mycompany.com</div>
          <div>support@mycompany.com</div>
        </div>
      }
      socialLinks={[
        {
          icon: "/assets/twitter-icon.svg",
          handle: "@mycompany",
          alt: "Twitter"
        },
        {
          icon: "/assets/instagram-icon.svg",
          handle: "@mycompany_official",
          alt: "Instagram"
        }
      ]}
    />
  );
};
```

#### Custom Colors:
```tsx
<DesignTemplate
  // ... other props
  colorScheme={{
    background: '#0f172a',    // Dark blue instead of charcoal
    textPrimary: '#f1f5f9',  // Light slate
    accent: '#10b981',       // Emerald green
    button: '#8b5cf6'        // Purple
  }}
/>
```

### 7. Responsive Considerations
The current design is fixed-width (1440px). For responsive design:
1. Replace fixed widths with responsive units
2. Use CSS Grid or Flexbox for layout
3. Add media queries for mobile/tablet breakpoints
4. Consider using `container mx-auto` instead of fixed positioning

### 8. Animation Opportunities
Consider adding:
- Fade-in animations for sections
- Hover effects on buttons and social icons  
- Parallax scrolling for hero section
- Loading animations for images

### 9. SEO Improvements
- Add proper meta tags
- Use semantic HTML elements
- Include alt text for all images
- Add structured data markup

This template preserves the exact visual design while making it easily customizable for your new project. The bold typography, dark theme, and impactful layout will work well for gaming, tech, or entrepreneurship brands.