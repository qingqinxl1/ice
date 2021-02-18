import * as path from 'path';
import * as fs from 'fs-extra';
import { IEntry, IRoute } from './types';

export default (
  route: IRoute,
  rootDir: string
) => {
  const entries:IEntry[] = [];
  const { name, source, pageHeader, frames } = route;
  if (name || source) {
    const entry = getEntry(route, rootDir);
    entry && entries.push(entry);
  }

  if (frames) {
    frames.forEach(frame => {
      const entry = getEntry(frame, rootDir);
      entry && entries.push(entry);
    });
  }

  if (pageHeader) {
    const entry = getEntry(pageHeader, rootDir);
    entry && entries.push(entry);
  }

  return entries;
};

function getEntry(route: IRoute, rootDir): IEntry | void {
  const { source, name, pageSource } = route;
  let entryName: string;
  if (name) {
    entryName = name;
  } else if (source) {
    const dir = path.dirname(source);
    entryName = path.parse(dir).name.toLocaleLowerCase();
  }

  if (entryName) {
    return {
      ...route,
      entryName,
      entryPath: pageSource || getEntryPath(rootDir, source),
    };
  }
}

function getEntryPath(rootDir, source) {
  const absolutePath = path.resolve(rootDir, 'src', source);
  const targetExt = ['ts', 'tsx', 'js', 'jsx'].find(ext => fs.existsSync(`${absolutePath}.${ext}`));
  if (!targetExt) {
    throw new Error(`Cannot find target file ${absolutePath}.`);
  }
  return `${absolutePath}.${targetExt}`;
}
