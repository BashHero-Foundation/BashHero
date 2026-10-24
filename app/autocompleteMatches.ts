
import { FileSystemNode } from "./types";
import { mockFileSystem} from "./types/mockFileSystem";

export function getAutocompleteMatches(
    inputPath: string,
    fileSystem: FileSystemNode = mockFileSystem
): string[] {
    inputPath = inputPath.split(" ").pop() ?? "";

    // if not start with / then stop
    if (!inputPath.startsWith("/")) {
        return [];
    }

    // split into fragments
    const lastSlashIndex = inputPath.lastIndexOf("/");
    const directoryPath = inputPath.slice(0, lastSlashIndex + 1);
    const fragment = inputPath.slice(lastSlashIndex + 1);

    const directoryParts = directoryPath
        .split("/")
        .filter(Boolean);

    let currentNode = fileSystem;

    for (const part of directoryParts) {
        const child = currentNode.children?.find(
            (node) =>
                node.name === part &&
                node.type === "directory"
        );

        if (!child) {
            return [];
        }

        currentNode = child;
    }

    // find in actual directory only
    return (currentNode.children ?? [])
        .filter((node) => node.name.startsWith(fragment))
        .map((node) =>
            node.type === "directory"
                ? `${node.name}/`
                : node.name
        );
}


export function getPrefix(matches: string[]): string {
    if (matches.length === 0) {
        return "";
    }

    let prefix = matches[0];

    for (let i = 1; i < matches.length; i++) {
        while (!matches[i].startsWith(prefix)) {
            prefix = prefix.slice(0, -1);

            if (prefix.length === 0) {
                return "";
            }
        }
    }

    return prefix;
}
