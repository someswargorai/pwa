import { useState, useEffect } from 'react';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';

interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  domain: string;
  url: string;
}

export default function LinkPreview({ url }: { url: string }) {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPreview() {
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPreview();
  }, [url]);

  if (error) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center gap-2 p-3 mt-2 rounded-xl bg-gray-50 border border-gray-100 text-blue-500 hover:bg-gray-100 transition-colors w-full"
      >
        <LinkIcon size={16} />
        <span className="truncate text-sm font-medium">{url}</span>
      </a>
    );
  }

  if (loading || !data) {
    return (
      <div className="w-full h-[120px] rounded-2xl bg-gray-50 border border-gray-100 mt-3 animate-pulse flex overflow-hidden">
        <div className="w-[120px] h-full bg-gray-200 shrink-0" />
        <div className="p-4 flex flex-col justify-center gap-2 flex-1">
          <div className="h-4 bg-gray-200 rounded-md w-3/4" />
          <div className="h-3 bg-gray-200 rounded-md w-1/2" />
          <div className="h-3 bg-gray-200 rounded-md w-1/4 mt-2" />
        </div>
      </div>
    );
  }

  return (
    <a 
      href={data.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group flex w-full h-[120px] rounded-2xl bg-white border border-gray-100 mt-3 overflow-hidden hover:shadow-md transition-all active:scale-[0.98]"
    >
      {/* Thumbnail */}
      {data.image ? (
        <div className="w-[120px] h-full bg-gray-100 shrink-0 relative overflow-hidden">
          <img 
            src={data.image} 
            alt={data.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="w-[120px] h-full bg-blue-50 shrink-0 flex items-center justify-center text-blue-300">
          <LinkIcon size={32} />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col justify-center flex-1 p-4 overflow-hidden">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">
          {data.title || data.domain}
        </h3>
        {data.description && (
          <p className="text-xs font-medium text-gray-500 line-clamp-2 mb-2 leading-relaxed">
            {data.description}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mt-auto uppercase tracking-wide">
          <ExternalLink size={12} />
          <span className="truncate">{data.domain}</span>
        </div>
      </div>
    </a>
  );
}
