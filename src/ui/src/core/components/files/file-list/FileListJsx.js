import React from 'react';
import Filesize from 'filesize';
import Radio from 'backbone.radio';
import './FileList.scss';

const Formatter = Radio.channel('formatter').request('get');

const FileListJsx = (fileCollection, clickFilename) => {
  return <> 
    { (!fileCollection?.length) ? '-' :
        fileCollection.map((file, index) => {
          return (
            <>
              <a href="javascript:;" data-file-id={file.get('file_id')} className="file-list__file-download filename-download" onClick={() => clickFilename(file)}>{file.get('file_name')}</a>&nbsp;
              { (file.get('file_size')) ? <span className="dispute-issue-evidence-filesize">({ Filesize(file.get('file_size')) }, {Formatter.toDateDisplay(file.get('created_date'))})</span> : null }
              { (index !== fileCollection.length - 1) ? <span className="list-comma">, </span> : null }
            </>
          );
        })
      }
  </>
}

export default FileListJsx;