/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useHistory } from 'react-router-dom';
import ComponentError from '../../../../../errorBoundaries/ComponentError/component-error';
import addFolderPlus from '../../../../../assets/folder-plus.svg';
import NamedButton from '../../../../../components/NamedButton';

import Secrets from '../Secrets';
import mediaBreakpoints from '../../../../../breakpoints';

import Permissions from '../Permissions';
import apiService from '../../apiService';
import AddFolderModal from '../AddFolderModal';
import SnackbarComponent from '../../../../../components/Snackbar';
// styled components goes here

const customBtnStyles = css`
  padding: 0.2rem 1rem;
  border-radius: 0.5rem;
`;

const TabPanelWrap = styled.div`
  position: relative;
  height: 100%;
  margin: 0;
  padding-top: 1.3rem;
  ${mediaBreakpoints.small} {
    height: 77vh;
  }
`;

const TabContentsWrap = styled('div')`
  height: calc(100% - 4.8rem);
`;

const TabPanel = (props) => {
  const { children = '', value, index } = props;

  return (
    <TabPanelWrap
      role="tabpanel"
      hidden={value !== index}
      id={`safes-tabpanel-${index}`}
      aria-labelledby={`safe-tab-${index}`}
    >
      {children}
    </TabPanelWrap>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

TabPanel.defaultProps = {
  children: <div />,
};

function a11yProps(index) {
  return {
    id: `safety-tab-${index}`,
    'aria-controls': `safety-tabpanel-${index}`,
  };
}

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    padding: '0 2.1rem',
    height: 'calc( 100% - 19.1rem )',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(to bottom,#151820,#2c3040)',
  },
  appBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '4.8rem',
    boxShadow: 'none',
    borderBottom: '0.3rem solid #222632',
  },
  tab: {
    minWidth: '9.5rem',
  },
}));

const SelectionTabs = (props) => {
  const { safeDetail, refresh } = props;
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [enabledAddFolder, setEnableAddFolder] = useState(false);
  const [secretsFolder, setSecretsFolder] = useState([]);
  const [getResponse, setGetResponse] = useState(null);
  const [status, setStatus] = useState({});

  const history = useHistory();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const addSecretsFolder = () => {
    setEnableAddFolder(true);
  };
  // toast close handling
  const onToastClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setStatus({});
  };

  const addSecretsFolderList = (secretFolder) => {
    const tempFolders = [...secretsFolder] || [];
    const folderObj = {};
    folderObj.id = `${secretFolder.parentId}/${secretFolder.value}`;
    folderObj.parentId = secretFolder.parentId;
    folderObj.value = secretFolder.value;
    folderObj.type = secretFolder.type || 'folder';
    folderObj.children = [];
    setStatus({ status: 'loading', message: 'loading...' });
    apiService
      .addFolder(folderObj.id)
      .then((res) => {
        setStatus({ status: 'success', message: res.data.messages[0] });
        tempFolders[0].children.push(folderObj);
        setSecretsFolder([...tempFolders]);
      })
      .catch((error) => {
        setStatus({ status: 'failed', message: 'Secret addition failed' });
        if (!error.toString().toLowerCase().includes('network')) {
          if (error.response) {
            setStatus({
              status: 'failed',
              message: error.response?.data.errors[0],
            });
            return;
          }
        }
        if (error.toString().toLowerCase().includes('422')) {
          setStatus({
            status: 'failed',
            message: 'Folder already exists',
          });
          return;
        }
        setStatus({
          status: 'failed',
          message: 'Network Error!',
        });
      });
    setEnableAddFolder(false);
  };

  useEffect(() => {
    const safeObj = history?.location?.state?.safe;
    if (safeDetail?.path || safeObj?.path) {
      if (!safeDetail.manage || !safeObj?.manage) {
        setValue(0);
      }
      apiService
        .getSecret(safeDetail.path || safeObj?.path)
        .then((res) => {
          setStatus({});
          setGetResponse(1);
          setSecretsFolder([res.data]);
        })
        .catch((error) => {
          setGetResponse(-1);
          if (error.toString().toLowerCase().includes('403')) {
            return;
          }
          if (!error.toString().toLowerCase().includes('network')) {
            if (error.response) {
              return;
            }
          }
          setStatus({
            status: 'failed',
            message: 'Network Error',
          });
        });
    }
  }, [safeDetail, history]);

  return (
    <ComponentError>
      <div className={classes.root}>
        <AppBar position="static" className={classes.appBar}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="safe tabs"
            indicatorColor="secondary"
            textColor="primary"
          >
            <Tab className={classes.tab} label="Secrets" {...a11yProps(0)} />
            {safeDetail.manage && <Tab label="Permissions" {...a11yProps(1)} />}
          </Tabs>
          {value === 0 && (
            <>
              {safeDetail?.access?.toLowerCase() === 'write' && (
                <NamedButton
                  label="Add Folder"
                  onClick={addSecretsFolder}
                  customStyle={customBtnStyles}
                  iconSrc={addFolderPlus}
                />
              )}
            </>
          )}
        </AppBar>
        <TabContentsWrap>
          <TabPanel value={value} index={0}>
            {enabledAddFolder ? (
              <AddFolderModal
                openModal={enabledAddFolder}
                setOpenModal={setEnableAddFolder}
                childrens={secretsFolder}
                handleSaveClick={addSecretsFolderList}
                parentId={safeDetail.path}
                handleCancelClick={() => setEnableAddFolder(false)}
              />
            ) : (
              <></>
            )}
            <Secrets
              secretsFolder={secretsFolder}
              secretsStatus={status}
              safeDetail={safeDetail}
              getResponse={getResponse}
              setEnableAddFolder={setEnableAddFolder}
            />
          </TabPanel>

          <TabPanel value={value} index={1}>
            <Permissions safeDetail={safeDetail} refresh={refresh} />
          </TabPanel>

          <SnackbarComponent
            open={status.status === 'failed'}
            onClose={() => onToastClose()}
            severity="error"
            icon="error"
            message={status.message || 'Something went wrong!'}
          />
          <SnackbarComponent
            open={status.status === 'success'}
            onClose={() => onToastClose()}
            severity="success"
            icon="checked"
            message={status.message || 'Folder added successfully'}
          />
        </TabContentsWrap>
      </div>
    </ComponentError>
  );
};
SelectionTabs.propTypes = {
  safeDetail: PropTypes.objectOf(PropTypes.any),
  refresh: PropTypes.func.isRequired,
};
SelectionTabs.defaultProps = {
  safeDetail: {},
};

export default SelectionTabs;
