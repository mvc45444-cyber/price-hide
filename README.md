# Hide Price When Out of Stock - Shopify App

A production-ready Shopify embedded app that automatically hides product prices when inventory reaches zero. Built with Remix, Polaris, App Bridge, and Theme App Extensions.

## Features

### Frontend (Storefront)
- Automatically hides prices when `product.available == false` or `inventory_quantity <= 0`
- Optionally hides Add to Cart button
- Shows customizable message (e.g., "Out of Stock", "Price on Request")
- Restores prices when products are back in stock
- Works across:
  - Product pages
  - Collection grid cards
  - Featured product sections
  - Quick view modals
- No page reload required (uses MutationObserver for dynamic content)

### Admin Features
- Polaris-based settings page with:
  - Toggle: Enable/Disable app
  - Checkbox: Hide Add to Cart button
  - Checkbox: Hide only when out of stock
  - Text field: Custom replacement message
  - Location toggles for each page type
- Settings persist to database
- Real-time save with feedback

### Theme Extension
- App Embed Block for easy theme integration
- JavaScript-based price detection and hiding
- Works with most Shopify themes
- Configurable via theme editor

## Project Structure

```
shopify-hide-price-app/
├── app/
│   ├── components/
│   │   ├── SettingsBlock.jsx      # Settings UI component
│   │   ├── SetupStepsBlock.jsx    # Setup wizard component
│   │   └── index.js               # Component exports
│   ├── models/
│   │   └── settings.server.js     # Database operations
│   ├── routes/
│   │   ├── app._index.jsx         # Main dashboard
│   │   ├── app.jsx                # App layout
│   │   ├── api.settings.jsx       # Settings API endpoint
│   │   ├── auth.$.jsx             # OAuth handler
│   │   ├── auth.login.jsx         # Login page
│   │   ├── webhooks.jsx           # Webhook handlers
│   │   └── _index.jsx             # Root redirect
│   ├── utils/
│   │   ├── appBridge.js           # App Bridge utilities
│   │   └── validation.js          # Input validation
│   ├── db.server.js               # Prisma client
│   ├── root.jsx                   # App root
│   └── shopify.server.js          # Shopify authentication
├── extensions/
│   └── hide-price-extension/
│       ├── assets/
│       │   └── hide-price.js      # Storefront script
│       ├── blocks/
│       │   └── app-embed.liquid   # Theme embed block
│       └── shopify.extension.toml # Extension config
├── prisma/
│   └── schema.prisma              # Database schema
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── shopify.app.toml              # Shopify app config
├── tsconfig.json                 # TypeScript config
└── vite.config.js                # Vite config
```

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Shopify Partner account
- Development store for testing

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd shopify-hide-price-app

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# SHOPIFY_API_KEY=your_api_key
# SHOPIFY_API_SECRET=your_api_secret
# SHOPIFY_APP_URL=https://your-app-url.com
# DATABASE_URL="file:./dev.db"
```

### Step 3: Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init
```

### Step 4: Link Shopify App

```bash
# Initialize Shopify CLI connection
npm run config:link

# Or create a new app
shopify app create
```

### Step 5: Start Development Server

```bash
npm run dev
```

This will:
1. Start the Remix development server
2. Create a tunnel for Shopify access
3. Open the app in your development store

### Step 6: Enable Theme Extension

1. Open your Shopify admin
2. Go to Online Store > Themes
3. Click "Customize" on your active theme
4. Click "App embeds" in the left sidebar
5. Toggle ON "Hide Price App"
6. Click "Save"

## Configuration Options

### Admin Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Enable App | Master on/off switch | ON |
| Hide Add to Cart | Also hide the purchase button | ON |
| Hide Only Out of Stock | Only hide when inventory = 0 | ON |
| Custom Message | Text shown instead of price | "Price on Request" |
| Product Pages | Apply to product detail pages | ON |
| Collection Pages | Apply to collection grids | ON |
| Featured Sections | Apply to homepage sections | ON |
| Quick View | Apply to quick view modals | ON |

### Theme Editor Settings

The app embed also provides settings in the theme editor for quick adjustments without opening the app.

## API Endpoints

### GET /api/settings
Returns current settings for a shop.

**Query Parameters:**
- `shop` (required): Shop domain

**Response:**
```json
{
  "success": true,
  "settings": {
    "enabled": true,
    "hideAddToCart": true,
    "hideOnlyOutOfStock": true,
    "customMessage": "Price on Request",
    "hideOnProductPage": true,
    "hideOnCollection": true,
    "hideOnFeatured": true,
    "hideOnQuickView": true
  }
}
```

## Webhooks

The app subscribes to:
- `APP_UNINSTALLED` - Cleans up shop data
- `PRODUCTS_UPDATE` - Notifies of product changes
- `INVENTORY_LEVELS_UPDATE` - Notifies of inventory changes

## Theme Compatibility

The storefront script uses flexible selectors to work with most themes:

### Supported Price Selectors
- `.price`, `.product-price`, `.product__price`
- `.money`, `.ProductPrice`
- `[data-price]`, `[data-product-price]`
- And many more...

### Supported Add to Cart Selectors
- `.product-form__submit`, `.add-to-cart`
- `button[type="submit"][name="add"]`
- `.shopify-payment-button`
- And many more...

## Customization

### Adding Theme Support

If your theme uses custom selectors, edit `hide-price.js`:

```javascript
const SELECTORS = {
  price: [
    // Add your custom selectors
    '.your-custom-price-class',
  ].join(', '),
  // ...
};
```

### Styling the Message

Override styles in your theme:

```css
.hide-price-message {
  font-weight: 600;
  color: #e53e3e;
  font-style: italic;
}
```

## Deployment

### Using Shopify CLI

```bash
npm run deploy
```

### Manual Deployment

1. Build the app: `npm run build`
2. Deploy to your hosting provider (Heroku, Railway, Render, etc.)
3. Update `SHOPIFY_APP_URL` in Shopify Partner Dashboard
4. Update OAuth redirect URLs

### Database for Production

For production, switch from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` to your PostgreSQL connection string

3. Run migrations: `npx prisma migrate deploy`

## Troubleshooting

### Prices not hiding
1. Check app is enabled in admin settings
2. Verify theme embed is activated
3. Check browser console for errors
4. Verify product is actually out of stock

### Settings not saving
1. Check database connection
2. Verify Prisma migrations ran
3. Check server logs for errors

### Theme embed not appearing
1. Refresh theme editor
2. Clear theme cache
3. Verify extension deployed: `shopify app deploy`

## Best Practices Used

- ✅ Separate fetchers per action
- ✅ No race conditions (proper state management)
- ✅ Correct useEffect guards
- ✅ App Bridge for theme editor redirect
- ✅ Proper Remix loaders/actions
- ✅ Clean component architecture
- ✅ Reusable utility functions
- ✅ MutationObserver for dynamic content
- ✅ Debounced DOM processing
- ✅ Proper cleanup on unmount

## License

MIT
