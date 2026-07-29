import { MetadataRoute } from "next";

export default function sitemap():MetadataRoute.Sitemap{

    return [
        {
            url: "",
            lastModified:new Date(),
            changeFrequency: "always",
            priority: 0.9
        }
    ]
}