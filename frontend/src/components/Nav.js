
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { indigo } from '@mui/material/colors';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';


import CodeIcon from '@mui/icons-material/Code';
import MenuIcon from '@mui/icons-material/Menu';

import React, { useCallback, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import UserService from '../services/UserService';



const settings = ['Logout'];

const ResponsiveAppBar = (props) => {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const [loginCompleted, setLoginCompleted] = React.useState(false);
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [username, setUsername] = React.useState('');

    const navigate = useNavigate();
    const redirectToTutorialListPage = useCallback(() => navigate('/tutorials', { replace: false }), [navigate]);
    const redirectToInstructionsPage = useCallback(() => navigate('/instructions', { replace: false }), [navigate]);
    const redirectToGamesPage = useCallback(() => navigate('/games', { replace: false }), [navigate]);

    const appBarIsFixed = props.fixed

    useEffect(() => {
        setLoginCompleted(true);
        setLoggedIn(UserService.getUserId() !== -1);
        setUsername(UserService.getUserName());
    }, []);


    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = (setting) => {
        if (setting === 'Logout') {
            UserService.logout();
            navigate(0);
        }
        setAnchorElUser(null);
    };
    const pages_and_links = !props.hideLinks ?
        [
            { 'page': 'Tutorials', 'link': '/tutorials' },
            // { 'page': 'Instructions', 'link': '/instructions' },
            { 'page': 'Challenges', 'link': '/coding-conundrum' },
            { 'page': 'Editor', 'link': '/ide' },

            // { 'page': 'Notebook', 'link': '/notebook' }
        ]
        : [];



    return (
        <AppBar position={appBarIsFixed ? 'fixed' : 'sticky'} sx={{ bgcolor: indigo[900] }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <CodeIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6" noWrap component="a" href="/" sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Comprehend C++
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {pages_and_links.map((item) => {
                                let page = item['page']
                                let link = item['link']
                                return (
                                    <MenuItem key={page} onClick={handleCloseNavMenu} href={link}>
                                        <Typography textAlign="center">{page}</Typography>
                                    </MenuItem>
                                )
                            })}
                        </Menu>
                    </Box>
                    <CodeIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5" noWrap component="a" href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Comprehend C++
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages_and_links.map((item) => {
                            let page = item['page']
                            let link = item['link']
                            return (
                                <Button
                                    key={page}
                                    onClick={handleCloseNavMenu}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                    href={link}
                                >
                                    {page}
                                </Button>
                            )
                        }
                        )}
                    </Box>


                    {loggedIn && loginCompleted &&

                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Your profile">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar>{username.charAt(0).toUpperCase()}</Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map((setting) => (
                                    <MenuItem key={setting} onClick={() => handleCloseUserMenu(setting)}>
                                        <Typography textAlign="center">{setting}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>


                    }

                    {
                        !loggedIn && loginCompleted &&
                        <>
                            <Button
                                sx={{ my: 2, color: 'white', display: 'block' }}
                                href={'/login'}
                            >
                                Login
                            </Button>
                            <Button
                                sx={{ my: 2, color: 'white', display: 'block' }}
                                href={'/create_account'}
                            >
                                Create Account
                            </Button>
                        </>
                    }
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default ResponsiveAppBar;
