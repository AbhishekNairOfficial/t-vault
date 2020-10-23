import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import { withRouter, Link as RRDLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import Link from '@material-ui/core/Link';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import ComponentError from '../../errorBoundaries/ComponentError/component-error';
import mediaBreakpoints from '../../breakpoints';
import vaultIcon from '../../assets/tvault.svg';
import menu from '../../assets/menu.svg';
import userIcon from '../../assets/icon-profile.svg';
import Sidebar from '../Sidebar';

const { small, smallAndMedium, semiLarge } = mediaBreakpoints;

const HeaderWrap = styled('header')`
  background-color: #151820;
  box-shadow: 0 5px 25px 0 rgba(226, 0, 116, 0.5);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
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
    justify-content: center;
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

const TVaultIcon = styled.img``;

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
const ProfileIconWrap = styled('div')`
  display: flex;
  align-items: center;
  ${smallAndMedium} {
    display: none;
  }
`;
const EachLink = styled.a`
  margin: 0 1rem;
  color: #fff;
  font-size: 1.4rem;
`;
const UserName = styled.span``;

const UserIcon = styled.img`
  margin: 0 0.5rem;
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
  const [login, setLogin] = useState(true);
  const { location } = props;
  const [userName] = useState('User');
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
    { label: 'Vault Approles', path: 'vault-app-roles' },
    { label: 'Service Accounts', path: 'service-accounts' },
    { label: 'Certificates', path: 'certificates' },
  ];

  const hideSideMenu = (anchor, open) => {
    setState({ ...state, [anchor]: open });
  };

  useEffect(() => {
    const val = location.pathname.split('/');
    if (
      val[1] !== 'vault-app-roles' &&
      val[1] !== 'certificates' &&
      val[1] !== 'service-accounts' &&
      val[1] !== 'safes'
    ) {
      setLogin(true);
    } else {
      setLogin(false);
    }
  }, [location, login]);

  return (
    <ComponentError>
      <HeaderWrap>
        <Container>
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
              />
            </SwipeableDrawer>
          </>

          <TVaultIcon src={vaultIcon} alt="tvault-logo" />
          {!login && (
            <HeaderCenter>
              {navItems &&
                navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={`/${item.path}`}
                    component={RRDLink}
                    active={`/${location.pathname}`
                      .includes(item.path)
                      .toString()}
                  >
                    {item.label}
                  </NavLink>
                ))}
            </HeaderCenter>
          )}
          <ProfileIconWrap>
            {login ? (
              <>
                <EachLink
                  href="https://docs.corporate.t-mobile.com/t-vault/introduction/"
                  target="_blank"
                >
                  Docs
                </EachLink>
                <EachLink
                  href="https://perf-vault.corporate.t-mobile.com/vault/swagger-ui.html"
                  target="_blank"
                >
                  Developer API
                </EachLink>
              </>
            ) : (
              <>
                <UserName>{userName}</UserName>
                <UserIcon src={userIcon} alt="usericon" />
              </>
            )}
          </ProfileIconWrap>
        </Container>
      </HeaderWrap>
    </ComponentError>
  );
};

Header.propTypes = {
  location: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withRouter(Header);
