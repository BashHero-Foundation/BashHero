
import { FileSystemNode } from "./types";
import { mockFileSystem, homeDirectory} from "./types/mockFileSystem";
import { commands } from "./commandOptions";

// simplify path 
export function normalizePath(path: string): string {
    const expandedPath =
            // ~ is alias for /home/student
        path === "~"
            ? homeDirectory
            : path.startsWith("~/")
                ? homeDirectory + "/" + path.slice(2)
                : path;


    const parts: string[] = [];

    for (const part of expandedPath.split("/")) {
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



// PATHS
export function getAutocompleteMatches(
    inputPath: string,
    currentDirectory = homeDirectory,
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

    if (fragmentPath.startsWith("/") || fragmentPath.startsWith("~/")) {
        // absolute path
        directoryPath = normalizePath(
            fragmentPath.slice(0, lastSlashIndex)
        );

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
    }

    const directory = getDirectoryNode(
        directoryPath,
        fileSystem
    );

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

// COMMANDS
export function getCommandMatches(input: string): string[] {
    return commands.filter(command =>
        command.startsWith(input)
    );
}

// check is it a pipe or sudo prefix in a command
export function getCommandContext(text: string) {
    const lastPipeIndex = text.lastIndexOf("|");

    // text after last pipe
    const segment = text.slice(lastPipeIndex + 1).trimStart();
    const words = segment.split(/\s+/);

    // ignore sudo prefix
    const commandIndex = words[0] === "sudo" ? 1 : 0;

    const commandName = words[commandIndex] ?? "";
    // check is it still a command 
    const isCommand = words.length === commandIndex + 1;

    return { isCommand, commandName };
}
