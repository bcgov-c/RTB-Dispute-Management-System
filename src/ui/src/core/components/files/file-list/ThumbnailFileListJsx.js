import React from 'react';
import Filesize from 'filesize';
import Radio from 'backbone.radio';
import LoaderImg from '../../../static/loader.svg';
import './FileList.scss';
import { ModalExternalFileViewer } from '../../file-viewer/ModalExternalFileViewer';

const Formatter = Radio.channel('formatter').request('get');
const modalChannel = Radio.channel('modals');

const ThumbnailFileListJsx = (fileCarouselArray=[], fileCollection=[], clickFilename) => {
  //turning off for now
  const openFileViewer = (fileModel) => {
    const viewableFiles = fileCarouselArray.filter(file => file.isImage() || file.isVideo() || file.isAudio());
    modalChannel.request('add', new ModalExternalFileViewer({ fileModel, fileCarouselArray: viewableFiles }), { no_animate: true });
  }

  const downloadClicked = (file) => {
    if (file.isImage() || file.isVideo() || file.isAudio()) {
      openFileViewer(file);
    } else {
      clickFilename(file);
    }
  }
  
  return <>
    { (!fileCollection?.length) ? '-' :
        fileCollection?.map((file, index) => {
          return (
            <div className="file-card">
              <div className="file-card__content">
                <div className="file-card__image-container">
                  <img src={LoaderImg} />
                  <img className="file-card__image-container__image hidden" src={ file.getThumbnailURL() } onClick={() => downloadClicked(file)}/>
                </div>
                <div className="file-card__file-description">
                  <a href="javascript:;" data-file-id={file.get('file_id')} className="file-list__file-download filename-download" onClick={() => downloadClicked(file)}>{file.get('file_name')}</a>
                  { (file.get('file_size')) ? <span className="dispute-issue-evidence-filesize">({ Filesize(file.get('file_size')) }, {Formatter.toDateDisplay(file.get('created_date'))})</span> : null }
                </div>
              </div>
            </div>
          );
        })
      }
  </>
}

export default ThumbnailFileListJsx;