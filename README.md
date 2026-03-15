# Elite 24 Finds - Automated Amazon Deals Website

🚀 A fully automated website that displays Amazon deals with your affiliate links, updated daily by a bot that also posts to Pinterest.

## Features

✨ **Automated Product Updates** - Daily bot searches for Amazon deals and updates the website
💰 **Affiliate Link Generation** - All products include your Amazon Associate ID for affiliate commissions
📌 **Pinterest Integration** - Bot automatically posts new deals to Pinterest
🎨 **Responsive Design** - Beautiful, mobile-friendly website
🔍 **Search & Filter** - Visitors can search products and filter by category
⚡ **Fast & Lightweight** - Static website hosted on GitHub Pages
🤖 **GitHub Actions Automation** - Runs daily without any manual intervention

## Quick Start

### 1. Fork or Clone the Repository

```bash
git clone https://github.com/johnsmartaidoo/elite-24-finds.git
cd elite-24-finds
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your details:

```
AMAZON_ASSOCIATE_ID=homestore0ba-20
AMAZON_API_KEY=your_key_here
AMAZON_API_SECRET=your_secret_here
PINTEREST_ACCESS_TOKEN=your_token_here
PINTEREST_ACCOUNT_ID=homestore0315
PINTEREST_BOARD_ID=your_board_id_here
```

### 4. Run the Bot Locally (Optional)

```bash
npm run bot
```

### 5. Deploy to GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages** section
3. Set **Source** to `main` branch and `/root` directory
4. Your site will be available at `https://yourusername.github.io/elite-24-finds`

## How It Works

### Website (Static)
- **`index.html`** - Main website page
- **`styles.css`** - Responsive design
- **`app.js`** - Product display and filtering
- **`products.json`** - Product data (updated daily by bot)

### Bot (Automation)
- **`bot/index.js`** - Main bot orchestration
- **`bot/amazon-bot.js`** - Amazon deal search and affiliate link generation
- **`bot/pinterest-bot.js`** - Pinterest posting automation

### GitHub Actions
- **`.github/workflows/daily-bot.yml`** - Scheduled daily automation

## Daily Automation Flow

```
1. GitHub Actions triggers at 9 AM UTC
2. Bot searches for Amazon deals
3. Generates affiliate links with your Associate ID
4. Updates products.json with new deals
5. Posts top deals to Pinterest
6. Commits changes to GitHub
7. Website automatically displays new products
```

## Configuration

### Amazon Integration

To enable real Amazon deal searching:

1. Sign up for [Amazon Product Advertising API](https://advertising.amazon.com/API)
2. Get your Access Key ID and Secret Key
3. Add to `.env`:
   ```
   AMAZON_API_KEY=your_access_key
   AMAZON_API_SECRET=your_secret_key
   ```

### Pinterest Integration

To enable Pinterest posting:

1. Create a [Pinterest Developer App](https://developers.pinterest.com/)
2. Generate an access token
3. Create a board for your deals
4. Add to `.env`:
   ```
   PINTEREST_ACCESS_TOKEN=your_token
   PINTEREST_BOARD_ID=your_board_id
   ```

## GitHub Secrets Setup

For GitHub Actions to work, add these secrets to your repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `AMAZON_ASSOCIATE_ID`
   - `AMAZON_API_KEY`
   - `AMAZON_API_SECRET`
   - `PINTEREST_ACCESS_TOKEN`
   - `PINTEREST_ACCOUNT_ID`
   - `PINTEREST_BOARD_ID`

## Product Data Structure

Each product in `products.json` contains:

```json
{
  "id": 1,
  "asin": "B08EXAMPLE1",
  "title": "Product Title",
  "description": "Product description",
  "price": 29.99,
  "originalPrice": 79.99,
  "discount": 62,
  "category": "home",
  "imageUrl": "https://...",
  "affiliateUrl": "https://amazon.com/dp/B08EXAMPLE1?tag=homestore0ba-20",
  "rating": 4.5,
  "reviewCount": 1250,
  "inStock": true,
  "isPrime": true
}
```

## Customization

### Change Update Schedule

Edit `.github/workflows/daily-bot.yml`:

```yaml
schedule:
  - cron: '0 9 * * *'  # Change this cron expression
```

Common schedules:
- `0 9 * * *` - Daily at 9 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 1` - Weekly on Monday

### Modify Website Design

- Edit `styles.css` for colors and layout
- Edit `index.html` for structure
- Edit `app.js` for functionality

### Filter Deal Criteria

In `bot/amazon-bot.js`, modify the `filterDeals()` method:

```javascript
filterDeals(deals, {
  minDiscount: 20,      // Minimum discount percentage
  maxPrice: 500,        // Maximum price
  minRating: 4.0,       // Minimum rating
  category: 'home',     // Specific category
  inStockOnly: true     // Only in-stock items
})
```

## Troubleshooting

### Bot not running
- Check GitHub Actions logs: **Actions** tab in your repository
- Verify all secrets are configured correctly
- Ensure `products.json` exists

### Website not showing products
- Check that `products.json` is valid JSON
- Verify GitHub Pages is enabled in Settings
- Clear browser cache and reload

### Pinterest posts not working
- Verify access token is valid and not expired
- Check that board ID is correct
- Ensure Pinterest API permissions are granted

## Monetization Tips

1. **Optimize Product Selection** - Focus on high-discount items
2. **SEO Optimization** - Use keywords in product titles and descriptions
3. **Social Sharing** - Encourage Pinterest and social media sharing
4. **Email List** - Consider adding email signup for deal notifications
5. **Content Marketing** - Write blog posts about best deals

## Legal & Disclaimers

- Ensure you comply with Amazon Associates Program policies
- Add affiliate disclosure to your website
- Don't mislead users about product information
- Respect Pinterest's terms of service

## Support & Updates

For issues or feature requests:
1. Check existing GitHub Issues
2. Create a new Issue with details
3. Include error messages and steps to reproduce

## License

MIT License - Feel free to use and modify for your own projects

## Disclaimer

This tool is provided as-is. Ensure you comply with:
- Amazon Associates Program Agreement
- Pinterest Terms of Service
- Local laws and regulations regarding affiliate marketing

---

**Made with ❤️ by Elite 24 Finds**

Happy selling! 🚀
