export enum Channel {
  GET_USER_SETTINGS = 'get-user-settings',
  GET_AUTOSTART_STATUS = 'get-autostart-task',
  ENABLE_AUTOSTART = 'enable-autostart',
  DISABLE_AUTOSTART = 'disable-autostart',
  SAVE_USER_SETTINGS = 'save-user-settings',
}

type ReplayChannel = { [K in Channel]: `${K}-reply` };
export const REPLY_BY_CHANNEL: ReplayChannel = Object.values(Channel).reduce((acc: any, key) => {
  acc[key] = `${key}-reply`;
  return acc;
}, {});

