declare namespace WebNode {
  export type ClassType<T=any> = new(...args: Array<any>) => T
  
  export function Injectable<T extends ClassType>(t: T): T

  export class LDIProvider {
    public static get<T>(t: ClassType<T>): T 
    public static set<T>(t: ClassType<T>, instance: object): void
    public static destroy(): void
  }
}

export = WebNode



