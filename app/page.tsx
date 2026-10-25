"use client";
import { useEffect, useState } from "react";
import { Chapter, Level, NavigateFn } from "./types";
import { TypingView } from "@/components/TypingView";
import StartView from "@/components/StartView";
import { navigateToFn, navigateToUrl } from "./scorm/scorm_utils";
import { StatsPageContent } from "@/components/StatsPageContent";
import Loading from "./loading";
import { stat } from "node:fs/promises";
import { GlobalStatsContent } from "@/components/GlobalStatsContent";

export default function Home() {
    const [levels, setLevels] = useState<Level[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
    const [statsPage, setStatsPage] = useState<boolean>(false);

    useEffect(() => {
        async function loadAllLevels() {
            setLoading(true);

            const manifestResponse = await fetch(`./levels_manifest.json`);
            const levelsPaths: string[] = await manifestResponse.json();

            const chapterData: Chapter[] = await Promise.all(
                levelsPaths.map(async (path) => {
                    const response = await fetch(path);
                    return response.json();
                }),
            );

            setChapters(chapterData);

            const allLevels = chapterData.flatMap((chapter) => chapter.levels);
            setLevels(allLevels);

            setLoading(false);
        }

        loadAllLevels();
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace("#", "");
            const params = new URLSearchParams(hash);
            const levelId = params.get("levelId");
            const statsPage = params.get("statsPage");

            setSelectedLevelId(levelId);
            if (statsPage !== null && statsPage === "true") {
                setStatsPage(true);
            } else {
                setStatsPage(false);
            }
        };

        handleHashChange();

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    const currentLevel = levels.find((t) => t.id === selectedLevelId);

    const navigateFn: NavigateFn = {
        setLevelIdFn: setSelectedLevelId,
        setStatsPageFn: setStatsPage,
    };

    if (loading) {
        return <Loading />;
    }

    if (selectedLevelId === null && statsPage) {
        return <GlobalStatsContent chapters={chapters} navigateFn={navigateFn} />;
    }

    if (selectedLevelId && currentLevel) {
        if (statsPage) {
            return (
                <StatsPageContent
                    level={currentLevel}
                    chapters={chapters}
                    navigateFn={navigateFn}
                />
            );
        } else {
            return (
                <TypingView
                    level={currentLevel}
                    nextLevelId="2"
                    chapters={chapters}
                    navigateFn={navigateFn}
                />
            );
        }
    } else {
        return (
            <div>
                <StartView firstLevelId={"1"} navigateFn={navigateFn} />
                <ul>
                    {chapters.map((chapter) => (
                        <li key={chapter.chapterId}>{chapter.chapterTitle}</li>
                    ))}
                </ul>
            </div>
        );
    }
}
