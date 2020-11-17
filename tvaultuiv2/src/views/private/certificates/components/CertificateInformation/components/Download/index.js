/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import Popover from '@material-ui/core/Popover';
import styled from 'styled-components';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import GetAppIcon from '@material-ui/icons/GetApp';
import { customColor } from '../../../../../../../theme';
import DownloadModal from '../DownloadModal';
import apiService from '../../../../apiService';

const FileDownload = require('js-file-download');

const PoperItemWrap = styled.div``;
const DownloadText = styled.div`
  color: #fff;
  cursor: pointer;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  svg {
    margin-left: 1rem;
    color: ${customColor.magenta};
  }
`;
const PopperItem = styled.div`
  padding: 0.5rem;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  cursor: pointer;
  span {
    margin-right: 0.75rem;
  }
  :hover {
    background: ${customColor.magenta};
  }
`;
const Download = (props) => {
  const { certificateMetaData, onDownloadChange } = props;
  const [isPrivateKey, setIsPrivateKey] = useState(false);
  const [openDownloadModal, setOpenDownloadModal] = useState(false);

  const onPopperItemClicked = (val) => {
    setIsPrivateKey(val);
    setOpenDownloadModal(true);
  };

  const onCloseDownloadModal = () => {
    setOpenDownloadModal(false);
    setIsPrivateKey(false);
  };

  const onPrivateDownloadClicked = (payload, type) => {
    onDownloadChange('loading', null);
    setOpenDownloadModal(false);
    apiService
      .onPrivateDownload(payload)
      .then((res) => {
        onDownloadChange('success', null);
        FileDownload(
          res.data,
          `${certificateMetaData.certificateName}.${type}`
        );
      })
      .catch(() => {
        onDownloadChange('success', -1);
      });
  };

  const onPemDerFormatClicked = (type) => {
    onDownloadChange('loading', null);
    setOpenDownloadModal(false);
    apiService
      .onDownloadCertificate(
        certificateMetaData.certificateName,
        type,
        `${certificateMetaData.certType}`
      )
      .then((res) => {
        onDownloadChange('success', null);
        FileDownload(
          res.data,
          `${certificateMetaData.certificateName}.${type}`
        );
      })
      .catch(() => {
        onDownloadChange('success', -1);
      });
  };

  const useStyles = makeStyles((theme) => ({
    paper: {
      padding: theme.spacing(1),
      color: theme.palette.common.white,
      backgroundColor: theme.customColor.hoverColor.list || '#151820',
    },
  }));

  const classes = useStyles();

  return (
    <div>
      <DownloadModal
        onCloseDownloadModal={onCloseDownloadModal}
        isPrivateKey={isPrivateKey}
        openDownloadModal={openDownloadModal}
        onPemDerFormatClicked={(type) => onPemDerFormatClicked(type)}
        certificateMetaData={certificateMetaData}
        onPrivateDownloadClicked={onPrivateDownloadClicked}
      />

      <PopupState variant="popover" popupId="demo-popup-popover">
        {(popupState) => (
          <div>
            <DownloadText {...bindTrigger(popupState)}>
              Download
              <GetAppIcon />
            </DownloadText>
            <Popover
              {...bindPopover(popupState)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              classes={classes}
            >
              <PoperItemWrap>
                <PopperItem onClick={() => onPopperItemClicked(true)}>
                  <span>Download certificate with private key</span>
                </PopperItem>
                <PopperItem onClick={() => onPopperItemClicked(false)}>
                  <span>Download certificate in PEM/DER format</span>
                </PopperItem>
              </PoperItemWrap>
            </Popover>
          </div>
        )}
      </PopupState>
    </div>
  );
};

Download.propTypes = {
  certificateMetaData: PropTypes.objectOf(PropTypes.any).isRequired,
  onDownloadChange: PropTypes.func.isRequired,
};

export default Download;
