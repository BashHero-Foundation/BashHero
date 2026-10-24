import { FileSystemNode } from "../types";

export const mockFileSystem: FileSystemNode = {
    name: "/",
    type: "directory",
    children: [
        {
            name: "home",
            type: "directory",
            children: [
                {
                    name: "project",
                    type: "directory",
                    children: [
                        {
                            name: "app",
                            type: "directory",
                            children: [],
                        },
                        {
                            name: "README.md",
                            type: "file",
                        },
                        {
                            name: "package.json",
                            type: "file",
                        },
                    ],
                },
                {
                    name: "projects",
                    type: "directory",
                    children: [],
                },
            ],
        },
        {
            name: "logs",
            type: "directory",
            children: [
                {
                    name: "app.log",
                    type: "file",
                },
                {
                    name: "error.log",
                    type: "file",
                },
            ],
        },
        {
            name: "etc",
            type: "directory",
            children: [],
        },
        {
            name: "host",
            type: "directory",
            children: [],
        },
    ],
};