export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || "fiction";

    const url = new URL("https://openlibrary.org/search.json");

    url.searchParams.set("q", query);
    url.searchParams.set(
      "fields",
      "key,title,author_name,cover_i,first_publish_year,ebook_access,has_fulltext"
    );
    url.searchParams.set("limit", "20");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Open Library request failed");
    }

    const data = await response.json();

    const books = data.docs.map((book) => ({
      id: book.key,
      title: book.title || "Unknown Title",
      author: book.author_name?.[0] || "Unknown Author",
      cover: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null,
      publishYear: book.first_publish_year || null,
      ebookAccess: book.ebook_access || "unknown",
      hasFulltext: book.has_fulltext || false,
    }));

    return Response.json(books);
  } catch (error) {
    console.error("External books error:", error);

    return Response.json(
      { error: "Failed to fetch external books" },
      { status: 500 }
    );
  }
}