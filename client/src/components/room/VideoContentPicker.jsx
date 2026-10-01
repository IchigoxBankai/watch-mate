import React from 'react';
import MediaSelector, { parseYouTubeId } from '../media/MediaSelector';

export { parseYouTubeId };

export default function VideoContentPicker(props) {
  return <MediaSelector {...props} />;
}
