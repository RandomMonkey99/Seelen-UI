import { path } from '@tauri-apps/api';
import { exists, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import yaml from 'js-yaml';

import { isRealPinned } from './app';

import { App, RootState, SpecialItemType } from './domain';

export interface YamlWeg {
  left: App[];
  center: App[];
  right: App[];
}

export const savePinnedItems = async (state: RootState): Promise<void> => {
  const cb = (acc: App[], app: App) => {
    if (isRealPinned(app)) {
      acc.push({
        type: SpecialItemType.PinnedApp,
        icon: app.icon,
        exe: app.exe,
        execution_path: app.execution_path,
        title: app.title,
      });
    }
    return acc;
  };

  const data: YamlWeg = {
    left: state.pinnedOnLeft.reduce(cb, []),
    center: state.pinnedOnCenter.reduce(cb, []),
    right: state.pinnedOnRight.reduce(cb, []),
  };

  const yaml_route = await path.join(await path.homeDir(), '.config/komorebi-ui/seelenweg_items.yaml');
  await writeTextFile(yaml_route, yaml.dump(data));
};

export const loadPinnedItems = async (): Promise<YamlWeg> => {
  const yaml_route = await path.join(await path.homeDir(), '.config/komorebi-ui/seelenweg_items.yaml');

  if (!(await exists(yaml_route))) {
    return {
      left: [],
      center: [],
      right: [],
    };
  }

  const yaml_data: any = yaml.load(await readTextFile(yaml_route));
  const data: YamlWeg = {
    left: yaml_data?.left || [],
    center: yaml_data?.center || [],
    right: yaml_data?.right || [],
  };
  return data;
};