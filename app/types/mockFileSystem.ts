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
                    name: "studia",
                    type: "directory",
                    children: [
                        {
                            name: "programowanie_obiektowe",
                            type: "directory",
                            children: [],
                        },
                        {
                            name: "projekt_zaliczeniowy",
                            type: "directory",
                            children: [
                                {
                                    name: "docs",
                                    type: "directory",
                                    children: [
                                        {
                                            name: "instrukcja.txt",
                                            type: "file",
                                        }
                                    ],
                                },
                                {
                                    name: "README.md",
                                    type: "file",
                                }
                            ],
                        },
                        {
                            name: "projektowanie_ui",
                            type: "directory",
                            children: [],
                        },
                        
                    ],
                },
                {
                    name: "student_wmi",
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
            name: "lib32",
            type: "directory",
            children: [],
        },
        {
            name: "host",
            type: "directory",
            children: [],
        },
        {
            name: "scroop",
            type: "directory",
            children: [],
        },
    ],
};