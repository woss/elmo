export interface ILink {
    title: string;
    url: string;
}
interface IUser {
    email: string;
    permissions: string[];
}
export interface IWorkspace {
    name: string;
    sharedWith: IUser[];
}
export interface ICollection {
    title: string;
    links: number[];
    workspaceIndexes: number[];
}
