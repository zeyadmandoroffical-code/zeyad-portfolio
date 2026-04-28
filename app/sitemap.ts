import { supabase } from "@/utils/supabase";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://zeyad-portfolio-taupe.vercel.app";

  // Fetch all published articles
  const { data: articles } = await supabase
    .from("articles")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const articleRoutes: MetadataRoute.Sitemap = (articles || []).map((a) => ({
    url: `${siteUrl}/articles/${a.id}`,
    lastModified: new Date(a.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...articleRoutes,
  ];
}
