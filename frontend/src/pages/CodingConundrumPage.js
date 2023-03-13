import { useEffect, useState, useRef } from 'react'

import IconButton from '@mui/material/IconButton'
import Input from '@mui/material/Input'
import FilledInput from '@mui/material/FilledInput'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import SmartToyTwoToneIcon from '@mui/icons-material/SmartToyTwoTone';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';

import TopNavBar from '../components/Nav'
import {
    Typography,
    Box,
    Grid,
    Container,
    Stack,
    Paper,
    Divider,
    TextField,
    Button,
    CircularProgress,
    Item,
    Avatar,
    Alert,
    Chip, Tooltip,
    Tabs,
    Tab,
} from '@mui/material'

import {
    red, grey, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, lime, yellow, amber, orange
} from '@mui/material/colors';


import UserService from '../services/UserService'
import CodeEditor from "../components/Editor";

import { useNavigate } from 'react-router-dom'
import { GameDataService } from '../services/GameDataService'
import UserDataService from '../services/UserService'

const USER_POINTS_KEY_NAME = 'CodingConumdrumPoints'

export default function CodingConumdrumPage() {

    const [gptText, setGptText] = useState("");
    const [channelTextData, setChannelTextData] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(120);
    const [gameStateManager, setGameStateManager] = useState(null);
    const [thisPlayer, setThisPlayer] = useState(null);
    const [gamePlayers, setGamePlayers] = useState([new UserData('john', '', '50', '10')]);
    const [backendConnection, setBackendConnection] = useState(null);
    const [loadingGPT, setLoadingGPT] = useState(false);

    const [tabValue, setTabValue] = useState(0);

    class GameStateManager {
        constructor(user) {
            this.user = user;
            this.connection = GameDataService.startConnection(this.responseHandler);
        }
        responseHandler(event) {
            let messages = event.data;
            console.log(messages)
            let data = JSON.parse(messages)
            if (data['prompt']) {
                setTime();
                setGptText(data['prompt'])
                setLoadingGPT(false);
            }
            // console.log(messages)

            // setChannelTextData(messages['converted_stream_data'].map(i => i.content))
        }

        startNewRound() {
            console.log('start new round called')
            setLoadingGPT(true);
            let message = `${this.user.username} would like to start a new round.`
            this.send(message)
        }

        joinRoom() {
            let message = `${this.user.username} has joined.`
            this.send(message)
        }
        leaveGame() {
            let message = `${this.user.username} has left.`
            this.send(message)
        }

        send(message, callback) {
            this.waitForConnection(() => {
                this.connection.send(message);
                if (typeof callback !== 'undefined') {
                    callback();
                }
            }, 1000);
        };

        waitForConnection(callback, interval) {
            if (this.connection.readyState === 1) {
                callback();
            } else {
                var that = this;
                // optional: implement backoff for interval here
                setTimeout(() => {
                    that.waitForConnection(callback, interval);
                }, interval);
            }
        };

    }

    function startNewRound() {
        gameStateManager.startNewRound();
    }


    function setTime() {
        let intervalId = setInterval(() => {
            setTimeRemaining((i) => {
                if (i - 1 <= 0) {
                    clearInterval(intervalId);
                }
                return i - 1;
            });

        }, 1000)
    }

    function initiateGameState() {
        let userid = UserDataService.getUserId();
        let username = UserDataService.getUserName();
        let currentRoundPoints = 0;
        let userGlobalPoints = UserDataService.getUserDataValue(USER_POINTS_KEY_NAME);

        if (userGlobalPoints === null) {
            UserDataService.setUserDataValue(USER_POINTS_KEY_NAME, 0);
            userGlobalPoints = 0;
        }

        let thisPlayer = new UserData(username, userid, currentRoundPoints, userGlobalPoints);
        setThisPlayer(thisPlayer);
        setGamePlayers((v) => [thisPlayer, ...v])

        let gameStateManager = new GameStateManager(thisPlayer);
        setGameStateManager(gameStateManager);

        gameStateManager.joinRoom();

        window.addEventListener('beforeunload', () => {
            gameStateManager.leaveGame()
        })


    }

    useState(() => {
        initiateGameState();
    }, [])






    return <Box>
        <TopNavBar fixed></TopNavBar>

        <Grid container mt={8} >
            <Grid item xs={5}
                sx={{
                    // backgroundColor: grey[800],
                    // color: "#e8eaed",
                }}
            >
                <Stack
                    direction="column"
                // justifyContent="flex-end"
                // alignItems="center"
                >
                    <Stack direction="row"
                        justifyContent="space-between"
                        // alignItems="center"
                        spacing={2} pt={5} pr={10}>
                        <Stack direction="column" >
                            <Typography fontFamily='PT Serif' ml={5} key='timeleft'>Time remaining this round:</Typography>
                            <Typography fontFamily='PT Serif' variant='h5' ml={5} key='timeleft'>{timeRemaining} seconds</Typography>
                        </Stack>

                        {
                            loadingGPT && <CircularProgress color="secondary" />
                        }



                        <Stack direction="row" >
                            {/* <Avatar alt="AI Overlord" sx={{ p: 1.5, m: 1, bgcolor: red[600] }}>
                                <SmartToyTwoToneIcon />
                            </Avatar> */}
                            {/* <Typography fontFamily='PT Serif' variant='h6'>ChatGPT Says:</Typography> */}
                        </Stack>

                    </Stack>

                    {/* ChatGPT prompt question */}
                    <Box sx={{ height: '40vh', p: 5, overflowY: 'scroll' }} key={reactComponentKey()} >
                        {
                            gptText ? <Typography sx={{ whiteSpace: 'pre-line' }}>{gptText}</Typography> :
                                <Typography variant="h5" fontFamily='PT Serif'>Press Start New Round to start a round when you're ready</Typography>
                        }
                    </Box>
                    <Button onClick={startNewRound}>Start New Round</Button>

                    <Box key={reactComponentKey()} >

                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={(event, value) => { setTabValue(value) }} aria-label="basic tabs example">
                                <Tab label="Players" {...a11yProps(0)} />
                                <Tab label="Messages" {...a11yProps(1)} />
                            </Tabs>
                        </Box>
                        <TabPanel value={tabValue} index={0} >
                            <Box sx={{ pl: 5, height: '15vh', overflowY: 'auto' }} key={reactComponentKey()} >
                                {
                                    gamePlayers.map((data) => userAvatarDisplay(data, reactComponentKey()))
                                }
                            </Box>
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <Box sx={{ pl: 5, height: '15vh', overflowY: 'auto' }} key={reactComponentKey()} >
                                {
                                    channelTextData.map((i) => {
                                        return <Typography key={reactComponentKey()}>{i}</Typography>
                                    })
                                }
                            </Box>
                        </TabPanel>
                    </Box>

                </Stack>
            </Grid>

            {/* right half of the page */}
            <Grid item xs={7}>
                <CodeEditor />
            </Grid>

        </Grid>
    </Box >


}


const userAvatarDisplay = (userData, key) => {
    return <Stack direction="row" spacing={2} key={key}>
        <Tooltip title={userData.username} >
            <Avatar sx={{ mb: 2, bgcolor: grey[900] }} ><AccessibilityNewIcon /></Avatar>
        </Tooltip>
        <Chip label={`${userData.roundPoints} points | ${userData.totalPoints} total`} variant="outlined" />
    </Stack>
}

class UserData {
    constructor(username, userid, roundPoints, totalPoints) {
        this.username = username
        this.userid = userid
        this.roundPoints = roundPoints
        this.totalPoints = totalPoints

    }
}

let _reactComponentKey = 0;
const reactComponentKey = () => {
    _reactComponentKey += 1;
    return _reactComponentKey;
}


function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component={'span'}>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}