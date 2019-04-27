
export type ClassType<T=any> = new(...args: any[]) => T
export type ClassTypeDecorator<T=any> = (target: ClassType<T>) => ClassType<T>