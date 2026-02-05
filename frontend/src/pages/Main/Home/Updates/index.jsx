import PlaceholderOne from "@/media/announcements/placeholder-1.png";
import PlaceholderTwo from "@/media/announcements/placeholder-2.png";
import PlaceholderThree from "@/media/announcements/placeholder-3.png";

// Static BOT_M announcements (no external fetch)
const BOT_M_NEWS = [
  {
    title: "Welcome to BOT_M",
    thumbnail_url: PlaceholderOne,
    short_description: "Your AI-powered chatbot platform. Train your bot with your own content!",
    source: "BOT_M",
    date: "2026",
    goto: "#",
  },
  {
    title: "Advanced Web Crawling",
    thumbnail_url: PlaceholderTwo,
    short_description: "Use Crawl4AI integration to scrape and index entire websites automatically.",
    source: "BOT_M",
    date: "2026",
    goto: "#",
  },
  {
    title: "Embed Anywhere",
    thumbnail_url: PlaceholderThree,
    short_description: "Generate embed widgets to add your chatbot to any website with one script tag.",
    source: "BOT_M",
    date: "2026",
    goto: "#",
  },
];

export default function Updates() {
  return (
    <div>
      <h1 className="text-theme-home-text uppercase text-sm font-semibold mb-4">
        BOT_M Features
      </h1>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BOT_M_NEWS.map((item, index) => (
          <AnnouncementCard
            key={index}
            thumbnail_url={item.thumbnail_url}
            title={item.title}
            subtitle={item.short_description}
            author={item.source}
            date={item.date}
            goto={item.goto}
          />
        ))}
      </div>
    </div>
  );
}

function AnnouncementCard({
  thumbnail_url = null,
  title = "",
  subtitle = "",
  author = "BOT_M",
  date = null,
  goto = "#",
}) {
  return (
    <a
      href={goto}
      className="block"
    >
      <div className="bg-theme-home-update-card-bg rounded-xl p-4 flex gap-x-4 hover:bg-theme-home-update-card-hover transition-colors">
        <img
          src={thumbnail_url}
          alt={title}
          loading="lazy"
          className="w-[80px] h-[80px] rounded-lg flex-shrink-0 object-cover"
        />
        <div className="flex flex-col gap-y-1">
          <h3 className="text-theme-home-text font-medium text-sm">{title}</h3>
          <p className="text-theme-home-text-secondary text-xs line-clamp-2">
            {subtitle}
          </p>
          <div className="flex items-center gap-x-4 text-xs text-theme-home-text-secondary">
            <span className="text-theme-home-update-source">{author}</span>
            <span>{date ?? "Recently"}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
