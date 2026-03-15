import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AmazonBot } from './amazon-bot.js';
import { PinterestBot } from './pinterest-bot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EliteFindsBot {
    constructor() {
        this.amazonBot = new AmazonBot();
        this.pinterestBot = new PinterestBot();
        this.productsFile = path.join(__dirname, '../products.json');
    }

    async run() {
        console.log('🤖 Elite 24 Finds Bot - Starting automation...');
        console.log(`⏰ Time: ${new Date().toISOString()}`);

        try {
            // Step 1: Search for Amazon deals
            console.log('\n📦 Step 1: Searching for Amazon deals...');
            const deals = await this.amazonBot.searchDeals();
            console.log(`✅ Found ${deals.length} deals`);

            if (deals.length === 0) {
                console.log('⚠️  No new deals found. Skipping update.');
                return;
            }

            // Step 2: Generate affiliate links
            console.log('\n🔗 Step 2: Generating affiliate links...');
            const productsWithAffiliateLinks = deals.map(deal => ({
                ...deal,
                affiliateUrl: this.amazonBot.generateAffiliateLink(deal.asin)
            }));
            console.log(`✅ Generated ${productsWithAffiliateLinks.length} affiliate links`);

            // Step 3: Update products.json
            console.log('\n💾 Step 3: Updating products.json...');
            await this.updateProductsFile(productsWithAffiliateLinks);
            console.log('✅ Products file updated');

            // Step 4: Post to Pinterest
            console.log('\n📌 Step 4: Posting to Pinterest...');
            const pinterestResults = await this.pinterestBot.postProducts(productsWithAffiliateLinks);
            console.log(`✅ Posted ${pinterestResults.success} products to Pinterest`);
            if (pinterestResults.failed > 0) {
                console.log(`⚠️  Failed to post ${pinterestResults.failed} products`);
            }

            console.log('\n✨ Automation completed successfully!');
            console.log(`📊 Summary: ${deals.length} deals found, ${pinterestResults.success} posted to Pinterest`);

        } catch (error) {
            console.error('❌ Error during automation:', error.message);
            process.exit(1);
        }
    }

    async updateProductsFile(products) {
        // Keep existing products and add new ones at the beginning
        let existingProducts = [];
        try {
            const data = fs.readFileSync(this.productsFile, 'utf8');
            existingProducts = JSON.parse(data);
        } catch (error) {
            console.log('📝 Creating new products file');
        }

        // Merge: new products first, then existing (limit to 50 total)
        const mergedProducts = [
            ...products,
            ...existingProducts
        ].slice(0, 50);

        // Update IDs
        const updatedProducts = mergedProducts.map((product, index) => ({
            ...product,
            id: index + 1
        }));

        fs.writeFileSync(
            this.productsFile,
            JSON.stringify(updatedProducts, null, 2),
            'utf8'
        );
    }
}

// Run the bot
const bot = new EliteFindsBot();
await bot.run();
