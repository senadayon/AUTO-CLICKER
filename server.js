const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, "public")));

function decodeXML(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim();

  if (!q || q.length > 200) {
    return res.status(400).json({
      error: "検索ワードを入力してください"
    });
  }

  try {
    const url =
      "https://www.bing.com/search?format=rss&q=" +
      encodeURIComponent(q);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      throw new Error("Bing search unavailable");
    }

    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const results = items.slice(0, 15).map(match => {
      const item = match[1];

      const getTag = tag => {
        const found = item.match(
          new RegExp("<" + tag + ">([\\\\s\\\\S]*?)</" + tag + ">")
        );
        return found ? decodeXML(found[1].trim()) : "";
      };

      return {
        title: getTag("title"),
        url: getTag("link"),
        description: getTag("description")
      };
    }).filter(item => {
      try {
        const u = new URL(item.url);
        return ["http:", "https:"].includes(u.protocol);
      } catch {
        return false;
      }
    });

    res.json({ results });
  } catch (error) {
    res.status(502).json({
      error: "検索結果を取得できませんでした。Bingを直接開いて試してください。"
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("AUTO CLICKER 起動: " + PORT);
});
