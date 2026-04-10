import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RecipeResult {
  title: string;
  description: string;
  cook_time_minutes: number;
  difficulty: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  tip?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert chef and cooking companion. When given a cooking request, respond with a complete recipe as valid JSON only — no markdown, no code blocks, no extra text.

JSON structure:
{
  "title": "Recipe Name",
  "description": "Brief appetizing description in 1-2 sentences",
  "cook_time_minutes": 30,
  "difficulty": "easy",
  "tags": ["vegetarian", "quick"],
  "ingredients": ["1 cup flour", "2 large eggs"],
  "instructions": ["Preheat oven to 180°C.", "Mix all dry ingredients in a bowl."],
  "tip": "Optional helpful cooking tip"
}

Rules:
- difficulty must be one of: easy, medium, hard
- ingredients: 4-12 items with amounts
- instructions: 4-10 clear steps
- tags: 2-5 descriptive tags`,
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenAI error: ${errText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";

    let recipe: RecipeResult;
    try {
      recipe = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipe = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse recipe JSON from OpenAI response");
      }
    }

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
