"use client";

type VideoEmbedProps = {
  url: string;
  title?: string;
};

export default function VideoEmbed({ url, title }: VideoEmbedProps) {
  // Extract video ID and platform from URL
  const getEmbedUrl = (url: string): string | null => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Bilibili
    const bilibiliRegex = /bilibili\.com\/video\/(BV[\w]+)/;
    const bilibiliMatch = url.match(bilibiliRegex);
    if (bilibiliMatch) {
      return `https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}&high_quality=1`;
    }

    // Vimeo
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 text-center">
        <p className="text-gray-400 text-sm">
          Video URL not supported. <a href={url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">Watch on original platform →</a>
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      <iframe
        src={embedUrl}
        title={title || "Video"}
        className="absolute top-0 left-0 w-full h-full rounded-xl"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
