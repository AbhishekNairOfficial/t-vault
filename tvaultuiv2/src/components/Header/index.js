import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import DescriptionIcon from '@material-ui/icons/Description';
import { withRouter, Link as RRDLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import Link from '@material-ui/core/Link';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import ComponentError from '../../errorBoundaries/ComponentError/component-error';
import mediaBreakpoints from '../../breakpoints';
import vaultIcon from '../../assets/tvault.svg';
import menu from '../../assets/menu.svg';
import Sidebar from '../Sidebar';
import UserLogout from './userLogout';
import configData from '../../config/config';

const { small, smallAndMedium, semiLarge } = mediaBreakpoints;

const HeaderWrap = styled('header')`
  background-color: #151820;
  box-shadow: 0 5px 25px 0 rgba(226, 0, 116, 0.5);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
  ${smallAndMedium} {
    box-shadow: 0 5px 15px 0 rgba(226, 0, 116, 0.5);
  }
`;
const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 130rem;
  margin: auto;
  font-size: 1.4rem;
  height: 7rem;
  ${semiLarge} {
    margin: 0 3.5rem;
  }
  ${smallAndMedium} {
    justify-content: ${(props) => (props.isLogin ? 'center' : 'space-between')};
    padding: 0 2rem;
  }
`;

const MenuIcon = styled.img`
  display: none;
  ${smallAndMedium} {
    display: block;
    position: absolute;
    left: 3.5rem;
    cursor: pointer;
  }
  ${small} {
    left: 2rem;
  }
`;

const TVaultIcon = styled.img`
  margin-right: 5rem;
  ${smallAndMedium} {
    margin-right: 0;
  }
`;

const HeaderCenter = styled.div`
  display: flex;
  ${smallAndMedium} {
    display: none;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  margin: 0 0.5rem;
  padding: 2.5rem 2rem;

  font-weight: bold;
  background: ${(props) =>
    props.active === 'true' ? props.theme.gradients.nav : 'none'};
  :hover {
    text-decoration: none;
  }
`;

const DocLinks = styled.div`
  display: flex;
`;
const ProfileIconWrap = styled('div')`
  display: flex;
  align-items: center;
  margin-left: auto;
  ${smallAndMedium} {
    display: none;
  }
`;
const EachLink = styled.a`
  margin: 0 1rem;
  color: #fff;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  text-decoration: ${(props) => props.decoration};
  svg {
    margin-right: 0.5rem;
  }
`;

const useStyles = makeStyles(() => ({
  root: {
    '& .MuiDrawer-paper': {
      boxShadow: '5px 0 15px 0 rgba(226, 0, 116, 0.5)',
      backgroundColor: '#151820',
    },
  },
}));

const Header = (props) => {
  const classes = useStyles();
  const [isLogin, setIsLogin] = useState(false);
  const [currentTab, setCurrentTab] = useState('Safes');
  const { location } = props;
  const [userName, setUserName] = useState('User');
  const [state, setState] = useState({
    left: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };
  const navItems = [
    { label: 'Safes', path: 'safes' },
    { label: 'Vault AppRoles', path: 'vault-app-roles' },
    { label: 'Service Accounts', path: 'service-accounts' },
    { label: 'Certificates', path: 'certificates' },
    {label:"IAM Service Accounts", path:"iam-service-accounts"}
  ];

  const hideSideMenu = (anchor, open) => {
    setState({ ...state, [anchor]: open });
  };

  const checkToken = () => {
    const loggedIn = sessionStorage.getItem('token');
    if (loggedIn) {
      setIsLogin(true);
      const name = sessionStorage.getItem('displayName');
      if (name) {
        const str = name?.split(',');
        setUserName(`${str[1]} ${str[0]}` || 'User');
      }
    } else {
      setIsLogin(false);
    }
  };

  useEffect(() => {
    checkToken();
    const path = location.pathname.split('/');
    setCurrentTab(path[1]);
  }, [location]);

  return (
    <ComponentError>
      <HeaderWrap>
        <Container isLogin={isLogin}>
          {isLogin && (
            <>
              <MenuIcon
                src={menu}
                alt="menu"
                onClick={toggleDrawer('left', true)}
              />
              <SwipeableDrawer
                anchor="left"
                open={state.left}
                onClose={toggleDrawer('left', false)}
                onOpen={toggleDrawer('left', true)}
                className={classes.root}
              >
                <Sidebar
                  onClose={() => hideSideMenu('left', false)}
                  navItems={navItems}
                  userName={userName}
                  checkToken={checkToken}
                  EachLink={EachLink}
                  DescriptionIcon={DescriptionIcon}
                  currentTab={currentTab}
                />
              </SwipeableDrawer>
            </>
          )}

          <TVaultIcon src={vaultIcon} alt="tvault-logo" />
          {isLogin && (
            <HeaderCenter>
              {navItems &&
                navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={`/${item.path}`}
                    component={RRDLink}
                    active={currentTab === item.path ? 'true' : 'false'}
                  >
                    {item.label}
                  </NavLink>
                ))}
            </HeaderCenter>
          )}
          <>
            {!isLogin ? (
              <DocLinks>
                <EachLink
                  href={configData.DOCS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Docs
                </EachLink>
                <EachLink
                  href="https://perf-vault.corporate.t-mobile.com/vault/swagger-ui.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Developer API
                </EachLink>
              </DocLinks>
            ) : (
              <ProfileIconWrap>
                <EachLink
                  href={configData.DOCS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  decoration="none"
                >
                  <DescriptionIcon
                    style={{ fill: '#c4c4c4', width: '2rem', height: '2rem' }}
                  />
                  Documentation
                </EachLink>
                <UserLogout userName={userName} checkToken={checkToken} />
              </ProfileIconWrap>
            )}
          </>
        </Container>
      </HeaderWrap>
    </ComponentError>
  );
};

Header.propTypes = {
  location: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withRouter(Header);
