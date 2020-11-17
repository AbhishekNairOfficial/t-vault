/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ComponentError from '../../../../../errorBoundaries/ComponentError/component-error';
import mediaBreakpoints from '../../../../../breakpoints';
import AppRoleSecrets from '../AppRoleSecrets';
import apiService from '../../apiService';
import NoData from '../../../../../components/NoData';
import Error from '../../../../../components/Error';
import NoSecretsIcon from '../../../../../assets/no-data-secrets.svg';
import SnackbarComponent from '../../../../../components/Snackbar';
import BackdropLoader from '../../../../../components/Loaders/BackdropLoader';
import ButtonComponent from '../../../../../components/FormFields/ActionButton';
import { TitleThree } from '../../../../../styles/GlobalStyles';
import { exportCSVFile } from '../../../../../services/helper-function';
import NamedButton from '../../../../../components/NamedButton';
import ConfirmationModal from '../../../../../components/ConfirmationModal';
import { useStateValue } from '../../../../../contexts/globalState';

// styled components goes here
const TabPanelWrap = styled.div`
  position: relative;
  height: 100%;
  margin: 0;
  padding-top: 1.3rem;
`;

const TabContentsWrap = styled('div')`
  height: calc(100% - 4.8rem);
  position: relative;
`;

const NoDataWrapper = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #5e627c;
  span {
    margin: 0 0.4rem;
    color: #fff;
    font-weight: bold;
    text-transform: uppercase;
  }
`;
const bgIconStyle = {
  width: '16rem',
  height: '16rem',
};

const noDataStyle = css`
  width: 45%;
  margin: 0 auto;
  ${mediaBreakpoints.small} {
    width: 100%;
  }
`;

const NoSecretIdWrap = styled.div`
  width: 100%;
`;
// const customLoaderStyle = css`
//   position: absolute;
//   left: 50%;
//   top: 50%;
//   transform: translate(-50%, -50%);
//   color: red;
//   z-index: 1;
// `;
const customBtnStyles = css`
  padding: 0.2rem 1rem;
  border-radius: 0.5rem;
  color: ${(props) => props.theme.customColor.magenta || '#e20074'} !important;
`;
const TabPanel = (props) => {
  const { children, value, index } = props;

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
  backdrop: {
    position: 'absolute',
  },
}));

const AppRoleDetails = (props) => {
  const { appRoleDetail } = props;
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [status, setStatus] = useState({});
  const [secretIdsData, setSecretIdsData] = useState(null);
  const [getResponseType, setGetResponseType] = useState(null);
  const [createSecretIdModal, setCreateSecretIdModal] = useState(false);
  const [downloadSecretModal, setDownloadSecretModal] = useState(false);
  const [secretIdInfo, setSecretIdInfo] = useState({});
  const isMobileScreen = useMediaQuery(mediaBreakpoints.small);

  const [userState] = useStateValue();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Function to get the secretIDs  of the given approle.
  const getSecrets = useCallback(() => {
    setStatus({ status: 'loading' });
    setGetResponseType(null);
    apiService
      .getAccessors(appRoleDetail?.name)
      .then((res) => {
        setStatus({});
        if (res?.data) {
          setSecretIdsData(res.data.keys);
        }
        setGetResponseType(1);
      })
      .catch((err) => {
        setStatus({});
        if (
          err?.response &&
          err.response.data?.errors &&
          err.response.data.errors[0]
        ) {
          setStatus({ message: err.response.data.errors[0] });
        }
        setGetResponseType(-1);
      });
  }, [appRoleDetail]);

  useEffect(() => {
    if (appRoleDetail) {
      getSecrets();
    }
  }, [getSecrets, appRoleDetail]);

  /**
   * @function OnDeleteSecretIds
   * @param secretId Secret id/s to be deleted
   * @description To delete the secretIds
   */

  const OnDeleteSecretIds = (ids) => {
    setStatus({ status: 'loading' });
    const payload = {
      accessorIds: [...ids],
      role_name: appRoleDetail?.name,
    };
    apiService
      .deleteSecretIds(payload)
      .then(async (res) => {
        setStatus({ status: 'success', message: res?.data?.messages[0] });
        await getSecrets();
      })
      .catch();
  };
  const onToastClose = () => {
    setStatus({});
    setGetResponseType(null);
  };

  /**
   * create new secret id
   */
  const createSecretId = () => {
    setCreateSecretIdModal(true);
  };

  /**
   * @function onCreateSecretId
   * On create confirmation call createSecretId api and fetch created secrets
   */

  const onCreateSecretId = () => {
    setStatus({ status: 'loading', message: 'loading' });
    setCreateSecretIdModal(false);
    apiService
      .createSecretId(appRoleDetail?.name)
      .then(async (res) => {
        setStatus({
          status: 'success',
          message: 'SecretID Created Successfully',
        });
        setSecretIdInfo(res?.data?.data);
        setDownloadSecretModal(true);
        await getSecrets();
      })
      .catch((err) => {
        setStatus({
          status: 'failed',
          message: err?.response?.data?.messages[0],
        });
      });
  };

  /**
   * @function onDownloadSecretId
   * @description To download the secret id in Xls format
   */
  const onDownloadSecretId = () => {
    apiService
      .getRoleId(appRoleDetail?.name)
      .then((res) => {
        if (res?.data) {
          const csvData = [
            {
              approle: appRoleDetail?.name,
              roleId: res.data.data.role_id,
              owner: userState?.username,
              secretID: secretIdInfo?.secret_id,
              accessorID: secretIdInfo?.secret_id_accessor,
            },
          ];
          const headers = {
            approle: 'Approle'.replace(/,/g, ''), // remove commas to avoid errors
            roleId: 'RoleId',
            owner: 'Owner',
            secretID: 'SecretID',
            accessorID: 'AccessorID',
          };

          const itemsFormatted = [];

          // format the data
          csvData.forEach((item) => {
            itemsFormatted.push({
              approle: item.approle.replace(/,/g, ''), // remove commas to avoid errors,
              roleId: item.roleId,
              owner: item.owner,
              secretID: item.secretID,
              accessorID: item.accessorID,
            });
          });
          exportCSVFile(
            headers,
            itemsFormatted,
            `${appRoleDetail?.name}_${secretIdInfo?.secret_id_accessor}.csv` // name of downloaded file
          );
          setStatus({
            status: 'success',
            message: 'SecretID Downloaded Successfully',
          });
        }
      })
      .catch((err) => {
        setStatus({
          status: 'failed',
          message: err?.response?.data?.errors[0] || 'Download Failed!',
        });
      });
  };
  return (
    <ComponentError>
      <div className={classes.root}>
        <ConfirmationModal
          open={createSecretIdModal}
          handleClose={() => setCreateSecretIdModal(false)}
          title="Confirmation"
          description={`Are you sure you want to create new Secret ID for the AppRole ${appRoleDetail?.name} ?`}
          cancelButton={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <ButtonComponent
              label="Cancel"
              color="primary"
              onClick={() => setCreateSecretIdModal(false)}
              width={isMobileScreen ? '45%' : ''}
            />
          }
          confirmButton={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <ButtonComponent
              label="Create"
              color="secondary"
              onClick={() => onCreateSecretId()}
              width={isMobileScreen ? '45%' : ''}
            />
          }
        />
        <ConfirmationModal
          open={downloadSecretModal}
          handleClose={() => setDownloadSecretModal(false)}
          title="Save the Secret ID and Accessor ID"
          description={`<p><strong>Secret Id</strong> -${secretIdInfo?.secret_id}</br><strong>Accessor Id</strong>-${secretIdInfo?.secret_id_accessor}</br></br>Please click on "Download" to download the Secret ID and Accessor ID</p>`}
          cancelButton={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <ButtonComponent
              label="Close"
              color="primary"
              onClick={() => setDownloadSecretModal()}
              width={isMobileScreen ? '45%' : ''}
            />
          }
          confirmButton={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <ButtonComponent
              label="Download"
              color="secondary"
              onClick={() => onDownloadSecretId()}
              width={isMobileScreen ? '45%' : ''}
              icon="get_app"
            />
          }
        />
        <AppBar position="static" className={classes.appBar}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="safe tabs"
            indicatorColor="secondary"
            textColor="primary"
          >
            <Tab
              className={classes.tab}
              label="Accessor IDs"
              {...a11yProps(0)}
            />
          </Tabs>
          <NamedButton
            label="+Create SecretId"
            onClick={createSecretId}
            customStyle={customBtnStyles}
            // iconSrc={addFolderPlus}
          />
        </AppBar>
        <TabContentsWrap>
          <TabPanel value={value} index={0}>
            {status?.status === 'loading' && (
              <BackdropLoader color="secondary" classes={classes} />
            )}
            <TitleThree extraCss="color:#5e627c">
              {`${secretIdsData?.length || 0} secretIds`}
            </TitleThree>
            {getResponseType === 1 && secretIdsData?.length ? (
              <AppRoleSecrets
                secretIds={secretIdsData}
                deleteSecretIds={OnDeleteSecretIds}
              />
            ) : getResponseType === 1 && secretIdsData?.length === 0 ? (
              <NoDataWrapper>
                {' '}
                <NoSecretIdWrap>
                  <NoData
                    imageSrc={NoSecretsIcon}
                    description="There are no secretIds to view here.Once you create a New Approle you’ll be able to add Secret IDs  to this app role here!"
                    actionButton={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <ButtonComponent
                        label="Add"
                        icon="add"
                        color="secondary"
                        onClick={() => createSecretId()}
                        width={isMobileScreen ? '45%' : ''}
                      />
                    }
                    bgIconStyle={bgIconStyle}
                    customStyle={noDataStyle}
                  />
                </NoSecretIdWrap>
              </NoDataWrapper>
            ) : getResponseType === -1 ? (
              <Error description="Error while fetching secretId's" />
            ) : null}
          </TabPanel>
        </TabContentsWrap>
        {status.status === 'success' && (
          <SnackbarComponent
            open
            onClose={() => onToastClose()}
            message={status.message}
          />
        )}
        {status.status === 'failed' && (
          <SnackbarComponent
            open
            onClose={() => onToastClose()}
            severity="error"
            icon="error"
            message="Something went wrong!"
          />
        )}
      </div>
    </ComponentError>
  );
};
AppRoleDetails.propTypes = {
  appRoleDetail: PropTypes.objectOf(PropTypes.object).isRequired,
};
AppRoleDetails.defaultProps = {};

export default AppRoleDetails;
