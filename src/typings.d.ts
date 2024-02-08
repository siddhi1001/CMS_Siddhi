// so the typescript compiler doesn't complain about the global config object
declare var CSConfig: any;

declare module "*.json" {
    const value: any;
    export default value;
}

