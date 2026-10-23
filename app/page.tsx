"use client";
import { useEffect, useState } from "react";

interface Level {
    id: string;
    title: string;
}

interface Chapter {
    chapterId: string;
    levels: Level[];
}

export default function Home() {
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

    useEffect(() => {
        fetch(`./chapter1.json`)
            .then((res) => res.json())
            .then((data: Chapter) => {
                setLevels(data.levels);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace("#", "");
            setSelectedLevelId(hash || null);
        };

        handleHashChange();

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    const navigateTo = (id: string | null) => {
        const url = id ? `#${id}` : window.location.pathname;
        window.history.pushState(null, "", url);
        setSelectedLevelId(id);
    };

    const currentLevel = levels.find((t) => t.id === selectedLevelId);

    if (loading) {
        return (
            <div>
                <p>loading levels</p>
            </div>
        );
    }

    return (
        <div>
            {selectedLevelId && currentLevel ? (
                <div>
                    <p>you are on {currentLevel.title}</p>
                    <button onClick={() => navigateTo(null)}>back</button>
                </div>
            ) : (
                <ul>
                    {levels.map((level) => (
                        <li key={level.id}>
                            <a
                                href={`#${level.id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigateTo(level.id);
                                }}
                            >
                                {level.title}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
