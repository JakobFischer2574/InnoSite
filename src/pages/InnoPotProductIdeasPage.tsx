import { useEffect, useMemo, useState } from "react";

type Idea = {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    tag: string;
    hidden?: boolean;
};

export default function InnoPotProductIdeasPage() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [description, setDescription] = useState("");
    const [tag, setTag] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        loadIdeas();
    }, []);

    async function loadIdeas() {
        try {
            setLoading(true);
            const response = await fetch("/api/ideas");

            if (!response.ok) {
                throw new Error("Ideen konnten nicht geladen werden.");
            }

            const data: Idea[] = await response.json();
            setIdeas(data);
        } catch (error) {
            console.error(error);
            setMessage("Fehler beim Laden der Ideen.");
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setTitle("");
        setSubtitle("");
        setDescription("");
        setTag("");
        setSelectedFile(null);

        const fileInput = document.getElementById("idea-image") as HTMLInputElement | null;
        if (fileInput) {
            fileInput.value = "";
        }
    }

    async function addIdea() {
        if (!title.trim() || !subtitle.trim() || !description.trim() || !tag.trim() || !selectedFile) {
            setMessage("Bitte fülle alle Felder aus und wähle ein Bild.");
            return;
        }

        try {
            setSaving(true);
            setMessage("");

            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("subtitle", subtitle.trim());
            formData.append("description", description.trim());
            formData.append("tag", tag.trim());
            formData.append("image", selectedFile);

            const response = await fetch("/api/ideas", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Idee konnte nicht gespeichert werden.");
            }

            const createdIdea: Idea = await response.json();
            setIdeas((prev) => [...prev, createdIdea]);
            resetForm();
            setMessage("Idee erfolgreich hinzugefügt.");
        } catch (error) {
            console.error(error);
            setMessage(error instanceof Error ? error.message : "Unbekannter Fehler.");
        } finally {
            setSaving(false);
        }
    }

    async function hideIdea(id: number) {
        try {
            const response = await fetch(`/api/ideas/${id}/hide`, {
                method: "PATCH",
            });

            if (!response.ok) {
                throw new Error("Idee konnte nicht ausgeblendet werden.");
            }

            setIdeas((prev) =>
                prev.map((idea) => (idea.id === id ? { ...idea, hidden: true } : idea)),
            );
        } catch (error) {
            console.error(error);
            setMessage("Fehler beim Ausblenden der Idee.");
        }
    }

    async function showIdea(id: number) {
        try {
            const response = await fetch(`/api/ideas/${id}/show`, {
                method: "PATCH",
            });

            if (!response.ok) {
                throw new Error("Idee konnte nicht eingeblendet werden.");
            }

            setIdeas((prev) =>
                prev.map((idea) => (idea.id === id ? { ...idea, hidden: false } : idea)),
            );
        } catch (error) {
            console.error(error);
            setMessage("Fehler beim Einblenden der Idee.");
        }
    }

    const visibleIdeas = useMemo(() => ideas.filter((idea) => !idea.hidden), [ideas]);
    const hiddenIdeas = useMemo(() => ideas.filter((idea) => idea.hidden), [ideas]);

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900">
            <header className="relative overflow-hidden border-b border-zinc-200 bg-white">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-700/10 via-transparent to-pink-500/10" />
                <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10">
                    <div className="mb-4 inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-4 py-1 text-sm font-medium text-pink-700">
                        InnoSite
                    </div>

                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                            Innovative Ideen vom InnoPot
                        </h1>
                        <p className="mt-4 text-lg leading-8 text-zinc-600">
                            Willkommen auf der InnoSite – dem digitalen Ideengarten des InnoPot.
                            Hier sammeln wir kreative, leicht verrückte und manchmal überraschend gute Ideen, wie wir als Studierendengruppe vielleicht eines Tages reich werden könnten.
                            Ob geniale Innovation oder glorreich gescheiterte Geschäftsidee – alles beginnt hier mit einer Kachel.
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold">Aktuelle Ideen und Konzepte</h2>
                    <p className="mt-1 text-zinc-600">
                        Hier findest du eine Auswahl an innovativen Ideen, die im InnoPot entstanden
                        sind. Jede Idee zielt darauf ab, sehr reich zu werden.
                    </p>
                </div>

                {message ? (
                    <div className="mb-6 rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-800">
                        {message}
                    </div>
                ) : null}

                {loading ? (
                    <p className="text-zinc-600">Ideen werden geladen ...</p>
                ) : (
                    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleIdeas.map((idea) => (
                            <article
                                key={idea.id}
                                className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative h-52 overflow-hidden bg-zinc-100">
                                    <img
                                        src={idea.image}
                                        alt={idea.title}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute left-4 top-4 rounded-full bg-pink-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                                        {idea.tag}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-pink-700">{idea.subtitle}</p>
                                            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                                                {idea.title}
                                            </h3>
                                        </div>

                                        <button
                                            onClick={() => hideIdea(idea.id)}
                                            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-pink-300 hover:text-pink-700"
                                        >
                                            Ausblenden
                                        </button>
                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-zinc-600">
                                        {idea.description}
                                    </p>
                                </div>
                            </article>
                        ))}

                        <article className="rounded-3xl border-2 border-dashed border-pink-300 bg-white p-6 shadow-sm">
                            <div className="flex h-full flex-col">
                                <div>
                                    <div className="inline-flex rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
                                        Neue Idee
                                    </div>
                                    <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                                        Idee hinzufügen
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                                        Füge hier eine neue Produktidee hinzu. Der Title muss mit Inno beginnen.
                                    </p>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Titel"
                                        className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-pink-400"
                                    />

                                    <input
                                        value={subtitle}
                                        onChange={(e) => setSubtitle(e.target.value)}
                                        placeholder="Untertitel"
                                        className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-pink-400"
                                    />

                                    <input
                                        value={tag}
                                        onChange={(e) => setTag(e.target.value)}
                                        placeholder="Kategorie / Tag"
                                        className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-pink-400"
                                    />

                                    <input
                                        id="idea-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                                        className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-pink-700"
                                    />

                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Beschreibung"
                                        rows={5}
                                        className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-pink-400"
                                    />
                                </div>

                                <div className="mt-5">
                                    <button
                                        onClick={addIdea}
                                        disabled={saving}
                                        className="rounded-2xl bg-pink-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? "Wird gespeichert ..." : "Idee hinzufügen"}
                                    </button>
                                </div>
                            </div>
                        </article>
                    </section>
                )}

                <section className="mt-12 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Ausgeblendete Ideen</h2>
                            <p className="mt-1 text-zinc-600">
                                Hier kannst du ausgeblendete Ideen wieder sichtbar machen.
                            </p>
                        </div>

                        <div className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
                            {hiddenIdeas.length} ausgeblendet
                        </div>
                    </div>

                    {hiddenIdeas.length === 0 ? (
                        <p className="mt-6 text-zinc-500">Aktuell sind keine Ideen ausgeblendet.</p>
                    ) : (
                        <div className="mt-6 space-y-4">
                            {hiddenIdeas.map((idea) => (
                                <div
                                    key={idea.id}
                                    className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-4 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={idea.image}
                                            alt={idea.title}
                                            className="h-16 w-16 rounded-2xl object-cover"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-pink-700">{idea.subtitle}</p>
                                            <h3 className="text-lg font-semibold">{idea.title}</h3>
                                            <p className="text-sm text-zinc-600">{idea.tag}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => showIdea(idea.id)}
                                        className="rounded-2xl bg-pink-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-700"
                                    >
                                        Wieder einblenden
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}