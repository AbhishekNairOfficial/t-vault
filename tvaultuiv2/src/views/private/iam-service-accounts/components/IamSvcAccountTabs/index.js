/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ComponentError from '../../../../../errorBoundaries/ComponentError/component-error';
import mediaBreakpoints from '../../../../../breakpoints';
import IamServiceAccountSecrets from '../IamServiceAccountSecrets';
import IamServiceAccountPermission from '../IamServiceAccountPermission';
import { useStateValue } from '../../../../../contexts/globalState';
import apiService from '../../apiService';
// styled components goes here

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

const useStyles = makeStyles((theme) => ({
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
    [theme.breakpoints.down('md')]: {
      height: 'auto',
    },
  },
  tab: {
    minWidth: '9.5rem',
  },
}));

const AccountSelectionTabs = (props) => {
  const { accountDetail, refresh } = props;
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [response, setResponse] = useState({ status: '' });
  const [accountSecretData, setAccountSecretData] = useState(null);
  const [accountSecretError, setAccountSecretError] = useState('');
  const [disabledPermission, setDisabledPermission] = useState(false);
  const [secretResStatus, setSecretResStatus] = useState({ status: 'loading' });
  const [accountMetaData, setAccountMetaData] = useState({
    response: {},
    error: '',
  });
  const [isIamSvcAccountActive, setIsIamSvcAccountActive] = useState(false);
  const [state] = useStateValue();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  // Function to get the secret of the given service account.
  const getSecrets = useCallback(() => {
    setSecretResStatus({ status: 'loading' });

    apiService
      .getIamSvcAccountSecrets(
        `${accountDetail.iamAccountId}_${accountDetail?.name}`
      )
      .then((res) => {
        setSecretResStatus({ status: 'success' });
        if (res?.data) {
          setAccountSecretData(res.data);
        }
        setAccountSecretError('');
      })
      .catch((err) => {
        if (
          err?.response &&
          err.response.data?.errors &&
          err.response.data.errors[0]
        ) {
          setAccountSecretError(err.response.data.errors[0]);
        }
        setSecretResStatus({ status: 'error' });
      });
  }, [accountDetail]);

  // Function to get the metadata of the given service account
  const fetchPermission = useCallback(() => {
    setResponse({ status: 'loading' });
    return apiService
      .fetchIamServiceAccountDetails(
        `${accountDetail.iamAccountId}_${accountDetail.name}`
      )
      .then((res) => {
        if (res?.data) {
          setResponse({ status: 'success' });
          setIsIamSvcAccountActive(res?.data?.isActivated);
          if (
            res.data.owner_ntid.toLowerCase() === state.username.toLowerCase()
          ) {
            setDisabledPermission(false);
            setAccountMetaData({ response: res.data, error: '' });
          }
        }
      })
      .catch((err) => {
        setResponse({ status: 'error' });
        if (err) {
          setAccountSecretError(err?.response?.data?.errors[0]);
          setAccountMetaData({ response: {}, error: 'Something went wrong' });
        }
      });
  }, [accountDetail, state]);

  useEffect(() => {
    setResponse({ status: 'loading' });
    setSecretResStatus({ status: ' loading' });

    if (accountDetail?.name) {
      fetchPermission();
      getSecrets();
    }
  }, [accountDetail, fetchPermission, getSecrets]);

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
            {!disabledPermission && (
              <Tab
                label="Permissions"
                {...a11yProps(1)}
                disabled={disabledPermission}
              />
            )}
          </Tabs>
        </AppBar>
        <TabContentsWrap>
          <TabPanel value={value} index={0}>
            <IamServiceAccountSecrets
              accountDetail={accountDetail}
              accountMetaData={accountMetaData}
              accountSecretData={accountSecretData}
              accountSecretError={accountSecretError}
              secretStatus={secretResStatus.status}
              getSecrets={getSecrets}
              isIamSvcAccountActive={isIamSvcAccountActive}
            />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <IamServiceAccountPermission
              accountDetail={accountDetail}
              accountMetaData={accountMetaData}
              parentStatus={response.status}
              refresh={refresh}
              fetchPermission={fetchPermission}
              isIamSvcAccountActive={isIamSvcAccountActive}
            />
          </TabPanel>
        </TabContentsWrap>
      </div>
    </ComponentError>
  );
};
AccountSelectionTabs.propTypes = {
  accountDetail: PropTypes.objectOf(PropTypes.object),
  refresh: PropTypes.func.isRequired,
};
AccountSelectionTabs.defaultProps = {
  accountDetail: {},
};

export default AccountSelectionTabs;
