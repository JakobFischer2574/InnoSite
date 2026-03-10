import { Hono } from "hono";
import { cors } from "hono/cors";
import { promises as fs } from "node:fs";
import * as path from "node:path";

type Idea = {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    tag: string;
    hidden?: boolean;
};

const app = new Hono();

app.use("/api/*", cors());

const ideasFile = path.resolve("data/ideas.json");
const imagesDir = path.resolve("public/images");

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function readIdeas(): Promise<Idea[]> {
    try {
        const raw = await fs.readFile(ideasFile, "utf-8");
        return JSON.parse(raw) as Idea[];
    } catch {
        return [];
    }
}

async function writeIdeas(ideas: Idea[]) {
    await fs.mkdir(path.dirname(ideasFile), { recursive: true });
    await fs.writeFile(ideasFile, JSON.stringify(ideas, null, 2), "utf-8");
}

app.get("/api/ideas", async (c) => {
    const ideas = await readIdeas();
    return c.json(ideas);
});

app.post("/api/ideas", async (c) => {
    const body = await c.req.parseBody();

    const title = body.title;
    const subtitle = body.subtitle;
    const description = body.description;
    const tag = body.tag;
    const file = body.image;

    if (
        typeof title !== "string" ||
        typeof subtitle !== "string" ||
        typeof description !== "string" ||
        typeof tag !== "string" ||
        !(file instanceof File)
    ) {
        return c.json({ message: "Ungültige Eingaben." }, 400);
    }

    const ext =
        file.name.split(".").pop()?.toLowerCase() ||
        (file.type === "image/png" ? "png" : "jpg");

    const fileName = `${slugify(title)}.${ext}`;
    const filePath = path.join(imagesDir, fileName);

    await fs.mkdir(imagesDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    const ideas = await readIdeas();

    const newIdea: Idea = {
        id: Date.now(),
        title,
        subtitle,
        description,
        tag,
        image: `/images/${fileName}`,
        hidden: false,
    };

    ideas.push(newIdea);
    await writeIdeas(ideas);

    return c.json(newIdea, 201);
});

app.patch("/api/ideas/:id/hide", async (c) => {
    const id = Number(c.req.param("id"));
    const ideas = await readIdeas();

    const updated = ideas.map((idea) =>
        idea.id === id ? { ...idea, hidden: true } : idea
    );

    await writeIdeas(updated);
    return c.json({ ok: true });
});

app.patch("/api/ideas/:id/show", async (c) => {
    const id = Number(c.req.param("id"));
    const ideas = await readIdeas();

    const updated = ideas.map((idea) =>
        idea.id === id ? { ...idea, hidden: false } : idea
    );

    await writeIdeas(updated);
    return c.json({ ok: true });
});

export default app;