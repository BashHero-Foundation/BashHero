declare module 'pipwerks-scorm-api-wrapper' {
  export const SCORM: {
    version: string;
    init(): boolean;
    get(parameter: string): string;
    set(parameter: string, value: string): boolean;
    save(): boolean;
    quit(): boolean;
    connection: {
      isActive: boolean;
    };
  };
}