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
                                },
                                {
                                    name: "Realms.mc",
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
            children: [
                {
                    name: "libc.so.6",
                    type: "file",
                },
                {
                    name: "libm.so.6",
                    type: "file",
                },
                {
                    name: "modules",
                    type: "directory",
                    children: [
                        {
                            name: "drivers",
                            type: "directory",
                            children: [
                                {
                                    name: "display.ko",
                                    type: "file",
                                },
                            ],
                        },
                        {
                            name: "druoffice",
                            type: "directory",
                        },
                        {
                            name: "modules.dep",
                            type: "file",
                        },
                    ],
                },
                {
                    name: "security",
                    type: "directory",
                    children: [
                        {
                            name: "pam_unix.so",
                            type: "file",
                        },
                        {
                            name: "pam_unix_v2.so",
                            type: "file",
                        },
                        {
                            name: "pam_pam_pam.al4",
                            type: "file",
                        },
                        {
                            name: "p.pam",
                            type: "file",
                        },
                    ],
                },
            ],
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