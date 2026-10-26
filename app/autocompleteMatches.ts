
import { FileSystemNode } from "./types";
import { mockFileSystem} from "./types/mockFileSystem";

// simplify path 
export function normalizePath(path: string): string {
    const parts: string[] = [];

    for (const part of path.split("/")) {
        if (!part || part === ".") {
            continue;
        }

        if (part === "..") {
            parts.pop();
        } else {
            parts.push(part);
        }
    }

    return "/" + parts.join("/");
}

// get the current directory position
export function getDirectoryNode(
    path: string,
    fileSystem: FileSystemNode
): FileSystemNode | null {
    const normalizedPath = normalizePath(path);
    const parts = normalizedPath.split("/").filter(Boolean);

    let currentNode = fileSystem;

    for (const part of parts) {
        const child = currentNode.children?.find(
            (node) =>
                node.name === part &&
                node.type === "directory"
        );

        if (!child) {
            return null;
        }

        currentNode = child;
    }

    return currentNode;
}

export function getAutocompleteMatches(
    inputPath: string,
    currentDirectory = "/home",
    fileSystem: FileSystemNode = mockFileSystem
): string[] {

    const fragmentPath = inputPath.split(/\s+/).pop() ?? "";


    if (!fragmentPath) {
        return [];
    }

    // split into fragments
    const lastSlashIndex = fragmentPath.lastIndexOf("/");
    const fragment = fragmentPath.slice(lastSlashIndex + 1);

    let directoryPath: string;

    if (fragmentPath.startsWith("/")) {
        // absolute path
        directoryPath =
            lastSlashIndex === 0
                ? "/"
                : fragmentPath.slice(0, lastSlashIndex);

        console.log("INPUT PATH:", inputPath);
        console.log("FRAGMENT PATH:", fragmentPath);
        console.log("ABSOLUTE DIRECTORY PATH:", directoryPath);
        console.log("FRAGMENT:", fragment);
    } else {
        // realtive path
        const relativeParent =
            lastSlashIndex === -1
                ? ""
                : fragmentPath.slice(0, lastSlashIndex);

        directoryPath = normalizePath(
            relativeParent
                ? `${currentDirectory}/${relativeParent}`
                : currentDirectory
        );

        console.log("INPUT PATH:", inputPath);
        console.log("FRAGMENT PATH:", fragmentPath);
        console.log("RELATIVE DIRECTORY PATH:", directoryPath);
        console.log("FRAGMENT:", fragment);
    }

    const directory = getDirectoryNode(
        directoryPath,
        fileSystem
    );

    console.log("DIRECTORY NODE:", directory);
    console.log("CHILDREN:", directory?.children);

    if (!directory) {
        return [];
    }

    return (directory.children ?? [])
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
