import { searchAmazonProducts, generateAffiliateLink } from "../integrations/amazon";
import { createPin } from "../integrations/pinterest";
import { generateProductDescription, generatePinterestCaption, generateProductTags } from "../integrations/llm";
import * as db from "../db";
import { notifyOwner } from "../_core/notification";
import { ENV } from "../_core/env";

export interface AutomationResult {
  success: boolean;
  logId: number;
  productsFound: number;
  productsPosted: number;
  errors: string[];
}

export async function runAmazonSearchAutomation(): Promise<AutomationResult> {
  const logId = (await db.createAutomationLog({
    automationType: "amazon_search",
    status: "started",
    message: "Amazon search automation started",
  }) as any).insertId;

  const errors: string[] = [];
  let productsFound = 0;
  let productsPosted = 0;

  try {
    // Search for deals on Amazon
    const deals = await searchAmazonProducts({
      keywords: "home deals",
      category: "home",
      minDiscount: 20,
    });

    productsFound = deals.length || 0;

    // Process each deal
    for (const deal of deals) {
      try {
        // Generate content using LLM
        const [description, caption, tags] = await Promise.all([
          generateProductDescription(deal as any),
          generatePinterestCaption(deal as any),
          generateProductTags(deal as any),
        ]);

        // Create product record
        const productData: any = {
          asin: deal.asin,
          title: deal.title,
          description,
          price: deal.price,
          originalPrice: deal.originalPrice,
          discount: deal.discount || 0,
          productUrl: deal.productUrl,
          imageUrl: deal.imageUrl,
          category: deal.category || "home",
          rating: deal.rating,
          reviewCount: deal.reviewCount,
          isPrime: deal.isPrime,
          inStock: deal.inStock,
          seoDescription: description,
          pinterestCaption: caption,
          tags,
          source: "automated",
        };
        const product = await db.createProduct(productData);

        const productId = (product as any).insertId;

        // Generate affiliate link
        const affiliateUrl = generateAffiliateLink(deal.asin, ENV.amazonAssociateId);
        const affiliateLink = await db.createAffiliateLink({
          productId,
          associateId: ENV.amazonAssociateId,
          affiliateUrl,
        });

        const affiliateLinkId = (affiliateLink as any).insertId;

        // Create Pinterest post
        const post = await db.createPinterestPost({
          productId,
          affiliateLinkId,
          title: deal.title,
          description: caption,
          imageUrl: deal.imageUrl,
          status: "scheduled",
          scheduledAt: new Date(Date.now() + 3600000), // Schedule for 1 hour from now
        });

        productsPosted++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to process ${deal.title}: ${errorMsg}`);
      }
    }

    // Update log
    await db.updateAutomationLog(logId, {
      status: "completed",
      productsFound,
      productsPosted,
      errorCount: errors.length,
      errorDetails: errors.map((e) => ({ message: e })) as any,
      executionTime: Math.floor(Date.now() / 1000),
      message: `Found ${productsFound} deals, posted ${productsPosted} to Pinterest`,
    });

    // Notify owner
    await notifyOwner({
      title: "Amazon Search Automation Completed",
      content: `Found ${productsFound} deals and posted ${productsPosted} to Pinterest. Errors: ${errors.length}`,
    });

    return {
      success: true,
      logId,
      productsFound,
      productsPosted,
      errors,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    errors.push(errorMsg);

    await db.updateAutomationLog(logId, {
      status: "failed",
      productsFound,
      productsPosted,
      errorCount: errors.length,
      errorDetails: errors.map((e) => ({ message: e })) as any,
      executionTime: Math.floor(Date.now() / 1000),
      message: `Automation failed: ${errorMsg}`,
    });

    await notifyOwner({
      title: "Amazon Search Automation Failed",
      content: `Error: ${errorMsg}`,
    });

    return {
      success: false,
      logId,
      productsFound,
      productsPosted,
      errors,
    };
  }
}

export async function runPinterestPostAutomation(): Promise<AutomationResult> {
  const logId = (await db.createAutomationLog({
    automationType: "pinterest_post",
    status: "started",
    message: "Pinterest post automation started",
  }) as any).insertId;

  const errors: string[] = [];
  let productsFound = 0;
  let productsPosted = 0;

  try {
    // Get scheduled posts
    const posts = await db.getPinterestPosts(100, 0, "scheduled");
    productsFound = posts.length;

    // Post each scheduled item
    for (const post of posts) {
      try {
        const result = await createPin({
          title: post.title,
          description: post.description || "",
          imageUrl: post.imageUrl || "https://via.placeholder.com/1000x1500",
          link: post.pinUrl || "",
        });

        if (result) {
          await db.updatePinterestPost(post.id, {
            status: "posted",
            postedAt: new Date(),
            pinId: result.pinId,
            pinUrl: result.url,
          });
          productsPosted++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to post ${post.title}: ${errorMsg}`);

        await db.updatePinterestPost(post.id, {
          status: "failed",
          errorMessage: errorMsg,
        });
      }
    }

    // Update log
    await db.updateAutomationLog(logId, {
      status: "completed",
      productsFound,
      productsPosted,
      errorCount: errors.length,
      errorDetails: errors.map((e) => ({ message: e })) as any,
      executionTime: Math.floor(Date.now() / 1000),
      message: `Posted ${productsPosted} of ${productsFound} scheduled posts`,
    });

    await notifyOwner({
      title: "Pinterest Post Automation Completed",
      content: `Posted ${productsPosted} of ${productsFound} scheduled posts. Errors: ${errors.length}`,
    });

    return {
      success: true,
      logId,
      productsFound,
      productsPosted,
      errors,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    errors.push(errorMsg);

    await db.updateAutomationLog(logId, {
      status: "failed",
      productsFound,
      productsPosted,
      errorCount: errors.length,
      errorDetails: errors.map((e) => ({ message: e })) as any,
      executionTime: Math.floor(Date.now() / 1000),
      message: `Automation failed: ${errorMsg}`,
    });

    await notifyOwner({
      title: "Pinterest Post Automation Failed",
      content: `Error: ${errorMsg}`,
    });

    return {
      success: false,
      logId,
      productsFound,
      productsPosted,
      errors,
    };
  }
}
