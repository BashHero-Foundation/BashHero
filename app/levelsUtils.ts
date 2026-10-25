import chapter1 from "../public/levels/chapter1.json";
import chapter2 from "../public/levels/chapter2.json";
import chapter3 from "../public/levels/chapter3.json";
import chapter4 from "../public/levels/chapter4.json";
import chapter5 from "../public/levels/chapter5.json";

export const chapters = [chapter1, chapter2, chapter3, chapter4, chapter5];
export const allLevels = chapters.flatMap(chapter => chapter.levels);
