import chapter1 from "./levels/chapter1.json";
import chapter2 from "./levels/chapter2.json";
import chapter3 from "./levels/chapter3.json";
import chapter4 from "./levels/chapter4.json";
import chapter5 from "./levels/chapter5.json";

export const chapters = [chapter1, chapter2, chapter3, chapter4, chapter5];
export const alllevels = chapters.flatMap(chapter => chapter.levels);
