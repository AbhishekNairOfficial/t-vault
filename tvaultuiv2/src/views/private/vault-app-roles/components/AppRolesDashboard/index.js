/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-param-reassign */
import React, { useState, useEffect, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';

import {
  Link,
  Route,
  Switch,
  useHistory,
  Redirect,
  useLocation,
} from 'react-router-dom';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useStateValue } from '../../../../../contexts/globalState';
import sectionHeaderBg from '../../../../../assets/approle_banner_img.png';
import sectionTabHeaderBg from '../../../../../assets/tab-vaultbg.png';
import sectionMobHeaderBg from '../../../../../assets/mob-vaultbg.png';
import mediaBreakpoints from '../../../../../breakpoints';
import ComponentError from '../../../../../errorBoundaries/ComponentError/component-error';
import NoData from '../../../../../components/NoData';
import NoSafesIcon from '../../../../../assets/no-data-safes.svg';
import appRoleIcon from '../../../../../assets/icon-approle.svg';
import FloatingActionButtonComponent from '../../../../../components/FormFields/FloatingActionButton';
import TextFieldComponent from '../../../../../components/FormFields/TextField';
import ListItemDetail from '../../../../../components/ListItemDetail';
import AppRoleDetails from '../ApproleDetails';
import EditDeletePopper from '../EditDeletePopper';
import ListItem from '../../../../../components/ListItem';
import EditAndDeletePopup from '../../../../../components/EditAndDeletePopup';
import Error from '../../../../../components/Error';
import SnackbarComponent from '../../../../../components/Snackbar';
import ScaledLoader from '../../../../../components/Loaders/ScaledLoader';
import apiService from '../../apiService';
import Strings from '../../../../../resources';
import ConfirmationModal from '../../../../../components/ConfirmationModal';
import ButtonComponent from '../../../../../components/FormFields/ActionButton';
import CreateAppRole from '../../CreateAppRole';
import { TitleOne } from '../../../../../styles/GlobalStyles';
import {
  ListContainer,
  StyledInfiniteScroll,
} from '../../../../../styles/GlobalStyles/listingStyle';

const ColumnSection = styled('section')`
  position: relative;
  background: ${(props) => props.backgroundColor || '#151820'};
`;

const RightColumnSection = styled.div`
  width: 59.23%;
  padding: 0;
  background: none;
  background: linear-gradient(to top, #151820, #2c3040);
  ${mediaBreakpoints.small} {
    width: 100%;
    ${(props) => props.mobileViewStyles}
    display: ${(props) => (props.isAccountDetailsOpen ? 'block' : 'none')};
  }
`;
const LeftColumnSection = styled(ColumnSection)`
  width: 40.77%;
  ${mediaBreakpoints.small} {
    display: ${(props) => (props.isAccountDetailsOpen ? 'none' : 'block')};
    width: 100%;
  }
`;

const SectionPreview = styled('main')`
  display: flex;
  height: 100%;
`;
const ColumnHeader = styled('div')`
  display: flex;
  align-items: center;
  padding: 0.5em;
  height: 6.5rem;
  justify-content: space-between;
  border-bottom: 0.1rem solid #1d212c;
`;

const NoDataWrapper = styled.div`
  height: 61vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopperWrap = styled.div`
  position: absolute;
  right: 4%;
  z-index: 1;
  display: none;
`;
const ListFolderWrap = styled(Link)`
  position: relative;
  display: flex;
  text-decoration: none;
  align-items: center;
  padding: 1.2rem 1.8rem 1.2rem 3.8rem;
  cursor: pointer;
  background-image: ${(props) =>
    props.active ? props.theme.gradients.list : 'none'};
  color: ${(props) => (props.active ? '#fff' : '#4a4a4a')};
  ${mediaBreakpoints.belowLarge} {
    padding: 2rem 1.1rem;
  }
  :hover {
    background-image: ${(props) => props.theme.gradients.list || 'none'};
    color: #fff;
    ${PopperWrap} {
      display: block;
    }
  }
`;

const NoListWrap = styled.div`
  width: 35%;
`;

const BorderLine = styled.div`
  border-bottom: 0.1rem solid #1d212c;
  width: 90%;
  position: absolute;
  bottom: 0;
`;
const FloatBtnWrapper = styled('div')`
  position: absolute;
  bottom: 3rem;
  right: 2.5rem;
  z-index: 1;
`;

const SearchWrap = styled.div`
  width: 100%;
`;

const ListHeader = css`
  width: 22rem;
  text-transform: capitalize;
  font-weight: 600;
  ${mediaBreakpoints.small} {
    width: 19rem;
  }
`;

const MobileViewForListDetailPage = css`
  position: fixed;
  display: flex;
  right: 0;
  left: 0;
  bottom: 0;
  top: 0;
  overflow-y: auto;
  max-height: 100%;
  z-index: 20;
`;
const EmptyContentBox = styled('div')`
  width: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const EditDeletePopperWrap = styled.div``;
const iconStyles = makeStyles(() => ({
  root: {
    width: '100%',
  },
}));

const AppRolesDashboard = () => {
  const [inputSearchValue, setInputSearchValue] = useState('');
  const [appRoleClicked, setAppRoleClicked] = useState(false);
  const [listItemDetails, setListItemDetails] = useState({});
  const [moreData] = useState(false);
  const [isLoading] = useState(false);
  const [appRoleList, setAppRoleList] = useState([]);
  const [status, setStatus] = useState({});
  const [getResponseType, setGetResponseType] = useState(null);
  const [deleteAppRoleName, setDeleteAppRoleName] = useState('');
  const [deleteAppRoleConfirmation, setDeleteAppRoleConfirmation] = useState(
    false
  );
  const [state, dispatch] = useStateValue();
  let scrollParentRef = null;
  const listIconStyles = iconStyles();
  const isMobileScreen = useMediaQuery(mediaBreakpoints.small);
  const isTabScreen = useMediaQuery(mediaBreakpoints.medium);
  const history = useHistory();
  const location = useLocation();
  const introduction = Strings.Resources.appRoles;
  const admin = Boolean(state.isAdmin);
  /**
   * @function fetchData
   * @description function call all the manage and safe api.
   */
  const fetchData = useCallback(async () => {
    setStatus({ status: 'loading', message: 'Loading...' });
    apiService
      .getAppRole()
      .then((res) => {
        setGetResponseType(1);
        setStatus({});
        const appRolesArr = [];
        if (res?.data?.keys) {
          res.data.keys.map((item) => {
            const appObj = {
              name: item,
              admin,
            };
            return appRolesArr.push(appObj);
          });
        }

        setAppRoleList([...appRolesArr]);
        dispatch({ type: 'UPDATE_APP_ROLE_LIST', payload: [...appRolesArr] });
      })
      .catch(() => {
        setStatus({});
        setGetResponseType(-1);
      });
  }, [admin, dispatch]);

  /**
   * @description On component load call fetchData function.
   */
  useEffect(() => {
    fetchData().catch(() => {
      setStatus({ status: 'failed', message: 'failed' });
    });
  }, [fetchData]);

  /**
   * @function onSearchChange
   * @description function to search input
   */
  const onSearchChange = (value) => {
    setInputSearchValue(value);
    if (value !== '') {
      const array = state?.appRoleList.filter((item) => {
        return String(item.name).startsWith(value);
      });
      setAppRoleList([...array]);
    } else {
      setAppRoleList([...state?.appRoleList]);
    }
  };

  /**
   * @function onLinkClicked
   * @description function to check if mobile screen the make safeClicked true
   * based on that value display left and right side.
   */
  const onLinkClicked = (item) => {
    setListItemDetails(item);
    if (isMobileScreen) {
      setAppRoleClicked(true);
    }
  };

  /**
   * @function onActionClicked
   * @description function to prevent default click.
   * @param {object} e event
   */
  const onActionClicked = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  /**
   * @function backToAppRoles
   * @description To get back to left side lists in case of mobile view
   * @param {bool} isMobileScreen boolian
   */
  const backToAppRoles = () => {
    if (isMobileScreen) {
      setAppRoleClicked(false);
    }
  };

  useEffect(() => {
    if (appRoleList?.length > 0) {
      appRoleList.map((item) => {
        if (history.location.pathname === `/vault-app-roles/${item.name}`) {
          return setListItemDetails(item);
        }
        return null;
      });
    }
  }, [appRoleList, listItemDetails, history]);

  // Infine scroll load more data
  const loadMoreData = () => {};

  // toast close handler
  const onToastClose = () => {
    setStatus({});
    setGetResponseType(null);
  };

  /**
   * @function onDeleteClicked
   * @description function is called when delete is clicked opening
   * the confirmation modal and setting the path.
   * @param {string} name app role  name to be deleted.
   */
  const onDeleteClicked = (name) => {
    setDeleteAppRoleConfirmation(true);
    setDeleteAppRoleName(name);
  };

  const onApproleEdit = (name) => {
    history.push({
      pathname: '/vault-app-roles/edit-vault-app-role',
      state: {
        appRoleDetails: {
          name,
          isAdmin: admin,
          isEdit: true,
          allAppRoles: appRoleList,
        },
      },
    });
  };

  /**
   * @function onDeleteRouteToNextAppRole
   * @description function is called after deletion is successfull
   * based on that the next approle  is selected,
   */
  const onDeleteRouteToNextAppRole = () => {
    const val = location.pathname.split('/');
    const routeName = val.slice(-1)[0];
    if (appRoleList.length > 0) {
      const obj = appRoleList.find((item) => item === routeName);
      if (!obj) {
        setListItemDetails(appRoleList[0]);
        history.push(`/vault-app-roles/${appRoleList[0].name}`);
      }
    } else {
      setListItemDetails({});
      history.push(`/vault-app-roles`);
    }
  };
  /**
   * @function onAppRoleDelete
   * @description delete app role
   */
  const onAppRoleDelete = () => {
    setDeleteAppRoleConfirmation(false);
    setStatus({ status: 'loading' });
    apiService
      .deleteAppRole(deleteAppRoleName)
      .then(async (res) => {
        setStatus({ status: 'success', message: res?.data?.messages[0] });
        onDeleteRouteToNextAppRole();
        await fetchData();
      })
      .catch((err) => {
        setStatus({
          status: 'failed',
          message: err?.response?.data?.errors[0],
        });
      });
  };

  /**
   * @function handleConfirmationModalClose
   * @description function to handle the close of deletion modal.
   */
  const handleConfirmationModalClose = () => {
    setDeleteAppRoleConfirmation(false);
  };

  const renderList = () => {
    return appRoleList.map((appRole) => (
      <ListFolderWrap
        key={appRole.name}
        to={{
          pathname: `/vault-app-roles/${appRole.name}`,
          state: { data: appRole },
        }}
        onClick={() => onLinkClicked(appRole)}
        active={
          history.location.pathname === `/vault-app-roles/${appRole.name}`
        }
      >
        <ListItem
          title={appRole.name}
          subTitle={appRole.date}
          flag={appRole.type}
          icon={appRoleIcon}
          showActions={false}
          listIconStyles={listIconStyles}
        />
        <BorderLine />
        {appRole.name && !isMobileScreen ? (
          <PopperWrap onClick={(e) => onActionClicked(e)}>
            <EditAndDeletePopup
              onDeletListItemClicked={() => onDeleteClicked(appRole.name)}
              onEditListItemClicked={() => onApproleEdit(appRole.name)}
            />
          </PopperWrap>
        ) : null}
        {isMobileScreen && appRole.name && (
          <EditDeletePopperWrap onClick={(e) => onActionClicked(e)}>
            <EditDeletePopper
              onDeleteClicked={() => onDeleteClicked(appRole.name)}
              onEditClicked={() => onApproleEdit(appRole.name)}
            />
          </EditDeletePopperWrap>
        )}
      </ListFolderWrap>
    ));
  };
  return (
    <ComponentError>
      <>
        <ConfirmationModal
          open={deleteAppRoleConfirmation}
          handleClose={handleConfirmationModalClose}
          title="Confirmation"
          description={`<p>Are you sure you want to delete this appRole : <strong>${deleteAppRoleName}</strong></p>`}
          cancelButton={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <ButtonComponent
              label="Cancel"
              color="primary"
              onClick={() => handleConfirmationModalClose()}
              width={isMobileScreen ? '45%' : ''}
            />
          }
          confirmButton={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <ButtonComponent
              label="Delete"
              color="secondary"
              onClick={() => onAppRoleDelete()}
              width={isMobileScreen ? '45%' : ''}
            />
          }
        />
        <SectionPreview title="vault-app-roles-section">
          <LeftColumnSection isAccountDetailsOpen={appRoleClicked}>
            <ColumnHeader>
              <div style={{ margin: '0 1rem' }}>
                <TitleOne extraCss={ListHeader}>
                  {`All Vault AppRoles (${appRoleList?.length})`}
                </TitleOne>
              </div>
              <SearchWrap>
                <TextFieldComponent
                  placeholder="Search"
                  icon="search"
                  fullWidth
                  onChange={(e) => onSearchChange(e.target.value)}
                  value={inputSearchValue || ''}
                  color="secondary"
                />
              </SearchWrap>
            </ColumnHeader>
            {status.status === 'loading' && (
              <ScaledLoader contentHeight="80%" contentWidth="100%" />
            )}
            {getResponseType === -1 && !appRoleList?.length && (
              <EmptyContentBox>
                {' '}
                <Error description="Error while fetching app roles!" />
              </EmptyContentBox>
            )}
            {getResponseType === 1 && (
              <>
                {appRoleList && appRoleList.length > 0 ? (
                  <ListContainer
                    // eslint-disable-next-line no-return-assign
                    ref={(ref) => (scrollParentRef = ref)}
                  >
                    <StyledInfiniteScroll
                      pageStart={0}
                      loadMore={() => {
                        loadMoreData();
                      }}
                      hasMore={moreData}
                      threshold={100}
                      loader={
                        !isLoading ? <div key={0}>Loading...</div> : <></>
                      }
                      useWindow={false}
                      getScrollParent={() => scrollParentRef}
                    >
                      {renderList()}
                    </StyledInfiniteScroll>
                  </ListContainer>
                ) : (
                  appRoleList?.length === 0 && (
                    <>
                      {' '}
                      {inputSearchValue ? (
                        <NoDataWrapper>
                          No app role found with name:
                          <strong>{inputSearchValue}</strong>
                        </NoDataWrapper>
                      ) : (
                        <NoDataWrapper>
                          {' '}
                          <NoListWrap>
                            <NoData
                              imageSrc={NoSafesIcon}
                              description="No approles are created yet!"
                              actionButton={
                                // eslint-disable-next-line react/jsx-wrap-multilines

                                <FloatingActionButtonComponent
                                  href="/vault-app-roles/create-vault-app-role"
                                  color="secondary"
                                  icon="add"
                                  tooltipTitle="Create New Approle"
                                  tooltipPos="bottom"
                                />
                              }
                            />
                          </NoListWrap>
                        </NoDataWrapper>
                      )}
                    </>
                  )
                )}
              </>
            )}

            {appRoleList?.length ? (
              <FloatBtnWrapper>
                <FloatingActionButtonComponent
                  href="/vault-app-roles/create-vault-app-role"
                  color="secondary"
                  icon="add"
                  tooltipTitle="Create New Approle"
                  tooltipPos="left"
                />
              </FloatBtnWrapper>
            ) : (
              <></>
            )}
          </LeftColumnSection>
          <RightColumnSection
            mobileViewStyles={isMobileScreen ? MobileViewForListDetailPage : ''}
            isAccountDetailsOpen={appRoleClicked}
          >
            <Switch>
              {appRoleList[0]?.name && (
                <Redirect
                  exact
                  from="/vault-app-roles"
                  to={{
                    pathname: `/vault-app-roles/${appRoleList[0]?.name}`,
                    state: { data: appRoleList[0] },
                  }}
                />
              )}
              <Route
                path="/vault-app-roles/:appRoleName"
                render={(routerProps) => (
                  <ListItemDetail
                    listItemDetails={listItemDetails}
                    params={routerProps}
                    backToLists={backToAppRoles}
                    ListDetailHeaderBg={
                      isTabScreen
                        ? sectionTabHeaderBg
                        : isMobileScreen
                        ? sectionMobHeaderBg
                        : sectionHeaderBg
                    }
                    description={introduction}
                    renderContent={
                      <AppRoleDetails appRoleDetail={listItemDetails} />
                    }
                  />
                )}
              />
              <Route
                path="/vault-app-roles"
                render={(routerProps) => (
                  <ListItemDetail
                    listItemDetails={appRoleList}
                    params={routerProps}
                    backToLists={backToAppRoles}
                    ListDetailHeaderBg={
                      isTabScreen
                        ? sectionTabHeaderBg
                        : isMobileScreen
                        ? sectionMobHeaderBg
                        : sectionHeaderBg
                    }
                    description={introduction}
                  />
                )}
              />
            </Switch>
          </RightColumnSection>
          {status.status === 'failed' && (
            <SnackbarComponent
              open
              onClose={() => onToastClose()}
              severity="error"
              icon="error"
              message="Something went wrong!"
            />
          )}
          {status.status === 'success' && (
            <SnackbarComponent
              open
              onClose={() => onToastClose()}
              message={status.message}
            />
          )}
        </SectionPreview>
        <Switch>
          <Route
            exact
            path="/vault-app-roles/create-vault-app-role"
            render={(routeProps) => (
              <CreateAppRole routeProps={routeProps} refresh={fetchData} />
            )}
          />
          <Route
            exact
            path="/vault-app-roles/edit-vault-app-role"
            render={(routeProps) => (
              <CreateAppRole routeProps={routeProps} refresh={fetchData} />
            )}
          />
        </Switch>
      </>
    </ComponentError>
  );
};
AppRolesDashboard.propTypes = {};
AppRolesDashboard.defaultProps = {};

export default AppRolesDashboard;
