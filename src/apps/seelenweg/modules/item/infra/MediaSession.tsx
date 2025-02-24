import { SeelenWegSide } from '@seelen-ui/lib';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { resolve, resourceDir } from '@tauri-apps/api/path';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { calcLuminance } from '../../../../toolbar/modules/media/application';
import { Selectors } from '../../shared/store/app';
import { cx } from 'src/apps/shared/styles';

import { MediaWegItem } from '../../shared/store/domain';

import { FileIcon, Icon } from '../../../../shared/components/Icon';
import { WithContextMenu } from '../../../components/WithContextMenu';
import { DraggableItem } from './DraggableItem';
import { getMenuForItem } from './Menu';

import './MediaSession.css';

const MAX_LUMINANCE = 210;
const MIN_LUMINANCE = 40;
const BRIGHTNESS_MULTIPLIER = 1.5; // used in css

const DEFAULT_THUMBNAIL = await resolve(
  await resourceDir(),
  'static',
  'icons',
  'music_thumbnail.jpg',
);

export function MediaSession({ item, drag }: { item: MediaWegItem; drag: boolean }) {
  const [luminance, setLuminance] = useState(0);

  const dockPosition = useSelector(Selectors.settings.position);
  const sessions = useSelector(Selectors.mediaSessions);
  const session = sessions.find((s) => s.default);

  let thumbnailSrc = convertFileSrc(session?.thumbnail ? session.thumbnail : DEFAULT_THUMBNAIL);

  const { t } = useTranslation();

  useEffect(() => {
    calcLuminance(thumbnailSrc).then(setLuminance).catch(console.error);
  }, [thumbnailSrc]);

  const filteredLuminance = Math.max(
    Math.min(luminance * BRIGHTNESS_MULTIPLIER, MAX_LUMINANCE),
    MIN_LUMINANCE,
  );
  const color = filteredLuminance < 125 ? '#efefef' : '#222222';

  const onClickBtn = (cmd: string) => {
    if (session) {
      invoke(cmd, { id: session.umid }).catch(console.error);
    }
  };

  const isHorizontal = dockPosition === SeelenWegSide.Bottom || dockPosition === SeelenWegSide.Top;

  return (
    <DraggableItem item={item} drag={drag}>
      <WithContextMenu items={getMenuForItem(t, item)}>
        <div
          className={cx('weg-item media-session-container', {
            'media-session-container-horizontal': isHorizontal,
            'media-session-container-vertical': !isHorizontal,
          })}
          onContextMenu={(e) => e.stopPropagation()}
        >
          <div
            className="media-session"
            style={{
              backgroundColor: `rgb(${filteredLuminance}, ${filteredLuminance}, ${filteredLuminance})`,
            }}
          >
            <div className="media-session-thumbnail-container">
              <FileIcon className="media-session-app-icon" umid={session?.umid} noFallback />
              <img className="media-session-thumbnail" src={thumbnailSrc} />
            </div>
            <img className="media-session-blurred-thumbnail" src={thumbnailSrc} />

            <div className="media-session-info">
              <span
                className={cx('media-session-title', {
                  'media-session-title-default': !session,
                })}
                style={{ color }}
              >
                {session ? session.title : t('media.not_playing')}
              </span>
              {session && (
                <div className="media-session-actions">
                  <Button type="text" size="small" onClick={onClickBtn.bind(null, 'media_prev')}>
                    <Icon iconName="TbPlayerSkipBackFilled" color={color} size={12} />
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    onClick={onClickBtn.bind(null, 'media_toggle_play_pause')}
                  >
                    <Icon
                      iconName={session?.playing ? 'TbPlayerPauseFilled' : 'TbPlayerPlayFilled'}
                      color={color}
                      size={12}
                    />
                  </Button>
                  <Button type="text" size="small" onClick={onClickBtn.bind(null, 'media_next')}>
                    <Icon iconName="TbPlayerSkipForwardFilled" color={color} size={12} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </WithContextMenu>
    </DraggableItem>
  );
}
