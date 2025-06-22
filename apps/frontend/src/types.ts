import { ReactNode, FC } from 'react';
export interface FCC<T = {}> extends FC<T & { children?: ReactNode }> { }