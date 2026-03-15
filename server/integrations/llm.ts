import { invokeLLM } from "../_core/llm";

/**
 * LLM Integration for Content Generation
 * Uses Manus built-in LLM to generate SEO-optimized descriptions and Pinterest captions
 */

interface ProductData {
  title: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  category?: string;
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
  inStock?: boolean;
}

/**
 * Generate SEO-optimized product description
 */
export async function generateProductDescription(product: ProductData): Promise<string> {
  try {
    const prompt = `Generate a compelling, SEO-optimized product description for an Amazon product.
    
Product Details:
- Title: ${product.title}
- Category: ${product.category || "General"}
- Price: ${product.price ? `$${product.price}` : "N/A"}
- Discount: ${product.discount ? `${product.discount}%` : "No discount"}
- Rating: ${product.rating ? `${product.rating}/5` : "Not rated"}
- Reviews: ${product.reviewCount || "No reviews"}
- Prime Eligible: ${product.isPrime ? "Yes" : "No"}
- In Stock: ${product.inStock ? "Yes" : "No"}

Original Description: ${product.description || "Not provided"}

Generate a 150-200 word description that:
1. Highlights key benefits and features
2. Includes relevant keywords for SEO
3. Emphasizes value and savings
4. Is engaging and persuasive
5. Mentions Prime eligibility if applicable

Return only the description text, no additional commentary.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert product copywriter specializing in creating compelling, SEO-optimized product descriptions for e-commerce.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    const description = typeof content === "string" ? content : "";
    return description.trim();
  } catch (error) {
    console.error("[LLM] Failed to generate product description:", error);
    return product.description || "";
  }
}

/**
 * Generate Pinterest caption optimized for engagement
 */
export async function generatePinterestCaption(product: ProductData): Promise<string> {
  try {
    const prompt = `Generate an engaging Pinterest caption for an affiliate product pin.
    
Product Details:
- Title: ${product.title}
- Price: ${product.price ? `$${product.price}` : "N/A"}
- Savings: ${product.discount ? `Save ${product.discount}%` : "Great deal"}
- Category: ${product.category || "General"}

Generate a Pinterest caption that:
1. Is 100-150 characters (optimal for Pinterest)
2. Includes relevant hashtags (3-5)
3. Creates urgency or highlights the deal
4. Uses power words like Save, Deal, Limited, Best
5. Encourages clicks and saves
6. Is engaging and conversational

Format: Caption text followed by hashtags

Return only the caption, no additional commentary.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a Pinterest marketing expert who creates viral, engaging captions that drive clicks and conversions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    const caption = typeof content === "string" ? content : "";
    return caption.trim();
  } catch (error) {
    console.error("[LLM] Failed to generate Pinterest caption:", error);
    return "Check out this amazing deal! #deals #shopping #affiliate";
  }
}

/**
 * Generate multiple caption variations for A/B testing
 */
export async function generateCaptionVariations(product: ProductData, count: number = 3): Promise<string[]> {
  try {
    const prompt = `Generate ${count} different Pinterest captions for the same product. Create variations with different angles and tones.
    
Product: ${product.title}
Price: ${product.price ? `$${product.price}` : "N/A"}
Discount: ${product.discount ? `${product.discount}%` : "No discount"}

For each caption:
1. Keep it 100-150 characters
2. Include relevant hashtags
3. Use different power words and angles
4. Vary the tone (urgent, informative, lifestyle, etc.)

Return ${count} captions, each on a new line, numbered 1-${count}.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a Pinterest marketing expert creating multiple high-performing captions for A/B testing.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    const contentStr = typeof content === "string" ? content : "";
    const captions = contentStr
      .split("\n")
      .filter((line: string) => line.trim())
      .map((line: string) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line: string) => line.length > 0);

    return captions.slice(0, count);
  } catch (error) {
    console.error("[LLM] Failed to generate caption variations:", error);
    return [];
  }
}

/**
 * Generate product tags for categorization
 */
export async function generateProductTags(product: ProductData): Promise<string[]> {
  try {
    const prompt = `Generate 5-10 relevant tags for this product for better categorization and search.
    
Product: ${product.title}
Category: ${product.category || "General"}
Description: ${product.description || "Not provided"}

Generate tags that:
1. Are relevant to the product
2. Are commonly searched
3. Help with SEO
4. Are single words or short phrases (1-2 words max)
5. Include the main category

Return tags as a comma-separated list.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert in product tagging and SEO optimization. You create tags that improve discoverability.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    const contentStr = typeof content === "string" ? content : "";
    const tags = contentStr
      .split(",")
      .map((tag: string) => tag.trim().toLowerCase())
      .filter((tag: string) => tag.length > 0 && tag.length < 50);

    return tags.slice(0, 10);
  } catch (error) {
    console.error("[LLM] Failed to generate tags:", error);
    return [product.category || "product"].filter((tag) => tag.length > 0);
  }
}

/**
 * Analyze product for deal worthiness
 */
export async function analyzeDealWorthiness(product: ProductData): Promise<{
  score: number;
  recommendation: string;
  reasons: string[];
}> {
  try {
    const prompt = `Analyze if this product is a good deal worth promoting on Pinterest.
    
Product: ${product.title}
Price: ${product.price ? `$${product.price}` : "N/A"}
Original Price: ${product.originalPrice ? `$${product.originalPrice}` : "N/A"}
Discount: ${product.discount ? `${product.discount}%` : "No discount"}
Rating: ${product.rating ? `${product.rating}/5` : "Not rated"}
Reviews: ${product.reviewCount || "No reviews"}

Provide:
1. A deal score from 0-100 (100 being the best deal)
2. A recommendation (Highly Recommended, Recommended, Not Recommended)
3. 2-3 reasons for the score

Format your response as JSON with keys: score, recommendation, reasons (array)`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert at evaluating product deals. You consider price, discount, ratings, and market value.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "deal_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: { type: "number", minimum: 0, maximum: 100 },
              recommendation: { type: "string" },
              reasons: { type: "array", items: { type: "string" } },
            },
            required: ["score", "recommendation", "reasons"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    const contentStr = typeof content === "string" ? content : "{}";
    const analysis = JSON.parse(contentStr);

    return {
      score: Math.min(100, Math.max(0, analysis.score || 0)),
      recommendation: analysis.recommendation || "Not Recommended",
      reasons: Array.isArray(analysis.reasons) ? analysis.reasons : [],
    };
  } catch (error) {
    console.error("[LLM] Failed to analyze deal:", error);
    return {
      score: 50,
      recommendation: "Neutral",
      reasons: ["Analysis unavailable"],
    };
  }
}
