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
                            children: [
                                {name: "zadanie1-opis.doc", type: "file"},
                                {name: "zadanie2-opis.doc", type: "file"},
                                {name: "zadanie3-opis.doc", type: "file"},
                                {name: "Zadania.rar", type: "file"}
                            ],
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
            name: "var",
            type: "directory",
            children: [
                {
                    name: "log",
                    type: "directory",
                    children: [
                        { name: "app.log", type: "file" },
                        { name: "error.log", type: "file" },
                        { name: "auth.log", type: "file" },
                        {
                            name: "network",
                            type: "directory",
                            children: [
                                {
                                    name: "interfaces",
                                    type: "directory",
                                    children: [],
                                },
                            ]
                        },  
                        {
                            name: "nginx",
                            type: "directory",
                            children: [
                                {
                                    name: "archive",
                                    type: "directory",
                                    children: [
                                        {name: "error.log.1",type: "file"},
                                        {name: "errors_packed.tar", type:"file"}
                                    ]
                                },   
                                { name: "archive_app.log",type: "file"},          
                            ]
                        },      
                        {
                            name: "neuro",
                            type: "directory",
                            children: []
                        },                    
                    ],
                },

            ]
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
                        {name: "modules.dep",type: "file"},
                        {name: "modules.alias",type: "file"},
                        {
                            name: "drivers",
                            type: "directory",
                            children: [
                                {name: "display.ko",type: "file"},
                                {name: "display_old.ko",type: "file"},
                            ],
                        },
                        {
                            name: "druoffice",
                            type: "directory",
                            children: []
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
            name: "Downloads",
            type: "directory",
            children: [
                {name: "image1.png", type: "file"},
                { name: "big_file.parquet",type: "file" },     
                { name: "big_file.hdf5", type: "file"}, 
                { name: "bigger_file.tar", type: "file"},          
                { name: "big_file.hdf5", type: "file"},
                { name: "bigLinux.iso", type: "file"},
                { name: "big_film.mov", type: "file"},                                        
            ],
        },
        {
            name: "usr",
            type: "directory",
            children: [
                {
                    name: "local",
                    type: "directory",
                    children: [
                        {
                            name: "bin",
                            type: "directory",
                            children: [],
                        }, 
                        {
                            name: "share",
                            type: "directory",
                            children: [

                            ],
                        },   
                        {
                            name: "ssh",
                            type: "directory",
                            children: [
                                { name: "id_rsa", type: "file"},     
                                { name: "id_rsa.pub", type: "file"}, 
                                { name: "config", type: "file"}, 
                            ],
                        },                                                 
                    ],
                },
                {
                    name: "bin",
                    type: "directory",
                    children: [],
                },     
                      
            ],
        },        
        {
            name: "host",
            type: "directory",
            children: [],
        },
        {
            name: "etc",
            type: "directory",
            children: [
                {
                    name: "nginx",
                    type: "directory",
                    children: [
                        { name: "access.log",type: "file"},
                        { name: "app_proxy.conf", type: "file"},
                        { name: "nginx.conf", type: "file"},                        
                    ],
                }, 
            ],
        },
    ],
};